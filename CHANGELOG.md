# CHANGELOG

## [1.1.0] 2020-07-26

### CHANGED

- Make `TurnAlert` and `TurnAlertConfig` globally available for use in macros, etc.
- Move the socket logic allowing for creating new TurnAlerts into the TurnAlert CRUD methods rather than TurnAlertConfig, so that players can create TurnAlerts via macro.

### REMOVED

- Removed `game.TurnAlertManager` as it was outdated and is now eclipsed by `TurnAlert` and `TurnAlertConfig` being global.

## [1.0.1] 2020-07-26

### FIXED

- Fix an issue where players could not create new alerts. (Thanks CRASH1115 for the report!)

## [1.0.0] 2020-07-26

The initial release of Turn Alert!
