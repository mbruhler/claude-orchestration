# Custom Checkpoints

Custom checkpoints are manual approval points with specific prompts for the user.

## Format

```markdown
---
name: @checkpoint-name
type: checkpoint
description: What this checkpoint validates
---

# Checkpoint Name

Detailed explanation of what should be checked at this point.

## Prompt
The prompt text shown to the user when the checkpoint is reached.
This should clearly explain what needs to be reviewed or verified.

## Usage
previous-step -> @checkpoint-name -> next-step
```

## When to Create

Create custom checkpoints when you need:
- Specific prompt text for approval
- Domain-specific validation instructions
- Contextual review guidelines

## Examples

See `security-gate.md` for a security approval checkpoint example.
