# Custom Actions

Custom actions are reusable workflow fragments that expand to full workflow syntax.

## Format

```markdown
---
name: @action-name
type: action
description: What this action does
---

# Action Name

Detailed explanation.

## Expansion
[actual workflow syntax this expands to]

## Usage
node -> @action-name -> next-node
```

## Examples

See `deep-review.md` for a multi-stage review action example.
