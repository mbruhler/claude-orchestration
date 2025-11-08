# Custom Syntax Design

Sometimes you need syntax beyond the built-in operators. I can help design custom syntax elements using a **reuse-first approach**.

## Reuse-First Philosophy

Before creating new syntax, I check:

1. **Built-in syntax** - Can existing operators do this?
2. **Global syntax library** - Does a pattern already exist?
3. **Template definitions** - Is this defined in a loaded template?
4. **Similar patterns** - Can existing syntax be adapted?

Only if no match exists do I create new syntax.

## When to Create Custom Syntax

Create custom syntax when:

- **Common pattern repeats** - You keep writing the same sequence
- **Domain-specific operations** - Industry-specific workflows
- **Readability suffers** - Too verbose with basic syntax
- **Abstraction helps** - Hide complexity behind clear name

**Don't create** custom syntax for:
- One-time use - Just use basic syntax
- Already exists - Check library first
- Overly specific - Won't be reusable

## Custom Syntax Types

### Actions (`@action-name`)

Reusable sub-workflows.

**Example**: `@deep-review`
```markdown
---
name: @deep-review
type: action
description: Multi-stage code review
---

## Expansion
[code-reviewer:"security" || code-reviewer:"style"] -> merge
```

**Usage**:
```flow
implement:"Write code" -> @deep-review -> deploy
```

### Checkpoints (`@checkpoint-name`)

Manual approval gates with specific prompts.

**Example**: `@security-gate`
```markdown
---
name: @security-gate
type: checkpoint
description: Security approval required
---

## Prompt
Review security findings. Verify no critical vulnerabilities.
Options: Approve, Fix Issues, Abort
```

**Usage**:
```flow
scan:"Security scan" -> @security-gate -> deploy
```

### Operators (symbols)

New flow control operators.

**Example**: `=>` (merge with dedup)
```markdown
---
symbol: =>
description: Merge with deduplication
---

Executes left then right, removing duplicates from combined output.
```

**Usage**:
```flow
fetch-primary => fetch-backup => process
```

### Conditions (`if condition-name`)

Custom conditional logic.

**Example**: `if security-critical`
```markdown
---
name: if security-critical
description: Check if changes affect security code
evaluation: Modified files in: auth/, crypto/, permissions/
---
```

**Usage**:
```flow
analyze:"Check changes" ->
(if security-critical)~> @security-review
```

### Loops

Reusable loop patterns.

**Example**: `retry-with-backoff(n)`
```markdown
---
name: retry-with-backoff
type: loop
params: [attempts]
description: Retry N times with exponential backoff
---

## Pattern
@try -> operation ->
(if failed)~> wait:[exponential delay] -> @try ~>
(if passed || attempts-exceeded)~> continue
```

**Usage**:
```flow
retry-with-backoff(3): deploy -> verify
```

## Design Process

When you ask for custom syntax:

### 1. I Verify Need

I check if existing syntax can work:
```
You want: "retry 3 times with increasing delays"

Existing solution:
@try -> op -> (if failed)~> wait -> @try ~> (if passed)~> next

Custom syntax needed?
Only if this repeats frequently in your workflows.
```

### 2. I Propose Name

I suggest an intuitive name:
```
For: "Deploy only if security scan is clean"
Proposed: @security-gate or (if security-passed)
```

### 3. I Define Behavior

I document exactly what it does:
```markdown
---
name: @security-gate
type: checkpoint
---

Behavior:
1. Pause workflow execution
2. Show security scan results to user
3. Prompt: "Security scan complete. Approve deployment?"
4. Options: Approve / Fix Issues / Abort
5. If Approve: Continue workflow
6. If Fix Issues: Return to previous step
7. If Abort: Stop workflow
```

### 4. I Create Examples

I show how to use it:
```flow
# Before
scan -> show-results -> ask-user -> (if approved)~> deploy

# After with custom syntax
scan -> @security-gate -> deploy
```

### 5. I Save Definition

I save to library for reuse:
```
library/syntax/checkpoints/security-gate.md
```

## Syntax Library Structure

```
library/syntax/
├── operators/          # Flow control operators
│   └── merge-dedup.md
├── actions/            # Reusable sub-workflows
│   └── deep-review.md
├── checkpoints/        # Approval gates
│   └── security-gate.md
├── conditions/         # Custom conditionals
│   └── security-critical.md
├── loops/              # Loop patterns
│   └── retry-backoff.md
├── aggregators/        # Result combination
│   └── vote-majority.md
└── guards/             # Pre-execution checks
    └── clean-working-tree.md
```

## Integration with Workflows

Custom syntax is automatically loaded:

```flow
# This workflow uses custom syntax
scan -> @security-gate -> deploy

# I automatically:
# 1. Check library/syntax/checkpoints/security-gate.md
# 2. Load definition
# 3. Expand during execution
# 4. Execute as: scan -> [pause + prompt user] -> deploy
```

## Best Practices

### DO:

✅ **Use descriptive names**
- `@security-gate` not `@check`
- `if security-critical` not `if important`

✅ **Document behavior clearly**
- Exact steps
- Edge cases
- Expected inputs/outputs

✅ **Provide examples**
- Show usage in workflows
- Demonstrate with/without custom syntax

✅ **Keep composable**
- Works with existing syntax
- Can be nested
- No surprising side effects

### DON'T:

❌ **Create for one-time use**
❌ **Make too specific** ("if tuesday-afternoon")
❌ **Hide too much complexity** (unclear what it does)
❌ **Duplicate existing syntax**

## Examples

### Example 1: Adaptive Testing

**Problem**: Different tests based on what changed.

**Without custom syntax**:
```flow
analyze:"Check what changed":changes ->
(if changes.includes('api'))~> run:"API tests" ~>
(if changes.includes('ui'))~> run:"UI tests" ~>
(if changes.includes('db'))~> run:"DB tests"
```

**With custom syntax**: `@adaptive-tests`
```markdown
---
name: @adaptive-tests
type: action
---

Analyzes changes and runs relevant test suites:
- API changes → API + integration tests
- UI changes → UI + visual tests
- DB changes → DB migration tests
```

**Usage**:
```flow
analyze:"Check changes" -> @adaptive-tests -> report
```

### Example 2: Canary Deployment

**Problem**: Gradual rollout with health checks.

**Custom syntax**: `=>canary(percent)`
```markdown
---
name: =>canary
type: operator
params: [percent]
---

Deploys to X% of servers, monitors health, expands if healthy.
```

**Usage**:
```flow
build -> test -> deploy =>canary(10%) -> verify -> deploy =>canary(50%) -> deploy =>canary(100%)
```

### Example 3: Review Escalation

**Problem**: Different approval levels based on risk.

**Custom syntax**: `@escalating-review`
```markdown
---
name: @escalating-review
type: checkpoint
---

Reviews code with escalation:
- Low risk: Auto-approve
- Medium risk: Peer review
- High risk: Senior + security review
```

**Usage**:
```flow
implement -> assess-risk -> @escalating-review -> deploy
```

## Global vs Local Syntax

**Global syntax** (in library/syntax/):
- Available in all workflows
- Well-tested and documented
- Part of standard library

**Local syntax** (in template Definitions):
- Specific to one template/workflow
- Not available globally
- Can be promoted to global

## Promoting Local to Global

After using local syntax successfully:

```
I've noticed you use @security-gate in multiple workflows.

Would you like to promote it to global syntax?
This will:
- Save to library/syntax/checkpoints/security-gate.md
- Make available in all future workflows
- Add to syntax reference documentation
```

---

**Want to create custom syntax? Describe the pattern you keep repeating!**
