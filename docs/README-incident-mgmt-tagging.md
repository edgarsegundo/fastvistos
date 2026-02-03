# RFC/Incident Management Tagging System

Adopt a format like `[CATEGORY][PRIORITY][TEAM]`.

- Categories: `OBS`, `BUG`, `RISK`, `CRITICAL`, `TECHDEBT`.
- Priority: `P0` (highest) → `P3` (lowest).
- Team: `DEV`, `OPS`, etc.

Example:

```js
// [RISK][P0][DEV] Needs monitoring, logging, and notification
// [BUG][P0][DEV] Needs monitoring, logging, and notification
```
