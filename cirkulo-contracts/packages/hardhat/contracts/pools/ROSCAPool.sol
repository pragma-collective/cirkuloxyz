// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../interfaces/IXershaPool.sol";
import "../libraries/TokenTransfer.sol";

/**
 * @title ROSCAPool
 * @notice Rotating Savings and Credit Association pool implementation
 * @dev Members contribute fixed amounts each round, one member receives the pot each round
 * Payout order is provided off-chain by the creator for fairness and transparency
 */
contract ROSCAPool is IXershaPool, ReentrancyGuard, Pausable {
    using TokenTransfer for address;

    // ========== Constants ==========

    /// @notice Duration of each cycle/round in seconds (30 days)
    uint256 public constant CYCLE_DURATION = 30 days;

    /// @notice Minimum number of members required to start a ROSCA
    uint8 public constant MIN_MEMBERS = 5;

    /// @notice Maximum number of members allowed in a ROSCA
    uint8 public constant MAX_MEMBERS = 12;

    // ========== State Variables ==========

    /// @notice Address of the user who created this pool
    address public creator;

    /// @notice Address of the backend manager (can invite members)
    address public backendManager;

    /// @notice Address of the Lens.xyz circle contract
    address public circleId;

    /// @notice Human-readable name of the circle
    string public circleName;

    /// @notice Address of the ERC20 token used for contributions (zero address if native token)
    address public tokenAddress;

    /// @notice Whether this pool uses native token (cBTC) or ERC20 token
    bool public isNativeToken;

    /// @notice Fixed contribution amount per round in wei
    uint256 public contributionAmount;

    /// @notice Array of all members in the pool
    address[] public members;

    /// @notice Mapping to check if an address is a member
    mapping(address => bool) public isMember;

    /// @notice Mapping to check if an address has been invited
    mapping(address => bool) public isInvited;

    /// @notice Total amount contributed by each member across all rounds
    mapping(address => uint256) public totalContributed;

    /// @notice Array defining the order in which members receive payouts
    address[] public payoutOrder;

    /// @notice Current round number (1-indexed)
    uint8 public currentRound;

    /// @notice Whether the current round's payout has been completed
    bool public currentRoundPaidOut;

    /// @notice Mapping to track which members have received their payout
    mapping(address => bool) public hasReceivedPayout;

    /// @notice Tracks whether a member has paid for a specific round
    mapping(address => mapping(uint8 => bool)) public hasPaid;

    /// @notice Timestamp when the ROSCA was started
    uint256 public roscaStartTime;

    /// @notice Timestamp when the current round started
    uint256 public currentRoundStartTime;

    /// @notice Whether the ROSCA is currently active
    bool public isActive;

    /// @notice Whether the ROSCA has completed all rounds
    bool public isComplete;

    /// @notice Whether this contract has been initialized (for clone pattern)
    bool private initialized;

    // ========== Events ==========

    event ROSCACreated(address indexed circleId, address indexed creator, uint256 contributionAmount);
    event MemberInvited(address indexed member, address indexed invitedBy);
    event MemberJoined(address indexed member, uint256 timestamp);
    event ROSCAStarted(address[] payoutOrder, uint256 startTime);
    event ContributionMade(address indexed member, uint8 round, uint256 amount);
    event AllMembersContributed(uint8 round);
    event PayoutTriggered(address indexed recipient, uint256 amount, uint8 round);
    event RoundStarted(uint8 round, uint256 startTime);
    event ROSCACompleted(uint256 completionTime);

    // ========== Modifiers ==========

    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this");
        _;
    }

    modifier onlyCreatorOrBackend() {
        require(
            msg.sender == creator || msg.sender == backendManager,
            "Only creator or backend"
        );
        _;
    }

    modifier onlyMember() {
        require(isMember[msg.sender], "Not a member");
        _;
    }

    modifier onlyInvited() {
        require(isInvited[msg.sender], "Not invited");
        _;
    }

    modifier poolActive() {
        require(isActive && !isComplete, "Pool not active");
        _;
    }

    // ========== Constructor ==========

    /**
     * @notice Constructor for implementation contract
     * @dev Prevents the implementation contract from being initialized
     */
    constructor() {
        initialized = true;
    }

    /**
     * @notice Initializes a new ROSCA pool clone
     * @dev This replaces the constructor for cloned instances
     * @param _creator Address of the user creating the pool
     * @param _circleId Address of the Lens.xyz circle contract
     * @param _circleName Name of the circle
     * @param _backendManager Address of the backend manager (can invite members)
     * @param _contributionAmount Fixed contribution amount per round
     * @param _tokenAddress Address of the ERC20 token to use for contributions (zero address if native)
     * @param _isNativeToken Whether this pool uses native token (cBTC) or ERC20 token
     */
    function initialize(
        address _creator,
        address _circleId,
        string memory _circleName,
        address _backendManager,
        uint256 _contributionAmount,
        address _tokenAddress,
        bool _isNativeToken
    ) external {
        require(!initialized, "Already initialized");
        initialized = true;

        require(_contributionAmount > 0, "Invalid contribution amount");
        require(_backendManager != address(0), "Invalid backend manager");

        // Validate token address based on token type
        if (_isNativeToken) {
            require(_tokenAddress == address(0), "Token address must be zero for native token");
        } else {
            require(_tokenAddress != address(0), "Invalid token address for ERC20");
        }

        creator = _creator;
        backendManager = _backendManager;
        circleId = _circleId;
        circleName = _circleName;
        contributionAmount = _contributionAmount;
        tokenAddress = _tokenAddress;
        isNativeToken = _isNativeToken;

        // Creator automatically becomes a member
        members.push(_creator);
        isMember[_creator] = true;
        isInvited[_creator] = true;

        emit ROSCACreated(_circleId, _creator, _contributionAmount);
        emit MemberJoined(_creator, block.timestamp);
    }

    // ========== Member Management ==========

    /**
     * @notice Invites a new member to the ROSCA
     * @dev Creator or backend manager can invite, only before ROSCA starts
     * @param member Address of the member to invite
     */
    function inviteMember(address member) external onlyCreatorOrBackend whenNotPaused {
        require(!isActive, "Cannot invite after ROSCA starts");
        require(!isInvited[member], "Already invited");
        require(members.length < MAX_MEMBERS, "Max members reached");

        isInvited[member] = true;
        emit MemberInvited(member, msg.sender);
    }

    /**
     * @notice Allows an invited member to join the pool
     * @dev Can only join before ROSCA starts
     */
    function joinPool() external onlyInvited whenNotPaused {
        require(!isActive, "Cannot join after ROSCA starts");
        require(!isMember[msg.sender], "Already a member");

        members.push(msg.sender);
        isMember[msg.sender] = true;

        emit MemberJoined(msg.sender, block.timestamp);
    }

    // ========== ROSCA Lifecycle ==========

    /**
     * @notice Starts the ROSCA with a provided payout order
     * @dev Only creator can start, requires min members, payout order generated off-chain
     * @param _payoutOrder Array of addresses defining payout order (must include all members exactly once)
     */
    function startROSCA(address[] calldata _payoutOrder) external onlyCreator whenNotPaused {
        require(!isActive, "Already started");
        require(members.length >= MIN_MEMBERS, "Not enough members");
        require(_payoutOrder.length == members.length, "Invalid payout order length");

        // Validate payout order contains all members exactly once
        _validatePayoutOrder(_payoutOrder);

        payoutOrder = _payoutOrder;
        isActive = true;
        currentRound = 1;
        roscaStartTime = block.timestamp;
        currentRoundStartTime = block.timestamp;

        emit ROSCAStarted(_payoutOrder, block.timestamp);
        emit RoundStarted(1, block.timestamp);
    }

    /**
     * @notice Validates that payout order contains all members exactly once
     * @param _payoutOrder The payout order array to validate
     */
    function _validatePayoutOrder(address[] calldata _payoutOrder) private view {
        // Validate each member is in the payout order and check for duplicates
        for (uint256 i = 0; i < _payoutOrder.length; i++) {
            address recipient = _payoutOrder[i];
            require(isMember[recipient], "Payout order contains non-member");

            // Check for duplicates by using a simple loop (gas-efficient for small arrays)
            for (uint256 j = i + 1; j < _payoutOrder.length; j++) {
                require(_payoutOrder[i] != _payoutOrder[j], "Duplicate in payout order");
            }
        }
    }

    /**
     * @notice Allows a member to contribute for the current round
     * @dev For ERC20: Member must have approved the contract to spend tokens before calling
     *      For native token: Must send exact amount of native currency
     */
    function contribute() external payable onlyMember poolActive whenNotPaused nonReentrant {
        require(!hasPaid[msg.sender][currentRound], "Already contributed");
        require(currentRound <= members.length, "All rounds complete");

        hasPaid[msg.sender][currentRound] = true;
        totalContributed[msg.sender] += contributionAmount;

        TokenTransfer.receiveTokens(tokenAddress, isNativeToken, contributionAmount);

        emit ContributionMade(msg.sender, currentRound, contributionAmount);

        if (_everyonePaid()) {
            emit AllMembersContributed(currentRound);
        }
    }

    /**
     * @notice Triggers the payout for the current round
     * @dev Only the designated recipient can trigger their own payout
     * Requires all members to have contributed for the current round
     */
    function triggerPayout() external poolActive whenNotPaused nonReentrant {
        require(_everyonePaid(), "Not everyone has paid");
        require(!currentRoundPaidOut, "Round already paid out");

        address recipient = payoutOrder[currentRound - 1];
        require(msg.sender == recipient, "Only recipient can claim payout");

        currentRoundPaidOut = true;
        hasReceivedPayout[recipient] = true;

        uint256 payoutAmount = contributionAmount * members.length;

        TokenTransfer.sendTokens(tokenAddress, isNativeToken, recipient, payoutAmount);

        emit PayoutTriggered(recipient, payoutAmount, currentRound);

        // Check if ROSCA is complete
        if (currentRound >= members.length) {
            isComplete = true;
            isActive = false;
            emit ROSCACompleted(block.timestamp);
        }
    }

    /**
     * @notice Starts the next round after the cycle duration has passed
     * @dev Any member can call this after the 30-day cycle is complete
     */
    function startNextRound() external onlyMember whenNotPaused {
        require(isActive && !isComplete, "ROSCA not active");
        require(currentRoundPaidOut, "Current round not paid out");
        require(currentRound < members.length, "All rounds complete");
        require(
            block.timestamp >= currentRoundStartTime + CYCLE_DURATION,
            "30-day cycle not complete"
        );

        currentRound++;
        currentRoundStartTime = block.timestamp;
        currentRoundPaidOut = false;

        emit RoundStarted(currentRound, block.timestamp);
    }

    // ========== Emergency Functions ==========

    /**
     * @notice Pauses the contract in case of emergency
     * @dev Only creator can pause
     */
    function pause() external onlyCreator {
        _pause();
    }

    /**
     * @notice Unpauses the contract
     * @dev Only creator can unpause
     */
    function unpause() external onlyCreator {
        _unpause();
    }

    // ========== View Functions ==========

    /**
     * @notice Checks if everyone has paid for the current round
     * @return True if all members have contributed, false otherwise
     */
    function everyonePaid() external view returns (bool) {
        return _everyonePaid();
    }

    /**
     * @notice Internal function to check if everyone has paid
     * @return True if all members have contributed, false otherwise
     */
    function _everyonePaid() private view returns (bool) {
        for (uint256 i = 0; i < members.length; i++) {
            if (!hasPaid[members[i]][currentRound]) {
                return false;
            }
        }
        return true;
    }

    /**
     * @notice Gets the current round's recipient
     * @return Address of the member who should receive payout this round
     */
    function getCurrentRecipient() external view returns (address) {
        if (currentRound == 0 || currentRound > payoutOrder.length) {
            return address(0);
        }
        return payoutOrder[currentRound - 1];
    }

    /**
     * @notice Gets the total number of members
     * @return Member count
     */
    function getMemberCount() external view returns (uint256) {
        return members.length;
    }

    /**
     * @notice Gets all members
     * @return Array of member addresses
     */
    function getMembers() external view returns (address[] memory) {
        return members;
    }

    /**
     * @notice Gets the complete payout order
     * @return Array of addresses in payout order
     */
    function getPayoutOrder() external view returns (address[] memory) {
        return payoutOrder;
    }

    /**
     * @notice Gets list of members who have contributed in the current round
     * @return Array of addresses who have paid
     */
    function getRoundContributors() external view returns (address[] memory) {
        uint256 contributorCount = 0;

        // Count contributors
        for (uint256 i = 0; i < members.length; i++) {
            if (hasPaid[members[i]][currentRound]) {
                contributorCount++;
            }
        }

        // Build contributor array
        address[] memory contributors = new address[](contributorCount);
        uint256 index = 0;

        for (uint256 i = 0; i < members.length; i++) {
            if (hasPaid[members[i]][currentRound]) {
                contributors[index] = members[i];
                index++;
            }
        }

        return contributors;
    }

    /**
     * @notice Gets the contract's current balance
     * @return Balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
