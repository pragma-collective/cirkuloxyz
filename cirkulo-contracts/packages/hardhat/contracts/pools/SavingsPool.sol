// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../interfaces/IXershaPool.sol";
import "../libraries/TokenTransfer.sol";

/**
 * @title SavingsPool
 * @notice Collective savings pool where members can deposit and withdraw freely
 * @dev Members maintain individual balances and can set collective savings goals
 */
contract SavingsPool is IXershaPool, ReentrancyGuard, Pausable {
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

    /// @notice Address of the ERC20 token used for savings (zero address if native token)
    address public tokenAddress;

    /// @notice Whether this pool uses native token (cBTC) or ERC20 token
    bool public isNativeToken;

    /// @notice Individual balances for each member
    mapping(address => uint256) public balances;

    /// @notice Total amount saved across all members
    uint256 public totalSaved;

    /// @notice Array of all members in the pool
    address[] public members;

    /// @notice Mapping to check if an address is a member
    mapping(address => bool) public isMember;

    /// @notice Optional target savings amount set by creator
    uint256 public targetAmount;

    /// @notice Optional target date for reaching the goal
    uint256 public targetDate;

    /// @notice Whether the pool is currently active
    bool public isActive;

    /// @notice Whether this contract has been initialized (for clone pattern)
    bool private initialized;

    // ========== Events ==========

    event PoolCreated(address indexed circleId, address indexed creator);
    event MemberJoined(address indexed member, address indexed addedBy);
    event Deposited(address indexed member, uint256 amount);
    event Withdrawn(address indexed member, uint256 amount);
    event TargetSet(uint256 amount, uint256 date);
    event PoolClosed(uint256 timestamp);

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

    modifier poolIsActive() {
        require(isActive, "Pool not active");
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
     * @notice Initializes a new Savings pool clone
     * @dev This replaces the constructor for cloned instances
     * @param _creator Address of the user creating the pool
     * @param _circleId Address of the Lens.xyz circle contract
     * @param _circleName Name of the circle
     * @param _backendManager Address of the backend manager (can invite members)
     * @param _tokenAddress Address of the ERC20 token to use for savings (zero address if native)
     * @param _isNativeToken Whether this pool uses native token (cBTC) or ERC20 token
     */
    function initialize(
        address _creator,
        address _circleId,
        string memory _circleName,
        address _backendManager,
        address _tokenAddress,
        bool _isNativeToken
    ) external {
        require(!initialized, "Already initialized");
        initialized = true;

        // Validate token address based on token type
        if (_isNativeToken) {
            require(_tokenAddress == address(0), "Token address must be zero for native token");
        } else {
            require(_tokenAddress != address(0), "Invalid token address for ERC20");
        }

        require(_backendManager != address(0), "Invalid backend manager");

        creator = _creator;
        backendManager = _backendManager;
        circleId = _circleId;
        circleName = _circleName;
        tokenAddress = _tokenAddress;
        isNativeToken = _isNativeToken;
        isActive = true;

        // Creator automatically becomes a member
        members.push(_creator);
        isMember[_creator] = true;

        emit PoolCreated(_circleId, _creator);
        emit MemberJoined(_creator, _creator);
    }

    // ========== Member Management ==========

    /**
     * @notice Adds a new member to the pool
     * @dev Creator or backend manager can add members directly
     * @param member Address of the member to add
     */
    function inviteMember(address member) external onlyCreatorOrBackend whenNotPaused {
        require(!isMember[member], "Already a member");
        require(member != address(0), "Invalid address");

        members.push(member);
        isMember[member] = true;

        emit MemberJoined(member, msg.sender);
    }

    // ========== Deposits & Withdrawals ==========

    /**
     * @notice Allows a member to deposit funds into their savings
     * @dev For ERC20: Member must have approved the contract to spend tokens before calling
     *      For native token: amount parameter is ignored, msg.value is used
     * @param amount Amount of ERC20 tokens to deposit (ignored for native token pools)
     */
    function deposit(uint256 amount) external payable onlyMember poolIsActive whenNotPaused nonReentrant {
        require(isNativeToken || amount > 0, "Must deposit something");

        uint256 depositAmount = TokenTransfer.receiveTokens(tokenAddress, isNativeToken, amount);

        balances[msg.sender] += depositAmount;
        totalSaved += depositAmount;

        emit Deposited(msg.sender, depositAmount);
    }

    /**
     * @notice Allows a member to withdraw from their savings balance
     * @param amount Amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external onlyMember whenNotPaused nonReentrant {
        require(amount > 0, "Must withdraw something");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        totalSaved -= amount;

        TokenTransfer.sendTokens(tokenAddress, isNativeToken, msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    // ========== Goal Management ==========

    /**
     * @notice Sets or updates the savings goal for the pool
     * @dev Only creator can set goals
     * @param _amount Target savings amount in wei
     * @param _date Target date as Unix timestamp
     */
    function setTarget(uint256 _amount, uint256 _date) external onlyCreator whenNotPaused {
        require(_amount > 0, "Target amount must be positive");
        require(_date > block.timestamp, "Target date must be in future");

        targetAmount = _amount;
        targetDate = _date;

        emit TargetSet(_amount, _date);
    }

    // ========== Pool Management ==========

    /**
     * @notice Closes the pool, preventing further deposits
     * @dev Only creator can close. Members can still withdraw their balances.
     */
    function closePool() external onlyCreator whenNotPaused {
        isActive = false;
        emit PoolClosed(block.timestamp);
    }

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
     * @notice Gets a member's savings balance
     * @param member Address of the member
     * @return Balance in wei
     */
    function getBalance(address member) external view returns (uint256) {
        return balances[member];
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
     * @notice Gets the current progress toward the savings goal
     * @return current Current total savings
     * @return target Target savings amount
     */
    function getProgress() external view returns (uint256 current, uint256 target) {
        return (totalSaved, targetAmount);
    }

    /**
     * @notice Checks if the savings goal has been reached
     * @return True if target is set and reached, false otherwise
     */
    function isGoalReached() external view returns (bool) {
        if (targetAmount == 0) return false;
        return totalSaved >= targetAmount;
    }

    /**
     * @notice Gets the contract's current balance
     * @return Balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
