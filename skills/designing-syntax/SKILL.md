---
name: designing-syntax
description: Design custom syntax elements with reuse-first approach for workflow orchestration. Use when user needs custom operators, checkpoints, or syntax patterns not available in core syntax.
---

# Designing Custom Workflow Syntax

I design custom syntax elements following a reuse-first approach. Only create new syntax when existing patterns don't fit.

## When I Activate

I activate when you:
- Need custom workflow operators
- Want specialized checkpoints
- Ask about extending syntax
- Need domain-specific patterns
- Say "I need a custom syntax for..."

## Reuse-First Process

Before creating new syntax, I check:

1. **Built-in syntax** - `->`, `||`, `~>`, `@`, `[...]`
2. **Global syntax library** - `library/syntax/`
3. **Template definitions** - Existing workflow definitions
4. **Similar patterns** - Adaptable existing syntax

**Only create new if no match exists.**

## Syntax Types

### Operators

Custom flow control operators.

Example: `=>` (merge with dedup)
```markdown
---
symbol: =>
description: Merge with deduplication
---
Executes left then right, removes duplicates from combined output.
```

### Actions

Reusable sub-workflows.

Example: `@deep-review`
```markdown
---
name: @deep-review
type: action
---
Expansion: [code-reviewer:"security" || code-reviewer:"style"] -> merge
```

### Checkpoints

Manual approval gates with prompts.

Example: `@security-gate`
```markdown
---
name: @security-gate
type: checkpoint
---
Prompt: Review security findings. Verify no critical vulnerabilities.
```

### Conditions

Custom conditional logic.

Example: `if security-critical`
```markdown
---
name: if security-critical
description: Check if changes affect security code
evaluation: Modified files in: auth/, crypto/, permissions/
---
```

### Loops

Reusable loop patterns.

Example: `retry-with-backoff(n)`
```markdown
---
name: retry-with-backoff
type: loop
params: [attempts]
---
Pattern: @try -> operation -> (if failed)~> wait -> @try
```

## Design Principles

1. **Intuitive** - Names/symbols hint at behavior
2. **Composable** - Works with existing syntax
3. **Self-documenting** - Clear from context
4. **Minimal** - Only when truly needed

## Best Practices

✅ **DO**:
- Use descriptive names (`@security-gate` not `@check`)
- Document behavior clearly
- Provide examples
- Keep composable

❌ **DON'T**:
- Create for one-time use
- Make too specific
- Hide too much complexity
- Duplicate existing syntax

## Library Structure

```
library/syntax/
├── operators/          # Flow control operators
├── actions/            # Reusable sub-workflows
├── checkpoints/        # Approval gates
├── conditions/         # Custom conditionals
├── loops/              # Loop patterns
├── aggregators/        # Result combination
└── guards/             # Pre-execution checks
```

## Related Skills

- **creating-workflows**: Use custom syntax in workflows
- **executing-workflows**: Execute workflows with custom syntax

---

**Need custom syntax? Describe the pattern you keep repeating!**
