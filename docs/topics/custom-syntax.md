# Custom Syntax Guide

Extend orchestration with custom syntax elements when built-in syntax doesn't express your workflow intent.

## Philosophy: Reuse First

**Before creating custom syntax:**

1. Check if built-in syntax works
2. Search global syntax library
3. Check existing templates
4. Consider adapting similar syntax
5. Only create new if no match

Custom syntax should be **intuitive, composable, self-documenting, and minimal**.

## Syntax Types

### 1. Operators

Custom flow control mechanisms.

**Format:**
```markdown
---
symbol: =>
description: Merge with deduplication
---

# Merge Operator (=>)

Executes left then right, deduplicating outputs.

## Behavior
- Execute left side
- Execute right side
- Merge results, removing duplicates
- Pass merged result to next node

## Example
explore => implement => test
```

**When to create:** Need flow behavior not covered by `->`, `||`, `~>`

### 2. Actions

Reusable workflow fragments that expand to full syntax.

**Format:**
```markdown
---
name: @deep-review
type: action
description: Multi-stage code review
---

# Deep Review Action

Parallel security and style review with merge.

## Expansion
[code-reviewer:"security" || code-reviewer:"style"] -> merge

## Usage
explore -> @deep-review -> implement
```

**When to create:** Frequently used workflow pattern that deserves shorthand

### 3. Checkpoints

Manual approval points with custom prompts.

**Format:**
```markdown
---
name: @security-gate
type: checkpoint
description: Security approval checkpoint
---

# Security Gate

Pauses workflow for security review approval.

## Prompt
Review security findings. Verify no critical vulnerabilities before proceeding.

## Usage
scan -> @security-gate -> deploy
```

**When to create:** Need specific prompt text for approval point

### 4. Loops

Retry patterns with custom behavior.

**Format:**
```markdown
---
name: retry-with-backoff
type: loop
params: [attempts]
description: Retry with exponential backoff
---

# Retry with Backoff

Retries operation N times with increasing delays.

## Pattern
@try -> {flow} (if failed)~> wait -> @try

## Usage
retry-with-backoff(3): deploy -> verify
```

**When to create:** Need specific retry behavior beyond simple `@try` loop

### 5. Conditions

Custom conditional logic.

**Format:**
```markdown
---
name: if security-critical
description: Check if changes affect security-critical code
evaluation: Check if modified files in: auth/, crypto/, permissions/
---

# Security-Critical Condition

Checks if changes affect security-sensitive code.

## Evaluation
Modified files match patterns:
- auth/**/*
- crypto/**/*
- permissions/**/*

## Usage
analyze (if security-critical):is-critical~>
  (if is-critical)~> careful-deploy
```

**When to create:** Need domain-specific conditional logic

### 6. Aggregators

Custom ways to combine parallel results.

**Format:**
```markdown
---
name: merge-with-vote
description: Combine parallel results using majority vote
behavior: Take most common result from parallel branches
---

# Merge with Vote

Takes majority vote from parallel branches.

## Behavior
1. Collect results from all parallel branches
2. Count occurrences of each unique result
3. Return most common result
4. Ties: return first encountered

## Usage
[agent1 || agent2 || agent3] merge-with-vote next-node
```

**When to create:** Need specific result combination logic

### 7. Guards

Pre-conditions that must be met before execution.

**Format:**
```markdown
---
name: require-clean-working-tree
description: Ensure no uncommitted changes
check: git status --porcelain returns empty
error: Uncommitted changes detected. Commit or stash first.
---

# Require Clean Working Tree

Ensures git working tree is clean before proceeding.

## Check
```bash
git status --porcelain
```
Must return empty output

## Error
Uncommitted changes detected. Commit or stash changes before running this workflow.

## Usage
require-clean-working-tree -> build -> test -> deploy
```

**When to create:** Need specific pre-condition checks

### 8. Tools

Wrappers for external command-line tools.

**Format:**
```markdown
---
name: tool:npm:test
type: tool
description: Run npm test suite
command: npm test
output: test results
---

# NPM Test Tool

Runs npm test suite.

## Command
```bash
npm test
```

## Output
Test results with pass/fail status and count

## Usage
build -> tool:npm:test (if passed)~> deploy
```

**When to create:** Need to invoke external tools in workflows

### 9. MCPs

Wrappers for MCP server tool calls.

**Format:**
```markdown
---
name: mcp:supabase:execute_sql
type: mcp
description: Execute SQL on Supabase
server: supabase
tool: execute_sql
params: [query]
---

# Supabase Execute SQL

Executes SQL query on Supabase database.

## Server
supabase

## Tool
execute_sql

## Parameters
- query: SQL query string

## Usage
validate -> mcp:supabase:execute_sql:"INSERT INTO ..." -> verify
```

**When to create:** Need to invoke MCP tools in workflows

## Scoping

### Template-Local (Default)

Custom syntax defined in template's Definitions section.

**Pros:**
- Specific to template needs
- No naming conflicts
- Easy to understand in context

**Cons:**
- Not reusable across templates
- Duplicated if needed elsewhere

**Example:**
```yaml
---
name: my-workflow
---

Workflow:
scan -> @my-checkpoint -> deploy

---

Definitions:

@my-checkpoint: checkpoint
description: My specific checkpoint
prompt: Check my specific things
```

### Global (Opt-In)

Promoted to `library/syntax/<type>/<name>.md`.

**Pros:**
- Reusable across all workflows
- Discoverable in syntax library
- Shared across team

**Cons:**
- Must manage naming conflicts
- More responsibility to document well

**When to promote:**
- Syntax is genuinely reusable
- Clear, descriptive name chosen
- Well documented
- Tested in at least one workflow

## Creation Process

### Via Natural Language

When creating workflow with `/orchestration:create`, system:

1. Recognizes when custom syntax needed
2. Calls `workflow-syntax-designer` agent
3. Checks for reusable syntax first
4. Creates new syntax if no match
5. Includes in template Definitions
6. Offers to promote to global library

### Manual Creation

1. Choose syntax type
2. Follow format for that type
3. Create file in `library/syntax/<type>/<name>.md`
4. Test in a workflow
5. Refine based on usage

## Naming Guidelines

### Operators

- Use symbols that suggest behavior
- `=>` suggests merge/combine
- `<~` suggests reverse/undo
- Keep to 1-2 characters

### Actions

- Use `@` prefix
- Descriptive names: `@deep-review`, `@full-validation`
- Kebab-case: `@security-gate`, `@pre-deploy-check`

### Checkpoints

- Use `@` prefix
- Include purpose: `@security-gate`, `@legal-review`
- Suffix `-gate` or `-review` for clarity

### Loops

- Describe behavior: `retry-with-backoff`, `retry-until-success`
- Include key parameters in name when clear

### Conditions

- Start with `if`: `if security-critical`, `if high-priority`
- Be specific: `if affects-auth` not `if important`

### Aggregators

- Describe combination logic: `merge-with-vote`, `merge-unique`
- Start with `merge-` when applicable

### Guards

- Imperative form: `require-clean-working-tree`, `ensure-tests-pass`
- Start with `require-` or `ensure-`

### Tools

- Format: `tool:<tool>:<action>`
- Examples: `tool:npm:test`, `tool:docker:build`, `tool:git:status`

### MCPs

- Format: `mcp:<server>:<tool>`
- Examples: `mcp:supabase:execute_sql`, `mcp:github:create_pr`

## Design Principles

### 1. Intuitive

Names/symbols should hint at behavior:
```
✅ @security-gate (clearly a security checkpoint)
❌ @sg (unclear abbreviation)

✅ retry-with-backoff (describes behavior)
❌ retry2 (what does 2 mean?)
```

### 2. Composable

Should work with existing syntax:
```
✅ build -> @security-gate -> deploy
(works with sequential operator)

✅ [test || @deep-review] -> merge
(works in parallel)
```

### 3. Self-Documenting

Clear from context what it does:
```
✅ require-clean-working-tree -> deploy
(obvious: checks git status before deploy)

✅ smoke-test (if failed):failed~> rollback
(clear: rollback if smoke test fails)
```

### 4. Minimal

Only create when truly needed:
```
❌ Creating custom operator for simple sequence
(use -> instead)

✅ Creating custom checkpoint with specific prompt
(built-in @label doesn't have custom prompts)
```

## Validation

Before saving custom syntax, verify:

- [ ] No conflict with built-in syntax
- [ ] No existing global syntax with same name
- [ ] Name follows guidelines for syntax type
- [ ] Documentation is complete
- [ ] Examples are provided
- [ ] Behavior is clearly defined
- [ ] Edge cases documented

## Examples

### Example 1: Security Gate Checkpoint

**Problem:** Need checkpoint specifically for security review with custom prompt.

**Reuse check:**
- Built-in `@label`? No custom prompts
- Global library? No security-specific checkpoint
- Templates? None found

**Create:**
```markdown
---
name: @security-gate
type: checkpoint
description: Security approval checkpoint
---

# Security Gate

Pauses workflow for security review approval.

## Prompt
Review security findings. Verify no critical vulnerabilities before proceeding.

## Usage
scan -> @security-gate -> deploy
```

**Scope:** Start template-local, promote if reused

### Example 2: Retry with Backoff Loop

**Problem:** Need retry with exponential backoff, not simple retry.

**Reuse check:**
- Built-in `@try`? No backoff support
- Global library? No backoff loop found
- Templates? None found

**Create:**
```markdown
---
name: retry-with-backoff
type: loop
params: [attempts]
description: Retry with exponential backoff
---

# Retry with Backoff

Retries operation N times with increasing delays between attempts.

## Pattern
@try -> {flow} (if failed)~> wait -> @try

Wait duration doubles each attempt: 1s, 2s, 4s, 8s...

## Parameters
- attempts: Maximum retry attempts (default: 3)

## Usage
retry-with-backoff(5): deploy -> verify
```

**Scope:** Promote to global (generally useful)

### Example 3: NPM Test Tool

**Problem:** Need to run npm tests in workflow.

**Reuse check:**
- Built-in tools? No built-in tool wrappers
- Global library? No npm tool yet
- Templates? None found

**Create:**
```markdown
---
name: tool:npm:test
type: tool
description: Run npm test suite
command: npm test
output: test results
---

# NPM Test Tool

Runs npm test suite and reports results.

## Command
```bash
npm test
```

## Output
Test results with:
- Pass/fail status
- Number of tests run
- Number of failures
- Test duration

## Usage
build -> tool:npm:test (if passed):tests-passed~>
  (if tests-passed)~> deploy ->
  (if !tests-passed)~> debug
```

**Scope:** Promote to global (common need)

## Managing Global Syntax

### View All Syntax

```
/orchestrate → Manage syntax → List all syntax
```

Shows table of all global syntax with type, name, and description.

### Search Syntax

```
/orchestrate → Manage syntax → Search syntax
```

Search by keyword in names and descriptions.

### View by Type

```
/orchestrate → Manage syntax → View by type
```

Browse operators, actions, checkpoints, etc. separately.

### Edit Syntax

1. Navigate to `library/syntax/<type>/<name>.md`
2. Edit the file
3. Save
4. Test in a workflow

### Delete Syntax

1. Find file in `library/syntax/<type>/`
2. Delete file
3. Verify no workflows use it

## Best Practices

1. **Reuse first:** Always check before creating
2. **Name clearly:** Future you should understand the name
3. **Document well:** Include examples and edge cases
4. **Test thoroughly:** Use in real workflow before promoting
5. **Start local:** Template-local first, promote when proven useful
6. **Be conservative:** Only promote genuinely reusable syntax
7. **Maintain:** Update documentation as you learn more

## Anti-Patterns

❌ **Creating custom syntax for simple sequences**
```
Bad: @test-and-deploy expands to: test -> deploy
Good: Just use: test -> deploy
```

❌ **Cryptic abbreviations**
```
Bad: @sgr (what does this mean?)
Good: @security-gate-review
```

❌ **Overly generic names**
```
Bad: @check (check what?)
Good: @security-check
```

❌ **Creating without checking reuse**
```
Bad: Creating operator before searching global library
Good: Search first, create only if needed
```

❌ **Promoting everything to global**
```
Bad: Promote template-specific checkpoint
Good: Keep it local if not generally useful
```

## Troubleshooting

**Problem:** Name conflicts with existing syntax

**Solution:** Search global library before creating, choose unique name

**Problem:** Syntax doesn't compose well

**Solution:** Redesign to work with existing operators and patterns

**Problem:** Too complex to understand

**Solution:** Simplify or break into smaller elements

**Problem:** Not sure if should promote to global

**Solution:** Start local, promote only if you use it in multiple templates

## See Also

- [Natural Language Workflow Creation](../features/natural-language.md)
- [Template System](../features/templates.md)
- [Variable Binding Reference](../reference/variable-binding.md)
