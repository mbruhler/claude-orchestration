# Template System

Templates are reusable workflow definitions stored as `.flow` files in `~/.claude/workflows/`.

## Template File Format

```yaml
---
name: template-name
description: What this workflow does
params:
  param1: Description (default: default-value)
  param2: Description
---

Workflow:

[workflow syntax with {{param1}} and {{param2}} placeholders]

---

Definitions:

@custom-action: action
description: What this does
workflow: [definition workflow]

custom-operator: operator
description: Operator behavior
behavior: How it works
```

## Template Operations

### Load Template

1. List all `.flow` files in `~/.claude/workflows/`
2. Display with descriptions
3. Allow selection
4. Prompt for parameter values (show defaults)
5. Substitute parameters into workflow
6. Execute resulting workflow

### Create Template

1. Prompt for workflow syntax
2. Parse syntax
3. Identify potential parameters (strings in quotes)
4. Ask user to confirm which should be parameters
5. Prompt for template name and description
6. Write template to `~/.claude/workflows/[name].flow`
7. Confirm creation

### List Templates

Scan `~/.claude/workflows/` for `.flow` files and display:

```
Name              Description                    Params
─────────────────────────────────────────────────────────
security-audit    Check for vulnerabilities      scope
tdd-feature       Implement with TDD             feature
refactor-module   Refactor with review           module, style
```

### Remove Template

1. List templates
2. Prompt for selection
3. Confirm deletion
4. Delete file
5. Confirm removed

### Update Template

1. List templates
2. Prompt for selection
3. Read template file
4. Display current content
5. Allow editing
6. Validate syntax
7. Write back to file
8. Confirm updated

## Parameter Substitution

When loading template with parameters:

1. Parse `params:` from frontmatter
2. For each parameter:
   - Show description
   - Show default value if any
   - Prompt for value
   - Use default if empty
3. Replace all `{{paramName}}` in workflow with values
4. Validate substituted workflow syntax
5. Execute substituted workflow

**Edge Cases:**
- Missing parameter in workflow: Show warning but continue
- Parameter not in frontmatter but used in workflow: Prompt user for value
- Invalid parameter name (special chars): Show error, refuse to execute
- Circular parameter references: Detect and show error

**User Guidance:** When prompting for parameters, always show the context where they'll be used.

## Custom Definitions

Templates can define custom elements in the `Definitions:` section:

### Custom Actions

```yaml
@action-name: action
description: What this does
workflow: actual-workflow-syntax
```

**Example:**
```yaml
@deep-review: action
description: Multi-stage review
workflow: [code-reviewer:"security" || code-reviewer:"style"] -> merge
```

**Usage:**
```
explore -> @deep-review -> implement
```

**Expansion:**
```
explore -> [code-reviewer:"security" || code-reviewer:"style"] -> merge -> implement
```

### Custom Operators

```yaml
operator-symbol: operator
description: What this does
behavior: How it behaves
```

**Example:**
```yaml
=>: operator
description: Merge with conflict resolution
behavior: Execute left, then right, with deduplication
```

### Custom Checkpoints

```yaml
@checkpoint-name: checkpoint
description: What to check
prompt: Message shown at checkpoint
```

**Example:**
```yaml
@security-gate: checkpoint
description: Security approval required
prompt: Verify no security vulnerabilities before proceeding
```

### Custom Loops

```yaml
loop-name(params): loop
description: What this does
pattern: loop-syntax-with-{flow}-placeholder
```

**Example:**
```yaml
retry-with-backoff(N): loop
description: Retry N times with delay
pattern: @try -> {flow} (if failed)~> @try
```

## Definition Parsing

When loading template:

1. **Extract Definitions Section**
   - Parse between `---` delimiters after workflow
   - Split by definition type markers

2. **Parse Each Definition**
   - Extract name, type, and properties
   - Validate syntax
   - Build definition object

3. **Register Definitions**
   - Add to parser's symbol table
   - Make available during workflow parsing
   - Validate no conflicts with built-in syntax

4. **Apply During Execution**
   - Expand custom actions inline
   - Apply custom operator behavior
   - Honor custom checkpoint prompts
   - Substitute loop patterns

## Validation

Validate custom definitions:
- No conflicts with built-in syntax
- Action workflows are valid
- Operator symbols are not ambiguous
- Checkpoint prompts are provided
- Loop patterns include `{flow}` placeholder
- Circular definition references detected

## Example Templates

### TDD Feature Template

```yaml
---
name: tdd-feature
description: Test-driven development workflow
params:
  feature: Feature to implement
  scope: Code scope (default: src/)
---

Workflow:
@try -> write-test:"{{feature}} in {{scope}}" ->
run-test (if failed)~>
implement:"{{feature}} in {{scope}}" ->
run-test (if failed)~> @try
```

### Security Audit Template

```yaml
---
name: security-audit
description: Comprehensive security check
params:
  scope: Code to audit (default: all)
---

Workflow:
explore:"analyze security in {{scope}}" ->
[code-reviewer:"security" || dependency-check] ->
(any failed)~> @security-review ->
fix-issues ->
verify (if failed)~> @security-review

---

Definitions:
@security-review: checkpoint
description: Review security findings
prompt: Review identified security issues and approve fixes
```

### Deployment Pipeline Template

```yaml
---
name: deploy-safe
description: Safe deployment with validation
params:
  environment: Target environment (default: production)
  tests: Test level (default: all)
---

Workflow:
build ->
[unit-tests || integration-tests] (all success)~>
@pre-deploy ->
deploy:"{{environment}}" ->
smoke-test (if failed)~> rollback ->
@rollback-review

---

Definitions:
@pre-deploy: checkpoint
description: Pre-deployment verification
prompt: Verify build and tests before deploying to {{environment}}

@rollback-review: checkpoint
description: Review rollback
prompt: Deployment failed and was rolled back. Review errors before retry.
```

## Best Practices

**Template Design:**
- Provide clear parameter descriptions
- Set sensible defaults for all parameters
- Include usage examples in description
- Version your templates (in name or description)
- Keep custom definitions focused and simple

**Parameter Usage:**
- Use descriptive parameter names
- Document where parameters are used
- Validate parameter values when possible
- Provide defaults for optional parameters
- Use consistent naming (kebab-case or camelCase)

**Custom Definitions:**
- Keep definitions simple and focused
- Avoid overly complex nested workflows
- Document behavior clearly
- Test definitions before sharing
- Name to avoid conflicts with built-ins

**Organization:**
- Group related templates in subdirectories (if supported)
- Use consistent naming conventions
- Include README in workflows directory
- Version control your templates
- Share useful templates with team

## Template Discovery

To help users find templates, the system can:

1. List all available templates with descriptions
2. Search templates by keyword
3. Show template usage examples
4. Display template parameters and defaults
5. Preview template workflow before execution

## Subworkflows (Calling Templates)

Templates can call other templates:

```yaml
Workflow:
explore -> @call:security-audit -> fix -> @call:deploy-safe
```

**Syntax:**
```
@call:template-name
@call:template-name(param1="value", param2="value")
```

**Expansion:** The called template is expanded inline at execution time.

**Edge Cases:**
- Circular template calls: Detect and show error
- Missing template: Show available templates
- Parameter mismatch: Prompt for missing parameters
- Deep nesting (>3 levels): Show warning about complexity
