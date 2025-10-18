// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../interfaces/IXershaPool.sol";

/**
 * @title SavingsPool
 * @notice Collective savings pool where members can deposit and withdraw freely
 * @dev Members maintain individual balances and can set collective savings goals
 */
contract SavingsPool is IXershaPool, ReentrancyGuard, Pausable {
    // ========== State Variables ==========

    /// @notice Address of the user who created this pool
    address public creator;

    /// @notice Address of the Lens.xyz circle contract
    address public circleId;

    /// @notice Human-readable name of the circle
    string public circleName;

    /// @notice Individual balances for each member
    mapping(address => uint256) public balances;

    /// @notice Total amount saved across all members
    uint256 public totalSaved;

    /// @notice Array of all members in the pool
    address[] public members;

    /// @notice Mapping to check if an address is a member
    mapping(address => bool) public isMember;

    /// @notice Mapping to check if an address has been invited
    mapping(address => bool) public isInvited;

    /// @notice Optional target savings amount set by creator
    uint256 public targetAmount;

    /// @notice Optional target date for reaching the goal
    uint256 public targetDate;

    /// @notice Whether the pool is currently active
    bool public isActive;

    // ========== Events ==========

    event PoolCreated(address indexed circleId, address indexed creator);
    event MemberInvited(address indexed member, address indexed invitedBy);
    event MemberJoined(address indexed member);
    event Deposited(address indexed member, uint256 amount);
    event Withdrawn(address indexed member, uint256 amount);
    event TargetSet(uint256 amount, uint256 date);
    event PoolClosed(uint256 timestamp);

    // ========== Modifiers ==========

    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this");
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

    modifier poolIsActive() {
        require(isActive, "Pool not active");
        _;
    }

    // ========== Constructor ==========

    /**
     * @notice Creates a new Savings pool
     * @param _creator Address of the user creating the pool
     * @param _circleId Address of the Lens.xyz circle contract
     * @param _circleName Name of the circle
     */
    constructor(address _creator, address _circleId, string memory _circleName) {
        creator = _creator;
        circleId = _circleId;
        circleName = _circleName;
        isActive = true;

        // Creator automatically becomes a member
        members.push(_creator);
        isMember[_creator] = true;
        isInvited[_creator] = true;

        emit PoolCreated(_circleId, _creator);
        emit MemberJoined(_creator);
    }

    // ========== Member Management ==========

    /**
     * @notice Invites a new member to the pool
     * @dev Only creator can invite members
     * @param member Address of the member to invite
     */
    function inviteMember(address member) external onlyCreator whenNotPaused {
        require(!isInvited[member], "Already invited");
        require(member != address(0), "Invalid address");

        isInvited[member] = true;
        emit MemberInvited(member, creator);
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

    // ========== Deposits & Withdrawals ==========

    /**
     * @notice Allows a member to deposit funds into their savings
     * @dev Amount is tracked in member's individual balance
     */
    function deposit() external payable onlyMember poolIsActive whenNotPaused nonReentrant {
        require(msg.value > 0, "Must deposit something");

        balances[msg.sender] += msg.value;
        totalSaved += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @notice Allows a member to withdraw from their savings balance
     * @param amount Amount to withdraw in wei
     */
    function withdraw(uint256 amount) external onlyMember whenNotPaused nonReentrant {
        require(amount > 0, "Must withdraw something");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        totalSaved -= amount;

        // Use call instead of transfer for better compatibility
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

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
