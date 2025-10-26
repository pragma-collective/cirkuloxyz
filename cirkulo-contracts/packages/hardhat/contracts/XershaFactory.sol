// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./pools/ROSCAPool.sol";
import "./pools/YieldSavingsPool.sol";
import "./pools/DonationPool.sol";
import "./tokens/XershaCUSD.sol";
import "./tokens/XershaCBTC.sol";

/**
 * @title XershaFactory
 * @notice Factory contract for creating and managing Xersha pools using minimal proxy pattern
 * @dev Enforces one pool per circle and tracks all deployed pools
 *      Uses EIP-1167 minimal proxies (clones) for gas-efficient pool deployment
 */
contract XershaFactory is Ownable {
    // ========== Types ==========

    enum PoolType {
        ROSCA,
        SAVINGS,
        DONATION
    }

    // ========== State Variables ==========

    /// @notice Implementation contract for ROSCA pools
    address public roscaImplementation;

    /// @notice Implementation contract for Savings pools (yield-enabled)
    address public savingsImplementation;

    /// @notice Implementation contract for Donation pools
    address public donationImplementation;

    /// @notice Address of the backend manager for all pools
    address public backendManager;

    /// @notice Yield vault for cBTC pools (3% APY)
    address public cBTCYieldVault;

    /// @notice Yield vault for CUSD pools (5% APY)
    address public cusdYieldVault;

    /// @notice Receipt token for CUSD deposits
    XershaCUSD public cusdReceiptToken;

    /// @notice Receipt token for cBTC deposits
    XershaCBTC public cbtcReceiptToken;

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

    /**
     * @notice Emitted when an implementation address is updated
     * @param poolType The type of pool implementation that was updated
     * @param newImplementation The new implementation address
     */
    event ImplementationUpdated(string poolType, address indexed newImplementation);

    /**
     * @notice Emitted when the backend manager address is updated
     * @param oldManager The previous backend manager address
     * @param newManager The new backend manager address
     */
    event BackendManagerUpdated(address indexed oldManager, address indexed newManager);

    // ========== Constructor ==========

    /**
     * @notice Initializes the factory with implementation addresses
     * @param initialOwner Address that will own the factory
     * @param _backendManager Address of the backend manager for all pools
     * @param _roscaImpl Address of the ROSCA pool implementation
     * @param _savingsImpl Address of the YieldSavingsPool implementation
     * @param _donationImpl Address of the Donation pool implementation
     * @param _cBTCYieldVault Address of the cBTC yield vault (3% APY)
     * @param _cusdYieldVault Address of the CUSD yield vault (5% APY)
     */
    constructor(
        address initialOwner,
        address _backendManager,
        address _roscaImpl,
        address _savingsImpl,
        address _donationImpl,
        address _cBTCYieldVault,
        address _cusdYieldVault
    ) Ownable(initialOwner) {
        require(_backendManager != address(0), "Invalid backend manager");
        require(_roscaImpl != address(0), "Invalid ROSCA implementation");
        require(_savingsImpl != address(0), "Invalid Savings implementation");
        require(_donationImpl != address(0), "Invalid Donation implementation");
        require(_cBTCYieldVault != address(0), "Invalid cBTC vault");
        require(_cusdYieldVault != address(0), "Invalid CUSD vault");

        backendManager = _backendManager;
        roscaImplementation = _roscaImpl;
        savingsImplementation = _savingsImpl;
        donationImplementation = _donationImpl;
        cBTCYieldVault = _cBTCYieldVault;
        cusdYieldVault = _cusdYieldVault;

        // Deploy receipt tokens
        cusdReceiptToken = new XershaCUSD();
        cbtcReceiptToken = new XershaCBTC();
    }

    // ========== Pool Creation Functions ==========

    /**
     * @notice Creates a new ROSCA (Rotating Savings and Credit Association) pool
     * @dev Validates circle ID and ensures no duplicate pools for the same circle
     *      Uses EIP-1167 minimal proxy pattern for gas-efficient deployment
     * @param circleId The Lens.xyz circle contract address
     * @param circleName The name of the circle
     * @param contributionAmount Fixed amount each member must contribute per round
     * @param tokenAddress Address of the ERC20 token (zero address if native)
     * @param isNativeToken Whether to use native token or ERC20
     * @return The address of the newly created ROSCA pool clone
     */
    function createROSCA(
        address circleId,
        string memory circleName,
        uint256 contributionAmount,
        address tokenAddress,
        bool isNativeToken
    ) external returns (address) {
        _validateCircleId(circleId);
        require(circleToPool[circleId] == address(0), "Circle already has pool");
        require(contributionAmount > 0, "Invalid contribution amount");

        // Clone the ROSCA implementation
        address clone = Clones.clone(roscaImplementation);

        // Select appropriate receipt token based on currency
        address receiptToken = isNativeToken ? address(cbtcReceiptToken) : address(cusdReceiptToken);

        // Initialize the clone
        ROSCAPool(clone).initialize(
            msg.sender,
            circleId,
            circleName,
            backendManager,
            contributionAmount,
            tokenAddress,
            isNativeToken,
            receiptToken
        );

        // Authorize pool to mint/burn receipt tokens
        if (isNativeToken) {
            cbtcReceiptToken.addAuthorizedPool(clone);
        } else {
            cusdReceiptToken.addAuthorizedPool(clone);
        }

        _registerPool(circleId, clone, PoolType.ROSCA);

        emit PoolCreated(circleId, clone, msg.sender, PoolType.ROSCA);
        return clone;
    }

    /**
     * @notice Creates a new yield-enabled Savings pool for collective savings
     * @dev All savings pools automatically earn yield (cBTC: 3% APY, CUSD: 5% APY)
     *      Validates circle ID and ensures no duplicate pools for the same circle
     *      Uses EIP-1167 minimal proxy pattern for gas-efficient deployment
     * @param circleId The Lens.xyz circle contract address
     * @param circleName The name of the circle
     * @param tokenAddress Address of the ERC20 token (zero address if native)
     * @param isNativeToken Whether to use native token or ERC20
     * @return The address of the newly created YieldSavingsPool clone
     */
    function createSavingsPool(
        address circleId,
        string memory circleName,
        address tokenAddress,
        bool isNativeToken
    ) external returns (address) {
        _validateCircleId(circleId);
        require(circleToPool[circleId] == address(0), "Circle already has pool");

        // Clone the YieldSavingsPool implementation
        address clone = Clones.clone(savingsImplementation);

        // Select appropriate yield vault based on token type
        address vaultAddress = isNativeToken ? cBTCYieldVault : cusdYieldVault;

        // Select appropriate receipt token based on currency
        address receiptToken = isNativeToken ? address(cbtcReceiptToken) : address(cusdReceiptToken);

        // Initialize the clone with yield vault
        YieldSavingsPool(payable(clone)).initialize(
            msg.sender,
            circleId,
            circleName,
            backendManager,
            tokenAddress,
            isNativeToken,
            vaultAddress,
            receiptToken
        );

        // Authorize pool to mint/burn receipt tokens
        if (isNativeToken) {
            cbtcReceiptToken.addAuthorizedPool(clone);
        } else {
            cusdReceiptToken.addAuthorizedPool(clone);
        }

        _registerPool(circleId, clone, PoolType.SAVINGS);

        emit PoolCreated(circleId, clone, msg.sender, PoolType.SAVINGS);
        return clone;
    }

    /**
     * @notice Creates a new Donation pool for group fundraising
     * @dev Validates circle ID and ensures no duplicate pools for the same circle
     *      Uses EIP-1167 minimal proxy pattern for gas-efficient deployment
     * @param circleId The Lens.xyz circle contract address
     * @param circleName The name of the circle
     * @param beneficiary The address that will receive the donated funds
     * @param goalAmount The fundraising goal amount in wei
     * @param deadline Unix timestamp when fundraising ends
     * @param tokenAddress Address of the ERC20 token (zero address if native)
     * @param isNativeToken Whether to use native token or ERC20
     * @return The address of the newly created Donation pool clone
     */
    function createDonationPool(
        address circleId,
        string memory circleName,
        address beneficiary,
        uint256 goalAmount,
        uint256 deadline,
        address tokenAddress,
        bool isNativeToken
    ) external returns (address) {
        _validateCircleId(circleId);
        require(circleToPool[circleId] == address(0), "Circle already has pool");
        require(beneficiary != address(0), "Invalid beneficiary");
        require(goalAmount > 0, "Invalid goal");
        require(deadline > block.timestamp, "Invalid deadline");

        // Clone the Donation implementation
        address clone = Clones.clone(donationImplementation);

        // Select appropriate receipt token based on currency
        address receiptToken = isNativeToken ? address(cbtcReceiptToken) : address(cusdReceiptToken);

        // Initialize the clone
        DonationPool(clone).initialize(
            msg.sender,
            circleId,
            circleName,
            backendManager,
            beneficiary,
            goalAmount,
            deadline,
            tokenAddress,
            isNativeToken,
            receiptToken
        );

        // Authorize pool to mint/burn receipt tokens
        if (isNativeToken) {
            cbtcReceiptToken.addAuthorizedPool(clone);
        } else {
            cusdReceiptToken.addAuthorizedPool(clone);
        }

        _registerPool(circleId, clone, PoolType.DONATION);

        emit PoolCreated(circleId, clone, msg.sender, PoolType.DONATION);
        return clone;
    }

    // ========== Admin Functions ==========

    /**
     * @notice Updates the ROSCA pool implementation address
     * @dev Only owner can update. New pools will use the new implementation
     * @param newImplementation Address of the new ROSCA implementation
     */
    function setROSCAImplementation(address newImplementation) external onlyOwner {
        require(newImplementation != address(0), "Invalid implementation");
        roscaImplementation = newImplementation;
        emit ImplementationUpdated("ROSCA", newImplementation);
    }

    /**
     * @notice Updates the Savings pool implementation address
     * @dev Only owner can update. New pools will use the new implementation
     * @param newImplementation Address of the new Savings implementation
     */
    function setSavingsImplementation(address newImplementation) external onlyOwner {
        require(newImplementation != address(0), "Invalid implementation");
        savingsImplementation = newImplementation;
        emit ImplementationUpdated("SAVINGS", newImplementation);
    }

    /**
     * @notice Updates the Donation pool implementation address
     * @dev Only owner can update. New pools will use the new implementation
     * @param newImplementation Address of the new Donation implementation
     */
    function setDonationImplementation(address newImplementation) external onlyOwner {
        require(newImplementation != address(0), "Invalid implementation");
        donationImplementation = newImplementation;
        emit ImplementationUpdated("DONATION", newImplementation);
    }

    /**
     * @notice Updates all implementation addresses at once
     * @dev Only owner can update. Pass address(0) to skip updating a specific implementation
     * @param _roscaImpl New ROSCA implementation (or address(0) to skip)
     * @param _savingsImpl New Savings implementation (or address(0) to skip)
     * @param _donationImpl New Donation implementation (or address(0) to skip)
     */
    function setImplementations(
        address _roscaImpl,
        address _savingsImpl,
        address _donationImpl
    ) external onlyOwner {
        if (_roscaImpl != address(0)) {
            roscaImplementation = _roscaImpl;
            emit ImplementationUpdated("ROSCA", _roscaImpl);
        }
        if (_savingsImpl != address(0)) {
            savingsImplementation = _savingsImpl;
            emit ImplementationUpdated("SAVINGS", _savingsImpl);
        }
        if (_donationImpl != address(0)) {
            donationImplementation = _donationImpl;
            emit ImplementationUpdated("DONATION", _donationImpl);
        }
    }

    /**
     * @notice Updates the backend manager address for all future pools
     * @dev Only owner can update. Existing pools are not affected.
     * @param _backendManager New backend manager address
     */
    function setBackendManager(address _backendManager) external onlyOwner {
        require(_backendManager != address(0), "Invalid address");
        address oldManager = backendManager;
        backendManager = _backendManager;
        emit BackendManagerUpdated(oldManager, _backendManager);
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
