# Custom Operators

Custom operators extend the orchestration syntax with new flow control mechanisms.

## Format

```markdown
---
symbol: =>
description: Brief description of what this operator does
---

# Operator Name

Detailed explanation of the operator behavior.

## Behavior
- Step 1 of what it does
- Step 2 of what it does

## Example
example-usage => another-node
```

## Built-in Operators

- `->` Sequential flow
- `||` Parallel execution
- `~>` Conditional flow

Add custom operators here only when built-in operators don't express your workflow intent.
