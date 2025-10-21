// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IGroupRule Interface
 * @notice Interface that all Lens Protocol group rules must implement
 * @dev Based on Lens Protocol documentation for custom group rules
 */
interface IGroupRule {
    /**
     * @notice Configure the rule for a specific group
     * @param configSalt Unique configuration identifier (32 bytes)
     * @param ruleParams Configuration parameters as key-value pairs
     */
    function configure(
        bytes32 configSalt, 
        KeyValue[] calldata ruleParams
    ) external;

    /**
     * @notice Called when admin adds a member
     * @param configSalt Configuration identifier
     * @param originalMsgSender Original transaction sender
     * @param account Account being added
     * @param primitiveParams Parameters from the group
     * @param ruleParams Rule-specific parameters
     */
    function processAddition(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external;

    /**
     * @notice Called when admin removes a member
     */
    function processRemoval(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external;

    /**
     * @notice Called when someone tries to join
     */
    function processJoining(
        bytes32 configSalt,
        address account,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external;

    /**
     * @notice Called when someone tries to leave
     */
    function processLeaving(
        bytes32 configSalt,
        address account,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external;
}

/// @notice Key-value pair structure used by Lens Protocol
struct KeyValue {
    string key;
    bytes value;
}

/**
 * @title InviteOnlyGroupRule
 * @notice Lens Protocol Group Rule that validates invite codes
 * @dev Implements IGroupRule interface for on-chain validation
 * 
 * This contract allows groups to be invite-only by:
 * 1. Backend registers invite codes on-chain (hashed for privacy)
 * 2. Users provide invite code when joining
 * 3. Contract validates code and marks as used (one-time use)
 * 4. Admins can still add members directly (override)
 */
contract InviteOnlyGroupRule is IGroupRule {
    // ========== ERRORS ==========
    error OnlyBackend();
    error OnlyOwner();
    error InviteNotFound();
    error InviteExpired();
    error InviteAlreadyUsed();
    error InvalidAddress();
    error InvalidInviteCode();
    
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
    
    event BackendUpdated(
        address indexed oldBackend,
        address indexed newBackend
    );
    
    event RuleConfigured(bytes32 indexed configSalt);
    
    // ========== STORAGE ==========
    
    /// @notice Backend address authorized to register invites
    address public backend;
    
    /// @notice Contract owner (can update backend address)
    address public owner;
    
    /// @notice Mapping of configSalt -> invitee -> invite data
    /// @dev configSalt is unique per group, allowing same contract for multiple groups
    mapping(bytes32 => mapping(address => InviteData)) public invites;
    
    /// @notice Invite data structure
    struct InviteData {
        bytes32 codeHash;      // Keccak256 hash of invite code (for privacy)
        uint256 expiresAt;     // Expiration timestamp
        bool used;             // Whether invite was used
    }
    
    // ========== MODIFIERS ==========
    
    modifier onlyBackend() {
        if (msg.sender != backend) revert OnlyBackend();
        _;
    }
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    // ========== CONSTRUCTOR ==========
    
    /**
     * @notice Initialize contract with backend signer address
     * @param _backend Address authorized to register invites
     */
    constructor(address _backend) {
        if (_backend == address(0)) revert InvalidAddress();
        backend = _backend;
        owner = msg.sender;
        
        emit BackendUpdated(address(0), _backend);
    }
    
    // ========== BACKEND FUNCTIONS ==========
    
    /**
     * @notice Register an invite for a specific address
     * @dev Only callable by backend signer
     * @param configSalt Configuration identifier (unique per group)
     * @param invitee Address that will receive the invite
     * @param inviteCodeHash Keccak256 hash of the invite code
     * @param expiresAt Expiration timestamp (Unix timestamp)
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
     * @notice Update backend signer address
     * @dev Only callable by contract owner
     * @param newBackend New backend address
     */
    function updateBackend(address newBackend) external onlyOwner {
        if (newBackend == address(0)) revert InvalidAddress();
        
        address oldBackend = backend;
        backend = newBackend;
        
        emit BackendUpdated(oldBackend, newBackend);
    }
    
    /**
     * @notice Transfer ownership to new address
     * @dev Only callable by current owner
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        owner = newOwner;
    }
    
    // ========== LENS PROTOCOL IGROUPRULE INTERFACE ==========
    
    /**
     * @notice Configure rule for a specific group
     * @dev Called by Lens Protocol when rule is added to group
     * @param configSalt Unique configuration identifier
     * 
     * NOTE: This is part of the IGroupRule interface.
     * For now, we don't need any special configuration.
     * ConfigSalt serves as unique identifier per group.
     */
    function configure(
        bytes32 configSalt,
        KeyValue[] calldata /* ruleParams */
    ) external override {
        emit RuleConfigured(configSalt);
    }
    
    /**
     * @notice Validate when someone tries to join the group
     * @dev Called by Lens Protocol when user attempts to join
     * @param configSalt Configuration identifier (identifies the group)
     * @param account Address attempting to join
     * 
     * Flow:
     * 1. User provides invite code when joining
     * 2. Lens Protocol calls this function with code in ruleParams
     * 3. We validate the code against stored hash
     * 4. If valid: mark as used, allow join (no revert)
     * 5. If invalid: revert with specific error
     */
    function processJoining(
        bytes32 configSalt,
        address account,
        KeyValue[] calldata /* primitiveParams */,
        KeyValue[] calldata ruleParams
    ) external override {
        // Extract invite code from ruleParams
        // Expected: ruleParams[0] = { key: "inviteCode", value: bytes(inviteCode) }
        if (ruleParams.length == 0) {
            revert InvalidInviteCode();
        }
        
        bytes memory inviteCodeBytes;
        bool found = false;
        
        for (uint256 i = 0; i < ruleParams.length; i++) {
            if (keccak256(bytes(ruleParams[i].key)) == keccak256(bytes("inviteCode"))) {
                inviteCodeBytes = ruleParams[i].value;
                found = true;
                break;
            }
        }
        
        if (!found) {
            revert InvalidInviteCode();
        }
        
        // Hash the provided invite code
        bytes32 providedCodeHash = keccak256(inviteCodeBytes);
        
        // Get stored invite data
        InviteData storage invite = invites[configSalt][account];
        
        // Validate invite exists
        if (invite.codeHash == bytes32(0)) {
            revert InviteNotFound();
        }
        
        // Validate not expired (valid up to and including expiresAt timestamp)
        if (block.timestamp > invite.expiresAt) {
            revert InviteExpired();
        }
        
        // Validate not already used
        if (invite.used) {
            revert InviteAlreadyUsed();
        }
        
        // Validate code matches
        if (invite.codeHash != providedCodeHash) {
            revert InvalidInviteCode();
        }
        
        // Mark as used (one-time use)
        invite.used = true;
        
        emit InviteUsed(configSalt, account, providedCodeHash);
        
        // No revert = validation passed, user can join
    }
    
    /**
     * @notice Validate when admin tries to add a member
     * @dev Empty implementation = ALLOW all admin additions
     * 
     * WHY: Admins should be able to add members without invites.
     * This gives admins an "override" capability for:
     * - Emergency adds
     * - Onboarding founding members
     * - Recovering from issues
     * 
     * HOW IT WORKS:
     * - Function completes without reverting
     * - Lens Protocol interprets this as "validation passed"
     * - Admin can add member successfully
     */
    function processAddition(
        bytes32 /* configSalt */,
        address /* originalMsgSender */,
        address /* account */,
        KeyValue[] calldata /* primitiveParams */,
        KeyValue[] calldata /* ruleParams */
    ) external pure override {
        // Empty implementation = allow action
        // No revert = validation passed
    }
    
    /**
     * @notice Validate when admin tries to remove a member
     * @dev Empty implementation = ALLOW all removals
     * 
     * WHY: Admins should always be able to remove members.
     * This is a safety mechanism - groups should never be locked
     * with bad actors that can't be removed.
     */
    function processRemoval(
        bytes32 /* configSalt */,
        address /* originalMsgSender */,
        address /* account */,
        KeyValue[] calldata /* primitiveParams */,
        KeyValue[] calldata /* ruleParams */
    ) external pure override {
        // Empty implementation = allow action
    }
    
    /**
     * @notice Validate when someone tries to leave the group
     * @dev Empty implementation = ALLOW anyone to leave anytime
     * 
     * WHY: Users should always have the right to leave a group.
     * This prevents groups from becoming "traps" that lock users in.
     * It's a fundamental user freedom.
     */
    function processLeaving(
        bytes32 /* configSalt */,
        address /* account */,
        KeyValue[] calldata /* primitiveParams */,
        KeyValue[] calldata /* ruleParams */
    ) external pure override {
        // Empty implementation = allow action
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Check if an address has a valid invite for a group
     * @param configSalt Group configuration identifier
     * @param invitee Address to check
     * @return hasInvite Whether the address has an invite
     * @return isExpired Whether the invite is expired
     * @return isUsed Whether the invite was already used
     */
    function getInviteStatus(
        bytes32 configSalt,
        address invitee
    ) external view returns (
        bool hasInvite,
        bool isExpired,
        bool isUsed
    ) {
        InviteData storage invite = invites[configSalt][invitee];
        
        hasInvite = invite.codeHash != bytes32(0);
        isExpired = block.timestamp > invite.expiresAt;
        isUsed = invite.used;
    }
}
