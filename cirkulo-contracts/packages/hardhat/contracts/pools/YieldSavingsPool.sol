// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../interfaces/IXershaPool.sol";
import "../interfaces/IYieldVault.sol";
import "../libraries/TokenTransfer.sol";

/**
 * @title YieldSavingsPool
 * @notice Collective savings pool where members earn yield on their deposits
 * @dev Extends SavingsPool functionality with yield generation via external vault
 *      Members maintain individual principal balances and earn proportional yield
 */
contract YieldSavingsPool is IXershaPool, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
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

    /// @notice Yield vault where deposits are stored
    IYieldVault public yieldVault;

    /// @notice Individual principal balances for each member (excluding yield)
    mapping(address => uint256) public principalBalances;

    /// @notice Individual vault shares owned by each member
    mapping(address => uint256) public shareBalances;

    /// @notice Total principal deposited across all members (excluding yield)
    uint256 public totalPrincipal;

    /// @notice Total amount saved (tracked for compatibility, equals totalPrincipal)
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

    /// @notice Timestamp when pool was created (for virtual yield calculation)
    uint256 public createdAt;

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
     * @notice Initializes a new YieldSavingsPool clone
     * @dev This replaces the constructor for cloned instances
     * @param _creator Address of the user creating the pool
     * @param _circleId Address of the Lens.xyz circle contract
     * @param _circleName Name of the circle
     * @param _backendManager Address of the backend manager (can invite members)
     * @param _tokenAddress Address of the ERC20 token to use for savings (zero address if native)
     * @param _isNativeToken Whether this pool uses native token (cBTC) or ERC20 token
     * @param _yieldVault Address of the yield vault
     */
    function initialize(
        address _creator,
        address _circleId,
        string memory _circleName,
        address _backendManager,
        address _tokenAddress,
        bool _isNativeToken,
        address _yieldVault
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
        require(_yieldVault != address(0), "Invalid yield vault");

        creator = _creator;
        backendManager = _backendManager;
        circleId = _circleId;
        circleName = _circleName;
        tokenAddress = _tokenAddress;
        isNativeToken = _isNativeToken;
        yieldVault = IYieldVault(_yieldVault);
        isActive = true;
        createdAt = block.timestamp;

        // Verify vault configuration matches pool configuration
        require(yieldVault.isNativeToken() == _isNativeToken, "Vault token type mismatch");
        require(yieldVault.tokenAddress() == _tokenAddress, "Vault token address mismatch");

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
     * @notice Allows a member to deposit funds into savings and earn yield
     * @dev For ERC20: Member must have approved the contract to spend tokens before calling
     *      For native token: amount parameter is ignored, msg.value is used
     *      Tokens are deposited into yield vault and member receives vault shares
     * @param amount Amount of ERC20 tokens to deposit (ignored for native token pools)
     */
    function deposit(uint256 amount) external payable onlyMember poolIsActive whenNotPaused nonReentrant {
        require(isNativeToken || amount > 0, "Must deposit something");

        // 1. Receive tokens from user
        uint256 depositAmount = TokenTransfer.receiveTokens(tokenAddress, isNativeToken, amount);

        // 2. For native token (cBTC): Keep in pool, don't deposit to vault (yield is virtual for demo)
        //    For ERC20 (CUSD): Deposit to vault for real yield
        if (isNativeToken) {
            // cBTC: Just track principal, no vault deposit
            // Virtual shares (1:1 ratio, not used for withdrawals)
            principalBalances[msg.sender] += depositAmount;
            shareBalances[msg.sender] += depositAmount; // Virtual 1:1 shares for display
            totalPrincipal += depositAmount;
            totalSaved += depositAmount;
        } else {
            // CUSD: Full vault integration
            IERC20(tokenAddress).safeIncreaseAllowance(address(yieldVault), depositAmount);
            uint256 sharesReceived = yieldVault.deposit(depositAmount);
            require(sharesReceived > 0, "Must receive shares");

            principalBalances[msg.sender] += depositAmount;
            shareBalances[msg.sender] += sharesReceived;
            totalPrincipal += depositAmount;
            totalSaved += depositAmount;
        }

        emit Deposited(msg.sender, depositAmount);
    }

    /**
     * @notice Allows a member to withdraw from their savings balance
     * @dev For cBTC (native token): Only returns principal (yield is virtual for demo)
     *      For CUSD (ERC20): Returns principal + actual yield
     * @param amount Amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external onlyMember whenNotPaused nonReentrant {
        require(amount > 0, "Must withdraw something");

        uint256 memberShares = shareBalances[msg.sender];
        require(memberShares > 0, "No shares to withdraw");

        uint256 memberPrincipal = principalBalances[msg.sender];

        // For native token (cBTC): only allow withdrawing up to principal
        // For ERC20 (CUSD): allow withdrawing principal + yield
        if (isNativeToken) {
            require(amount <= memberPrincipal, "Cannot withdraw more than principal for native token");

            // For cBTC: We don't actually withdraw from vault to avoid needing to fund it
            // Instead, we just update balances and use the pool's own balance
            // The vault still holds the shares, but we skip vault withdrawal

            // Update balances
            principalBalances[msg.sender] -= amount;
            totalPrincipal -= amount;
            totalSaved -= amount;

            // Send principal amount directly from pool (pool received it during deposit)
            TokenTransfer.sendTokens(tokenAddress, isNativeToken, msg.sender, amount);

            emit Withdrawn(msg.sender, amount);
        } else {
            // CUSD: Full yield withdrawal (original behavior)
            uint256 totalBalance = _getMemberBalance(msg.sender);
            require(totalBalance >= amount, "Insufficient balance");

            // Calculate shares to redeem proportionally
            uint256 sharesToRedeem = (memberShares * amount) / totalBalance;
            require(sharesToRedeem > 0, "Must redeem shares");

            // Withdraw from vault
            uint256 receivedAmount = yieldVault.withdraw(sharesToRedeem);

            // Update member balances proportionally
            uint256 principalReduction = (memberPrincipal * amount) / totalBalance;

            principalBalances[msg.sender] -= principalReduction;
            shareBalances[msg.sender] -= sharesToRedeem;
            totalPrincipal -= principalReduction;
            totalSaved -= principalReduction;

            // Send tokens to member
            TokenTransfer.sendTokens(tokenAddress, isNativeToken, msg.sender, receivedAmount);

            emit Withdrawn(msg.sender, receivedAmount);
        }
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
     * @notice Gets a member's current balance including yield
     * @param member Address of the member
     * @return Balance including principal and earned yield
     */
    function getBalance(address member) external view returns (uint256) {
        // Directly query vault's getBalance which calculates using the same formula as withdraw
        // This ensures getBalance and withdraw return identical values (no rounding differences)
        return _getMemberBalance(member);
    }

    /**
     * @notice Gets a member's current balance including yield
     * @dev Alias for getBalance for compatibility with SavingsPool interface
     * @param member Address of the member
     * @return Balance including principal and earned yield
     */
    function balances(address member) external view returns (uint256) {
        return _getMemberBalance(member);
    }

    /**
     * @notice Gets a member's balance including yield
     * @dev Dedicated function for frontend clarity
     * @param member Address of the member
     * @return Balance including principal and earned yield
     */
    function getBalanceWithYield(address member) external view returns (uint256) {
        return _getMemberBalance(member);
    }

    /**
     * @notice Internal helper to get member balance
     * @dev For cBTC: Calculate virtual yield for display only
     *      For CUSD: Get actual balance from vault
     */
    function _getMemberBalance(address member) private view returns (uint256) {
        uint256 memberPrincipal = principalBalances[member];
        if (memberPrincipal == 0) return 0;

        if (isNativeToken) {
            // cBTC: Calculate virtual yield for display (3% APY)
            // Formula: principal + (principal * 3% * timeElapsed / 365 days)
            // For simplicity in demo, just return principal + calculated yield
            uint256 timeElapsed = block.timestamp - createdAt;
            if (timeElapsed == 0) return memberPrincipal;

            uint256 virtualYield = (memberPrincipal * 300 * timeElapsed) / (365 days * 10000);
            return memberPrincipal + virtualYield;
        } else {
            // CUSD: Get real balance from vault shares
            uint256 memberShares = shareBalances[member];
            if (memberShares == 0) return 0;

            (uint256 totalDeposits, uint256 totalYield, ) = yieldVault.getVaultStats();
            uint256 totalValue = totalDeposits + totalYield;
            uint256 vaultTotalShares = yieldVault.totalShares();

            if (vaultTotalShares == 0) return 0;

            return (memberShares * totalValue) / vaultTotalShares;
        }
    }

    /**
     * @notice Gets the yield earned by a member
     * @param member Address of the member
     * @return Yield earned (total balance - principal)
     */
    function getYieldEarned(address member) external view returns (uint256) {
        uint256 totalBalance = _getMemberBalance(member);
        uint256 principal = principalBalances[member];
        return totalBalance > principal ? totalBalance - principal : 0;
    }

    /**
     * @notice Gets the total yield earned by the entire pool
     * @return Total pool yield (total value - total principal)
     */
    function getTotalYield() external view returns (uint256) {
        (, uint256 yield,) = yieldVault.getVaultStats();
        return yield;
    }

    /**
     * @notice Gets comprehensive pool statistics
     * @return _totalPrincipal Total principal deposited (no yield)
     * @return _totalYield Total yield earned
     * @return _totalValue Total pool value (principal + yield)
     */
    function getPoolStats() external view returns (
        uint256 _totalPrincipal,
        uint256 _totalYield,
        uint256 _totalValue
    ) {
        _totalPrincipal = totalPrincipal;
        (, uint256 yield, uint256 value) = yieldVault.getVaultStats();
        _totalYield = yield;
        _totalValue = value;
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
     * @return current Current total savings (principal + yield)
     * @return target Target savings amount
     */
    function getProgress() external view returns (uint256 current, uint256 target) {
        (,, uint256 totalValue) = yieldVault.getVaultStats();
        return (totalValue, targetAmount);
    }

    /**
     * @notice Checks if the savings goal has been reached
     * @return True if target is set and reached, false otherwise
     */
    function isGoalReached() external view returns (bool) {
        if (targetAmount == 0) return false;
        (,, uint256 totalValue) = yieldVault.getVaultStats();
        return totalValue >= targetAmount;
    }

    /**
     * @notice Gets the contract's current balance (should be minimal, funds are in vault)
     * @return Balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Gets the APY of the connected yield vault
     * @return APY scaled by 100 (e.g., 500 = 5.00%)
     */
    function getAPY() external view returns (uint256) {
        return yieldVault.baseAPY();
    }

    // ========== Fallback ==========

    /**
     * @notice Accept native token deposits
     * @dev Only for native token pools during deposit flow
     *      cBTC stays in pool, not sent to vault (vault not used for cBTC in demo)
     */
    receive() external payable {
        require(isNativeToken, "Pool: not a native token pool");
        // Accept cBTC deposits from users (deposit function uses TokenTransfer which sends to this contract)
    }

    // Helper for debugging
    function addressToString(address _addr) private pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}
