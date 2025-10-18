// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IXershaPool
 * @notice Base interface for all Xersha pool types
 * @dev Common interface elements shared across ROSCA, Savings, and Donation pools
 */
interface IXershaPool {
    /**
     * @notice Returns the address of the circle (Lens.xyz contract) this pool belongs to
     * @return The circle contract address
     */
    function circleId() external view returns (address);

    /**
     * @notice Returns the address of the user who created this pool
     * @return The creator's address
     */
    function creator() external view returns (address);

    /**
     * @notice Returns the human-readable name of the circle
     * @return The circle name
     */
    function circleName() external view returns (string memory);

    /**
     * @notice Returns whether the pool is currently active
     * @return True if pool is active, false otherwise
     */
    function isActive() external view returns (bool);

    /**
     * @notice Returns the list of all members in the pool
     * @return Array of member addresses
     */
    function getMembers() external view returns (address[] memory);

    /**
     * @notice Returns the total number of members in the pool
     * @return Member count
     */
    function getMemberCount() external view returns (uint256);
}
