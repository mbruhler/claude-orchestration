# Custom Tools

Custom tools are wrappers for external command-line tools that can be invoked in workflows.

## Format

```markdown
---
name: tool:toolname:action
type: tool
description: What this tool does
command: command-line invocation
output: description of output
---

# Tool Name

Detailed explanation of the tool and its usage.

## Command
```bash
actual command-line invocation
```

## Output
Description of what the tool outputs:
- Output format
- Success/failure indicators
- Useful data returned

## Usage
previous-step -> tool:toolname:action (if passed):result~> next-step
```

## Naming Convention

Format: `tool:<tool>:<action>`

Examples:
- `tool:npm:test` - Run npm tests
- `tool:docker:build` - Build docker image
- `tool:git:status` - Check git status
- `tool:pytest:run` - Run pytest suite

Create tool wrappers when you need to:
- Invoke external commands in workflows
- Capture and use command output
- Make tools composable with workflow syntax

## Examples

See examples for npm, docker, and git tool wrappers.
