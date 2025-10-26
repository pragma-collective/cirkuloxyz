// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IYieldVault
 * @notice Interface for yield-generating vaults
 * @dev Supports both native tokens (cBTC) and ERC20 tokens (CUSD)
 */
interface IYieldVault {
    /**
     * @notice Deposits tokens into the vault and mints shares
     * @dev For native token vaults, msg.value is used. For ERC20, amount parameter is used.
     * @param amount Amount of ERC20 tokens to deposit (ignored for native token vaults)
     * @return shares Number of vault shares minted
     */
    function deposit(uint256 amount) external payable returns (uint256 shares);

    /**
     * @notice Withdraws tokens from the vault by burning shares
     * @param shares Number of vault shares to burn
     * @return amount Amount of tokens returned (principal + yield)
     */
    function withdraw(uint256 shares) external returns (uint256 amount);

    /**
     * @notice Gets the current balance (principal + yield) for a user
     * @param user Address of the user
     * @return balance Current token balance including accrued yield
     */
    function getBalance(address user) external view returns (uint256 balance);

    /**
     * @notice Gets the current exchange rate (how many tokens per share)
     * @dev Scaled by 1e18. Exchange rate increases as yield accrues.
     * @return rate Current exchange rate (tokens per share × 1e18)
     */
    function getExchangeRate() external view returns (uint256 rate);

    /**
     * @notice Accrues yield based on time elapsed since last accrual
     * @dev Called automatically before deposits/withdrawals, but can be called manually
     */
    function accrueYield() external;

    /**
     * @notice Gets the number of shares owned by a user
     * @param user Address of the user
     * @return shares Number of vault shares owned
     */
    function shares(address user) external view returns (uint256 shares);

    /**
     * @notice Gets the total number of shares in circulation
     * @return total Total vault shares
     */
    function totalShares() external view returns (uint256 total);

    /**
     * @notice Whether this vault handles native tokens (true) or ERC20 (false)
     * @return isNative True if native token vault, false if ERC20
     */
    function isNativeToken() external view returns (bool isNative);

    /**
     * @notice The ERC20 token address (address(0) if native token vault)
     * @return token ERC20 token address or address(0)
     */
    function tokenAddress() external view returns (address token);

    /**
     * @notice The annual percentage yield (APY) of this vault
     * @dev Scaled by 100 (e.g., 500 = 5.00%, 300 = 3.00%)
     * @return apy The base APY
     */
    function baseAPY() external view returns (uint256 apy);

    /**
     * @notice Gets comprehensive vault statistics
     * @return deposits Total deposits (principal only)
     * @return yield Total yield accrued
     * @return value Total vault value (deposits + yield)
     */
    function getVaultStats() external view returns (
        uint256 deposits,
        uint256 yield,
        uint256 value
    );
}
