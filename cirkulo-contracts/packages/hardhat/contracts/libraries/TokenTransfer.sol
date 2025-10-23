// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TokenTransfer
 * @notice Library for handling both native token and ERC20 token transfers
 * @dev Reduces code duplication across pool contracts
 */
library TokenTransfer {
    /**
     * @notice Receives tokens from sender (either native or ERC20)
     * @param tokenAddress Address of the ERC20 token (zero address if native)
     * @param isNativeToken Whether this is a native token transfer
     * @param amount Amount of tokens to receive (for ERC20) or 0 (for native)
     * @return The actual amount received
     */
    function receiveTokens(
        address tokenAddress,
        bool isNativeToken,
        uint256 amount
    ) internal returns (uint256) {
        if (isNativeToken) {
            require(msg.value > 0, "Must send native token");
            return msg.value;
        } else {
            require(msg.value == 0, "No native token");
            IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
            return amount;
        }
    }

    /**
     * @notice Sends tokens to recipient (either native or ERC20)
     * @param tokenAddress Address of the ERC20 token (zero address if native)
     * @param isNativeToken Whether this is a native token transfer
     * @param recipient Address to send tokens to
     * @param amount Amount of tokens to send
     */
    function sendTokens(
        address tokenAddress,
        bool isNativeToken,
        address recipient,
        uint256 amount
    ) internal {
        if (isNativeToken) {
            (bool success, ) = payable(recipient).call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(tokenAddress).transfer(recipient, amount);
        }
    }
}
