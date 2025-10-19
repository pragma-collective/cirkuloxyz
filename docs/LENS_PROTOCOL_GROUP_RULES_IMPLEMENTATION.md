# Lens Protocol Invite-Only Groups Implementation (Option A: Backend-Controlled)

## Overview

This document provides a complete implementation guide for building **invite-only groups** using **Lens Protocol Groups** with **backend-controlled membership**.

**IMPORTANT**: This is **Option A** - a simpler approach where the backend validates invites and adds members directly. For a fully on-chain implementation using Lens Protocol's `IGroupRule` interface, see [LENS_PROTOCOL_CUSTOM_GROUP_RULE_IMPLEMENTATION.md](./LENS_PROTOCOL_CUSTOM_GROUP_RULE_IMPLEMENTATION.md).

### The Problem
By default, Lens Protocol groups require admin approval for new members via the `MembershipApprovalGroupRule`. This requires manual intervention from group admins.

### Our Solution (Backend-Controlled Approach)
- Create a standard Lens Protocol Group (backend is admin/owner)
- Backend validates invite codes from database
- Backend adds members directly using Lens Protocol SDK
- No custom smart contract rule implementation needed

**Key Difference**: We do NOT implement Lens Protocol's `IGroupRule` interface. Instead, the backend acts as the group admin and controls membership.

### Architecture

```
LENS PROTOCOL (Social Layer + Groups)
    ↓ Group created by
Backend API (Admin/Owner of Group)
    ↓ validates invites
Database (Invites ONLY - no group data)
    ↓ adds members via
Lens Protocol SDK (addMemberToGroup)
```

---

## 1. How This Approach Works

### No Custom Smart Contracts Needed

Unlike a full custom rule implementation, this approach:

- ✅ Uses standard Lens Protocol Groups (no custom rule contracts)
- ✅ Backend is the group owner/admin
- ✅ Invites stored in database only
- ✅ Backend validates invites server-side
- ✅ Backend adds members using Lens Protocol SDK

### Flow Overview

1. **Create Group**: Backend creates a Lens Group (backend is owner)
2. **Send Invite**: Backend stores invite in database, sends email
3. **Accept Invite**: User clicks link, backend validates invite, backend adds user to group via Lens SDK

---

## 2. Backend Implementation

### 2.1 Database Schema

**IMPORTANT**: We only store invites, NOT group data. All group info is in Lens Protocol.

```typescript
// invites table - ONLY table we need
export const invites = pgTable("invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: uuid("code").defaultRandom().notNull().unique(), // The actual invite code
  groupAddress: text("group_address").notNull(), // Lens Group contract address
  recipientEmail: text("recipient_email").notNull(),
  recipientAddress: text("recipient_address"), // Set when invite is sent
  senderAddress: text("sender_address").notNull(),
  status: inviteStatusEnum("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at").notNull(),
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

### 2.2 Environment Variables

```env
# Lens Protocol
LENS_API_URL=https://api.testnet.lens.xyz/graphql
LENS_CHAIN_RPC_URL=https://rpc.testnet.lens.xyz
LENS_CHAIN_ID=37111

# Backend
BACKEND_SIGNER_PRIVATE_KEY=0x... # Backend wallet (group owner/admin)

# Database
DATABASE_URL=postgresql://...

# Email
EMAIL_SERVICE_API_KEY=...
EMAIL_FROM=noreply@cirkulo.xyz

# App
FRONTEND_URL=https://cirkulo.xyz
```

### 2.3 Lens Service

```typescript
import { LensClient, development } from "@lens-protocol/client";
import { evmAddress } from "@lens-protocol/client";
import { addMemberToGroup } from "@lens-protocol/client/actions";

// Initialize Lens client with backend authentication
const lensClient = LensClient.create({
  environment: development,
});

export class LensService {
  /**
   * Add member to group (backend is admin)
   */
  static async addMemberToGroup(
    sessionClient: any,
    groupAddress: string,
    memberAddress: string
  ): Promise<string> {
    const result = await addMemberToGroup(sessionClient, {
      group: evmAddress(groupAddress),
      members: [evmAddress(memberAddress)],
    });

    if (result.isErr()) {
      throw new Error(result.error);
    }

    // Handle transaction
    const txResult = await result
      .andThen(handleOperationWith(walletClient))
      .andThen(sessionClient.waitForTransaction);

    if (txResult.isErr()) {
      throw new Error(txResult.error);
    }

    return txResult.value;
  }

  /**
   * Check if address is member of group
   */
  static async isGroupMember(
    groupAddress: string,
    memberAddress: string
  ): Promise<boolean> {
    // Query Lens Protocol API
    // Implementation depends on Lens GraphQL API
    const result = await lensClient.query(/* GraphQL query */);
    return result.isMember;
  }

  /**
   * Fetch group details
   */
  static async fetchGroup(groupAddress: string) {
    // Query Lens Protocol API
    const result = await lensClient.query(/* GraphQL query */);
    return result.group;
  }
}
```

### 2.4 API Routes

```typescript
import { Router } from "express";
import { db, invites } from "./db/schema";
import { BlockchainService } from "./services/blockchain";
import { EmailService } from "./services/email";

const router = Router();

// POST /api/invites - Send invite
router.post("/", authenticateJWT, async (req, res) => {
  const { recipientEmail, recipientAddress, groupAddress } = req.body;
  const senderAddress = req.user.address;

  // 1. Verify sender is member of the group (query Lens Protocol)
  const isMember = await LensService.isGroupMember(
    groupAddress,
    senderAddress
  );
  
  if (!isMember) {
    return res.status(403).json({ error: "Not a member of this group" });
  }

  // 2. Create invite in database
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const [invite] = await db.insert(invites).values({
    groupAddress,
    recipientEmail,
    recipientAddress,
    senderAddress,
    expiresAt,
  }).returning();

  // 3. Send email
  await EmailService.sendInvite(
    recipientEmail,
    invite.code,
    groupAddress
  );

  res.json({ 
    success: true,
    inviteCode: invite.code,
  });
});

// GET /api/invites/:code - Get invite details
router.get("/:code", async (req, res) => {
  const { code } = req.params;

  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.code, code));
  
  if (!invite) {
    return res.status(404).json({ error: "Invite not found" });
  }

  // Fetch group details from Lens Protocol
  const group = await LensService.fetchGroup(invite.groupAddress);

  res.json({
    invite: {
      code: invite.code,
      status: invite.status,
      expiresAt: invite.expiresAt,
    },
    group: {
      address: group.address,
      name: group.metadata?.name,
      description: group.metadata?.description,
      avatar: group.metadata?.picture,
    },
  });
});

// POST /api/invites/:code/accept - Accept invite
router.post("/:code/accept", authenticateJWT, async (req, res) => {
  const { code } = req.params;
  const userAddress = req.user.address;

  // 1. Get invite from database
  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.code, code));
  
  if (!invite || invite.status !== "pending") {
    return res.status(400).json({ error: "Invalid invite" });
  }

  // 2. Validate expiration
  if (invite.expiresAt < new Date()) {
    return res.status(400).json({ error: "Invite expired" });
  }

  // 3. Validate recipient address matches
  if (invite.recipientAddress !== userAddress) {
    return res.status(403).json({ error: "Invite not for this address" });
  }

  // 4. Add member to group (backend is admin, so it can do this)
  const txHash = await LensService.addMemberToGroup(
    sessionClient, // Backend's authenticated session
    invite.groupAddress,
    userAddress
  );

  // 5. Update invite status
  await db.update(invites)
    .set({ 
      status: "accepted", 
      acceptedAt: new Date() 
    })
    .where(eq(invites.code, code));

  res.json({ 
    success: true, 
    txHash,
    groupAddress: invite.groupAddress 
  });
});
```

---

## 3. Frontend Implementation

### 3.1 Dependencies

```json
{
  "dependencies": {
    "@lens-protocol/client": "^2.0.0",
    "@lens-chain/sdk": "^1.0.0",
    "viem": "^2.0.0",
    "wagmi": "^2.0.0"
  }
}
```

### 3.2 Create Group (Backend Does This)

**Note**: The backend creates groups on behalf of users, making the backend the owner/admin.

```typescript
// This happens in the backend, not frontend
import { createGroup, uri } from "@lens-protocol/client/actions";

export async function createGroup(params: {
  name: string;
  description: string;
  backendSessionClient: any; // Backend's authenticated session
}) {
  // 1. Upload metadata
  const metadataUri = await uploadMetadata({
    name: params.name,
    description: params.description,
  });

  // 2. Create group (backend is owner)
  const result = await createGroup(params.backendSessionClient, {
    metadataUri: uri(metadataUri),
    // No custom rules - standard Lens Group
  });

  if (result.isErr()) {
    throw new Error(result.error);
  }

  // 3. Handle transaction
  const txResult = await result
    .andThen(handleOperationWith(backendWallet))
    .andThen(backendSessionClient.waitForTransaction);

  if (txResult.isErr()) {
    throw new Error(txResult.error);
  }

  // 4. Fetch created group
  const groupResult = await fetchGroup(backendSessionClient, {
    txHash: txResult.value,
  });

  if (groupResult.isErr()) {
    throw new Error(groupResult.error);
  }

  return groupResult.value; // Returns Group with address
}
```

### 3.3 Accept Invite (Frontend)

```typescript
// When user clicks invite link: /invite/:code
export async function acceptInvite(inviteCode: string) {
  // 1. Fetch invite details from backend
  const response = await fetch(`/api/invites/${inviteCode}`);
  const data = await response.json();

  // 2. Show group info to user
  displayGroupInfo(data.group);

  // 3. When user clicks "Join"
  const handleJoin = async () => {
    try {
      // Backend validates invite and adds user to group
      const result = await fetch(`/api/invites/${inviteCode}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const responseData = await result.json();

      if (responseData.success) {
        // Redirect to group
        window.location.href = `/groups/${responseData.groupAddress}`;
      }
    } catch (error) {
      console.error("Failed to join group:", error);
    }
  };
}
```

---

## 4. Complete Flow Diagram

### Group Creation Flow

```
Creator → Backend: Request to create group
Backend → Lens Protocol: createGroup() (backend is owner)
Lens Protocol → Blockchain: Deploy Group contract
Blockchain → Backend: Group address
Backend → Frontend: Group details
Frontend: Display group
```

### Invite Flow

```
Member → Frontend: Enter recipient email + wallet address
Frontend → Backend: POST /api/invites
Backend → Database: Store invite
Backend → Email Service: Send invite email
User → Email: Click invite link
Frontend → Backend: GET /api/invites/:code
Backend → Frontend: Return invite + group details
Frontend: Show group info + "Join" button
User → Frontend: Click "Join Group"
Frontend → Backend: POST /api/invites/:code/accept
Backend: Validate invite from database
Backend → Lens Protocol SDK: addMemberToGroup(user)
Lens Protocol: Add user as member
Backend → Database: Update invite status to "accepted"
Backend → Frontend: Success response
Frontend: Redirect to group page
```

---

## 5. Deployment Steps

### Step 1: Setup Backend Wallet

```bash
# Generate backend wallet
# This wallet will be the owner/admin of all groups

# Fund with GRASS tokens (for gas fees)
```

### Step 2: Deploy Backend

```bash
cd cirkulo-api
npm install
npm run migrate # Run database migrations
npm run dev
```

### Step 3: Deploy Frontend

```bash
cd cirkulo-pwa
npm install
npm run dev
```

---

## 6. Advantages of This Approach

1. **✅ Simpler Implementation** - No custom smart contract rules to implement
2. **✅ Uses Lens Protocol Groups** - Full integration with Lens ecosystem
3. **✅ No Admin Approval Needed** - Backend auto-adds members after validation
4. **✅ Flexible** - Can change validation logic without redeploying contracts
5. **✅ Gasless for Users** - Backend pays for adding members
6. **✅ One-time Use** - Invites tracked in database
7. **✅ Expiration** - Invites have expiration timestamps
8. **✅ Minimal Database** - Only stores invites, not group data
9. **✅ Fast to Build** - No complex smart contract development

---

## 7. Tradeoffs

### Pros
- ✅ **Simpler** - No smart contract development
- ✅ **Faster** - Quicker to implement and iterate
- ✅ **Flexible** - Easy to change validation logic
- ✅ **Database-driven** - Familiar backend patterns

### Cons
- ❌ **Backend is admin** - Backend must be trusted
- ❌ **Not fully on-chain** - Validation happens server-side
- ❌ **Centralization** - Backend is single point of control
- ❌ **Backend cost** - Backend pays gas for every member addition

---

## Summary

**What Lens Provides**: Group infrastructure via Lens Protocol
**What We Build**: Backend API that validates invites and adds members
**How It Works**: 
1. Backend creates Lens Group (backend is owner)
2. Backend stores invites in database
3. Users click invite link
4. Backend validates invite and adds user to group via Lens Protocol SDK

This is the **simpler, backend-controlled approach** for invite-only groups. For a fully on-chain implementation using Lens Protocol's `IGroupRule` interface, see [LENS_PROTOCOL_CUSTOM_GROUP_RULE_IMPLEMENTATION.md](./LENS_PROTOCOL_CUSTOM_GROUP_RULE_IMPLEMENTATION.md).
