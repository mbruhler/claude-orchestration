# Natural Language Workflow Creation

Create orchestration workflows from plain language descriptions using guided Socratic questioning.

## Overview

Instead of learning orchestration syntax, describe what you want to do in natural language. The system asks strategic questions to refine your intent, then generates precise workflow syntax.

## How It Works

1. **Describe your workflow** in plain language
2. **Answer questions** to refine requirements
3. **Review generated workflow** with explanations
4. **Save as template** for reuse
5. **Optionally promote** custom syntax to global library

## Entry Points

### 1. Command: `/orchestration:create`

**Basic usage:**
```
/orchestration:create
```
Starts with no context, asks what you want to build.

**With description:**
```
/orchestration:create deploy with security validation
/orchestration:create implement auth feature with TDD
/orchestration:create review and test code before merging
```
Starts with your description, refines through questions.

### 2. Menu: `/orchestrate`

Select "Create from description" from the menu.

### 3. Proactive Suggestion

Claude automatically suggests orchestration when you describe multi-step tasks:

**You:** "I need to run tests, then if they pass, do a security scan, and deploy if both succeed"

**Claude:** "This sounds like a perfect use case for orchestration! I can help you create a workflow that handles:
- Parallel test and security validation
- Quality gate (both must pass)
- Automatic deployment on success

Would you like me to guide you through creating this workflow?"

## Socratic Refinement Process

The system asks questions based on your initial description:

### For Vague Requests

**Example:** "help me deploy"

1. **Problem identification:** "What problem are you solving?"
   - Options: Consistency, Quality gates, Speed, Collaboration

2. **Scope clarification:** "Which parts matter?" (can select multiple)
   - Options: Tests, Security, Build, Documentation

3. **Constraints:** "What constraints apply?" (can select multiple)
   - Options: Must pass tests, Needs approval, Automated rollback

4. **Pattern:** "This sounds like a deployment pipeline. Does that fit?"

### For Specific Requests

**Example:** "implement auth with TDD"

1. **Pattern recognition:** Identifies TDD pattern automatically

2. **Customization:** "What should this workflow include?" (select multiple)
   - Options: Error retry, Logging, Code review, Documentation

3. **Validation:** "Here's the workflow. Does this match your intent?"

### For Medium-Specificity Requests

**Example:** "review and deploy code"

1. **Scope:** "What kind of review?" (select multiple)
   - Options: Security, Style, Performance, All

2. **Details:** "How should deployment work?"
   - Options: With tests, With approval, With rollback

3. **Connection:** "Should review block deployment?"

## Generated Workflow Features

### Variable Binding

Workflows use explicit variable binding for traceability:

```
[test || lint] (all success):validation-passed~>
  (if validation-passed)~> deploy ->
  (if !validation-passed)~> fix -> retry
```

**Benefits:**
- Clear where variables come from
- Explicit condition checking
- Easy to trace logic
- Self-documenting

### Negative Conditions

Support for `!` negation operator:

```
analyze (if security-critical):is-critical~>
  (if !is-critical)~> fast-deploy ->
  (if is-critical)~> careful-deploy
```

### Custom Syntax

When existing syntax doesn't fit, system creates custom elements:

**Custom checkpoint:**
```
@security-gate: checkpoint
description: Security approval checkpoint
prompt: Review security findings before proceeding
```

**Used in workflow:**
```
scan -> @security-gate -> deploy
```

## Template Creation

After generating workflow, system guides you through template creation:

1. **Name:** Suggests name based on pattern, allows customization
2. **Description:** Confirms or allows editing
3. **Parameters:** Extracts parameterizable values, confirms with you
4. **Save:** Writes to `examples/<name>.flow`
5. **Promote syntax:** Choose which custom syntax to promote to global library

### Template Format

```yaml
---
name: tdd-with-review
description: TDD workflow with security review
params:
  feature: Feature to implement (default: new-feature)
  scope: Code scope (default: src/)
---

Workflow:
@try -> write-test:"{{feature}} in {{scope}}" ->
run-test (if failed):tests-failing~>
  (if tests-failing)~> implement:"{{feature}}" -> run-test (if failed)~> @try ->
  (if !tests-failing)~> @security-review -> deploy

---

Definitions:

@security-review: checkpoint
description: Security review checkpoint
prompt: Review code for security vulnerabilities before deployment
```

## Global Syntax Library

Custom syntax can be promoted to global library for reuse across all workflows.

**Structure:**
```
library/syntax/
├── operators/       # Custom operators like =>
├── actions/         # Reusable workflow fragments like @deep-review
├── checkpoints/     # Custom checkpoints like @security-gate
├── loops/           # Retry patterns like retry-with-backoff
├── conditions/      # Custom conditions like (if security-critical)
├── aggregators/     # Result combining like merge-with-vote
├── guards/          # Pre-conditions like require-clean-working-tree
├── tools/           # Tool wrappers like tool:npm:test
└── mcps/            # MCP wrappers like mcp:supabase:execute_sql
```

**Managing global syntax:**

Use `/orchestrate` menu → "Manage syntax" to:
- List all global syntax
- Browse by type
- Search syntax
- View definitions

## Examples

### Example 1: Simple TDD Workflow

**Input:** `/orchestration:create implement feature with TDD`

**Questions:**
1. "What feature?" → "authentication"
2. "What should this include?" → [Error retry, Code review]

**Generated:**
```
@try -> write-test:"authentication" ->
run-test (if failed):tests-failing~>
  (if tests-failing)~> implement:"authentication" -> run-test (if failed)~> @try ->
  (if !tests-failing)~> code-review (if approved):review-passed~>
    (if review-passed)~> merge ->
    (if !review-passed)~> @review-feedback
```

### Example 2: Deployment Pipeline

**Input:** `/orchestration:create deploy with validation`

**Questions:**
1. "What validations?" → [Tests, Security, Linting]
2. "What if validation fails?" → Fix and retry
3. "What if deployment fails?" → Rollback

**Generated:**
```
require-clean-working-tree ->
build ->
[test || security || lint] (all success):validation-passed~>
(if !validation-passed)~> fix -> @retry ->
(if validation-passed)~> @pre-deploy -> deploy ->
smoke-test (if failed):deployment-failed~>
  (if deployment-failed)~> rollback -> notify-failure ->
  (if !deployment-failed)~> notify-success
```

### Example 3: Security Audit

**Input:** `/orchestration:create security audit workflow`

**Questions:**
1. "What scope?" → "authentication module"
2. "What checks?" → [Code review, Dependency scan]
3. "What if issues found?" → Manual review then fix

**Generated:**
```
explore:"analyze auth module security" ->
[code-reviewer:"security" || dependency-check] (any failed):has-issues~>
(if has-issues)~> @security-review -> fix-issues -> verify ->
(if !has-issues)~> document-findings
```

## Best Practices

1. **Start with description:** Provide context in initial command
2. **Be specific in answers:** More detail = better workflow
3. **Review before saving:** Check generated workflow makes sense
4. **Name clearly:** Use descriptive template names
5. **Promote reusable syntax:** Share useful custom syntax globally
6. **Iterate:** Run workflow, refine based on experience

## Tips

- **For complex workflows:** Start simple, add complexity incrementally
- **For reusable patterns:** Save as template with parameters
- **For custom syntax:** Only create when truly needed (reuse first)
- **For conditions:** Use variable binding for clarity
- **For error handling:** Plan for both success and failure paths

## Troubleshooting

**Problem:** Generated workflow doesn't match intent

**Solution:** Use "Modify" option when shown workflow, explain what's different

**Problem:** Too many questions

**Solution:** Provide more detail in initial description

**Problem:** Need specific custom syntax

**Solution:** Mention it in answers: "I need a security gate checkpoint"

**Problem:** Want to edit generated workflow

**Solution:** Save as template, then edit the .flow file manually

## See Also

- [Variable Binding Reference](../reference/variable-binding.md)
- [Custom Syntax Guide](../topics/custom-syntax.md)
- [Template System](./templates.md)
- [Examples Gallery](../reference/examples.md)
