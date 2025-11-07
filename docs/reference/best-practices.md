# Best Practices and Guidelines

## Workflow Design

### Start Simple
- Begin with linear workflows
- Add complexity incrementally
- Test each phase before adding more
- Verify basic syntax before adding advanced features

### Use Checkpoints
- Add `@checkpoints` before critical operations
- Place checkpoints after complex parallel sections
- Use checkpoints for human review points
- Name checkpoints descriptively

### Descriptive Naming
- Use clear, specific names for nodes
- Make checkpoint names action-oriented
- Include context in agent instructions
- Avoid generic names like "step1", "check2"

### Parallel Execution
- Keep parallel branches to 3-5 for clarity
- Only parallelize truly independent operations
- Always add explicit merge points
- Consider timeout for long-running parallel ops

### Error Handling
- Plan for failures in critical paths
- Use retry loops for transient errors
- Provide clear error messages
- Document recovery strategies
- Add fallback approaches where appropriate

## Template Design

### Parameters
- Provide clear descriptions for all parameters
- Set sensible defaults where possible
- Document parameter usage context
- Validate parameter values when needed

### Reusability
- Create templates for repeated workflows
- Keep templates focused on single purpose
- Version templates (in name or description)
- Document template usage examples

### Custom Definitions
- Keep definitions simple and focused
- Avoid overly complex nested workflows
- Document custom behavior clearly
- Test definitions before sharing

## Performance

### Parallel Optimization
- Launch parallel agents in single response
- Use multiple Task calls simultaneously
- Don't wait sequentially for parallel operations
- Monitor execution time for optimization

### Visualization
- Keep workflows under 80 chars width
- Limit workflows to ~50 nodes for clarity
- Split large workflows into templates
- Use subgraphs to group related operations

### Resource Management
- Set appropriate timeouts for agents
- Monitor memory usage for large workflows
- Clean up temporary files/state
- Consider rate limits for API-based agents

## Syntax Best Practices

### Readability
✓ Use descriptive instructions
✓ Add whitespace for clarity
✓ Group related operations
✓ Comment complex patterns (in templates)

✗ Avoid vague instructions
✗ Don't create deeply nested structures
✗ Avoid long sequential chains without checkpoints

### Structure
✓ Break complex workflows into templates
✓ Use subgraphs for logical grouping
✓ Add merge points after parallel branches
✓ Use consistent formatting

✗ Don't create "spaghetti" workflows
✗ Avoid circular dependencies
✗ Don't mix unrelated operations in parallel

## Error Patterns

### Retry Patterns
```
@try -> action (if failed)~> @try
```

**Best for:** Transient failures (network, timeout)
**Add:** Max retry limit to prevent infinite loops

### Fallback Patterns
```
primary (if failed)~> secondary (if failed)~> tertiary
```

**Best for:** Multiple approaches available
**Add:** Logging of which path was taken

### Graceful Degradation
```
full-feature (if failed)~> reduced-feature (if failed)~> minimal
```

**Best for:** Non-critical features
**Add:** User notification of degraded mode

## Testing Workflows

### Incremental Testing
1. Test simple linear flow first
2. Add one complexity at a time
3. Verify each addition works
4. Build up to full workflow

### Common Test Cases
- **Happy path** - All operations succeed
- **Single failure** - One operation fails
- **Multiple failures** - Multiple operations fail
- **Timeout** - Long-running operation
- **Invalid input** - Bad parameters
- **Edge cases** - Boundary conditions

### Validation Checklist
- [ ] All agents exist and are spelled correctly
- [ ] All subgraphs are closed
- [ ] All quotes are balanced
- [ ] All conditionals have proper format
- [ ] No orphaned nodes
- [ ] No circular dependencies (or proper exits)
- [ ] Merge points after parallel branches
- [ ] Checkpoints before critical operations

## Documentation

### Workflow Documentation
- Add comments in template descriptions
- Document expected inputs/outputs
- Describe failure modes and recovery
- Include usage examples
- Specify prerequisites

### Template Documentation
- Describe what the template does
- List all parameters with defaults
- Provide usage examples
- Document custom definitions
- Note any limitations

## Limitations to Consider

### Current Constraints
- Workflows don't persist across sessions
- Only built-in agents supported
- Parallel execution limited by Task tool
- Very large workflows (>100 nodes) may be slow
- Natural language conditions may be ambiguous

### Design Around Limitations
- Save workflows as templates for reuse
- Use built-in agents creatively
- Split large workflows into smaller templates
- Use explicit conditions when possible
- Add checkpoints for manual intervention

## Common Pitfalls

### Pitfall 1: Parallelizing Dependent Operations
✗ **Wrong:**
```
fetch-data || process-data || save-data
```

✓ **Right:**
```
fetch-data -> process-data -> save-data
```

### Pitfall 2: Missing Merge After Parallel
✗ **Wrong:**
```
[a || b] -> c
```

✓ **Right:**
```
[a || b] -> merge -> c
```

### Pitfall 3: Vague Agent Instructions
✗ **Wrong:**
```
explore:"check code"
```

✓ **Right:**
```
explore:"find authentication bugs in src/auth/ module"
```

### Pitfall 4: No Error Handling
✗ **Wrong:**
```
build -> test -> deploy
```

✓ **Right:**
```
build -> test (if passed)~> deploy (if failed)~> @review-failure
```

### Pitfall 5: Deeply Nested Structures
✗ **Wrong:**
```
[[[a || b] -> [c || d]] || [[e -> f] || [g -> h]]]
```

✓ **Right:**
```
@call:phase1 -> @call:phase2
(Define phase1 and phase2 as separate templates)
```

## Workflow Patterns Library

### Investigation Pattern
```
explore:"analyze problem" ->
explore:"identify root cause" ->
@review-findings ->
plan-solution
```

### TDD Pattern
```
@try ->
write-test:"feature" ->
run-test (if failed)~>
implement:"feature" ->
run-test (if failed)~> @try
```

### Quality Gate Pattern
```
build ->
[test || lint || security || docs] (all success)~>
@approve ->
deploy
```

### Deployment Pattern
```
prepare ->
@pre-deploy ->
deploy ->
smoke-test (if failed)~> rollback -> @failure-review
```

### Refactor Pattern
```
@plan ->
implement-refactor ->
[test || type-check || lint] (all success)~>
code-reviewer:"verify refactor" ->
@approve ->
commit
```

## Troubleshooting

### Workflow Not Executing
1. Check syntax for errors
2. Verify all agents spelled correctly
3. Ensure quotes are balanced
4. Check for orphaned nodes

### Visualization Unreadable
1. Reduce parallel branches
2. Use shorter node names
3. Split into templates
4. Remove unnecessary checkpoints

### Performance Issues
1. Reduce sequential chain length
2. Optimize agent instructions
3. Split large workflows
4. Check for timeout settings

### Conditional Not Working
1. Use (v) View to check output
2. Make condition more explicit
3. Add checkpoint before conditional
4. Test with simple conditions first

## Workflow Lifecycle

### Development
1. Draft workflow on paper/diagram
2. Implement simple version
3. Test incrementally
4. Add error handling
5. Add checkpoints
6. Optimize for performance

### Deployment
1. Save as template
2. Document parameters
3. Test with various inputs
4. Version control template
5. Share with team

### Maintenance
1. Monitor for failures
2. Update based on feedback
3. Refactor for clarity
4. Version updates
5. Archive obsolete workflows

## Team Collaboration

### Sharing Workflows
- Use git for template version control
- Create marketplace for team templates
- Document template usage in README
- Include examples in templates
- Establish naming conventions

### Standards
- Agree on naming conventions
- Define standard parameters
- Create common custom definitions
- Document team patterns
- Review templates before sharing

### Knowledge Transfer
- Create example gallery
- Document common patterns
- Hold workflow design sessions
- Share lessons learned
- Build pattern library

## Summary Checklist

Before executing workflow:
- [ ] Syntax is valid
- [ ] All agents exist
- [ ] Subgraphs are closed
- [ ] Conditionals have proper format
- [ ] No circular dependencies
- [ ] Error handling in place
- [ ] Checkpoints at critical points
- [ ] Tested incrementally

Before saving as template:
- [ ] Parameterized appropriately
- [ ] Documented clearly
- [ ] Tested with various inputs
- [ ] Custom definitions validated
- [ ] Examples included
- [ ] Version indicated
- [ ] Ready for team use
