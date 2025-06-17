# grid-wolf

`grid-wolf` is a project meant primarily to demonstrate design and development patterns associated
with skillfully architected software solutions.

The `grid-wolf` application provides UIs, APIs, code and infrastructure for managing encounters and
combat in table-top roleplaying games. A gamemaster can upload map images, grid configuration and
other encounter information to the application, and can invite and manage participating players.
Players can upload avatar/token images and character data.  Players and gamemaster can then move
characters and NPCs around the map, view lines-of-site and areas-of-effect, and manage encounter
progress and statistics, all in real-time.

Unlike similar tools such as those provided by Roll20, `grid-wolf` does not attempt to provide
resources for map creation or video conferencing amongst participants.

This application is in early development. Refer to
[architecture documentation](./packages/docs/architecture.md) for more information.

## General Environment Configuration

A standard set of environment variables is required for any component of this application.  At a minimum, the following variables must be set:

```
STEPINTO_APP_TARGET_ACCOUNT_ID
STEPINTO_APP_TARGET_REGION
STEPINTO_APP_TARGET_ENV_PREFIX
STEPINTO_APP_DATA_TABLE_NAME
```

Additionally, the following variables may be required depending on which AWS services are utilized by a particular application:

```
GRID_WOLF_HOSTED_ZONE
GRID_WOLF_API_CERTIFICATE_ARN
GRID_WOLF_CDN_CERTIFICATE_ARN
GRID_WOLF_USER_POOL_CERTIFICATE_ARN
GRID_WOLF_APP_SUBDOMAIN
GRID_WOLF_SECRETS_ARN
```

Integration tests also require a [distinct set of environment variables](./packages/int-tests/README.md).