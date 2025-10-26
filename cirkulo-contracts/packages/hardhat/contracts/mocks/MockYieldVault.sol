// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IYieldVault.sol";
import "./MockCUSD.sol";

/**
 * @title MockYieldVault
 * @notice Mock yield-generating vault for demo purposes (simulates AAVE-like behavior)
 * @dev Supports both native tokens (cBTC) and ERC20 tokens (CUSD)
 *      Uses share-based accounting where exchange rate increases over time
 */
contract MockYieldVault is IYieldVault, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ========== Constants ==========

    uint256 private constant SECONDS_PER_YEAR = 365 days;
    uint256 private constant PRECISION = 1e18;

    // ========== State Variables ==========

    /// @notice Address of the ERC20 token (address(0) if native token)
    address public override tokenAddress;

    /// @notice Whether this vault uses native token (true) or ERC20 (false)
    bool public override isNativeToken;

    /// @notice Base APY scaled by 100 (e.g., 500 = 5.00%, 300 = 3.00%)
    uint256 public override baseAPY;

    /// @notice Last time yield was accrued
    uint256 public lastAccrualTime;

    /// @notice Total tokens deposited (principal only, excludes yield)
    uint256 public totalDeposits;

    /// @notice Total yield accrued
    uint256 public totalYield;

    /// @notice Total vault shares in circulation
    uint256 public override totalShares;

    /// @notice Mapping of user addresses to their vault shares
    mapping(address => uint256) public override shares;

    // ========== Events ==========

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 shares, uint256 amount);
    event YieldAccrued(uint256 amount, uint256 timestamp);

    // ========== Constructor ==========

    /**
     * @notice Creates a new yield vault
     * @param _tokenAddress Address of the ERC20 token (address(0) for native token)
     * @param _isNativeToken Whether this vault uses native token
     * @param _baseAPY Base APY scaled by 100 (e.g., 500 = 5.00%)
     */
    constructor(
        address _tokenAddress,
        bool _isNativeToken,
        uint256 _baseAPY
    ) {
        // Validate token configuration
        if (_isNativeToken) {
            require(_tokenAddress == address(0), "Native token must have zero address");
        } else {
            require(_tokenAddress != address(0), "ERC20 token must have valid address");
        }

        require(_baseAPY > 0 && _baseAPY <= 10000, "Invalid APY"); // Max 100% APY

        tokenAddress = _tokenAddress;
        isNativeToken = _isNativeToken;
        baseAPY = _baseAPY;
        lastAccrualTime = block.timestamp;
    }

    // ========== External Functions ==========

    /**
     * @notice Deposits tokens and mints shares
     * @dev For native token: uses msg.value, amount parameter ignored
     *      For ERC20: transfers amount from user
     * @param amount Amount of ERC20 tokens to deposit (ignored for native)
     * @return sharesAmount Number of shares minted
     */
    function deposit(uint256 amount)
        external
        payable
        override
        nonReentrant
        returns (uint256 sharesAmount)
    {
        // Accrue yield before deposit to get accurate exchange rate
        accrueYield();

        // Determine deposit amount based on token type
        uint256 depositAmount;
        if (isNativeToken) {
            require(msg.value > 0, "Must deposit native tokens");
            depositAmount = msg.value;
        } else {
            require(amount > 0, "Must deposit tokens");
            require(msg.value == 0, "Do not send native tokens to ERC20 vault");
            depositAmount = amount;

            // Transfer ERC20 tokens from user
            IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), depositAmount);
        }

        // Calculate shares to mint based on current exchange rate
        if (totalShares == 0) {
            // First deposit: 1:1 ratio
            sharesAmount = depositAmount;
        } else {
            // Subsequent deposits: shares = (depositAmount * totalShares) / totalValue
            uint256 totalValue = totalDeposits + totalYield;
            sharesAmount = (depositAmount * totalShares) / totalValue;
        }

        require(sharesAmount > 0, "Shares minted must be > 0");

        // Update state
        shares[msg.sender] += sharesAmount;
        totalShares += sharesAmount;
        totalDeposits += depositAmount;

        emit Deposited(msg.sender, depositAmount, sharesAmount);

        return sharesAmount;
    }

    /**
     * @notice Withdraws tokens by burning shares
     * @param sharesToBurn Number of shares to burn
     * @return withdrawAmount Amount of tokens returned (principal + yield)
     */
    function withdraw(uint256 sharesToBurn)
        external
        override
        nonReentrant
        returns (uint256 withdrawAmount)
    {
        require(sharesToBurn > 0, "Must withdraw shares");
        require(shares[msg.sender] >= sharesToBurn, "Insufficient shares");

        // Accrue yield before withdrawal
        accrueYield();

        // Calculate withdrawal amount: (shares * totalValue) / totalShares
        uint256 totalValue = totalDeposits + totalYield;
        withdrawAmount = (sharesToBurn * totalValue) / totalShares;

        require(withdrawAmount > 0, "Withdrawal amount must be > 0");

        // Update state (reduce proportionally from deposits and yield)
        uint256 principalReduction = (sharesToBurn * totalDeposits) / totalShares;
        uint256 yieldReduction = withdrawAmount - principalReduction;

        shares[msg.sender] -= sharesToBurn;
        totalShares -= sharesToBurn;
        totalDeposits -= principalReduction;

        if (yieldReduction > totalYield) {
            totalYield = 0;
        } else {
            totalYield -= yieldReduction;
        }

        // Transfer tokens to user
        if (isNativeToken) {
            require(address(this).balance >= withdrawAmount, "Insufficient native token balance in vault");
            // Send with explicit gas limit to ensure receive() can execute
            (bool success, bytes memory returndata) = msg.sender.call{value: withdrawAmount, gas: 100000}("");
            require(success, string(abi.encodePacked("Native token transfer failed: ", string(returndata))));
        } else {
            IERC20(tokenAddress).safeTransfer(msg.sender, withdrawAmount);
        }

        emit Withdrawn(msg.sender, sharesToBurn, withdrawAmount);

        return withdrawAmount;
    }

    /**
     * @notice Accrues yield based on time elapsed
     * @dev Can be called by anyone to update yield
     */
    function accrueYield() public override {
        if (totalDeposits == 0) {
            lastAccrualTime = block.timestamp;
            return;
        }

        uint256 timeElapsed = block.timestamp - lastAccrualTime;
        if (timeElapsed == 0) {
            return;
        }

        // Calculate yield: principal * APY * timeElapsed / SECONDS_PER_YEAR / 10000
        // baseAPY is scaled by 100 (500 = 5%), so divide by 10000 to get decimal
        uint256 yieldAccrued = (totalDeposits * baseAPY * timeElapsed) / (SECONDS_PER_YEAR * 10000);

        if (yieldAccrued > 0) {
            totalYield += yieldAccrued;

            // For mock vault: mint/receive yield tokens so they're available for withdrawal
            // In production, yield would come from actual DeFi protocols
            if (!isNativeToken) {
                // Mint ERC20 yield tokens to this vault
                MockCUSD(tokenAddress).mint(address(this), yieldAccrued);
            }
            // For native tokens, yield would need to be sent to this contract
            // In tests, this is handled by sending ETH/cBTC to the vault

            emit YieldAccrued(yieldAccrued, block.timestamp);
        }

        lastAccrualTime = block.timestamp;
    }

    // ========== View Functions ==========

    /**
     * @notice Gets current balance (principal + yield) for a user
     * @param user Address of the user
     * @return balance Current token balance including accrued yield
     */
    function getBalance(address user) external view override returns (uint256 balance) {
        if (shares[user] == 0 || totalShares == 0) {
            return 0;
        }

        // Calculate pending yield (not yet accrued on-chain)
        uint256 pendingYield = _calculatePendingYield();
        uint256 totalValue = totalDeposits + totalYield + pendingYield;

        // User's balance: (shares * totalValue) / totalShares
        balance = (shares[user] * totalValue) / totalShares;

        return balance;
    }

    /**
     * @notice Gets the current exchange rate (tokens per share)
     * @dev Scaled by PRECISION (1e18)
     * @return rate Exchange rate × 1e18
     */
    function getExchangeRate() external view override returns (uint256 rate) {
        if (totalShares == 0) {
            return PRECISION; // 1:1 ratio for first deposit
        }

        uint256 pendingYield = _calculatePendingYield();
        uint256 totalValue = totalDeposits + totalYield + pendingYield;

        // Exchange rate: (totalValue * PRECISION) / totalShares
        rate = (totalValue * PRECISION) / totalShares;

        return rate;
    }

    /**
     * @notice Gets the contract's current token balance
     * @return balance Contract balance in tokens
     */
    function getContractBalance() external view returns (uint256 balance) {
        if (isNativeToken) {
            return address(this).balance;
        } else {
            return IERC20(tokenAddress).balanceOf(address(this));
        }
    }

    /**
     * @notice Gets vault statistics
     * @return deposits Total deposits (principal only)
     * @return yield Total yield accrued
     * @return value Total vault value (deposits + yield)
     */
    function getVaultStats() external view returns (
        uint256 deposits,
        uint256 yield,
        uint256 value
    ) {
        uint256 pendingYield = _calculatePendingYield();
        deposits = totalDeposits;
        yield = totalYield + pendingYield;
        value = totalDeposits + totalYield + pendingYield;
    }

    // ========== Internal Functions ==========

    /**
     * @notice Calculates pending yield that hasn't been accrued on-chain yet
     * @return pending Pending yield amount
     */
    function _calculatePendingYield() internal view returns (uint256 pending) {
        if (totalDeposits == 0) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - lastAccrualTime;
        if (timeElapsed == 0) {
            return 0;
        }

        pending = (totalDeposits * baseAPY * timeElapsed) / (SECONDS_PER_YEAR * 10000);
        return pending;
    }

    // ========== Fallback ==========

    /**
     * @notice Accept native token deposits
     * @dev Only for native token vaults
     */
    receive() external payable {
        require(isNativeToken, "Vault does not accept native tokens");
    }
}
