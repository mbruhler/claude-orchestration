---
name: debugging-workflows
description: Debug workflow execution issues including syntax errors, agent failures, variable problems, and execution errors. Use when workflows fail, produce unexpected results, or user asks for debugging help.
---

# Debugging Orchestration Workflows

I help diagnose and fix workflow execution issues using systematic debugging techniques.

## When I Activate

I activate when you:
- Experience workflow failures
- Get syntax errors
- Have agent execution issues
- Variables not working as expected
- Ask "why isn't this working?"

## Common Issues

### Syntax Errors

**Problem**: Workflow won't parse

**Symptoms**:
- "Unexpected token" errors
- "Invalid syntax" messages
- Workflow won't start

**Solutions**:
1. Check operator syntax: `->`, `||`, `~>` (not `=>` or `&&`)
2. Verify bracket matching: `[...]`
3. Check quote matching: `"instruction"`
4. Validate agent names (no typos)

### Agent Not Found

**Problem**: Agent reference doesn't resolve

**Symptoms**:
- "Agent 'X' not found"
- Execution stops at agent invocation

**Solutions**:
1. Check spelling of agent name
2. Verify temp agent file exists: `temp-agents/agent-name.md`
3. Check defined agent in registry: `agents/registry.json`
4. Ensure built-in agent name is correct

### Variable Issues

**Problem**: Variables not passing correctly

**Symptoms**:
- `{variable}` shows as literal text
- "Variable not found" errors
- Empty variable values

**Solutions**:
1. Verify capture syntax: `agent:"task":variable_name`
2. Check interpolation: `"Use {variable_name}"`
3. Ensure variable set before use
4. Check variable name spelling

### Parallel Execution Failures

**Problem**: Parallel tasks failing or hanging

**Symptoms**:
- Only some parallel tasks complete
- Workflow hangs at parallel section
- Inconsistent results

**Solutions**:
1. Ensure tasks are independent (no shared state)
2. Check syntax: `[task1 || task2 || task3]`
3. Verify each task can run standalone
4. Check for race conditions

### Checkpoint Issues

**Problem**: Checkpoints not triggering

**Symptoms**:
- Checkpoints skipped
- No user prompt shown
- Workflow continues without pause

**Solutions**:
1. Check checkpoint syntax: `@checkpoint-name`
2. Verify not in auto-mode
3. Ensure checkpoint is reachable in flow

## Debugging Process

### 1. Reproduce

Run workflow with minimal changes to reproduce issue.

### 2. Isolate

Simplify workflow to find problematic section:

```flow
# If this fails:
step1 -> step2 -> step3 -> step4

# Try:
step1 -> step2  # Works?
step3 -> step4  # Works?
```

### 3. Inspect

Check execution logs for error details.

### 4. Fix

Apply targeted fix based on findings.

### 5. Verify

Run full workflow to ensure fix works.

## Error Messages Guide

| Error | Meaning | Fix |
|-------|---------|-----|
| "Unexpected token" | Syntax error | Check syntax around error location |
| "Agent not found" | Missing agent | Verify agent exists and spelling |
| "Variable not found" | Variable undefined | Check variable was captured |
| "Condition failed" | Condition not met | Check condition logic |
| "Execution timeout" | Task took too long | Add timeout handling or simplify task |

## Best Practices

✅ **DO**:
- Start with simple workflow, add complexity gradually
- Test each section independently
- Use meaningful variable names
- Add error handling paths
- Capture outputs for debugging

❌ **DON'T**:
- Create overly complex workflows initially
- Skip testing individual steps
- Use cryptic variable names
- Ignore error messages
- Remove error handling

## Diagnostic Commands

```bash
# Check temp agents exist
ls temp-agents/

# Verify agent registry
cat agents/registry.json

# Check workflow syntax file
cat examples/workflow-name.flow
```

## Related Skills

- **creating-workflows**: Create well-structured workflows
- **executing-workflows**: Execute with better error visibility
- **managing-agents**: Debug agent-related issues

---

**Workflow not working? Show me the error and I'll help debug!**
