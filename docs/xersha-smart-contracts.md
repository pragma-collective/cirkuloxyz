# Xersha Pool System - Smart Contract Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Pool Types](#pool-types)
   - [ROSCA Pool](#rosca-pool)
   - [Savings Pool](#savings-pool)
   - [Donation Pool](#donation-pool)
4. [Smart Contract Implementation](#smart-contract-implementation)
   - [Factory Contract](#factory-contract)
   - [ROSCA Pool Contract](#rosca-pool-contract)
   - [Savings Pool Contract](#savings-pool-contract)
   - [Donation Pool Contract](#donation-pool-contract)
5. [Yield Integration Guide](#yield-integration-guide)
   - [AAVE Integration](#aave-integration)
   - [Safe SDK Integration](#safe-sdk-integration)
6. [Access Control & Security](#access-control--security)
7. [Deployment Strategy](#deployment-strategy)
8. [Future Enhancements](#future-enhancements)

---

## Overview

Xersha enables friend groups (circles) to collectively save money through different pool mechanisms. Each circle can have ONE active pool at a time, choosing between rotating savings (ROSCA), collective savings, or group fundraising for causes. The system is fully decentralized - users create and manage their own pools directly from the frontend.

### Core Principles

- **One Pool Per Circle**: Keeps focus and simplifies management
- **Creator-Controlled**: The person who creates the pool manages it
- **Social Trust Model**: Built for existing friend groups, no collateral required
- **Fully Decentralized**: No backend required, users interact directly with contracts

## Architecture

```
User (Circle Creator)
    ├── Creates Pool via Factory
    └── Manages Pool
            ├── Invites Members
            ├── Starts ROSCA/Sets Goals
            └── Manages Settings

Factory Contract
    ├── Deploys Pools
    └── Tracks Circle → Pool Mapping
            ├── ROSCA Pool (rotating payouts)
            ├── Savings Pool (collective savings) 
            └── Donation Pool (charitable giving)
```

### Key Components

| Component | Purpose | Control |
|-----------|---------|---------|
| **Factory** | Deploys pools, prevents duplicates | Permissionless - anyone can create |
| **Pools** | Individual savings mechanisms | Creator controls their pool |
| **Members** | Circle participants | Invited by creator |
| **Events** | State tracking for frontend | Indexed by frontend |

## Pool Types

### ROSCA Pool

**Purpose**: Rotating savings where each member receives the full pot once

**Mechanics**:
1. User creates ROSCA with contribution amount (e.g., $50/month)
2. Creator invites friends (5-12 people)
3. Creator starts ROSCA, triggering lottery for payout order
4. Each round: Everyone contributes → One member receives pot
5. Continues until everyone receives once

**Key Parameters**:
- `contributionAmount`: Fixed amount per round (set by creator)
- `cycleDuration`: 30 days (monthly cycles)
- `minMembers`: 5 (for viable pool)
- `maxMembers`: 12 (for manageable size)

**Rules Enforced**:
- No individual withdrawals
- Fixed payout order (randomly set at start)
- Mandatory waiting period between rounds
- Each member receives exactly once

### Savings Pool

**Purpose**: Collective savings like a shared bank account

**Mechanics**:
1. Creator starts a savings pool for their circle
2. Creator invites members
3. Members deposit any amount, anytime
4. Members can withdraw their balance
5. Optional: Creator sets savings goals
6. Future: Yield generation via DeFi

**Key Features**:
- Flexible contribution amounts
- Individual balance tracking
- No fixed timeline
- Withdrawal rights maintained
- Creator can set targets

### Donation Pool

**Purpose**: Group fundraising for charitable causes

**Mechanics**:
1. Creator sets beneficiary, goal amount, and deadline
2. Creator invites circle members
3. Members contribute towards goal
4. Creator releases funds when appropriate
5. No individual withdrawals allowed

**Key Parameters**:
- `beneficiary`: Recipient address (set by creator)
- `goalAmount`: Target fundraising amount
- `deadline`: Time limit for fundraising
- `membersOnly`: Only invited members can contribute

## Smart Contract Implementation

### Factory Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ROSCAPool.sol";
import "./SavingsPool.sol";
import "./DonationPool.sol";

contract XershaFactory {
    // ========== State Variables ==========
    
    mapping(address => address) public circleToPool;  // One pool per circle
    mapping(address => bool) public isValidPool;
    mapping(address => PoolType) public poolTypes;
    
    address[] public allPools;
    
    enum PoolType { ROSCA, SAVINGS, DONATION }
    
    // ========== Events ==========
    event PoolCreated(
        address indexed circleId,
        address indexed poolAddress,
        address indexed creator,
        PoolType poolType
    );
    
    // ========== Pool Creation (Permissionless) ==========
    
    function createROSCA(
        address circleId,
        string memory circleName,
        uint256 contributionAmount
    ) external returns (address) {
        require(circleToPool[circleId] == address(0), "Circle already has pool");
        require(contributionAmount > 0, "Invalid contribution amount");
        
        // Creator is msg.sender - the user calling this function
        ROSCAPool pool = new ROSCAPool(
            msg.sender,  // Creator becomes admin of the pool
            circleId,
            circleName,
            contributionAmount
        );
        
        address poolAddress = address(pool);
        _registerPool(circleId, poolAddress, PoolType.ROSCA);
        
        emit PoolCreated(circleId, poolAddress, msg.sender, PoolType.ROSCA);
        return poolAddress;
    }
    
    function createSavingsPool(
        address circleId,
        string memory circleName
    ) external returns (address) {
        require(circleToPool[circleId] == address(0), "Circle already has pool");
        
        // Creator is msg.sender
        SavingsPool pool = new SavingsPool(
            msg.sender,
            circleId,
            circleName
        );
        
        address poolAddress = address(pool);
        _registerPool(circleId, poolAddress, PoolType.SAVINGS);
        
        emit PoolCreated(circleId, poolAddress, msg.sender, PoolType.SAVINGS);
        return poolAddress;
    }
    
    function createDonationPool(
        address circleId,
        string memory circleName,
        address beneficiary,
        uint256 goalAmount,
        uint256 deadline
    ) external returns (address) {
        require(circleToPool[circleId] == address(0), "Circle already has pool");
        require(beneficiary != address(0), "Invalid beneficiary");
        require(goalAmount > 0, "Invalid goal");
        require(deadline > block.timestamp, "Invalid deadline");
        
        // Creator is msg.sender
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
    
    function _registerPool(
        address circleId,
        address poolAddress,
        PoolType poolType
    ) private {
        circleToPool[circleId] = poolAddress;
        isValidPool[poolAddress] = true;
        poolTypes[poolAddress] = poolType;
        allPools.push(poolAddress);
    }
    
    // ========== View Functions ==========
    
    function getCirclePool(address circleId) external view returns (address) {
        return circleToPool[circleId];
    }
    
    function getTotalPools() external view returns (uint256) {
        return allPools.length;
    }
    
    function getAllPools() external view returns (address[] memory) {
        return allPools;
    }
}
```

### ROSCA Pool Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ROSCAPool {
    // ========== State Variables ==========
    
    // Core identifiers
    address public creator;  // User who created the pool
    address public circleId;
    string public circleName;
    
    // ROSCA configuration
    uint256 public contributionAmount;
    uint256 public constant CYCLE_DURATION = 30 days;
    uint8 public constant MIN_MEMBERS = 5;
    uint8 public constant MAX_MEMBERS = 12;
    
    // Member management
    address[] public members;
    mapping(address => bool) public isMember;
    mapping(address => bool) public isInvited;  // Invited by creator
    mapping(address => uint256) public totalContributed;
    
    // Payout management
    address[] public payoutOrder;
    uint8 public currentRound;
    bool public currentRoundPaidOut;
    mapping(address => bool) public hasReceivedPayout;
    
    // Payment tracking
    mapping(address => mapping(uint8 => bool)) public hasPaid;
    
    // Timing
    uint256 public roscaStartTime;
    uint256 public currentRoundStartTime;
    
    // Status
    bool public isActive;
    bool public isComplete;
    
    // ========== Events ==========
    event ROSCACreated(address indexed circleId, address indexed creator, uint256 contributionAmount);
    event MemberInvited(address indexed member, address indexed invitedBy);
    event MemberJoined(address indexed member, uint256 timestamp);
    event ROSCAStarted(address[] payoutOrder, uint256 startTime);
    event ContributionMade(address indexed member, uint8 round, uint256 amount);
    event AllMembersContributed(uint8 round);
    event PayoutTriggered(address indexed recipient, uint256 amount, uint8 round);
    event RoundStarted(uint8 round, uint256 startTime);
    event ROSCACompleted(uint256 completionTime);
    
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
    
    modifier poolActive() {
        require(isActive && !isComplete, "Pool not active");
        _;
    }
    
    // ========== Constructor ==========
    constructor(
        address _creator,
        address _circleId,
        string memory _circleName,
        uint256 _contributionAmount
    ) {
        require(_contributionAmount > 0, "Invalid contribution amount");
        
        creator = _creator;
        circleId = _circleId;
        circleName = _circleName;
        contributionAmount = _contributionAmount;
        
        // Creator automatically becomes a member
        members.push(_creator);
        isMember[_creator] = true;
        isInvited[_creator] = true;
        
        emit ROSCACreated(_circleId, _creator, _contributionAmount);
        emit MemberJoined(_creator, block.timestamp);
    }
    
    // ========== Member Management (Creator Controlled) ==========
    
    function inviteMember(address member) external onlyCreator {
        require(!isActive, "Cannot invite after ROSCA starts");
        require(!isInvited[member], "Already invited");
        require(members.length < MAX_MEMBERS, "Max members reached");
        
        isInvited[member] = true;
        emit MemberInvited(member, creator);
    }
    
    function joinPool() external onlyInvited {
        require(!isActive, "Cannot join after ROSCA starts");
        require(!isMember[msg.sender], "Already a member");
        
        members.push(msg.sender);
        isMember[msg.sender] = true;
        
        emit MemberJoined(msg.sender, block.timestamp);
    }
    
    // ========== Start ROSCA with On-Chain Lottery ==========
    
    function startROSCA() external onlyCreator {
        require(!isActive, "Already started");
        require(members.length >= MIN_MEMBERS, "Not enough members");
        
        // Generate random payout order using on-chain randomness
        payoutOrder = _shuffleMembers();
        
        isActive = true;
        currentRound = 1;
        roscaStartTime = block.timestamp;
        currentRoundStartTime = block.timestamp;
        
        emit ROSCAStarted(payoutOrder, block.timestamp);
        emit RoundStarted(1, block.timestamp);
    }
    
    function _shuffleMembers() private view returns (address[] memory) {
        address[] memory shuffled = new address[](members.length);
        
        // Copy members to shuffled array
        for (uint i = 0; i < members.length; i++) {
            shuffled[i] = members[i];
        }
        
        // Fisher-Yates shuffle with on-chain randomness
        for (uint256 i = shuffled.length - 1; i > 0; i--) {
            uint256 j = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                block.number,
                i
            ))) % (i + 1);
            
            // Swap
            address temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        
        return shuffled;
    }
    
    // ========== Contributions ==========
    
    function contribute() external payable onlyMember poolActive {
        require(msg.value == contributionAmount, "Incorrect amount");
        require(!hasPaid[msg.sender][currentRound], "Already contributed");
        require(currentRound <= members.length, "All rounds complete");
        
        hasPaid[msg.sender][currentRound] = true;
        totalContributed[msg.sender] += msg.value;
        
        emit ContributionMade(msg.sender, currentRound, msg.value);
        
        if (_everyonePaid()) {
            emit AllMembersContributed(currentRound);
        }
    }
    
    // ========== Payout Management ==========
    
    function triggerPayout() external poolActive {
        require(_everyonePaid(), "Not everyone has paid");
        require(!currentRoundPaidOut, "Round already paid out");
        
        address recipient = payoutOrder[currentRound - 1];
        
        // Only recipient can trigger their own payout
        require(msg.sender == recipient, "Only recipient can claim payout");
        
        currentRoundPaidOut = true;
        hasReceivedPayout[recipient] = true;
        
        uint256 payoutAmount = contributionAmount * members.length;
        payable(recipient).transfer(payoutAmount);
        
        emit PayoutTriggered(recipient, payoutAmount, currentRound);
        
        // Check if ROSCA is complete
        if (currentRound >= members.length) {
            isComplete = true;
            isActive = false;
            emit ROSCACompleted(block.timestamp);
        }
    }
    
    // ========== Round Management ==========
    
    function startNextRound() external onlyMember {
        require(isActive && !isComplete, "ROSCA not active");
        require(currentRoundPaidOut, "Current round not paid out");
        require(currentRound < members.length, "All rounds complete");
        require(
            block.timestamp >= currentRoundStartTime + CYCLE_DURATION,
            "30-day cycle not complete"
        );
        
        // Any member can start the next round after waiting period
        currentRound++;
        currentRoundStartTime = block.timestamp;
        currentRoundPaidOut = false;
        
        // Reset payment tracking for new round
        for (uint i = 0; i < members.length; i++) {
            hasPaid[members[i]][currentRound] = false;
        }
        
        emit RoundStarted(currentRound, block.timestamp);
    }
    
    // ========== View Functions ==========
    
    function _everyonePaid() private view returns (bool) {
        for (uint i = 0; i < members.length; i++) {
            if (!hasPaid[members[i]][currentRound]) {
                return false;
            }
        }
        return true;
    }
    
    function everyonePaid() external view returns (bool) {
        return _everyonePaid();
    }
    
    function getCurrentRecipient() external view returns (address) {
        if (currentRound == 0 || currentRound > payoutOrder.length) {
            return address(0);
        }
        return payoutOrder[currentRound - 1];
    }
    
    function getMemberCount() external view returns (uint256) {
        return members.length;
    }
    
    function getMembers() external view returns (address[] memory) {
        return members;
    }
    
    function getPayoutOrder() external view returns (address[] memory) {
        return payoutOrder;
    }
    
    function getRoundContributors() external view returns (address[] memory) {
        uint256 contributorCount = 0;
        
        // Count contributors
        for (uint i = 0; i < members.length; i++) {
            if (hasPaid[members[i]][currentRound]) {
                contributorCount++;
            }
        }
        
        // Build contributor array
        address[] memory contributors = new address[](contributorCount);
        uint256 index = 0;
        
        for (uint i = 0; i < members.length; i++) {
            if (hasPaid[members[i]][currentRound]) {
                contributors[index] = members[i];
                index++;
            }
        }
        
        return contributors;
    }
}
```

### Savings Pool Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SavingsPool {
    // ========== State Variables ==========
    
    // Core identifiers
    address public creator;  // User who created the pool
    address public circleId;
    string public circleName;
    
    // Savings tracking
    mapping(address => uint256) public balances;
    uint256 public totalSaved;
    
    // Member management
    address[] public members;
    mapping(address => bool) public isMember;
    mapping(address => bool) public isInvited;
    
    // Optional goal setting (creator can set)
    uint256 public targetAmount;
    uint256 public targetDate;
    
    // Status
    bool public isActive;
    
    // Yield integration (future)
    address public yieldStrategy;
    bool public yieldEnabled;
    
    // ========== Events ==========
    event PoolCreated(address indexed circleId, address indexed creator);
    event MemberInvited(address indexed member, address indexed invitedBy);
    event MemberJoined(address indexed member);
    event Deposited(address indexed member, uint256 amount);
    event Withdrawn(address indexed member, uint256 amount);
    event TargetSet(uint256 amount, uint256 date);
    
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
    
    // ========== Constructor ==========
    constructor(
        address _creator,
        address _circleId,
        string memory _circleName
    ) {
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
    
    // ========== Member Management (Creator Controlled) ==========
    
    function inviteMember(address member) external onlyCreator {
        require(!isInvited[member], "Already invited");
        
        isInvited[member] = true;
        emit MemberInvited(member, creator);
    }
    
    function joinPool() external onlyInvited {
        require(!isMember[msg.sender], "Already a member");
        
        members.push(msg.sender);
        isMember[msg.sender] = true;
        
        emit MemberJoined(msg.sender);
    }
    
    // ========== Deposits & Withdrawals ==========
    
    function deposit() external payable onlyMember {
        require(msg.value > 0, "Must deposit something");
        require(isActive, "Pool not active");
        
        balances[msg.sender] += msg.value;
        totalSaved += msg.value;
        
        emit Deposited(msg.sender, msg.value);
        
        // If yield enabled and strategy set (future feature)
        if (yieldEnabled && yieldStrategy != address(0)) {
            _deployToYield(msg.value);
        }
    }
    
    function withdraw(uint256 amount) external onlyMember {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // If yield enabled, withdraw from yield first
        if (yieldEnabled && yieldStrategy != address(0)) {
            _withdrawFromYield(amount);
        }
        
        balances[msg.sender] -= amount;
        totalSaved -= amount;
        
        payable(msg.sender).transfer(amount);
        
        emit Withdrawn(msg.sender, amount);
    }
    
    // ========== Goal Management (Creator Sets Goals) ==========
    
    function setTarget(uint256 _amount, uint256 _date) external onlyCreator {
        targetAmount = _amount;
        targetDate = _date;
        
        emit TargetSet(_amount, _date);
    }
    
    // ========== Yield Integration Hooks (Future) ==========
    
    function enableYield(address _strategy) external onlyCreator {
        yieldStrategy = _strategy;
        yieldEnabled = true;
    }
    
    function _deployToYield(uint256 amount) private {
        // To be implemented with AAVE/Safe integration
        // Placeholder for future yield deployment
    }
    
    function _withdrawFromYield(uint256 amount) private {
        // To be implemented with AAVE/Safe integration
        // Placeholder for future yield withdrawal
    }
    
    // ========== View Functions ==========
    
    function getBalance(address member) external view returns (uint256) {
        return balances[member];
    }
    
    function getMemberCount() external view returns (uint256) {
        return members.length;
    }
    
    function getMembers() external view returns (address[] memory) {
        return members;
    }
    
    function getProgress() external view returns (uint256 current, uint256 target) {
        return (totalSaved, targetAmount);
    }
}
```

### Donation Pool Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DonationPool {
    // ========== State Variables ==========
    
    // Core identifiers
    address public creator;  // User who created the pool
    address public circleId;
    string public circleName;
    
    // Donation configuration (set by creator)
    address public beneficiary;
    uint256 public goalAmount;
    uint256 public deadline;
    
    // Tracking
    uint256 public totalRaised;
    mapping(address => uint256) public donations;
    
    // Member management
    address[] public members;
    mapping(address => bool) public isMember;
    mapping(address => bool) public isInvited;
    address[] public donors;
    
    // Status
    bool public fundsReleased;
    bool public isActive;
    
    // ========== Events ==========
    event PoolCreated(
        address indexed circleId,
        address indexed creator,
        address beneficiary,
        uint256 goal,
        uint256 deadline
    );
    event MemberInvited(address indexed member, address indexed invitedBy);
    event MemberJoined(address indexed member);
    event DonationMade(address indexed donor, uint256 amount);
    event GoalReached(uint256 totalRaised);
    event FundsReleased(address indexed beneficiary, uint256 amount);
    
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
    
    // ========== Constructor ==========
    constructor(
        address _creator,
        address _circleId,
        string memory _circleName,
        address _beneficiary,
        uint256 _goalAmount,
        uint256 _deadline
    ) {
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_goalAmount > 0, "Goal must be positive");
        require(_deadline > block.timestamp, "Deadline must be future");
        
        creator = _creator;
        circleId = _circleId;
        circleName = _circleName;
        beneficiary = _beneficiary;
        goalAmount = _goalAmount;
        deadline = _deadline;
        isActive = true;
        
        // Creator automatically becomes a member
        members.push(_creator);
        isMember[_creator] = true;
        isInvited[_creator] = true;
        
        emit PoolCreated(_circleId, _creator, _beneficiary, _goalAmount, _deadline);
        emit MemberJoined(_creator);
    }
    
    // ========== Member Management (Creator Controlled) ==========
    
    function inviteMember(address member) external onlyCreator {
        require(!isInvited[member], "Already invited");
        
        isInvited[member] = true;
        emit MemberInvited(member, creator);
    }
    
    function joinPool() external onlyInvited {
        require(!isMember[msg.sender], "Already a member");
        
        members.push(msg.sender);
        isMember[msg.sender] = true;
        
        emit MemberJoined(msg.sender);
    }
    
    // ========== Donations (Members Only) ==========
    
    function donate() external payable onlyMember {
        require(msg.value > 0, "Must donate something");
        require(block.timestamp <= deadline, "Deadline passed");
        require(!fundsReleased, "Funds already released");
        require(isActive, "Pool not active");
        
        // Track donation
        if (donations[msg.sender] == 0) {
            donors.push(msg.sender);
        }
        donations[msg.sender] += msg.value;
        totalRaised += msg.value;
        
        emit DonationMade(msg.sender, msg.value);
        
        // Check if goal reached
        if (totalRaised >= goalAmount) {
            emit GoalReached(totalRaised);
        }
    }
    
    // ========== Fund Management (Creator Controls Release) ==========
    
    function releaseFunds() external onlyCreator {
        require(!fundsReleased, "Already released");
        require(
            totalRaised >= goalAmount || block.timestamp > deadline,
            "Goal not met and deadline not passed"
        );
        
        fundsReleased = true;
        isActive = false;
        
        uint256 amount = address(this).balance;
        payable(beneficiary).transfer(amount);
        
        emit FundsReleased(beneficiary, amount);
    }
    
    // ========== View Functions ==========
    
    function getDonation(address donor) external view returns (uint256) {
        return donations[donor];
    }
    
    function getMemberCount() external view returns (uint256) {
        return members.length;
    }
    
    function getDonorCount() external view returns (uint256) {
        return donors.length;
    }
    
    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= deadline) {
            return 0;
        }
        return deadline - block.timestamp;
    }
    
    function getProgress() external view returns (uint256 raised, uint256 goal) {
        return (totalRaised, goalAmount);
    }
}
```

## Yield Integration Guide

### AAVE Integration

AAVE allows pools to earn yield on deposited funds. Here's how Savings Pools can integrate:

#### High-Level Architecture

```solidity
interface IAavePool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;
    
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);
}

contract YieldSavingsPool is SavingsPool {
    IAavePool public constant AAVE = IAavePool(0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2);
    address public constant aWETH = 0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8;
    
    function _deployToYield(uint256 amount) internal override {
        // Deposit ETH to AAVE
        AAVE.supply{value: amount}(
            address(0), // ETH
            amount,
            address(this),
            0
        );
    }
    
    function _withdrawFromYield(uint256 amount) internal override {
        // Withdraw from AAVE
        AAVE.withdraw(
            address(0), // ETH
            amount,
            address(this)
        );
    }
    
    function getYieldBalance() external view returns (uint256) {
        return IERC20(aWETH).balanceOf(address(this));
    }
}
```

#### Benefits of AAVE Integration
- **Automatic Yield**: Deposits earn interest automatically
- **No Lock Period**: Can withdraw anytime
- **Battle-Tested**: AAVE has billions in TVL
- **Gas Efficient**: Optimized contracts

### Safe SDK Integration

Safe (formerly Gnosis Safe) provides smart contract wallets with enhanced security:

#### High-Level Architecture

```solidity
import "@safe-global/safe-contracts/contracts/GnosisSafe.sol";
import "@safe-global/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol";

contract SafeSavingsPool is SavingsPool {
    address public safeWallet;
    GnosisSafeProxyFactory public constant SAFE_FACTORY = GnosisSafeProxyFactory(0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2);
    
    function createSafeWallet() external onlyCreator {
        // Creator sets up Safe with circle members as signers
        address[] memory owners = getMembers();
        uint256 threshold = owners.length / 2 + 1; // Majority required
        
        bytes memory initializer = abi.encodeWithSelector(
            GnosisSafe.setup.selector,
            owners,
            threshold,
            address(0),
            bytes(""),
            address(0),
            address(0),
            0,
            address(0)
        );
        
        safeWallet = SAFE_FACTORY.createProxy(
            address(0x3E5c63644E683549055b9Be8653de26E0B4CD36E),
            initializer
        );
    }
}
```

#### Benefits of Safe Integration
- **Multi-Signature Security**: Requires multiple members to approve large withdrawals
- **Module System**: Can add DeFi strategies as modules
- **Recovery Mechanisms**: Social recovery if keys are lost
- **Batched Transactions**: Save gas with multiple operations

### Choosing Between AAVE and Safe

| Criteria | AAVE | Safe SDK |
|----------|------|----------|
| **Primary Use** | Yield generation | Security & control |
| **Complexity** | Medium | Higher |
| **Gas Costs** | Higher deposits/withdrawals | Higher for multi-sig |
| **Yield** | Automatic | Manual via modules |
| **Access Control** | Contract-based | Multi-signature |
| **Best For** | Passive savings | Active treasury management |

## Access Control & Security

### Role-Based Permissions

| Role | Permissions | Implementation |
|------|------------|----------------|
| **Creator** | Invite members, start ROSCA, set goals, release funds | `onlyCreator` modifier |
| **Members** | Contribute, withdraw (savings), vote on decisions | `onlyMember` modifier |
| **Invited** | Can join the pool | `onlyInvited` modifier |
| **Recipient** | Trigger their own payout (ROSCA) | Direct address check |
| **Anyone** | Create pools via factory, view pool data | Public functions |

### Security Measures

1. **No Reentrancy**: Follow checks-effects-interactions pattern
2. **Input Validation**: All parameters validated
3. **Access Control**: Creator manages their own pool
4. **Immutable Core**: Key parameters cannot be changed
5. **Event Emission**: All actions emit events for frontend tracking

### Key Design Decisions

- **Permissionless Pool Creation**: Anyone can create a pool for their circle
- **Creator Authority**: Pool creator has admin rights
- **Social Trust**: Invited members only, no anonymous participants
- **On-Chain Randomness**: Lottery uses block data for simplicity
- **Self-Service**: Users manage everything from frontend

### Network Deployment Plan

| Network | Priority | Reasoning |
|---------|----------|-----------|
| **Citrea Testnet** | Current | Testing and development |
