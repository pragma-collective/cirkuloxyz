// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../interfaces/IXershaPool.sol";
import "../libraries/TokenTransfer.sol";

/**
 * @title DonationPool
 * @notice Fundraising pool where circle members donate toward a specific goal and beneficiary
 * @dev Includes refund mechanism if goal is not met by deadline
 */
contract DonationPool is IXershaPool, ReentrancyGuard, Pausable {
    using TokenTransfer for address;

    // ========== State Variables ==========

    /// @notice Address of the user who created this pool
    address public creator;

    /// @notice Address of the backend manager (can invite members)
    address public backendManager;

    /// @notice Address of the Lens.xyz circle contract
    address public circleId;

    /// @notice Human-readable name of the circle
    string public circleName;

    /// @notice Address of the ERC20 token used for donations (zero address if native token)
    address public tokenAddress;

    /// @notice Whether this pool uses native token (cBTC) or ERC20 token
    bool public isNativeToken;

    /// @notice Address that will receive the donated funds
    address public beneficiary;

    /// @notice Target fundraising amount in wei
    uint256 public goalAmount;

    /// @notice Deadline for fundraising as Unix timestamp
    uint256 public deadline;

    /// @notice Total amount raised so far
    uint256 public totalRaised;

    /// @notice Individual donation amounts per member
    mapping(address => uint256) public donations;

    /// @notice Array of all members in the pool
    address[] public members;

    /// @notice Mapping to check if an address is a member
    mapping(address => bool) public isMember;

    /// @notice Mapping to check if an address has been invited
    mapping(address => bool) public isInvited;

    /// @notice Array of addresses that have donated
    address[] public donors;

    /// @notice Whether funds have been released to beneficiary
    bool public fundsReleased;

    /// @notice Whether the pool is currently active
    bool public isActive;

    /// @notice Whether refunds are enabled (goal not met by deadline)
    bool public refundsEnabled;

    /// @notice Whether this contract has been initialized (for clone pattern)
    bool private initialized;

    // ========== Events ==========

    event PoolCreated(
        address indexed circleId,
        address indexed creator,
        address beneficiary,
        uint256 goal,
        uint256 deadline
    );
    event MemberInvited(address indexed member, address indexed invitedBy);
    event MemberJoined(address indexed member);
    event DonationMade(address indexed donor, uint256 amount);
    event GoalReached(uint256 totalRaised);
    event FundsReleased(address indexed beneficiary, uint256 amount);
    event RefundsEnabled(uint256 timestamp);
    event RefundClaimed(address indexed donor, uint256 amount);

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

    // ========== Constructor ==========

    /**
     * @notice Constructor for implementation contract
     * @dev Prevents the implementation contract from being initialized
     */
    constructor() {
        initialized = true;
    }

    /**
     * @notice Initializes a new Donation pool clone
     * @dev This replaces the constructor for cloned instances
     * @param _creator Address of the user creating the pool
     * @param _circleId Address of the Lens.xyz circle contract
     * @param _circleName Name of the circle
     * @param _backendManager Address of the backend manager (can invite members)
     * @param _beneficiary Address that will receive the funds
     * @param _goalAmount Target fundraising amount in wei
     * @param _deadline Deadline as Unix timestamp
     * @param _tokenAddress Address of the ERC20 token to use for donations (zero address if native)
     * @param _isNativeToken Whether this pool uses native token (cBTC) or ERC20 token
     */
    function initialize(
        address _creator,
        address _circleId,
        string memory _circleName,
        address _backendManager,
        address _beneficiary,
        uint256 _goalAmount,
        uint256 _deadline,
        address _tokenAddress,
        bool _isNativeToken
    ) external {
        require(!initialized, "Already initialized");
        initialized = true;

        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_goalAmount > 0, "Goal must be positive");
        require(_deadline > block.timestamp, "Deadline must be future");
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
        beneficiary = _beneficiary;
        goalAmount = _goalAmount;
        deadline = _deadline;
        tokenAddress = _tokenAddress;
        isNativeToken = _isNativeToken;
        isActive = true;

        // Creator automatically becomes a member
        members.push(_creator);
        isMember[_creator] = true;
        isInvited[_creator] = true;

        emit PoolCreated(_circleId, _creator, _beneficiary, _goalAmount, _deadline);
        emit MemberJoined(_creator);
    }

    // ========== Member Management ==========

    /**
     * @notice Invites a new member to the pool
     * @dev Creator or backend manager can invite members
     * @param member Address of the member to invite
     */
    function inviteMember(address member) external onlyCreatorOrBackend whenNotPaused {
        require(!isInvited[member], "Already invited");
        require(member != address(0), "Invalid address");

        isInvited[member] = true;
        emit MemberInvited(member, msg.sender);
    }

    /**
     * @notice Allows an invited member to join the pool
     */
    function joinPool() external onlyInvited whenNotPaused {
        require(!isMember[msg.sender], "Already a member");

        members.push(msg.sender);
        isMember[msg.sender] = true;

        emit MemberJoined(msg.sender);
    }

    // ========== Donations ==========

    /**
     * @notice Allows anyone to donate to the fundraising pool
     * @dev For ERC20: Donor must have approved the contract to spend tokens before calling
     *      For native token: amount parameter is ignored, msg.value is used
     *      NOTE: Unlike SavingsPool and ROSCAPool, DonationPool allows public donations
     * @param amount Amount of ERC20 tokens to donate (ignored for native token pools)
     */
    function donate(uint256 amount) external payable whenNotPaused nonReentrant {
        require(block.timestamp <= deadline, "Deadline passed");
        require(!fundsReleased, "Funds already released");
        require(!refundsEnabled, "Refunds enabled, cannot donate");
        require(isActive, "Pool not active");
        require(isNativeToken || amount > 0, "Must donate something");

        uint256 donationAmount = TokenTransfer.receiveTokens(tokenAddress, isNativeToken, amount);

        // Track first-time donors
        if (donations[msg.sender] == 0) {
            donors.push(msg.sender);
        }

        donations[msg.sender] += donationAmount;
        totalRaised += donationAmount;

        emit DonationMade(msg.sender, donationAmount);

        // Check if goal reached
        if (totalRaised >= goalAmount) {
            emit GoalReached(totalRaised);
        }
    }

    // ========== Fund Management ==========

    /**
     * @notice Releases funds to the beneficiary
     * @dev Only creator can release, can only release after goal met or deadline passed
     */
    function releaseFunds() external onlyCreator whenNotPaused nonReentrant {
        require(!fundsReleased, "Already released");
        require(!refundsEnabled, "Refunds enabled");
        require(
            totalRaised >= goalAmount || block.timestamp > deadline,
            "Goal not met and deadline not passed"
        );

        fundsReleased = true;
        isActive = false;

        uint256 amount = isNativeToken
            ? address(this).balance
            : IERC20(tokenAddress).balanceOf(address(this));

        TokenTransfer.sendTokens(tokenAddress, isNativeToken, beneficiary, amount);

        emit FundsReleased(beneficiary, amount);
    }

    /**
     * @notice Enables refunds if goal was not met by deadline
     * @dev Only creator can enable refunds, only after deadline if goal not met
     */
    function enableRefunds() external onlyCreator whenNotPaused {
        require(!fundsReleased, "Funds already released");
        require(!refundsEnabled, "Refunds already enabled");
        require(block.timestamp > deadline, "Deadline not passed");
        require(totalRaised < goalAmount, "Goal was met");

        refundsEnabled = true;
        isActive = false;

        emit RefundsEnabled(block.timestamp);
    }

    /**
     * @notice Allows a donor to claim their refund
     * @dev Only available if refunds are enabled
     */
    function claimRefund() external whenNotPaused nonReentrant {
        require(refundsEnabled, "Refunds not enabled");
        require(donations[msg.sender] > 0, "Nothing to refund");

        uint256 amount = donations[msg.sender];
        donations[msg.sender] = 0;
        totalRaised -= amount;

        TokenTransfer.sendTokens(tokenAddress, isNativeToken, msg.sender, amount);

        emit RefundClaimed(msg.sender, amount);
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
     * @notice Gets a member's total donation amount
     * @param donor Address of the donor
     * @return Donation amount in wei
     */
    function getDonation(address donor) external view returns (uint256) {
        return donations[donor];
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
     * @notice Gets the total number of donors
     * @return Donor count
     */
    function getDonorCount() external view returns (uint256) {
        return donors.length;
    }

    /**
     * @notice Gets all donors
     * @return Array of donor addresses
     */
    function getDonors() external view returns (address[] memory) {
        return donors;
    }

    /**
     * @notice Gets the time remaining until deadline
     * @return Seconds remaining, or 0 if deadline passed
     */
    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= deadline) {
            return 0;
        }
        return deadline - block.timestamp;
    }

    /**
     * @notice Gets the current fundraising progress
     * @return raised Current amount raised
     * @return goal Goal amount
     */
    function getProgress() external view returns (uint256 raised, uint256 goal) {
        return (totalRaised, goalAmount);
    }

    /**
     * @notice Checks if the fundraising goal has been reached
     * @return True if goal reached, false otherwise
     */
    function isGoalReached() external view returns (bool) {
        return totalRaised >= goalAmount;
    }

    /**
     * @notice Gets the contract's current balance
     * @return Balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
