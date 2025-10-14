# Test HIDDEN-REF Parsing

This is a test article to demonstrate the HIDDEN-REF functionality.

## Before Hidden Content

This content is always visible.

[[HIDDEN-REF]]test-uuid-123[[/HIDDEN-REF]]

[[HIDDEN-REF]]another-test-uuid-456[[/HIDDEN-REF]]

## After Hidden Content

This content is also always visible.

### How it works:

1. **If the UUID exists and is published**: The content inside the tags will be shown
2. **If the UUID doesn't exist or is not published**: The entire tag and content will be removed
3. **Multiple tags**: All HIDDEN-REF tags in the same content will be processed

### Example scenarios:

**Published article (UUID: abc123):**
```
[[HIDDEN-REF]]abc123[[/HIDDEN-REF]]
```
Result: "abc123" (without the tags)

**Unpublished article (UUID: xyz789):**
```
[[HIDDEN-REF]]xyz789[[/HIDDEN-REF]]
```
Result: "" (completely removed)

**Invalid or empty UUID:**
```
[[HIDDEN-REF]][[/HIDDEN-REF]]
```
Result: "" (completely removed)
