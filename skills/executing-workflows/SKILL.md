---
name: orchestration:executing-workflows
description: Use when user provides workflow syntax with arrows (-> || ~>), says "run workflow", "execute workflow", "run this", mentions step1 -> step2 patterns. Executes orchestration workflows with real-time visualization, steering, and error recovery.
---

# Executing Orchestration Workflows

I execute workflows with real-time visualization, progress tracking, and interactive steering at checkpoints.

## When I Activate

I automatically activate when you:
- Provide workflow syntax to execute
- Ask to "run a workflow"
- Mention workflow execution
- Want to execute a template
- Ask "how do I run this workflow?"

## Quick Start

Just provide workflow syntax and I'll handle the rest:

```flow
Explore:"Analyze codebase":analysis ->
implement:"Add feature based on {analysis}":code ->
general-purpose:"Run tests":results
```

I automatically:
1. Parse and validate syntax
2. Show execution graph visualization
3. Execute agents with progress updates
4. Handle checkpoints and steering
5. Manage errors gracefully
6. Clean up temporary files

## Execution Process

### Phase 1: Parse & Validate

I analyze your workflow:
- Validate syntax correctness
- Check agent references
- Verify variable bindings
- Identify checkpoints
- Map execution graph

### Phase 2: Visualize

I show you the execution plan using ASCII art:

```
Execution Graph:
┌─────────────────┐
│ Explore         │
│ (Analyze code)  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ implement       │
│ (Add feature)   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ general-purpose │
│ (Run tests)     │
└─────────────────┘
```

### Phase 3: Execute

I run agents sequentially or in parallel:

**Sequential** (`->`):
```
Running: Explore...  [In Progress]
Result: ✓ Analysis complete
Running: implement...  [In Progress]
Result: ✓ Feature added
```

**Parallel** (`||`):
```
Running: task1...  [In Progress]
Running: task2...  [In Progress]
Running: task3...  [In Progress]
All complete! Merging results...
```

### Phase 4: Steering

At checkpoints (`@review`), you control flow:

```
@review-point reached

Options:
  [C]ontinue - Proceed with workflow
  [R]etry - Re-run previous step
  [M]odify - Adjust and continue
  [A]bort - Stop workflow

Your choice?
```

### Phase 5: Error Recovery

If agent fails, I offer options:

```
❌ Agent 'implement' failed: Tests not passing

Options:
  - Retry with same instruction
  - Modify instruction and retry
  - Skip this step (continue workflow)
  - Abort workflow

What would you like to do?
```

### Phase 6: Cleanup (MANDATORY)

**CRITICAL:** After EVERY workflow execution, you MUST clean up temporary files!

**Cleanup steps:**

1. **Delete temp-scripts** - Remove all Python, JavaScript, shell scripts created during workflow
   - Path: `${CLAUDE_PLUGIN_ROOT}/temp-scripts/`
   - Delete ALL files (*.py, *.js, *.sh)

2. **Delete temp-agents** - Remove temporary agent definitions (if not promoted)
   - Path: `${CLAUDE_PLUGIN_ROOT}/temp-agents/`
   - Delete all .md files

3. **Delete temporary JSON** - Remove workflow state files
   - Path: `${CLAUDE_PLUGIN_ROOT}/examples/`
   - Delete *.json files only (keep .flow files!)

4. **Report cleanup** - Tell user what was cleaned:
   ```
   🧹 Cleaned up 5 temporary files:
   - temp-scripts/fetch_reddit.py
   - temp-scripts/process_data.js
   - temp-agents/scanner.md
   - examples/workflow-state.json
   ```

5. **Verify cleanup** - Check that temp directories are empty

**NEVER skip cleanup!** This prevents disk clutter and keeps plugin workspace clean.

## Syntax Reference

See [syntax-reference.md](syntax-reference.md) for complete syntax documentation.

**Quick reference**:

| Syntax | Meaning | Example |
|--------|---------|---------|
| `->` | Sequential | `a -> b` |
| `||` | Parallel | `[a \|\| b]` |
| `~>` | Conditional | `(if passed)~> next` |
| `@` | Checkpoint | `@review` |
| `:var` | Output capture | `task:output` |
| `{var}` | Variable interpolation | `"Use {output}"` |
| `$agent` | Temp agent | `$scanner:"Scan"` |

## Agent Types

**Built-in Claude Code agents** (no prefix):
- `Explore` - Fast codebase exploration and search
- `Plan` - Planning and breaking down tasks
- `general-purpose` - Versatile agent for complex multi-step tasks

**Plugin agents** (orchestration: prefix):
- `orchestration:workflow-socratic-designer` - Workflow creation via Socratic method
- `orchestration:workflow-syntax-designer` - Custom syntax design

**External agents** (registered via /orchestration:init):
- Agents from `~/.claude/agents/` can be registered and used directly
- Example: `expert-code-implementer`, `code-optimizer` (if registered)

**Temp agents** ($name):
- Created during workflow execution
- Automatically cleaned up after workflow
- Can be promoted to permanent agents if useful

## Variable Passing

See [variables.md](variables.md) for advanced variable usage.

**Capture output**:
```flow
Explore:"Find routes":routes ->
analyze:"Check {routes}":findings
```

**Conditional on variables**:
```flow
test:"Run tests":results ->
(if results.passed)~> deploy ->
(if results.failed)~> debug
```

## Error Handling

Common error patterns:

**Retry on failure**:
```flow
@attempt ->
operation:"Try task" ->
(if failed)~> wait:"Wait 5s" -> @attempt ~>
(if passed)~> continue
```

**Fallback path**:
```flow
primary:"Try primary" ->
(if failed)~> backup:"Use backup" ~>
(if passed)~> process
```

**Stop on critical error**:
```flow
security-scan:"Scan" ->
(if critical-issues)~> @emergency-stop -> abort ~>
(if clean)~> deploy
```

## Checkpoints

See [checkpoints.md](checkpoints.md) for checkpoint details.

**Basic checkpoint**:
```flow
implement -> @review -> deploy
```

**Labeled checkpoint**:
```flow
@quality-gate:"Review code quality. Approve?"
```

**Conditional checkpoint**:
```flow
(if security-critical)~> @security-review
```

## Parallel Execution

See [parallel.md](parallel.md) for parallel execution patterns.

**Basic parallel**:
```flow
[task1 || task2 || task3] -> merge
```

**Parallel with individual variables**:
```flow
[
  task1:"First":result1 ||
  task2:"Second":result2 ||
  task3:"Third":result3
] ->
general-purpose:"Process {result1}, {result2}, {result3}"
```

**Conditional parallel**:
```flow
(if needs-full-scan)~> [security || performance || style] ~>
(if needs-quick-check)~> basic-lint
```

## Examples

See [examples/](examples/) for categorized workflow examples:

- [sequential.md](examples/sequential.md) - Sequential workflows
- [parallel.md](examples/parallel.md) - Parallel execution
- [conditional.md](examples/conditional.md) - Conditional logic
- [error-handling.md](examples/error-handling.md) - Error recovery
- [checkpoints.md](examples/checkpoints.md) - Manual gates

## Execution Modes

**Normal mode** (default):
- Full execution with all phases
- Interactive checkpoints
- Error recovery prompts

**Dry-run mode**:
- Parse and validate only
- Show execution plan
- No actual agent execution

**Auto mode**:
- Skip checkpoint prompts
- Automatic error retry (up to 3 times)
- Minimal user interaction

## Progress Tracking

During execution, I show:

```
Workflow: TDD Implementation
Progress: [████████░░] 80%

Phase 1: ✓ Requirements analyzed
Phase 2: ✓ Tests written
Phase 3: ✓ Tests verified failing
Phase 4: ⏸ Checkpoint: review-test-coverage
Phase 5: ⏳ In Progress: Implementing code...
Phase 6: ⏸ Pending
Phase 7: ⏸ Pending
```

## Workflow Metadata

Track execution metadata:

```
Workflow: debug-and-fix.flow
Started: 2025-01-08 14:32:10
Duration: 5m 23s
Agents used: 8
Checkpoints: 2
Status: ✓ Complete

Agents executed:
- Explore (×1)
- general-purpose (×5)
- expert-code-implementer (×2)

Resources:
- Files read: 12
- Files modified: 3
- Tests run: 1
```

## Tips for Successful Execution

1. **Start simple** - Test with small workflows first
2. **Use checkpoints** - Add review points for critical steps
3. **Capture outputs** - Use variables to pass data between agents
4. **Handle errors** - Add fallback paths for critical operations
5. **Monitor progress** - Watch execution visualization

## Common Issues

**Agent not found**:
- Check agent name spelling
- Verify temp agent exists in temp-agents/
- Ensure namespace prefix for plugin agents

**Variable not found**:
- Verify variable was captured with `:varname`
- Check variable name spelling in `{varname}`
- Ensure variable set before use

**Checkpoint skipped**:
- Checkpoints only work in normal mode
- Check checkpoint syntax: `@checkpoint-name`

**Parallel execution failed**:
- Ensure parallel tasks are independent
- Check bracket syntax: `[a || b]`
- Verify no shared state between parallel tasks

## Related Skills

- **creating-workflows**: Design and create workflows
- **managing-agents**: Create and manage custom agents
- **debugging-workflows**: Debug workflow issues
- **using-templates**: Execute workflow templates

## Commands

- `/orchestration:run` - Execute workflow from file or inline
- `/orchestration:template` - Execute saved template
- `/orchestration:explain` - Explain workflow execution plan

---

**Ready to execute? Provide your workflow syntax or template name!**
