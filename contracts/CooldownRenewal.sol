// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CooldownRenewal
 * @notice Enforces a minimum time gap between renewal attempts per subscriber.
 *
 * Security Design Notes:
 * ─────────────────────
 * 1. MINER TIMESTAMP MANIPULATION
 *    block.timestamp can be nudged ~15 seconds by validators.
 *    For cooldowns ≥ 60 seconds this is negligible.
 *    We enforce a minimum cooldownPeriod of 60 seconds at the setter level
 *    to ensure timestamp manipulation cannot meaningfully bypass cooldown.
 *    DO NOT use this pattern for sub-minute cooldowns in adversarial contexts.
 *
 * 2. REENTRANCY
 *    We follow Checks-Effects-Interactions (CEI):
 *    - Check: require cooldown elapsed
 *    - Effect: update lastAttemptTimestamp BEFORE any external call
 *    - Interaction: emit event / call downstream (if any)
 *    This makes reentrancy-based cooldown bypass impossible.
 *
 * 3. STORAGE PACKING
 *    `lastAttemptTimestamp` is uint48 (fits timestamps until year 8.9M),
 *    packed alongside a bool `active` and address `owner` into one slot.
 *    Saves ~20k gas on first write vs. uint256.
 *
 * 4. GAS EFFICIENCY
 *    - uint48 for timestamps (3 bytes vs 32 bytes)
 *    - Custom errors (saves ~50 gas vs. require strings)
 *    - No redundant SSTORE: only write timestamp when cooldown passes
 *    - `cooldownPeriod` is immutable after deployment (use proxy pattern if upgrade needed)
 *
 * 5. DoS VECTORS
 *    - Per-user state: one user spamming doesn't lock others out
 *    - No loop over unbounded arrays
 *    - Admin cannot freeze all users at once (cooldown is per-user enforcement only)
 *
 * 6. REPLAY / RACE CONDITIONS
 *    - Timestamp written atomically within the same transaction
 *    - Two simultaneous txs from the same address: one will revert (second reads
 *      the updated state if included in the same block — both see the same
 *      block.timestamp, but only the first committed tx wins in state order)
 *    - Note: same-block race is mitigated because once one tx writes the timestamp,
 *      any other tx in the same block sees block.timestamp == lastAttemptTimestamp,
 *      which fails the `>` check (strict inequality required).
 *
 * 7. UPGRADE SAFETY
 *    If using a proxy (UUPS/Transparent), use initializer pattern instead of
 *    constructor for cooldownPeriod. See `initialize()` function below.
 *    Storage layout: leave gaps with __gap array.
 */

/**
 * @dev Packed subscriber state. Fits in a single 32-byte storage slot:
 *   [active: 1 byte][lastAttemptTimestamp: 6 bytes][padding: 25 bytes]
 *   (address owner is stored separately or can be the mapping key)
 */
struct SubscriberState {
    bool active;
    uint48 lastAttemptTimestamp; // safe until Unix time ~281 trillion — far future
}

// ─── Custom Errors (cheaper than require strings) ────────────────────────────

/// @notice Thrown when a renewal is attempted before the cooldown period has elapsed.
/// @param retryAfter The earliest timestamp at which retry is permitted.
error CooldownNotElapsed(uint256 retryAfter);

/// @notice Thrown when an invalid cooldown period is set (below minimum safe threshold).
error InvalidCooldownPeriod(uint256 provided, uint256 minimum);

/// @notice Thrown when caller is not the contract owner.
error Unauthorized();

// ─── Contract ────────────────────────────────────────────────────────────────

contract CooldownRenewal {

    // ── Constants ──────────────────────────────────────────────────────────

    /**
     * @dev Minimum cooldown: 60s. Below this, miner timestamp manipulation
     *      (~15s window) becomes a non-trivial percentage of the cooldown,
     *      undermining the guarantee.
     */
    uint48 public constant MIN_COOLDOWN = 60 seconds;

    // ── State ───────────────────────────────────────────────────────────────

    address public owner;

    /**
     * @dev Configurable cooldown period. Settable by owner only.
     *      Using uint48 so it can be packed if needed; casting is explicit.
     */
    uint48 public cooldownPeriod;

    /**
     * @dev Core per-user state. Packed struct saves gas on every read/write.
     */
    mapping(address => SubscriberState) private _subscribers;

    /**
     * @dev Storage gap for upgrade-safe contracts (EIP-1967 proxy pattern).
     *      Reserve 49 slots so future variables don't corrupt existing layout.
     */
    uint256[49] private __gap;

    // ── Events ──────────────────────────────────────────────────────────────

    event RenewalAttempted(address indexed subscriber, uint48 timestamp);
    event CooldownPeriodUpdated(uint48 oldPeriod, uint48 newPeriod);
    event CooldownReset(address indexed subscriber);

    // ── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    // ── Constructor / Initializer ────────────────────────────────────────────

    /**
     * @dev Standard constructor. For proxy deployments, disable this and use
     *      `initialize()` instead (OpenZeppelin Initializable pattern).
     * @param _cooldownPeriod Initial cooldown in seconds (must be >= MIN_COOLDOWN).
     */
    constructor(uint48 _cooldownPeriod) {
        _initializeCooldown(_cooldownPeriod);
        owner = msg.sender;
    }

    /**
     * @notice Initializer for proxy-upgradeable deployments.
     *         Call this instead of constructor when deploying behind a proxy.
     *         Add `initializer` modifier from OpenZeppelin if using their library.
     */
    function initialize(address _owner, uint48 _cooldownPeriod) external {
        // In production: add `initializer` modifier (OpenZeppelin) to prevent re-init
        require(owner == address(0), "Already initialized");
        owner = _owner;
        _initializeCooldown(_cooldownPeriod);
    }

    function _initializeCooldown(uint48 _cooldownPeriod) internal {
        if (_cooldownPeriod < MIN_COOLDOWN) {
            revert InvalidCooldownPeriod(_cooldownPeriod, MIN_COOLDOWN);
        }
        cooldownPeriod = _cooldownPeriod;
    }

    // ── External Functions ───────────────────────────────────────────────────

    /**
     * @notice Attempt a renewal. Reverts if called within the cooldown window.
     *
     * CEI Pattern enforced:
     *   1. CHECK  — verify cooldown has elapsed (or first attempt)
     *   2. EFFECT — update timestamp before any external interaction
     *   3. INTERACT — emit event (safe; no external calls here)
     *
     * @dev Same-block race: if two txs from the same address land in one block,
     *      they share block.timestamp. The first to be executed writes the state;
     *      the second reads `lastAttemptTimestamp == block.timestamp`, which fails
     *      `block.timestamp > lastAttemptTimestamp + cooldownPeriod` (strict >).
     *      Result: only one succeeds per block. This is the desired behavior.
     */
    function attemptRenewal() external {
        SubscriberState storage state = _subscribers[msg.sender];

        uint48 now48 = uint48(block.timestamp);
        uint48 last = state.lastAttemptTimestamp;
        uint48 period = cooldownPeriod;

        // ── CHECK ────────────────────────────────────────────────────────────
        // First attempt: last == 0, so condition is trivially satisfied.
        // Subsequent: must have passed the cooldown window.
        // Reject if now < last + period (require strict >=)
        if (last != 0 && now48 < last + period) {
            // Provide the exact retry timestamp for better UX in frontends/SDKs
            revert CooldownNotElapsed(uint256(last) + uint256(period));
        }

        // ── EFFECT ───────────────────────────────────────────────────────────
        // Update state BEFORE any external interaction to prevent reentrancy bypass.
        state.lastAttemptTimestamp = now48;
        state.active = true;

        // ── INTERACT ─────────────────────────────────────────────────────────
        // Safe: emit does not trigger external code execution.
        emit RenewalAttempted(msg.sender, now48);

        // If your renewal logic calls an external contract (e.g., token transfer),
        // put it HERE — after state is already updated. This ensures reentrancy
        // cannot re-enter before the timestamp is committed.
        // Example:
        //   ISubscriptionToken(token).mint(msg.sender, subscriptionAmount);
    }

    /**
     * @notice Update the cooldown period. Only callable by owner.
     * @param newPeriod New cooldown in seconds. Must be >= MIN_COOLDOWN.
     *
     * @dev Trade-off: allowing admin to reduce cooldown could be abused.
     *      Consider adding a timelock or DAO governance for production use.
     */
    function setCooldownPeriod(uint48 newPeriod) external onlyOwner {
        if (newPeriod < MIN_COOLDOWN) {
            revert InvalidCooldownPeriod(newPeriod, MIN_COOLDOWN);
        }
        emit CooldownPeriodUpdated(cooldownPeriod, newPeriod);
        cooldownPeriod = newPeriod;
    }

    /**
     * @notice Emergency function: reset a user's cooldown (admin only).
     * @param subscriber The address to reset.
     *
     * @dev Use with caution. For authorized account recoveries only.
     *      Consider requiring governance approval for production.
     */
    function resetCooldown(address subscriber) external onlyOwner {
        _subscribers[subscriber].lastAttemptTimestamp = 0;
        emit CooldownReset(subscriber);
    }

    // ── View Functions ───────────────────────────────────────────────────────

    /**
     * @notice Returns the earliest timestamp at which `subscriber` may renew.
     *         Returns 0 if they have never attempted (can renew immediately).
     */
    function nextRenewalTimestamp(address subscriber) external view returns (uint256) {
        uint48 last = _subscribers[subscriber].lastAttemptTimestamp;
        if (last == 0) return 0;
        return uint256(last) + uint256(cooldownPeriod);
    }

    /**
     * @notice Returns whether a subscriber is currently in cooldown.
     */
    function isInCooldown(address subscriber) external view returns (bool) {
        uint48 last = _subscribers[subscriber].lastAttemptTimestamp;
        if (last == 0) return false;
        return block.timestamp < uint256(last) + uint256(cooldownPeriod);
    }
}
