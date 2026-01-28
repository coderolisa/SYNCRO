use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    Address, Env,
};

#[test]
fn test_renewal_success() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SubscriptionRenewalContract, ());
    let client = SubscriptionRenewalContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let sub_id = 123;

    client.init_sub(&user, &sub_id);

    let result = client.renew(&sub_id, &3, &10, &true);
    assert!(result);

    let data = client.get_sub(&sub_id);
    assert_eq!(data.state, SubscriptionState::Active);
    assert_eq!(data.failure_count, 0);
}

#[test]
fn test_retry_logic() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SubscriptionRenewalContract, ());
    let client = SubscriptionRenewalContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let sub_id = 456;
    let max_retries = 2;
    let cooldown = 10;

    client.init_sub(&user, &sub_id);

    // First failure
    let result = client.renew(&sub_id, &max_retries, &cooldown, &false);
    assert!(!result);

    let data = client.get_sub(&sub_id);
    assert_eq!(data.state, SubscriptionState::Retrying);
    assert_eq!(data.failure_count, 1);

    // Advance ledger to pass cooldown
    env.ledger().with_mut(|li| {
        li.sequence_number = 100;
    }); // jump ahead

    // renewal attempt but fail again (ledger 100)
    client.renew(&sub_id, &max_retries, &cooldown, &false);

    // Advance ledger less than cooldown from 100
    env.ledger().with_mut(|li| {
        li.sequence_number = 105;
    });

    // Should fail panic due to cooldown
    // This part is tricky to test with simple panic check in soroban test utils sometimes,
    // but the logic is there. We'll skip the panic test and test the limit.

    // Advance past cooldown
    env.ledger().with_mut(|li| {
        li.sequence_number = 120;
    });

    // Third failure (count becomes 3 > max_retries 2) -> Should fail
    client.renew(&sub_id, &max_retries, &cooldown, &false);

    let data = client.get_sub(&sub_id);
    assert_eq!(data.state, SubscriptionState::Failed);
    assert_eq!(data.failure_count, 3);
}

#[test]
#[should_panic(expected = "Cooldown period active")]
fn test_cooldown_enforcement() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SubscriptionRenewalContract, ());
    let client = SubscriptionRenewalContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let sub_id = 789;

    client.init_sub(&user, &sub_id);

    // Fail once
    client.renew(&sub_id, &3, &10, &false);

    // Try again immediately (cooldown not met)
    client.renew(&sub_id, &3, &10, &false);
}
