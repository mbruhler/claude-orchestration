# Socratic Questioning Method

This document describes how I use strategic questioning to understand your workflow needs.

## Philosophy

Rather than making assumptions, I ask targeted questions to:
- Understand your true intent
- Identify the right pattern
- Uncover edge cases
- Ensure the workflow fits your needs

## Question Strategy by Request Type

### Vague Requests

**Example**: "I need a workflow for my project"

**Strategy**: Problem → Scope → Constraints → Pattern

1. **Problem identification**
   - "What problem are you solving?"
   - Options: Consistency, Quality gates, Speed, Collaboration

2. **Scope clarification**
   - "What's the scope of this workflow?"
   - Options: Single feature, Multiple features, Entire project, Specific task

3. **Constraint exploration**
   - "Any constraints or requirements?"
   - Options: Must be fast, Must have approval, Must handle errors, Must be reversible

4. **Pattern suggestion**
   - Based on answers, suggest pattern
   - Confirm fit or adjust

### Specific Requests

**Example**: "Create a workflow that scans for security issues, reviews them, and fixes critical ones"

**Strategy**: Pattern confirmation → Customization → Validation

1. **Pattern confirmation**
   - "This sounds like: scan → review → fix. Does that fit?"
   - Options: Yes, Similar but different, No

2. **Customization questions**
   - "Should review be automatic or manual?"
   - "What counts as critical?"
   - "Should fixes be auto-applied or require approval?"

3. **Validation**
   - Show proposed workflow
   - Ask for confirmation or adjustments

### Medium Specificity Requests

**Example**: "I want to automate testing and deployment"

**Strategy**: Scope → Details → Connection

1. **Scope clarification**
   - "What should be tested?"
   - Options: Unit tests only, Integration tests, All tests, Specific test suites

2. **Detail exploration**
   - "What happens if tests fail?"
   - "Should deployment require approval?"
   - "Any pre-deployment checks?"

3. **Connection questions**
   - "How are testing and deployment connected?"
   - "Sequential or conditional?"

## Question Patterns

### Problem Type Questions (Single-select)

Used to understand the core problem.

```
Question: "What problem are you solving?"
Options:
- Consistency: Ensure consistent process execution
- Quality gates: Add validation checkpoints
- Speed: Parallelize independent tasks
- Collaboration: Add review/approval steps
```

### Feature Selection (Multi-select)

Used to gather feature requirements.

```
Question: "What features should this workflow have?"
Options:
- Retry logic: Retry failed operations
- Checkpoints: Manual approval points
- Parallel execution: Run tasks simultaneously
- Error rollback: Rollback on failure
```

### Pattern Confirmation (Single-select)

Used to validate identified pattern.

```
Question: "This sounds like [pattern name]. Does that fit?"
Options:
- Yes: Use this pattern as-is
- Similar but different: Customize it
- No: Different pattern needed
```

### Customization Questions (Varies)

Used to refine details.

```
Question: "How should errors be handled?"
Options:
- Stop immediately: Fail fast
- Continue with warnings: Best effort
- Retry N times: Resilient
- Ask user: Manual decision
```

## Workflow Requirements Building

As I ask questions, I build a WorkflowRequirements object:

```javascript
{
  intent: "User's goal in plain language",
  pattern: "sequential|parallel|conditional|hybrid",
  agents: ["agent1", "agent2", "agent3"],
  structure: "Detailed structure description",
  errorHandling: ["retry", "rollback", "continue"],
  checkpoints: ["@review-point", "@approval-gate"],
  conditions: ["if passed", "if critical"],
  guards: ["require-clean-working-tree"],
  tools: ["npm:test", "npm:build"],
  mcps: ["supabase:execute_sql"],
  customSyntaxNeeded: ["@custom-checkpoint"]
}
```

## Decision Tree

```
User Request
    ↓
Is it vague?
    ├─ Yes → Ask problem question
    │         ↓
    │       Ask scope question
    │         ↓
    │       Ask constraints question
    │         ↓
    │       Suggest pattern
    │
    └─ No → Is it specific?
            ├─ Yes → Identify pattern
            │         ↓
            │       Confirm pattern
            │         ↓
            │       Ask customization questions
            │
            └─ Medium → Ask scope question
                        ↓
                      Ask detail questions
                        ↓
                      Ask connection questions
                        ↓
                      Build workflow
```

## Question Limits

- Ask minimum questions necessary
- Group related questions together
- Maximum 4 options per question
- Maximum 4 questions at a time
- Use multi-select when appropriate

## Examples

### Example 1: Vague Request

**User**: "I need automation"

**Question 1** (Problem):
```
"What problem are you solving?"
- Consistency (Ensure repeatable process)
- Quality (Add validation steps)
- Speed (Parallelize work)
- Collaboration (Add reviews)
```

**User selects**: Quality

**Question 2** (Scope):
```
"What needs quality checks?"
- Code changes (Review/test code)
- Security (Scan for vulnerabilities)
- Documentation (Verify docs)
- Dependencies (Check for issues)
```

**User selects**: Code changes

**Question 3** (Features):
```
"What quality checks do you want?"
[Multi-select]
- Linting (Code style)
- Testing (Run test suite)
- Type checking (Verify types)
- Code review (Manual review)
```

**User selects**: Testing, Code review

**Result**: Generate workflow:
```flow
implement:"Make changes" ->
general-purpose:"Run tests":results ->
@code-review:"Review changes and {results}" ->
(if approved)~> commit:"Commit and push"
```

### Example 2: Specific Request

**User**: "Create workflow that explores codebase, implements feature, tests it, and creates PR"

**Question 1** (Confirmation):
```
"This sounds like: explore → implement → test → PR. Does that fit?"
- Yes (Use this flow)
- Similar but different (Customize)
- No (Different pattern)
```

**User selects**: Yes

**Question 2** (Customization):
```
"Any additional requirements?"
[Multi-select]
- Code review before PR
- Run linter
- Update documentation
- None
```

**User selects**: Code review before PR

**Result**: Generate workflow:
```flow
Explore:"Analyze codebase structure":context ->
implementation-architect:"Plan implementation using {context}":plan ->
expert-code-implementer:"Implement {plan}":code ->
general-purpose:"Run tests":test_results ->
code-reviewer:"Review {code} and {test_results}":review ->
(if review.approved)~> general-purpose:"Create PR with summary"
```

### Example 3: Medium Request

**User**: "I want to automate deployment with checks"

**Question 1** (Scope):
```
"What checks before deployment?"
[Multi-select]
- Tests pass
- Build succeeds
- Security scan clean
- Manual approval
```

**User selects**: Tests pass, Security scan clean, Manual approval

**Question 2** (Details):
```
"Should checks run in parallel or sequential?"
- Parallel (Faster, all at once)
- Sequential (Ordered, one by one)
```

**User selects**: Parallel

**Result**: Generate workflow:
```flow
[general-purpose:"Run test suite":tests || $security-scanner:"Scan for vulnerabilities":scan] ->
general-purpose:"Consolidate {tests} and {scan}":report ->
@deployment-approval:"Review {report}. Approve deployment?" ->
(if approved)~> general-purpose:"Deploy to production":deployment
```

## Tips for Effective Questioning

1. **Start broad, then narrow**: General questions first, specific details later
2. **Group related questions**: Ask about related features together
3. **Confirm understanding**: Repeat back what you heard
4. **Offer alternatives**: Present options, don't assume
5. **Progressive refinement**: Start with basic workflow, add complexity

## When to Stop Asking

Stop asking questions when:
- You have enough info to generate a complete workflow
- User explicitly asks you to proceed
- You've asked 3-4 rounds of questions
- Pattern is clear and confirmed

Remember: Better to ask one more clarifying question than generate wrong workflow.
