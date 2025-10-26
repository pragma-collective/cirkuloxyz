// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title XershaCUSD
 * @notice Receipt token representing user's total CUSD deposits across all pools
 * @dev Non-transferable ERC20 token that tracks principal + yield
 *      Only authorized pool contracts can mint/burn tokens
 */
contract XershaCUSD is ERC20 {
    // ========== State Variables ==========

    /// @notice Contract owner (factory)
    address public owner;

    /// @notice Authorized pool contracts that can mint/burn
    mapping(address => bool) public authorizedPools;

    /// @notice Track principal balances (excluding yield)
    mapping(address => uint256) public principalBalances;

    // ========== Events ==========

    event PoolAuthorized(address indexed pool);
    event PoolDeauthorized(address indexed pool);
    event YieldMinted(address indexed to, uint256 amount);

    // ========== Constructor ==========

    constructor() ERC20("Xersha CUSD", "xshCUSD") {
        owner = msg.sender;
    }

    // ========== Modifiers ==========

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedPools[msg.sender], "Not authorized");
        _;
    }

    // ========== Pool Functions ==========

    /**
     * @notice Mint receipt tokens when user deposits principal
     * @dev Called by pool contracts on deposit
     * @param to User address
     * @param amount Amount of principal deposited
     */
    function mint(address to, uint256 amount) external onlyAuthorized {
        principalBalances[to] += amount;
        _mint(to, amount);
    }

    /**
     * @notice Burn receipt tokens when user withdraws
     * @dev Proportionally reduces principal balance
     * @param from User address
     * @param amount Amount to burn (includes principal + yield)
     */
    function burn(address from, uint256 amount) external onlyAuthorized {
        uint256 currentBalance = balanceOf(from);
        require(currentBalance >= amount, "Insufficient balance");

        // Calculate proportional principal reduction
        uint256 principalReduction = (principalBalances[from] * amount) / currentBalance;
        principalBalances[from] -= principalReduction;

        _burn(from, amount);
    }

    /**
     * @notice Mint yield tokens (doesn't affect principal balance)
     * @dev Called when yield accrues and needs to be reflected in receipt balance
     * @param to User address
     * @param yieldAmount Amount of yield to mint
     */
    function mintYield(address to, uint256 yieldAmount) external onlyAuthorized {
        _mint(to, yieldAmount);
        emit YieldMinted(to, yieldAmount);
    }

    // ========== Admin Functions ==========

    /**
     * @notice Authorize a pool contract to mint/burn tokens
     * @dev Only owner (factory) can authorize pools
     * @param pool Pool contract address
     */
    function addAuthorizedPool(address pool) external onlyOwner {
        require(pool != address(0), "Invalid pool address");
        authorizedPools[pool] = true;
        emit PoolAuthorized(pool);
    }

    /**
     * @notice Remove authorization from a pool contract
     * @dev Only owner can deauthorize pools
     * @param pool Pool contract address
     */
    function removeAuthorizedPool(address pool) external onlyOwner {
        authorizedPools[pool] = false;
        emit PoolDeauthorized(pool);
    }

    // ========== Non-Transferable Overrides ==========

    /**
     * @notice Disabled - receipt tokens are non-transferable (soulbound)
     */
    function transfer(address, uint256) public pure override returns (bool) {
        revert("xshCUSD: Non-transferable");
    }

    /**
     * @notice Disabled - receipt tokens are non-transferable (soulbound)
     */
    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("xshCUSD: Non-transferable");
    }

    // ========== View Functions ==========

    /**
     * @notice Get user's principal balance (excluding yield)
     * @param account User address
     * @return Principal balance
     */
    function principalOf(address account) external view returns (uint256) {
        return principalBalances[account];
    }

    /**
     * @notice Get user's yield balance
     * @param account User address
     * @return Yield balance (total - principal)
     */
    function yieldOf(address account) external view returns (uint256) {
        uint256 total = balanceOf(account);
        uint256 principal = principalBalances[account];
        return total > principal ? total - principal : 0;
    }
}
