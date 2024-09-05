# User Stories

## Feature

- So that important data is not lost, I want a DLQ setup for unprocessed kinesis records
    - Should allow full detail of record data to be preserved
- I want to save Map data via API
- I want to save Game data via API
- I want to setup my user account via API
- I want to add entities via API
- I want to run game sessions via API
- I want all items in the HLD architecture design to be clearly defined
- I want to be able to deploy the entire app ecosystem using a single command which will respect
dependency ordering and deploy successfully

## Bugfix
- I want to remove the kinesis stream from `central-infra` and only implement as part of `session`

## Maint
