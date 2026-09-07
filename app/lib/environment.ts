const REQUIRED_ENVIRONMENT_VARIABLES = [
  'SESSION_SECRET',
  'PUBLIC_STORE_DOMAIN',
  'PUBLIC_STOREFRONT_API_TOKEN',
  'PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID',
  'PUBLIC_CUSTOMER_ACCOUNT_API_URL',
] as const;

export function validateShopifyEnvironment(env: Env) {
  const missingVariables = REQUIRED_ENVIRONMENT_VARIABLES.filter(
    (variableName) => !env[variableName],
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing Shopify environment variables: ${missingVariables.join(', ')}`,
    );
  }

  if (env.PUBLIC_STORE_DOMAIN.includes('mock.shop')) {
    throw new Error(
      'PUBLIC_STORE_DOMAIN points to Mock Shop. Pull the linked Shopify environment before starting the storefront.',
    );
  }
}
