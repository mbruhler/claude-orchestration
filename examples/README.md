# Orchestration Workflow Templates

This directory contains static workflow templates that follow strict orchestration syntax for deterministic execution.

## Template Structure

All templates in this directory follow these principles:

1. **Static Execution**: Templates define a fixed execution graph with no dynamic behavior
2. **Real Agents Only**: Use actual agent names (Explore, general-purpose, expert-code-implementer, etc.)
3. **No Custom Actions**: No undefined actions like `find-jsx-strings` or `validate-structure`
4. **No Parameters**: Templates execute the same way every time without parameter substitution
5. **Clear Phases**: Each phase has a descriptive comment explaining its purpose

## Available Templates

### i18n-fix-hardcoded-strings.flow
Finds and replaces hardcoded strings in JSX/TSX files with i18n translation calls.
- Searches entire codebase for hardcoded user-facing text
- Generates semantic translation keys
- Updates all locale files
- Creates git commit with changes

### plugin-testing.flow
Comprehensive validation of Claude Code plugins.
- Validates plugin structure and configuration
- Security audit for vulnerabilities
- Functionality testing
- Documentation compliance check
- Generates improvement plan

### tdd-implementation.flow
Implements new features using Test-Driven Development methodology.
- Writes failing tests first (RED)
- Implements minimal code to pass tests (GREEN)
- Refactors for quality (REFACTOR)
- Maintains test coverage throughout

### debug-and-fix.flow
Systematic approach to debugging and fixing issues.
- Reproduces the problem
- Investigates root cause
- Writes regression test
- Implements targeted fix
- Verifies solution

## Syntax Guide

### Sequential Execution
```
agent1:"instruction":output1 -> agent2:"instruction":output2
```

### Parallel Execution
```
[
  agent1:"instruction":output1 ||
  agent2:"instruction":output2
] ->
```

### Checkpoints (User Interaction)
```
@checkpoint-name ->
```

### Comments
```
# This is a comment explaining the phase
```

## Agent Types

The following agents are available for use in templates:

- `Explore` - Fast codebase exploration and search
- `Plan` - Planning and breaking down complex tasks
- `general-purpose` - Versatile agent for complex multi-step tasks

**Note:** Additional agents may be available through plugins installed in your environment.

## Best Practices

1. **Descriptive Instructions**: Each agent instruction should be self-contained and clear
2. **Meaningful Output Names**: Use descriptive names like `:requirements_analyzed` not `:output1`
3. **Logical Phases**: Group related operations into clear phases with comments
4. **User Checkpoints**: Add `@checkpoint` at decision points for user review
5. **Error Handling**: Include validation steps after critical operations
6. **Parallel When Possible**: Use parallel execution `||` for independent operations
7. **Atomic Commits**: Include git operations at the end of workflows

## Running Templates

Templates are executed via the orchestration system:

```
/orchestration:template [template-name]
```

Example:
```
/orchestration:template i18n-fix-hardcoded-strings
/orchestration:template debug-and-fix
```

Templates can also be run directly:
```
/orchestration:run < [template-file]
```

## Creating New Templates

When creating new templates:

1. Start with a clear goal and break it into phases
2. Use only real agents that exist in the system
3. Write self-contained instructions for each agent
4. Add checkpoints for user review at key decision points
5. Include validation steps to ensure correctness
6. End with a summary or commit phase
7. Test the template thoroughly before committing

## Template Validation

Before using a template, validate it follows these rules:

- ✅ Uses only real agent names (Explore, Plan, general-purpose, or plugin agents)
- ✅ No parameter placeholders like `{{param}}`
- ✅ No custom/undefined actions
- ✅ Clear phase structure with comments
- ✅ Deterministic execution path
- ✅ Meaningful output variable names
- ✅ Appropriate checkpoints for user control

## Notes

- Templates are version-controlled and should be treated as code
- Changes to templates should be tested before committing
- Templates should be idempotent when possible
- Keep templates focused on a single workflow/goal
- Document any prerequisites or assumptions in comments