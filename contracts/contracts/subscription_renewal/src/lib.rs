#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum SubscriptionState {
    Active,
    Retrying,
    Failed,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SubscriptionData {
    pub owner: Address,
    pub state: SubscriptionState,
    pub failure_count: u32,
    pub last_attempt_ledger: u32,
}

#[contract]
pub struct SubscriptionRenewalContract;

#[contractimpl]
impl SubscriptionRenewalContract {
    /// Initialize a subscription
    pub fn init_sub(env: Env, info: Address, sub_id: u64) {
        let key = sub_id;
        let data = SubscriptionData {
            owner: info,
            state: SubscriptionState::Active,
            failure_count: 0,
            last_attempt_ledger: 0,
        };
        env.storage().persistent().set(&key, &data);
    }

    /// Attempt to renew the subscription.
    /// Returns true if renewal is successful (simulated), false if it failed and retry logic was triggered.
    /// limits: max retries allowed.
    /// cooldown: min ledgers between retries.
    pub fn renew(
        env: Env,
        sub_id: u64,
        max_retries: u32,
        cooldown_ledgers: u32,
        succeed: bool,
    ) -> bool {
        let key = sub_id;
        let mut data: SubscriptionData = env
            .storage()
            .persistent()
            .get(&key)
            .expect("Subscription not found");

        // If already failed, we can't renew (or maybe we specifically handle this, but simpler to abort)
        if data.state == SubscriptionState::Failed {
            panic!("Subscription is in FAILED state");
        }

        let current_ledger = env.ledger().sequence();

        // Check cooldown
        if data.failure_count > 0 && current_ledger < data.last_attempt_ledger + cooldown_ledgers {
            panic!("Cooldown period active");
        }

        if succeed {
            // Simulated success
            data.state = SubscriptionState::Active;
            data.failure_count = 0;
            data.last_attempt_ledger = current_ledger;
            env.storage().persistent().set(&key, &data);

            #[allow(deprecated)]
            env.events()
                .publish((symbol_short!("renewed"), sub_id), data.owner);
            true
        } else {
            // Simulated failure
            data.failure_count += 1;
            data.last_attempt_ledger = current_ledger;

            #[allow(deprecated)]
            env.events().publish(
                (symbol_short!("failed"), sub_id),
                (data.failure_count, current_ledger),
            );

            if data.failure_count > max_retries {
                data.state = SubscriptionState::Failed;
                #[allow(deprecated)]
                env.events().publish(
                    (symbol_short!("state_ch"), sub_id),
                    SubscriptionState::Failed,
                );
            } else {
                data.state = SubscriptionState::Retrying;
                #[allow(deprecated)]
                env.events().publish(
                    (symbol_short!("state_ch"), sub_id),
                    SubscriptionState::Retrying,
                );
            }

            env.storage().persistent().set(&key, &data);
            false
        }
    }

    pub fn get_sub(env: Env, sub_id: u64) -> SubscriptionData {
        env.storage()
            .persistent()
            .get(&sub_id)
            .expect("Subscription not found")
    }
}

#[cfg(test)]
mod test;
