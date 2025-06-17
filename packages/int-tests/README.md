# integration-tests

**grid-wolf** relies on [playwright](https://playwright.dev/) integration testing, which provides a set of APIs for both headless and non-headless browser testing, as well as API request testing, authentication, detailed reporting and coverage. 

## Prerequisites

Two user accounts must be established in the 

## Accounts and Authentication

Testing user authentication, as well as acquiring access tokens for testing API endpoints,
currently requires two pre-configured users.  Credentials for the user can be provided via
environment variables:

- GRID_WOLF_INT_TEST_USERNAME
- GRID_WOLF_INT_TEST_PASSWORD
- GRID_WOLF_INT_TEST_USER_ID
- GRID_WOLF_INT_TEST_USERNAME_2
- GRID_WOLF_INT_TEST_PASSWORD_2
- GRID_WOLF_INT_TEST_USER_ID_2

Additionally, the following details provide configuration values th
