# Error Handling and Recovery

Comprehensive error handling with intelligent recovery strategies.

## Error Types

1. **Syntax Error** - Invalid workflow syntax
2. **Agent Error** - Agent execution failure
3. **Condition Error** - Conditional evaluation failure
4. **Validation Error** - Graph validation failure
5. **Template Error** - Template loading/parsing failure

## Error Display Format

```
╔════════════════════════════════════════════╗
║  ERROR: [Error Type]                       ║
╠════════════════════════════════════════════╣
║                                            ║
║  Node: [failed-node] ✗                     ║
║                                            ║
║  Error: [error message]                    ║
║                                            ║
║  Context: [relevant context]               ║
║                                            ║
╠════════════════════════════════════════════╣
║  Suggested Actions:                        ║
║                                            ║
║  (r) Retry - Re-execute failed node        ║
║  (e) Edit - Modify workflow syntax         ║
║  (s) Skip - Continue past this node        ║
║  (d) Debug - Insert debug step before      ║
║  (f) Fork - Create parallel fix branches   ║
║  (q) Quit - Abort workflow                 ║
║                                            ║
╠════════════════════════════════════════════╣
║  Details: [additional error information]   ║
╚════════════════════════════════════════════╝
```

## Recovery Actions

### (r) Retry
- Re-execute failed node with same parameters
- Update graph with new result
- Continue or fail again
- **Use when:** Transient errors (network, timeout)

### (e) Edit Workflow
- Show current workflow syntax
- Highlight failed node
- Allow editing
- Re-parse and update graph
- Resume execution
- **Use when:** Workflow has bugs or needs adjustment

### (s) Skip
- Mark node as skipped `⊗`
- Continue with rest of workflow
- **Warning:** May cause issues if later nodes depend on skipped output
- **Use when:** Optional step, non-critical failure

### (d) Debug
- Insert new debug node before failed node
- Pause for investigation
- Allow inspection of state
- Continue after debugging
- **Use when:** Need to investigate why failure occurred

### (f) Fork Branches
- Create parallel branches to try different approaches
- Execute all branches
- Choose best result
- **Use when:** Multiple fix strategies possible, uncertain which will work

### (q) Quit
- Abort workflow
- Show summary of completed vs failed steps
- Preserve state for potential resume
- **Use when:** Unrecoverable error or need to stop

## Context-Aware Suggestions

Prioritize suggestions based on error type:

### Agent Timeout
**Priority:**
1. Retry (network might recover)
2. Fork (try with simpler sub-tasks)
3. Skip (if non-critical)

**Guidance:** "Agent timed out. Retry may succeed if issue was transient. Consider forking to break task into smaller pieces."

### Condition Evaluation Failed
**Priority:**
1. View output (check what was produced)
2. Edit (modify condition)
3. Skip (bypass conditional)

**Guidance:** "Could not evaluate condition. View output to check manually, or edit condition to be more explicit."

### Syntax Error
**Priority:**
1. Edit (fix syntax)
2. Show help (syntax reference)
3. Quit (start over)

**Guidance:** "Syntax error detected. Edit workflow to fix, or use '/orchestrate help' for syntax reference."

### Validation Error
**Priority:**
1. View graph (see structure)
2. Edit (fix structure)
3. Quit (start over)

**Guidance:** "Graph validation failed. View structure to identify issue, then edit to fix."

### Template Not Found
**Priority:**
1. List templates (find correct name)
2. Fix name (edit workflow)
3. Create template (if it should exist)

**Guidance:** "Template not found. Use '(t)' to list available templates and verify name."

## Error Recovery State

Maintain during recovery:
- Error history (all errors encountered)
- Recovery attempts (what's been tried)
- Modified workflows (edits made)
- User decisions (choices made)

Allow resume from error point after recovery.

## Error Messages

Provide clear, actionable error messages:

### Unclosed Subgraph
```
Syntax error: Unclosed subgraph bracket at position 42.
Expected ']' before end of workflow.

Found: [step1 -> step2 -> step3
Missing: ]
```

### Unknown Agent
```
Unknown agent 'custom-agent'. Valid agents:
  - explore
  - general-purpose
  - code-reviewer

Did you mean 'explore'?
```

### Orphaned Node
```
Validation error: Node 'verify' is not connected to the workflow.
All nodes must be reachable from the start.

Suggestion: Connect 'verify' to another node using '->' operator.
```

### Missing Merge
```
Warning: Parallel branches [test || lint] should reconverge at a merge point.

Consider: [test || lint] -> merge -> next-step
```

### Circular Dependency
```
Validation error: Circular dependency detected:
  step1 -> step2 -> step3 -> step1

Workflows cannot have cycles without exit conditions.
Use conditional flow to create loops:
  @try -> step (if failed)~> @try
```

### Invalid Condition
```
Syntax error: Condition must be in format '(if condition)~>'.
Found: 'step1 (if) step2'
Expected: 'step1 (if passed)~> step2'
```

## Error Handling Patterns

### Retry with Limit

```
@try ->
attempt-count = 0 ->
action ->
(if failed && attempt-count < 3)~> increment-count -> @try
```

### Fallback Strategy

```
primary-method (if failed)~>
secondary-method (if failed)~>
tertiary-method (if failed)~>
@manual-intervention
```

### Graceful Degradation

```
full-test-suite (if failed)~>
quick-tests (if failed)~>
smoke-tests (if failed)~>
@skip-tests-with-warning
```

### Error with Manual Review

```
risky-operation (if failed)~>
@review-error ->
diagnose ->
apply-fix ->
verify (if failed)~> @review-error
```

### Parallel with Partial Failure

```
[op1 || op2 || op3] ->
(any success)~> collect-results ->
continue
```

## Best Practices

### Planning for Errors

1. **Identify critical paths** - Where failures are unacceptable
2. **Add checkpoints** - Before and after risky operations
3. **Provide fallbacks** - Alternative approaches when primary fails
4. **Use conditionals** - Route based on success/failure
5. **Log errors** - Capture context for debugging

### During Execution

1. **Read error messages carefully** - They provide specific guidance
2. **Try suggested actions first** - Context-aware suggestions are prioritized
3. **Use debug mode** - When cause is unclear
4. **Document patterns** - Save successful recovery strategies as templates
5. **Don't skip critical steps** - Unless absolutely necessary

### Recovery Strategies

**For transient errors:**
- Use (r) Retry
- Consider adding retry loop to workflow
- Check for network/resource issues

**For workflow bugs:**
- Use (e) Edit to fix syntax
- Test fixed workflow incrementally
- Save working version as template

**For uncertain fixes:**
- Use (f) Fork to try multiple approaches
- Review results from all branches
- Update workflow with working solution

**For investigation:**
- Use (d) Debug to add logging/inspection
- Use (v) View to check outputs
- Use @checkpoints to pause and examine state

## Troubleshooting Guide

### "Agent not executing"

**Check:**
1. Agent name is valid (explore, general-purpose, code-reviewer)
2. Instruction is in quotes: `agent:"instruction"`
3. No syntax errors before this step
4. Previous steps completed successfully

**Recovery:** Edit workflow to fix agent name or instruction

### "Condition always evaluates wrong"

**Check:**
1. Previous step actually produced output
2. Output contains expected indicators
3. Condition syntax is correct

**Recovery:** Use (v) View output, then (e) Edit condition

### "Workflow hangs at merge point"

**Check:**
1. All parallel branches completed
2. No branches failed without handling
3. Merge point properly defined

**Recovery:** Use (d) Debug to inspect branch states

### "Cannot continue after checkpoint"

**Check:**
1. Steering menu shows options
2. Command input is correct: (c), (j), (r), (e), (v), or (q)

**Recovery:** Enter command or use (q) to quit and restart

### "Template not found"

**Check:**
1. File exists in `~/.claude/workflows/[name].flow`
2. Filename matches template name in frontmatter
3. YAML frontmatter is valid

**Recovery:** Use (t) List templates to find correct name

## Advanced Error Handling

### Custom Error Handlers

Define in templates:

```yaml
---
error-handlers:
  agent-timeout: retry-with-backoff
  condition-failed: manual-review
---
```

### Error Context Preservation

Save on error:
- Workflow state at time of failure
- All node outputs up to failure
- User inputs and decisions
- Timing and performance data

### Error Reporting

Generate error reports:
```
Error Report
────────────
Workflow: security-audit
Node: code-reviewer:"security"
Error: Agent timeout after 5m
Attempts: 3
Context: Large codebase (10k+ files)
Suggestion: Fork into smaller audit tasks
```

Save reports for analysis and pattern identification.
