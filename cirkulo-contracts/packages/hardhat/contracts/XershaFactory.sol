// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./pools/ROSCAPool.sol";
import "./pools/SavingsPool.sol";
import "./pools/DonationPool.sol";

/**
 * @title XershaFactory
 * @notice Factory contract for creating and managing Xersha pools
 * @dev Enforces one pool per circle and tracks all deployed pools
 */
contract XershaFactory {
    // ========== Types ==========

    enum PoolType {
        ROSCA,
        SAVINGS,
        DONATION
    }

    // ========== State Variables ==========

    /// @notice Mapping from circle contract address to pool address
    mapping(address => address) public circleToPool;

    /// @notice Mapping to validate if an address is a legitimate pool created by this factory
    mapping(address => bool) public isValidPool;

    /// @notice Mapping from pool address to pool type
    mapping(address => PoolType) public poolTypes;

    /// @notice Array of all pools created by this factory
    address[] public allPools;

    // ========== Events ==========

    /**
     * @notice Emitted when a new pool is created
     * @param circleId The Lens.xyz circle contract address
     * @param poolAddress The address of the newly created pool
     * @param creator The address that created the pool
     * @param poolType The type of pool created (ROSCA, SAVINGS, or DONATION)
     */
    event PoolCreated(
        address indexed circleId,
        address indexed poolAddress,
        address indexed creator,
        PoolType poolType
    );

    // ========== Pool Creation Functions ==========

    /**
     * @notice Creates a new ROSCA (Rotating Savings and Credit Association) pool
     * @dev Validates circle ID and ensures no duplicate pools for the same circle
     * @param circleId The Lens.xyz circle contract address
     * @param circleName The name of the circle
     * @param contributionAmount Fixed amount each member must contribute per round
     * @return The address of the newly created ROSCA pool
     */
    function createROSCA(
        address circleId,
        string memory circleName,
        uint256 contributionAmount
    ) external returns (address) {
        _validateCircleId(circleId);
        require(circleToPool[circleId] == address(0), "Circle already has pool");
        require(contributionAmount > 0, "Invalid contribution amount");

        // Deploy new ROSCA pool
        ROSCAPool pool = new ROSCAPool(msg.sender, circleId, circleName, contributionAmount);

        address poolAddress = address(pool);
        _registerPool(circleId, poolAddress, PoolType.ROSCA);

        emit PoolCreated(circleId, poolAddress, msg.sender, PoolType.ROSCA);
        return poolAddress;
    }

    /**
     * @notice Creates a new Savings pool for collective savings
     * @dev Validates circle ID and ensures no duplicate pools for the same circle
     * @param circleId The Lens.xyz circle contract address
     * @param circleName The name of the circle
     * @return The address of the newly created Savings pool
     */
    function createSavingsPool(
        address circleId,
        string memory circleName
    ) external returns (address) {
        _validateCircleId(circleId);
        require(circleToPool[circleId] == address(0), "Circle already has pool");

        // Deploy new Savings pool
        SavingsPool pool = new SavingsPool(msg.sender, circleId, circleName);

        address poolAddress = address(pool);
        _registerPool(circleId, poolAddress, PoolType.SAVINGS);

        emit PoolCreated(circleId, poolAddress, msg.sender, PoolType.SAVINGS);
        return poolAddress;
    }

    /**
     * @notice Creates a new Donation pool for group fundraising
     * @dev Validates circle ID and ensures no duplicate pools for the same circle
     * @param circleId The Lens.xyz circle contract address
     * @param circleName The name of the circle
     * @param beneficiary The address that will receive the donated funds
     * @param goalAmount The fundraising goal amount in wei
     * @param deadline Unix timestamp when fundraising ends
     * @return The address of the newly created Donation pool
     */
    function createDonationPool(
        address circleId,
        string memory circleName,
        address beneficiary,
        uint256 goalAmount,
        uint256 deadline
    ) external returns (address) {
        _validateCircleId(circleId);
        require(circleToPool[circleId] == address(0), "Circle already has pool");
        require(beneficiary != address(0), "Invalid beneficiary");
        require(goalAmount > 0, "Invalid goal");
        require(deadline > block.timestamp, "Invalid deadline");

        // Deploy new Donation pool
        DonationPool pool = new DonationPool(
            msg.sender,
            circleId,
            circleName,
            beneficiary,
            goalAmount,
            deadline
        );

        address poolAddress = address(pool);
        _registerPool(circleId, poolAddress, PoolType.DONATION);

        emit PoolCreated(circleId, poolAddress, msg.sender, PoolType.DONATION);
        return poolAddress;
    }

    // ========== Internal Functions ==========

    /**
     * @notice Validates that the circle ID is not the zero address
     * @dev Circle IDs can reference contracts on other chains (e.g., Lens circles on Polygon)
     * @param circleId The circle address to validate
     */
    function _validateCircleId(address circleId) private pure {
        require(circleId != address(0), "Zero address not allowed");
    }

    /**
     * @notice Registers a newly created pool in the factory's tracking systems
     * @param circleId The circle contract address
     * @param poolAddress The address of the newly created pool
     * @param poolType The type of pool (ROSCA, SAVINGS, or DONATION)
     */
    function _registerPool(address circleId, address poolAddress, PoolType poolType) private {
        circleToPool[circleId] = poolAddress;
        isValidPool[poolAddress] = true;
        poolTypes[poolAddress] = poolType;
        allPools.push(poolAddress);
    }

    // ========== View Functions ==========

    /**
     * @notice Gets the pool address for a given circle
     * @param circleId The circle contract address
     * @return The pool address, or zero address if no pool exists
     */
    function getCirclePool(address circleId) external view returns (address) {
        return circleToPool[circleId];
    }

    /**
     * @notice Gets the total number of pools created by this factory
     * @return The total pool count
     */
    function getTotalPools() external view returns (uint256) {
        return allPools.length;
    }

    /**
     * @notice Gets all pool addresses created by this factory
     * @dev Warning: This can be gas-intensive for large numbers of pools
     * @return Array of all pool addresses
     */
    function getAllPools() external view returns (address[] memory) {
        return allPools;
    }

    /**
     * @notice Gets the pool type for a given pool address
     * @param poolAddress The pool address to query
     * @return The PoolType enum value
     */
    function getPoolType(address poolAddress) external view returns (PoolType) {
        require(isValidPool[poolAddress], "Invalid pool address");
        return poolTypes[poolAddress];
    }
}
