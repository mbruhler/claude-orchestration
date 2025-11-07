# Orchestration Plugin for Claude Code

Multi-agent workflow orchestration system with visual feedback, parallel execution, and interactive steering.

## Overview

The Orchestration plugin enables you to define and execute complex multi-agent workflows using declarative syntax. Instead of manually coordinating multiple agents, you specify your workflow as sequences, parallel operations, or conditional logic, and the orchestrator handles execution, visualization, and error recovery.

## Features

- **Declarative Workflow Syntax**: Define workflows using intuitive operators (`->`, `||`, `~>`)
- **Visual Feedback**: ASCII art visualization with real-time status updates
- **Parallel Execution**: Run independent agents simultaneously for faster completion
- **Interactive Steering**: Pause, jump, repeat, or modify workflows mid-execution
- **Error Recovery**: Intelligent recovery options when agents fail
- **Template System**: Save and reuse common workflows with parameters
- **Conditional Logic**: Dynamic routing based on agent results
- **Retry Patterns**: Built-in support for retry loops and fallback strategies

## Installation

### From Local Repository

```bash
cd ~/.claude/plugins/repos
git clone [your-repo-url] orchestration
```

Then in Claude Code:
```
/plugin install orchestration@local
```

### From Marketplace

```
/plugin marketplace add [marketplace-url]
/plugin install orchestration@[marketplace-name]
```

## Quick Start

### Basic Sequential Workflow

```
/orchestrate explore:"find bugs" -> review -> implement
```

### Parallel Execution

```
/orchestrate [test || lint || security] -> deploy
```

### Conditional with Retry

```
/orchestrate @try -> fix -> test (if failed)~> @try
```

## Workflow Syntax

### Operators

- `->` Sequential flow (left executes before right)
- `||` Parallel execution (both execute simultaneously)
- `~>` Conditional flow (only if condition met)
- `@label` Checkpoint or label for jumps/loops
- `[...]` Subgraph (grouped operations)

### Agent Invocation

```
agent-name:"instruction text"
```

Supported agents:
- `explore:"instruction"` - Explore agent for investigation
- `general-purpose:"instruction"` - General purpose agent for implementation
- `code-reviewer:"instruction"` - Code review agent for quality checks

### Conditions

- `(if passed)` - Check for success
- `(if failed)` - Check for failure
- `(if no issues)` - Check output for problems
- `(if all success)` - All parallel branches succeeded
- `(if any success)` - At least one branch succeeded

## Examples

### TDD Workflow

```
/orchestrate @try -> write-test:"auth feature" -> run-test (if failed)~> implement:"auth" -> run-test (if failed)~> @try
```

### Quality Gate

```
/orchestrate build -> [test || lint || security] (all success)~> deploy
```

### Multi-Stage with Checkpoints

```
/orchestrate explore:"security issues" -> @review -> [fix || document] -> @approve -> deploy
```

## Templates

Save frequently used workflows as templates:

1. Create template: Use `/orchestrate` menu → (c) Create template
2. Store in: `~/.claude/workflows/template-name.flow`
3. Use template: `/orchestrate template-name`

### Template Format

```yaml
---
name: my-workflow
description: What this workflow does
params:
  target: Deployment target (default: production)
---

Workflow:
explore:"analyze {{target}}" -> fix -> deploy:"{{target}}"
```

## Commands

- `/orchestrate` - Interactive menu
- `/orchestrate help` - Quick reference
- `/orchestrate examples` - Example gallery
- `/orchestrate explain <topic>` - Detailed documentation
- `/orchestrate <syntax>` - Execute workflow
- `/orchestrate <template>` - Execute saved template

## Skills

The plugin includes the `using-orchestration` skill that helps Claude:
- Detect when orchestration would be beneficial
- Suggest appropriate workflow syntax
- Convert user requirements into workflows

Claude will proactively suggest using orchestration when you describe complex multi-agent tasks.

## Interactive Steering

During execution, you can:
- `(c)ontinue` - Resume execution
- `(j)ump` - Jump to specific node
- `(r)epeat` - Re-execute last node
- `(e)dit` - Modify workflow mid-execution
- `(v)iew-output` - Inspect agent results
- `(q)uit` - Abort workflow

## Error Recovery

When agents fail, choose from:
- `(r)etry` - Re-execute failed node
- `(e)dit` - Modify workflow
- `(s)kip` - Continue past failure
- `(d)ebug` - Insert debug step
- `(f)ork` - Try parallel approaches
- `(q)uit` - Abort

## Best Practices

1. **Start Simple**: Begin with linear workflows, add complexity incrementally
2. **Use Checkpoints**: Add `@label` before critical operations
3. **Name Clearly**: Use descriptive names for nodes and checkpoints
4. **Limit Parallel**: Keep parallel branches to 3-5 for clarity
5. **Plan for Failure**: Add retry logic for transient errors
6. **Template Common**: Save frequently used workflows as templates

## Limitations

- Workflows don't persist across Claude Code sessions
- Only built-in agents supported (explore, general-purpose, code-reviewer)
- Workflows with >50 nodes may have slower visualization
- Natural language conditions may be ambiguous in edge cases

## Documentation

For detailed documentation, use:
- `/orchestrate help` - Quick reference
- `/orchestrate explain <topic>` - Topic-specific docs
- `/orchestrate examples` - Example gallery

Available topics: syntax, agents, parallel, conditionals, loops, checkpoints, subgraphs, templates, custom, subworkflows, error-handling

## Contributing

To contribute improvements or report issues, please see the main repository.

## License

[Add your license here]

## Version History

- 1.0.0 - Initial release with core orchestration features
