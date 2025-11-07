# Custom Conditions

Custom conditions enable domain-specific conditional logic in workflows.

## Format

```markdown
---
name: if condition-name
description: What this condition checks
evaluation: How the condition is evaluated
---

# Condition Name

Detailed explanation of when this condition is true.

## Evaluation
Specific criteria for evaluation:
- Check 1
- Check 2
- Result determination

## Usage
operation (if condition-name):variable~>
  (if variable)~> handle-true
```

## Built-in Conditions

- `(if passed)` - Check if previous step succeeded
- `(if failed)` - Check if previous step failed
- `(all success)` - Check if all parallel branches succeeded
- `(any failed)` - Check if any parallel branch failed

Create custom conditions when you need:
- Domain-specific logic
- File/directory checks
- Environment validation
- Business rule evaluation

## Examples

See examples for file-based and environment-based condition patterns.
