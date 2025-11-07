# Custom Guards

Custom guards are pre-conditions that must be met before workflow execution can proceed.

## Format

```markdown
---
name: guard-name
type: guard
description: What this guard checks
---

# Guard Name

Detailed explanation of the pre-condition.

## Check
```bash
command to check condition
```
Expected output or exit code

## Error
Error message shown when guard fails.
Should explain what needs to be fixed.

## Usage
guard-name -> step1 -> step2
```

## Built-in Guards

- None (create custom guards as needed)

Create guards when you need to:
- Verify environment state
- Check file/directory existence
- Validate prerequisites
- Ensure clean state

## Examples

See `require-clean-working-tree.md` for a git status check example.
