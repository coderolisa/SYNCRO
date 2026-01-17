## Self-Custodial Subscription Manager (Built on Stellar)

A decentralized subscription management platform built on the Stellar blockchain that enables users to control recurring payments directly from their own wallet. Users can track, approve, pause, and fund subscriptions such as Netflix, YouTube, Claude, Midjourney, and more—without handing over control of their payment method to any centralized service. Payments are executed via a crypto-card–funded agent to handle Web2 billing.

## ✨ Key Features

Full self-custody: Users retain complete control of funds via Stellar wallets

Unified dashboard: Manage all subscriptions in one place

AI-powered agent: Automates approval requests and payment execution

Crypto-to-card settlement layer: Bridges Stellar assets to legacy Web2 services

Price-change protection: Spending caps and approval thresholds enforced on-chain

Push notifications: Real-time approvals, renewals, and balance alerts

Manual subscription entry: Support for platforms without native integrations

## High-Level Workflow

User connects a Stellar-compatible Web3 wallet.

User adds subscriptions (auto-detected or manually entered).

User funds a Subscription Vault with USDC or other Stellar-native stable assets.

When a bill is due:

The system sends an approval request.

Upon approval, the agent loads the exact amount onto a crypto card and pays the provider, or

Executes an on-chain settlement using x402-compatible payment flows where supported.

The dashboard updates balances, renewal dates, and spending insights in real time.
