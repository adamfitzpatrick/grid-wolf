# integration-tests

## Accounts and Authentication

Testing user authentication, as well as acquiring access tokens for testing API endpoints,
currently requires a pre-configured testing user.  Credentials for the user can be provided via
environment variables, along with variable values required for client ID and redirect URI:

- GRID_WOLF_USER_AUTH_DOMAIN
- GRID_WOLF_USER_AUTH_CLIENT_ID
- GRID_WOLF_INT_TEST_USERNAME
- GRID_WOLF_INT_TEST_PASSWORD
