# User Stories

## Feature

- So that important data is not lost, I want a DLQ setup for unprocessed kinesis records
    - Should allow full detail of record data to be preserved
- I want to save Map data via API
- ~~I want to save Game data via API~~
- ~~I want to save Map data via API~~
- I want to save images for Maps via API
- I want to setup my user account via API
- I want to add entities via API
- I want to run game sessions via API
- I want all items in the HLD architecture design to be clearly defined
- I want to be able to deploy the entire app ecosystem using a single command which will respect
dependency ordering and deploy successfully
- I want to be able to create a game and all required data within a UI
- I want to be able to setup and save a map & grid for a game within the UI
- I want to be able to get a list of saved data when there are too many items to retrieve with a
single call

## Bugfix
- I want to remove the kinesis stream from `central-infra` and only implement as part of `session`

## Maint
- To DRY up my api specifications, I want to reference models shared from a CDN
- ~~To loosen dependencies between packages, I want to store shared resource information in AWS
parameter store instead of importing stack outputs~~
- To DRY up my APIs, I want to use a shared API handler component which accepts specific models and
prepends primary and sort key values properly
