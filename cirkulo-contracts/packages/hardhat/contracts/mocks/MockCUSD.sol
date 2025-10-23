//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockCUSD
 * @notice Mock CUSD token for testing purposes
 */
contract MockCUSD is ERC20 {
    constructor() ERC20("Citrea USD", "CUSD") {
        // Mint initial supply to deployer for testing
        _mint(msg.sender, 10_000_000 * 10**18); // 10 million tokens
    }

    /**
     * @notice Allows anyone to mint tokens for testing
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
