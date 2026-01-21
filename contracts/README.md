# Synchro Smart Contracts

Smart contracts for Synchro built on Stellar's Soroban platform. These contracts will handle decentralized subscription management, payment processing, and integration with the Stellar network for future automated payment capabilities.

## Overview

The contracts folder contains Soroban smart contracts that will enable:
- **Decentralized Subscription Management**: Store subscription data on-chain
- **Payment Processing**: Handle crypto payments for subscriptions
- **Stellar Integration**: Prepare for future non-custodial card issuance
- **Gift Card Tracking**: Track gift card purchases and redemptions
- **Automated Payments**: Future phase - automated recurring payments via Stellar

## Tech Stack

- **Platform**: Stellar Soroban
- **Language**: Rust
- **SDK**: Soroban SDK 23
- **Build Tool**: Stellar Contract CLI
- **Testing**: Soroban testutils

## Project Structure

```
contracts/
├── Cargo.toml                    # Workspace configuration
├── contracts/
│   └── hello-world/             # Example contract (to be replaced)
│       ├── Cargo.toml
│       ├── Makefile
│       └── src/
│           ├── lib.rs           # Contract implementation
│           └── test.rs           # Contract tests
└── README.md
```

## Current State

### ✅ Implemented
- Soroban workspace setup
- Example hello-world contract structure
- Build configuration
- Test framework setup

### ❌ Not Implemented
- Subscription management contract
- Payment processing contract
- Gift card tracking contract
- Integration with Stellar network
- Contract deployment scripts
- Contract interaction utilities

## Setup

### Prerequisites

1. **Install Rust** (if not already installed):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Install Stellar Contract CLI**:
   ```bash
   cargo install --locked --version 23.0.0 soroban-cli
   ```

3. **Install Stellar CLI** (for network interaction):
   ```bash
   # Follow instructions at https://developers.stellar.org/docs/tools/stellar-cli
   ```

### Building Contracts

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release
```

Or use the Makefile in each contract directory:

```bash
cd contracts/hello-world
make build
```

### Testing Contracts

```bash
cd contracts
cargo test
```

Or use the Makefile:

```bash
cd contracts/hello-world
make test
```

## Contract Development Roadmap

### Phase 1: MVP Contracts (Current Phase)
- [ ] Replace hello-world with subscription tracking contract
- [ ] Implement basic subscription data storage
- [ ] Add subscription CRUD operations
- [ ] Implement access control and permissions

### Phase 2: Payment Integration
- [ ] Create payment processing contract
- [ ] Integrate with Stellar payment network
- [ ] Handle gift card purchase tracking
- [ ] Implement payment verification

### Phase 3: Automation (Future)
- [ ] Automated payment scheduling contract
- [ ] Integration with non-custodial Stellar card issuance
- [ ] Recurring payment automation
- [ ] Multi-signature support for security

## Planned Contracts

### 1. Subscription Registry Contract
**Purpose**: Store and manage subscription data on-chain

**Key Functions**:
- `create_subscription(user, subscription_data)` - Create new subscription
- `update_subscription(id, updates)` - Update subscription details
- `cancel_subscription(id)` - Cancel a subscription
- `get_subscription(id)` - Retrieve subscription data
- `list_user_subscriptions(user)` - List all subscriptions for a user

### 2. Payment Processor Contract
**Purpose**: Handle payment processing and verification

**Key Functions**:
- `process_payment(subscription_id, amount, asset)` - Process payment
- `verify_payment(payment_id)` - Verify payment status
- `refund_payment(payment_id)` - Process refunds
- `get_payment_history(user)` - Get payment history

### 3. Gift Card Tracker Contract
**Purpose**: Track gift card purchases and redemptions

**Key Functions**:
- `register_gift_card_purchase(user, amount, provider)` - Register purchase
- `mark_gift_card_redeemed(card_id)` - Mark as redeemed
- `get_gift_card_balance(user)` - Get total gift card balance

### 4. Automation Contract (Future)
**Purpose**: Handle automated recurring payments

**Key Functions**:
- `schedule_payment(subscription_id, schedule)` - Schedule recurring payment
- `execute_scheduled_payment(payment_id)` - Execute scheduled payment
- `cancel_scheduled_payment(payment_id)` - Cancel scheduled payment

## Development Guidelines

### Code Style
- Follow Rust naming conventions (snake_case for functions, PascalCase for types)
- Write comprehensive tests for all contract functions
- Document all public functions with doc comments
- Use meaningful variable names

### Testing
- Write unit tests for each function
- Test edge cases and error conditions
- Test access control and permissions
- Test with different user scenarios

### Security
- Validate all inputs
- Implement proper access control
- Avoid storing sensitive data on-chain
- Use secure random number generation when needed
- Follow Soroban security best practices

## Deployment

### Local Testing
```bash
# Start local Soroban network
soroban network start

# Deploy contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/contract.wasm \
  --source-account <account-secret>
```

### Testnet Deployment
```bash
# Deploy to Stellar testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/contract.wasm \
  --network testnet \
  --source-account <account-secret>
```

### Mainnet Deployment
```bash
# Deploy to Stellar mainnet (use with caution)
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/contract.wasm \
  --network mainnet \
  --source-account <account-secret>
```

## Integration with Backend

The smart contracts will integrate with the backend service to:
- Store subscription data on-chain for transparency
- Process payments through Stellar network
- Enable future automated payment capabilities
- Provide decentralized subscription management

## Resources

- [Soroban Documentation](https://developers.stellar.org/docs/build/smart-contracts/overview)
- [Soroban Examples](https://github.com/stellar/soroban-examples)
- [Stellar Developer Docs](https://developers.stellar.org/)
- [Rust Documentation](https://doc.rust-lang.org/)

## Related Documentation

- See main `/README.md` for project overview
- See `/backend/README.md` for backend integration details
- See `/client/README.md` for frontend integration

## Notes

- Contracts are in early development stage
- Current hello-world contract is a placeholder
- Contract architecture will evolve based on MVP requirements
- Focus on Phase 1 MVP functionality first
- Future phases depend on Stellar non-custodial card issuance availability
