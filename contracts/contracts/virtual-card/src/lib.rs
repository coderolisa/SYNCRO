use soroban_sdk::{contracterror, contracttype};

/// Virtual Card Interface - Forward-compatible contract specification
/// 
/// This interface defines the abstract requirements for virtual card operations
/// on the Stellar Soroban platform. Implementations should extend these traits
/// to provide specific functionality while maintaining compatibility with future
/// enhancements.
///
/// NOTE: This interface specifies no settlement, balance management, or fund
/// storage logic. These are intentionally left for implementation contracts
/// to define based on their specific use cases.

// ============================================================================
// Error Types
// ============================================================================

/// Contract-level errors for virtual card operations
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum VirtualCardError {
    /// Card not found or invalid card ID
    CardNotFound = 1,
    /// Caller is not authorized to perform this action
    Unauthorized = 2,
    /// Card is currently inactive or disabled
    CardInactive = 3,
    /// Operation failed due to card state constraints
    InvalidCardState = 4,
    /// Card limits exceeded (spending limit, transaction count, etc.)
    LimitExceeded = 5,
    /// Invalid input parameters provided
    InvalidInput = 6,
    /// Card has expired or time window has passed
    Expired = 7,
    /// Duplicate card ID or identifier
    DuplicateCard = 8,
    /// Operation not supported by card type or version
    NotSupported = 9,
    /// Internal contract error
    InternalError = 10,
}

// ============================================================================
// Data Types
// ============================================================================

/// Unique identifier for a virtual card
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd)]
pub struct CardId(pub u128);

/// Card status enumeration for state transitions
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum CardStatus {
    /// Card has been created but not yet activated
    Pending = 0,
    /// Card is active and operational
    Active = 1,
    /// Card is temporarily suspended
    Suspended = 2,
    /// Card is permanently closed
    Closed = 3,
    /// Card is awaiting activation by user
    AwaitingActivation = 4,
}

/// Card type enumeration for categorization
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum CardType {
    /// Standard debit virtual card
    Standard = 0,
    /// Premium card with enhanced limits
    Premium = 1,
    /// Restricted usage card (e.g., gift card style)
    Restricted = 2,
    /// Corporate or team card
    Corporate = 3,
    /// Disposable single-use card
    Disposable = 4,
    /// Custom card type (reserved for future extensions)
    Custom = 5,
}

/// Card metadata structure containing immutable properties
#[contracttype]
#[derive(Clone, Debug)]
pub struct CardMetadata {
    /// Unique card identifier
    pub card_id: CardId,
    /// Owner/holder of the card
    pub holder: soroban_sdk::Address,
    /// Card type classification
    pub card_type: CardType,
    /// Card creation timestamp (Unix epoch seconds)
    pub created_at: u64,
    /// Card expiration timestamp (Unix epoch seconds)
    pub expires_at: u64,
    /// Optional human-readable card reference (e.g., last 4 digits)
    pub reference: soroban_sdk::String,
    /// Custom metadata storage for extensibility
    pub metadata: soroban_sdk::Map<soroban_sdk::String, soroban_sdk::String>,
}

/// Card configuration structure for mutable properties
#[contracttype]
#[derive(Clone, Debug)]
pub struct CardConfig {
    /// Current card status
    pub status: CardStatus,
    /// Maximum number of transactions allowed (0 = unlimited)
    pub max_transactions: u32,
    /// Spending limit in base units (0 = unlimited)
    pub spending_limit: u128,
    /// Time-based window for spending limit (seconds, 0 = per-transaction)
    pub limit_window_seconds: u64,
    /// Is card blocked temporarily
    pub is_blocked: bool,
    /// Custom configuration data (reserved for extensions)
    pub custom_config: soroban_sdk::Map<soroban_sdk::String, soroban_sdk::String>,
}

/// Transaction request specification
#[contracttype]
#[derive(Clone, Debug)]
pub struct TransactionRequest {
    /// Card being used
    pub card_id: CardId,
    /// Transaction amount in base units
    pub amount: u128,
    /// Currency or asset identifier
    pub currency: soroban_sdk::String,
    /// Merchant or destination identifier
    pub merchant: soroban_sdk::String,
    /// Descriptive transaction reference
    pub description: soroban_sdk::String,
    /// Metadata for transaction context
    pub metadata: soroban_sdk::Map<soroban_sdk::String, soroban_sdk::String>,
}

/// Transaction response specification
#[contracttype]
#[derive(Clone, Debug)]
pub struct TransactionResponse {
    /// Unique transaction ID
    pub transaction_id: u128,
    /// Associated card ID
    pub card_id: CardId,
    /// Transaction amount
    pub amount: u128,
    /// Transaction status (0=pending, 1=approved, 2=declined, 3=failed)
    pub status: u8,
    /// Timestamp of transaction
    pub timestamp: u64,
    /// Additional response metadata
    pub metadata: soroban_sdk::Map<soroban_sdk::String, soroban_sdk::String>,
}

// ============================================================================
// Event Type Specifications
// ============================================================================

/// Emitted when a new virtual card is created
#[contracttype]
#[derive(Clone, Debug)]
pub struct CardCreatedEvent {
    pub card_id: CardId,
    pub holder: soroban_sdk::Address,
    pub card_type: CardType,
    pub timestamp: u64,
}

/// Emitted when card metadata or configuration changes
#[contracttype]
#[derive(Clone, Debug)]
pub struct CardUpdatedEvent {
    pub card_id: CardId,
    pub status: CardStatus,
    pub timestamp: u64,
}

/// Emitted when card status changes
#[contracttype]
#[derive(Clone, Debug)]
pub struct CardStatusChangedEvent {
    pub card_id: CardId,
    pub old_status: CardStatus,
    pub new_status: CardStatus,
    pub reason: soroban_sdk::String,
    pub timestamp: u64,
}

/// Emitted when transaction is validated or processed
#[contracttype]
#[derive(Clone, Debug)]
pub struct TransactionValidatedEvent {
    pub transaction_id: u128,
    pub card_id: CardId,
    pub amount: u128,
    pub approved: bool,
    pub reason: soroban_sdk::String,
    pub timestamp: u64,
}

/// Emitted when card is activated
#[contracttype]
#[derive(Clone, Debug)]
pub struct CardActivatedEvent {
    pub card_id: CardId,
    pub holder: soroban_sdk::Address,
    pub timestamp: u64,
}

/// Emitted when card is deactivated or closed
#[contracttype]
#[derive(Clone, Debug)]
pub struct CardDeactivatedEvent {
    pub card_id: CardId,
    pub reason: soroban_sdk::String,
    pub timestamp: u64,
}

/// Emitted for custom events (extensible)
#[contracttype]
#[derive(Clone, Debug)]
pub struct CustomEvent {
    pub card_id: CardId,
    pub event_type: soroban_sdk::String,
    pub data: soroban_sdk::Map<soroban_sdk::String, soroban_sdk::String>,
    pub timestamp: u64,
}

// ============================================================================
// Abstract Contract Interface
// ============================================================================

/// VirtualCardContract - Interface specification for virtual card operations
/// 
/// Implementations must provide all methods defined in this interface.
/// Future extensions can add new methods while maintaining backward compatibility.
/// 
/// Design Principles:
/// - No balance or settlement logic (implementation-specific)
/// - Forward-compatible through metadata maps and custom fields
/// - Event-driven architecture for off-chain indexing
/// - Stateless transaction validation
pub trait VirtualCardContract {
    /// Create a new virtual card
    /// 
    /// Returns: Result<CardId, VirtualCardError>
    /// 
    /// Events: CardCreatedEvent
    fn create_card(
        holder: soroban_sdk::Address,
        card_type: CardType,
        expires_at: u64,
        reference: soroban_sdk::String,
        metadata: soroban_sdk::Map<soroban_sdk::String, soroban_sdk::String>,
    ) -> Result<CardId, VirtualCardError>;

    /// Retrieve card metadata
    /// 
    /// Returns: Result<CardMetadata, VirtualCardError>
    fn get_card_metadata(card_id: CardId) -> Result<CardMetadata, VirtualCardError>;

    /// Retrieve card configuration
    /// 
    /// Returns: Result<CardConfig, VirtualCardError>
    fn get_card_config(card_id: CardId) -> Result<CardConfig, VirtualCardError>;

    /// Update card configuration
    /// 
    /// Returns: Result<(), VirtualCardError>
    /// 
    /// Events: CardUpdatedEvent
    fn update_card_config(
        card_id: CardId,
        config: CardConfig,
    ) -> Result<(), VirtualCardError>;

    /// Change card status
    /// 
    /// Returns: Result<(), VirtualCardError>
    /// 
    /// Events: CardStatusChangedEvent
    fn change_card_status(
        card_id: CardId,
        new_status: CardStatus,
        reason: soroban_sdk::String,
    ) -> Result<(), VirtualCardError>;

    /// Activate a card
    /// 
    /// Returns: Result<(), VirtualCardError>
    /// 
    /// Events: CardActivatedEvent
    fn activate_card(card_id: CardId) -> Result<(), VirtualCardError>;

    /// Deactivate or close a card
    /// 
    /// Returns: Result<(), VirtualCardError>
    /// 
    /// Events: CardDeactivatedEvent
    fn deactivate_card(
        card_id: CardId,
        reason: soroban_sdk::String,
    ) -> Result<(), VirtualCardError>;

    /// Validate a transaction against card constraints
    /// 
    /// This method performs validation without executing settlement.
    /// Settlement is delegated to separate contracts.
    /// 
    /// Returns: Result<TransactionResponse, VirtualCardError>
    /// 
    /// Events: TransactionValidatedEvent
    fn validate_transaction(
        request: TransactionRequest,
    ) -> Result<TransactionResponse, VirtualCardError>;

    /// Check if a card is eligible for a transaction
    /// 
    /// Returns: Result<bool, VirtualCardError>
    fn can_transact(
        card_id: CardId,
        amount: u128,
    ) -> Result<bool, VirtualCardError>;

    /// Lock a card temporarily
    /// 
    /// Returns: Result<(), VirtualCardError>
    /// 
    /// Events: CardStatusChangedEvent
    fn lock_card(
        card_id: CardId,
        reason: soroban_sdk::String,
    ) -> Result<(), VirtualCardError>;

    /// Unlock a temporarily locked card
    /// 
    /// Returns: Result<(), VirtualCardError>
    /// 
    /// Events: CardStatusChangedEvent
    fn unlock_card(card_id: CardId) -> Result<(), VirtualCardError>;

    /// Verify card ownership
    /// 
    /// Returns: Result<bool, VirtualCardError>
    fn verify_ownership(
        card_id: CardId,
        claimant: soroban_sdk::Address,
    ) -> Result<bool, VirtualCardError>;

    /// Retrieve card by reference identifier
    /// 
    /// Returns: Result<CardId, VirtualCardError>
    fn lookup_card_by_reference(
        reference: soroban_sdk::String,
    ) -> Result<CardId, VirtualCardError>;

    /// Emit a custom event for extensibility
    /// 
    /// Returns: Result<(), VirtualCardError>
    fn emit_custom_event(event: CustomEvent) -> Result<(), VirtualCardError>;

    /// Get contract version (for upgrade compatibility)
    /// 
    /// Returns: soroban_sdk::String
    fn get_version() -> soroban_sdk::String;

    /// Get contract capabilities/features (for discovery)
    /// 
    /// Returns: soroban_sdk::Vec<soroban_sdk::String>
    fn get_capabilities() -> soroban_sdk::Vec<soroban_sdk::String>;
}
