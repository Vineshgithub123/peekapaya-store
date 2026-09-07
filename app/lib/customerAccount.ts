export function isCustomerAccountConfigured(env: Env) {
  return Boolean(
    env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID &&
      env.PUBLIC_CUSTOMER_ACCOUNT_API_URL,
  );
}
