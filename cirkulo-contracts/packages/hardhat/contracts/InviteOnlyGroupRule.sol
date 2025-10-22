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
    bytes32 key;
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
    error InviteNotCancellable();
    error InvalidAddress();
    error InvalidInviteCode();
    
    // ========== EVENTS ==========
    event InviteRegistered(
        bytes32 indexed configSalt,
        address indexed inviter,
        bytes32 indexed inviteCodeHash,
        uint256 expiresAt
    );
    
    event InviteUsed(
        bytes32 indexed configSalt,
        address indexed invitee,
        bytes32 indexed inviteCodeHash,
        address inviter
    );
    
    event InviteCancelled(
        bytes32 indexed configSalt,
        address indexed inviter,
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
    
    /// @notice Mapping of configSalt -> inviteCodeHash -> invite data
    /// @dev configSalt is unique per group, inviteCodeHash is unique per invite
    mapping(bytes32 => mapping(bytes32 => InviteData)) public invites;
    
    /// @notice Invite data structure
    struct InviteData {
        address inviter;       // Address of person who created the invite
        uint256 expiresAt;     // Expiration timestamp
        bool used;             // Whether invite was used
        address usedBy;        // Address that used this invite (set when used)
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
     * @notice Register a new invite for a group
     * @dev Only callable by the designated backend address
     * @param configSalt The configuration salt for the group
     * @param inviter The address creating the invite
     * @param inviteCodeHash The hash of the invite code
     * @param expiresAt The expiration timestamp (0 for no expiration)
     */
    function registerInvite(
        bytes32 configSalt,
        address inviter,
        bytes32 inviteCodeHash,
        uint256 expiresAt
    ) external onlyBackend {
        if (inviter == address(0)) revert InvalidAddress();
        if (inviteCodeHash == bytes32(0)) revert InvalidInviteCode();
        
        InviteData storage invite = invites[configSalt][inviteCodeHash];
        
        // Allow re-registration if not yet used
        if (invite.used) revert InviteAlreadyUsed();
        
        invite.inviter = inviter;
        invite.expiresAt = expiresAt;
        invite.used = false;
        invite.usedBy = address(0);
        
        emit InviteRegistered(configSalt, inviter, inviteCodeHash, expiresAt);
    }
    
    /**
     * @notice Cancel a registered invite and free storage
     * @dev Only callable by the backend address. Deletes invite data to reclaim gas.
     * @param configSalt The configuration salt for the group
     * @param inviteCodeHash The hash of the invite code to cancel
     * 
     * IMPORTANT: Cannot cancel invites that have already been used.
     * This prevents issues with historical data and ensures audit trails.
     * 
     * GAS OPTIMIZATION: Using `delete` frees storage and provides gas refund (~15k gas)
     */
    function cancelInvite(
        bytes32 configSalt,
        bytes32 inviteCodeHash
    ) external onlyBackend {
        InviteData storage invite = invites[configSalt][inviteCodeHash];
        
        // Validate invite exists
        if (invite.inviter == address(0)) revert InviteNotFound();
        
        // Cannot cancel if already used (preserve audit trail)
        if (invite.used) revert InviteNotCancellable();
        
        // Emit event BEFORE deletion (so we still have data to emit)
        emit InviteCancelled(configSalt, invite.inviter, inviteCodeHash);
        
        // Delete invite data - this zeros out all fields and provides gas refund
        delete invites[configSalt][inviteCodeHash];
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
    
    // Parameter keys (using Lens Protocol pattern)
    /// @custom:keccak lens.param.inviteCode
    bytes32 constant PARAM__INVITE_CODE = 0x5797e5205a2d50babd9c0c4d9ab1fc2eb654e110118c575a0c6efc620e7e055e;
    
    /**
     * @notice Process a join request (IGroupRule interface)
     * @dev Validates invite code and marks it as used
     * @param configSalt The configuration salt for the group
     * @param account The account attempting to join
     * @param ruleParams Rule-specific parameters containing the invite code
     */
    function processJoining(
        bytes32 configSalt,
        address account,
        KeyValue[] calldata /* primitiveParams */,
        KeyValue[] calldata ruleParams
    ) external override {
        if (account == address(0)) revert InvalidAddress();
        
        // Extract invite code from params
        string memory providedCode = _extractInviteCode(ruleParams);
        if (bytes(providedCode).length == 0) revert InvalidInviteCode();
        
        // Hash the provided code
        bytes32 providedCodeHash = keccak256(abi.encodePacked(providedCode));
        
        // Get the invite data using the hash as the key
        InviteData storage invite = invites[configSalt][providedCodeHash];
        
        // Validate invite exists (if inviter is zero, invite was deleted/cancelled or never existed)
        if (invite.inviter == address(0)) revert InviteNotFound();
        
        // Check if already used
        if (invite.used) revert InviteAlreadyUsed();
        
        // Check expiration
        if (invite.expiresAt != 0 && block.timestamp > invite.expiresAt) {
            revert InviteExpired();
        }
        
        // Mark as used and record who used it
        invite.used = true;
        invite.usedBy = account;
        
        emit InviteUsed(configSalt, account, providedCodeHash, invite.inviter);
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
     * @notice Extract invite code from KeyValue parameters
     * @dev Helper function to parse Lens Protocol params
     * @param params Array of KeyValue pairs
     * @return Invite code string
     */
    function _extractInviteCode(KeyValue[] calldata params) private pure returns (string memory) {
        for (uint256 i = 0; i < params.length; i++) {
            if (params[i].key == PARAM__INVITE_CODE) {
                return abi.decode(params[i].value, (string));
            }
        }
        return "";
    }
    
    /**
     * @notice Get invite details by invite code hash
     * @param configSalt Group configuration identifier
     * @param inviteCodeHash Hash of the invite code
     * @return inviter Address that created the invite
     * @return expiresAt Expiration timestamp
     * @return used Whether the invite was used
     * @return usedBy Address that used the invite (if used)
     */
    function getInvite(
        bytes32 configSalt,
        bytes32 inviteCodeHash
    ) external view returns (
        address inviter,
        uint256 expiresAt,
        bool used,
        address usedBy
    ) {
        InviteData storage invite = invites[configSalt][inviteCodeHash];
        return (invite.inviter, invite.expiresAt, invite.used, invite.usedBy);
    }
}
