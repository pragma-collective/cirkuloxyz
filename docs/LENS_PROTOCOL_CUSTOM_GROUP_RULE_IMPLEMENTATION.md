# Lens Protocol Custom Group Rule Implementation (Option B: Fully On-Chain)

## Overview

This document provides a complete implementation guide for building **invite-only groups** using **Lens Protocol's IGroupRule interface** for fully on-chain validation.

**IMPORTANT**: This is **Option B** - a more complex approach where invite validation happens entirely on-chain via a custom Lens Group Rule. For a simpler backend-controlled approach, see [LENS_PROTOCOL_GROUP_RULES_IMPLEMENTATION.md](./LENS_PROTOCOL_GROUP_RULES_IMPLEMENTATION.md).

### The Problem
By default, Lens Protocol groups require admin approval for new members via the `MembershipApprovalGroupRule`. This requires manual intervention from group admins.

### Our Solution (Custom Rule Approach)
- Implement Lens Protocol's `IGroupRule` interface
- Deploy custom rule contract to Lens Chain
- Backend registers invites on-chain
- Lens Protocol calls our rule when users try to join
- Rule validates invite code automatically (no backend intervention at join time)

**Key Difference**: We implement Lens Protocol's `IGroupRule` interface, so validation happens on-chain via Lens Protocol's group system.

### Architecture

```
LENS PROTOCOL (Social Layer + Groups)
    ↓ configured with
Custom InviteOnlyGroupRule (implements IGroupRule)
    ↓ stores invites registered by
Backend API (Registers invites on-chain)
    ↓ also stores
Database (Invites for email tracking - optional)
```

---

## 1. Understanding IGroupRule Interface

### The Interface

Lens Protocol requires custom group rules to implement this interface:

```solidity
interface IGroupRule {
    /// @notice Configure the rule for a specific group
    /// @param configSalt Unique configuration identifier (32 bytes)
    /// @param ruleParams Configuration parameters as key-value pairs
    function configure(
        bytes32 configSalt, 
        KeyValue[] calldata ruleParams
    ) external;

    /// @notice Called when admin adds a member
    /// @param configSalt Configuration identifier
    /// @param originalMsgSender Original transaction sender
    /// @param account Account being added
    /// @param primitiveParams Parameters from the group
    /// @param ruleParams Rule-specific parameters
    function processAddition(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external;

    /// @notice Called when admin removes a member
    function processRemoval(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external;

    /// @notice Called when someone tries to join
    function processJoining(
        bytes32 configSalt,
        address account,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external;

    /// @notice Called when someone tries to leave
    function processLeaving(
        bytes32 configSalt,
        address account,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external;
}
```

### Key Concepts

1. **configSalt**: Unique identifier for each rule configuration. Multiple groups can use the same rule contract with different configs.
2. **KeyValue[]**: Flexible parameter system for passing data
3. **Execution Hooks**: Lens Protocol calls these functions at specific lifecycle events

---

## 2. Smart Contract Implementation

### 2.1 Full InviteOnlyGroupRule.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@lens-protocol/contracts/interfaces/IGroupRule.sol";
import "@lens-protocol/contracts/libraries/KeyValue.sol";

/**
 * @title InviteOnlyGroupRule
 * @notice Lens Protocol Group Rule that validates invite codes
 * @dev Implements IGroupRule interface for on-chain validation
 */
contract InviteOnlyGroupRule is IGroupRule {
    // ========== ERRORS ==========
    error OnlyBackend();
    error InviteNotFound();
    error InviteExpired();
    error InviteAlreadyUsed();
    error InvalidAddress();
    error Unauthorized();
    
    // ========== EVENTS ==========
    event InviteRegistered(
        bytes32 indexed configSalt,
        address indexed invitee,
        bytes32 indexed inviteCodeHash,
        uint256 expiresAt
    );
    
    event InviteUsed(
        bytes32 indexed configSalt,
        address indexed invitee,
        bytes32 indexed inviteCodeHash
    );
    
    event BackendUpdated(address indexed oldBackend, address indexed newBackend);
    
    event RuleConfigured(bytes32 indexed configSalt);
    
    // ========== STORAGE ==========
    
    /// @notice Backend address authorized to register invites
    address public backend;
    
    /// @notice Mapping of configSalt -> invitee -> invite data
    mapping(bytes32 => mapping(address => InviteData)) public invites;
    
    struct InviteData {
        bytes32 codeHash;      // Hash of invite code (for privacy)
        uint256 expiresAt;     // Expiration timestamp
        bool used;             // Whether invite was used
    }
    
    // ========== MODIFIERS ==========
    
    modifier onlyBackend() {
        if (msg.sender != backend) revert OnlyBackend();
        _;
    }
    
    // ========== CONSTRUCTOR ==========
    
    constructor(address _backend) {
        if (_backend == address(0)) revert InvalidAddress();
        backend = _backend;
    }
    
    // ========== BACKEND FUNCTIONS ==========
    
    /**
     * @notice Register an invite for a specific address
     * @param configSalt Configuration identifier (unique per group)
     * @param invitee Address that will receive the invite
     * @param inviteCodeHash Keccak256 hash of the invite code
     * @param expiresAt Expiration timestamp
     */
    function registerInvite(
        bytes32 configSalt,
        address invitee,
        bytes32 inviteCodeHash,
        uint256 expiresAt
    ) external onlyBackend {
        if (invitee == address(0)) revert InvalidAddress();
        if (expiresAt <= block.timestamp) revert InviteExpired();
        
        invites[configSalt][invitee] = InviteData({
            codeHash: inviteCodeHash,
            expiresAt: expiresAt,
            used: false
        });
        
        emit InviteRegistered(configSalt, invitee, inviteCodeHash, expiresAt);
    }
    
    /**
     * @notice Update backend address
     * @param newBackend New backend address
     */
    function updateBackend(address newBackend) external onlyBackend {
        if (newBackend == address(0)) revert InvalidAddress();
        emit BackendUpdated(backend, newBackend);
        backend = newBackend;
    }
    
    // ========== LENS PROTOCOL IGROUPRULE INTERFACE ==========
    
    /**
     * @notice Configure rule for a specific group
     * @dev Called by Lens Protocol when rule is added to group
     * @param configSalt Unique configuration identifier
     * @param ruleParams Configuration parameters (empty for this rule)
     */
    function configure(
        bytes32 configSalt, 
        KeyValue[] calldata ruleParams
    ) external override {
        // No special configuration needed
        // ConfigSalt serves as unique identifier per group
        emit RuleConfigured(configSalt);
    }
    
    /**
     * @notice Validate when someone tries to join
     * @dev Called by Lens Protocol when user attempts to join group
     * @param configSalt Configuration identifier
     * @param account Address attempting to join
     * @param primitiveParams Parameters from Lens group (contains invite code)
     * @param ruleParams Rule-specific parameters (unused)
     */
    function processJoining(
        bytes32 configSalt,
        address account,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external override {
        // Extract invite code from primitiveParams
        // Lens will pass the invite code as a parameter when user joins
        bytes32 providedCodeHash = _extractInviteCodeHash(primitiveParams);
        
        InviteData storage invite = invites[configSalt][account];
        
        // Validate invite exists
        if (invite.codeHash == bytes32(0)) {
            revert InviteNotFound();
        }
        
        // Validate not expired
        if (block.timestamp > invite.expiresAt) {
            revert InviteExpired();
        }
        
        // Validate not already used
        if (invite.used) {
            revert InviteAlreadyUsed();
        }
        
        // Validate code matches
        if (invite.codeHash != providedCodeHash) {
            revert Unauthorized();
        }
        
        // Mark as used
        invite.used = true;
        
        emit InviteUsed(configSalt, account, providedCodeHash);
    }
    
    /**
     * @notice Validate when admin tries to add a member
     * @dev Allow admin additions without invite (admin override)
     */
    function processAddition(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external override {
        // Allow - admins can add members without invites
    }
    
    /**
     * @notice Validate when admin tries to remove a member
     * @dev Always allow removal
     */
    function processRemoval(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external override {
        // Allow - admins can remove members
    }
    
    /**
     * @notice Validate when someone tries to leave
     * @dev Always allow leaving
     */
    function processLeaving(
        bytes32 configSalt,
        address account,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external override {
        // Allow - members can leave anytime
    }
    
    // ========== INTERNAL HELPERS ==========
    
    /**
     * @notice Extract invite code hash from KeyValue parameters
     * @param params Array of KeyValue parameters
     * @return codeHash The extracted code hash
     */
    function _extractInviteCodeHash(
        KeyValue[] calldata params
    ) internal pure returns (bytes32 codeHash) {
        // Look for "inviteCode" key in params
        for (uint256 i = 0; i < params.length; i++) {
            if (keccak256(abi.encodePacked(params[i].key)) == keccak256("inviteCode")) {
                // Assuming the data is the raw hash
                codeHash = bytes32(params[i].data);
                return codeHash;
            }
        }
        revert InviteNotFound();
    }
}
```

**Key Design Decisions:**

1. **ConfigSalt**: Used as unique identifier per group (one salt = one group)
2. **Privacy**: Only hash of invite code stored on-chain
3. **One-time Use**: Invites marked as used after joining
4. **Admin Override**: Admins can add members without invites
5. **Flexible Leaving**: Members can leave anytime

---

## 3. Backend Implementation

### 3.1 Database Schema

**Optional**: Database only needed for email tracking and UI display.

```typescript
// invites table - OPTIONAL for email tracking
export const invites = pgTable("invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: uuid("code").defaultRandom().notNull().unique(),
  configSalt: text("config_salt").notNull(), // Group's config salt
  groupAddress: text("group_address").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  recipientAddress: text("recipient_address").notNull(),
  senderAddress: text("sender_address").notNull(),
  status: inviteStatusEnum("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at").notNull(),
  registeredTxHash: text("registered_tx_hash"), // Transaction that registered invite on-chain
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "accepted",
  "expired",
  "revoked",
]);
```

### 3.2 Blockchain Service

```typescript
import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider(
  process.env.LENS_CHAIN_RPC_URL
);

const backendSigner = new ethers.Wallet(
  process.env.BACKEND_SIGNER_PRIVATE_KEY!,
  provider
);

const ruleContract = new ethers.Contract(
  process.env.INVITE_RULE_CONTRACT_ADDRESS!,
  ruleContractABI,
  backendSigner
);

export class BlockchainService {
  /**
   * Register invite on-chain
   */
  static async registerInvite(params: {
    configSalt: string;
    inviteeAddress: string;
    inviteCode: string;
    expiresAt: Date;
  }): Promise<string> {
    // Hash the invite code
    const inviteCodeHash = ethers.keccak256(
      ethers.toUtf8Bytes(params.inviteCode)
    );
    
    // Register on-chain
    const tx = await ruleContract.registerInvite(
      params.configSalt,
      params.inviteeAddress,
      inviteCodeHash,
      Math.floor(params.expiresAt.getTime() / 1000)
    );
    
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }
}
```

### 3.3 API Routes

```typescript
// POST /api/invites - Send invite
router.post("/", authenticateJWT, async (req, res) => {
  const { recipientEmail, recipientAddress, groupAddress } = req.body;
  const senderAddress = req.user.address;

  // 1. Verify sender is member
  const isMember = await LensService.isGroupMember(
    groupAddress,
    senderAddress
  );
  
  if (!isMember) {
    return res.status(403).json({ error: "Not a member of this group" });
  }

  // 2. Get group's configSalt from Lens Protocol
  const group = await LensService.fetchGroup(groupAddress);
  const configSalt = group.rules.required[0].id; // Rule ID is the configSalt

  // 3. Create invite
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  const [invite] = await db.insert(invites).values({
    configSalt,
    groupAddress,
    recipientEmail,
    recipientAddress,
    senderAddress,
    expiresAt,
  }).returning();

  // 4. Register invite on-chain
  const txHash = await BlockchainService.registerInvite({
    configSalt,
    inviteeAddress: recipientAddress,
    inviteCode: invite.code,
    expiresAt,
  });

  // 5. Update database with tx hash
  await db.update(invites)
    .set({ registeredTxHash: txHash })
    .where(eq(invites.id, invite.id));

  // 6. Send email
  await EmailService.sendInvite(
    recipientEmail,
    invite.code,
    groupAddress
  );

  res.json({ 
    success: true,
    inviteCode: invite.code,
    txHash,
  });
});

// POST /api/invites/mark-accepted - Mark invite as accepted in database
router.post("/mark-accepted", authenticateJWT, async (req, res) => {
  const { inviteCode, txHash, userAddress } = req.body;

  // 1. Find invite
  const invite = await db.query.invites.findFirst({
    where: eq(invites.code, inviteCode),
  });

  if (!invite) {
    return res.status(404).json({ error: "Invite not found" });
  }

  // 2. Idempotent check - if already accepted, return success
  if (invite.status === "accepted") {
    return res.json({ 
      success: true, 
      message: "Invite already marked as accepted" 
    });
  }

  // 3. Verify recipient address matches
  if (invite.recipientAddress.toLowerCase() !== userAddress.toLowerCase()) {
    return res.status(403).json({ 
      error: "User address does not match invite recipient" 
    });
  }

  // 4. Update invite status
  await db
    .update(invites)
    .set({
      status: "accepted",
      acceptedAt: new Date(),
    })
    .where(eq(invites.id, invite.id));

  res.json({ success: true });
});
```

---

## 4. Frontend Implementation

### 4.1 Create Group with Custom Rule

```typescript
import { 
  createGroup, 
  evmAddress, 
  uri, 
  blockchainData 
} from "@lens-protocol/client/actions";

export async function createInviteOnlyGroup(params: {
  name: string;
  description: string;
  sessionClient: any;
}) {
  // 1. Upload metadata
  const metadataUri = await uploadMetadata({
    name: params.name,
    description: params.description,
  });

  // 2. Create group with our custom rule
  const result = await createGroup(params.sessionClient, {
    metadataUri: uri(metadataUri),
    rules: {
      required: [
        {
          unknownRule: {
            address: evmAddress(process.env.INVITE_RULE_CONTRACT_ADDRESS!),
            executeOn: ["JOINING"], // Only validate on joining
            params: [
              // Config params if needed (empty for our rule)
            ],
          },
        },
      ],
    },
  });

  if (result.isErr()) {
    throw new Error(result.error);
  }

  // 3. Handle transaction
  const txResult = await result
    .andThen(handleOperationWith(walletClient))
    .andThen(sessionClient.waitForTransaction);

  if (txResult.isErr()) {
    throw new Error(txResult.error);
  }

  // 4. Fetch created group
  const groupResult = await fetchGroup(sessionClient, {
    txHash: txResult.value,
  });

  return groupResult.value;
}
```

### 4.2 Join Group with Invite

```typescript
import { joinGroup, evmAddress, blockchainData } from "@lens-protocol/client/actions";

export async function joinGroupWithInvite(params: {
  inviteCode: string;
  groupAddress: string;
  sessionClient: any;
  walletClient: any;
}) {
  // 1. Hash the invite code
  const inviteCodeHash = ethers.keccak256(
    ethers.toUtf8Bytes(params.inviteCode)
  );

  // 2. Join group with invite code as parameter
  // Lens Protocol will call our rule's processJoining function
  const result = await joinGroup(params.sessionClient, {
    group: evmAddress(params.groupAddress),
    primitiveParams: [
      {
        raw: {
          key: blockchainData(ethers.keccak256(ethers.toUtf8Bytes("inviteCode"))),
          data: blockchainData(inviteCodeHash),
        },
      },
    ],
  });

  if (result.isErr()) {
    throw new Error(result.error);
  }

  // 3. Handle transaction
  const txResult = await result
    .andThen(handleOperationWith(params.walletClient))
    .andThen(params.sessionClient.waitForTransaction);

  if (txResult.isErr()) {
    throw new Error(txResult.error);
  }

  // 4. Update backend after successful join
  // This updates the database to mark invite as accepted
  try {
    const userAddress = await params.walletClient.getAddress();
    
    await fetch('/api/invites/mark-accepted', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        inviteCode: params.inviteCode,
        txHash: txResult.value,
        userAddress,
      }),
    });
  } catch (error) {
    // Log but don't fail - user is already a member on-chain
    // Database is just for tracking/UI purposes
    console.error('Failed to update backend:', error);
  }

  return txResult.value;
}
```

**Note**: The backend update in step 4 is for database synchronization only. The user is already a member on-chain, so this call is optional but recommended for keeping your database in sync.

---

## 5. Database Synchronization

### Current Approach: Frontend Updates Backend

After a user successfully joins a group on-chain, the frontend calls the backend to update the invite status in the database. This keeps the database in sync for UI/tracking purposes.

**Why this works:**
- ✅ Simple to implement
- ✅ Immediate feedback (no delay)
- ✅ Works for 99% of cases
- ✅ User is already a member on-chain (database is secondary)

**Implementation:**
See the `joinGroupWithInvite` function in section 4.2, which calls `/api/invites/mark-accepted` after successful join.

### Future Improvement: Hybrid Approach

For production systems requiring higher reliability, consider implementing a hybrid approach:

1. **Frontend call** (current) - Immediate update, handles most cases
2. **Event listener** (future) - Backend listens to `InviteUsed` events from the smart contract
   - Automatically syncs database even if frontend fails to call
   - Provides backup/redundancy
   - Can catch historical events on startup

**Event Listener Implementation (Future)**:

```typescript
// Example event listener (not implemented yet)
import { ethers } from "ethers";

const ruleContract = new ethers.Contract(
  process.env.INVITE_RULE_CONTRACT_ADDRESS!,
  ruleContractABI,
  provider
);

// Listen for InviteUsed events
ruleContract.on("InviteUsed", async (configSalt, invitee, inviteCodeHash) => {
  // Find invite by recipient address and configSalt
  const invite = await db.query.invites.findFirst({
    where: and(
      eq(invites.recipientAddress, invitee.toLowerCase()),
      eq(invites.configSalt, configSalt)
    ),
  });

  if (invite && invite.status !== "accepted") {
    // Update status
    await db.update(invites)
      .set({ status: "accepted", acceptedAt: new Date() })
      .where(eq(invites.id, invite.id));
  }
});
```

**When to implement:**
- When you need 100% database sync guarantee
- When frontend reliability is a concern
- For audit/compliance requirements
- After initial MVP validation

---

## 6. Complete Flow Diagram

### Group Creation Flow

```
Creator → Frontend: Create invite-only group
Frontend → Lens Protocol: createGroup() with unknownRule
Lens Protocol → Blockchain: Deploy Group + configure rule
Blockchain: Call rule.configure(configSalt, params)
Rule Contract: Store configuration
Blockchain → Frontend: Group address + configSalt
Frontend: Display group
```

### Invite Flow

```
Member → Frontend: Enter recipient email + address
Frontend → Backend: POST /api/invites
Backend → Database: Store invite
Backend → Rule Contract: registerInvite(configSalt, address, codeHash, expiry)
Rule Contract: Store invite data on-chain
Backend → Email Service: Send invite email
User → Email: Click invite link
Frontend → Backend: GET /api/invites/:code
Backend → Frontend: Return invite + group details
Frontend: Show group info
User → Frontend: Click "Join Group"
Frontend → User Wallet: Sign join transaction
User Wallet → Lens Protocol: joinGroup(group, inviteCodeHash)
Lens Protocol → Rule Contract: processJoining(configSalt, user, [inviteCodeHash])
Rule Contract: Validate invite code
Rule Contract: Mark invite as used
Rule Contract → Lens Protocol: Success (no revert)
Lens Protocol → Group Contract: Add user as member
Blockchain → Frontend: Transaction success
Frontend → Backend: POST /api/invites/mark-accepted (update DB)
Backend → Database: Update invite status to "accepted"
Backend → Frontend: Success response
Frontend: Redirect to group page
```

**Note**: The `InviteUsed` event is emitted by the rule contract when the invite is used. In the current implementation, we rely on the frontend to call the backend. For future improvement, a backend event listener can be added to catch this event as a backup.

---

## 7. Deployment Steps

### Step 1: Deploy InviteOnlyGroupRule Contract

```bash
# Deploy to Lens Chain Testnet
npx hardhat deploy --network lensTestnet --tags InviteOnlyGroupRule

# Output: Contract address
# Set in .env: INVITE_RULE_CONTRACT_ADDRESS=0x...
```

### Step 2: Fund Backend Signer

```bash
# Send GRASS tokens to backend signer
# Needed for registerInvite() transactions
```

### Step 3: Deploy Backend

```bash
cd cirkulo-api
npm install
npm run migrate # Run database migrations
npm run dev
```

### Step 4: Deploy Frontend

```bash
cd cirkulo-pwa
npm install
npm run dev
```

---

## 8. Advantages of This Approach

1. **✅ Fully On-Chain** - Validation happens in smart contract
2. **✅ Decentralized** - No backend needed at join time
3. **✅ Trustless** - Users validate themselves via Lens Protocol
4. **✅ Transparent** - All invites registered on-chain
5. **✅ No Admin Override at Join** - Pure rule-based validation
6. **✅ Lens Native** - Full integration with Lens group system

---

## 9. Tradeoffs

### Pros
- ✅ **Fully On-Chain** - Validation in smart contract
- ✅ **Decentralized** - No backend trust required
- ✅ **Transparent** - On-chain audit trail
- ✅ **Lens Protocol Native** - Uses official rule system

### Cons
- ❌ **More Complex** - Requires Solidity development
- ❌ **Gas Costs** - Backend pays gas to register each invite
- ❌ **Less Flexible** - Rule logic locked in contract
- ❌ **Harder to Update** - Need contract upgrade to change logic
- ❌ **Database Sync** - Frontend must call backend to update invite status (current approach)

**Note on Database Sync**: The current implementation relies on frontend calling the backend after successful join. For production systems requiring 100% database sync, consider implementing the event listener approach (see section 5).

---

## 10. Summary

**What Lens Provides**: Group infrastructure + IGroupRule system
**What We Build**: InviteOnlyGroupRule contract implementing IGroupRule
**How It Works**: 
1. Deploy custom rule contract
2. Create Lens Group with our rule configured
3. Backend registers invites on-chain
4. Users join with invite code
5. Lens Protocol calls our rule.processJoining()
6. Rule validates invite on-chain
7. If valid, user added to group

This is the **fully on-chain, decentralized approach** using Lens Protocol's custom group rules system. For a simpler backend-controlled approach, see [LENS_PROTOCOL_GROUP_RULES_IMPLEMENTATION.md](./LENS_PROTOCOL_GROUP_RULES_IMPLEMENTATION.md).
