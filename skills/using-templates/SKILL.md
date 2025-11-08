---
name: using-templates
description: Use and customize workflow templates for common scenarios. Use when user wants to use a template, asks about available templates, or wants to customize existing workflows.
---

# Using Workflow Templates

I help you use and customize workflow templates for common automation scenarios.

## When I Activate

I activate when you:
- Ask about available templates
- Want to use a workflow template
- Need to customize a template
- Ask "what templates exist?"
- Say "use the X template"

## Available Templates

Located in `examples/` directory:

- **tdd-implementation.flow** - Test-Driven Development
- **debug-and-fix.flow** - Bug investigation and fixing
- **polish-news-aggregation.flow** - News data aggregation
- **plugin-testing.flow** - Plugin testing workflow
- **i18n-fix-hardcoded-strings.flow** - Internationalization
- **ui-component-refinement.flow** - UI component improvement
- **agent-system-demo.flow** - Agent system demonstration

## Using Templates

### 1. List Templates

```bash
ls examples/*.flow
```

### 2. View Template

```bash
cat examples/tdd-implementation.flow
```

### 3. Execute Template

Use `/orchestration:template` command:

```
/orchestration:template tdd-implementation
```

Or reference directly:

```
Use examples/tdd-implementation.flow
```

## Customizing Templates

### Parameter Substitution

Some templates have parameters:

```flow
# Template with parameter
$scanner := {base: "Explore", prompt: "{{SCAN_TYPE}}", model: "sonnet"}
```

**Customize**:
```flow
# Your version
$scanner := {base: "Explore", prompt: "Security expert", model: "sonnet"}
```

### Modify Steps

Add or remove workflow steps:

```flow
# Original
step1 -> step2 -> step3

# Your version (added error handling)
step1 -> step2 ->
(if failed)~> handle-error ~>
(if passed)~> step3
```

### Add Checkpoints

Insert review points:

```flow
# Original
analyze -> implement -> deploy

# Your version
analyze -> implement -> @review-implementation -> deploy
```

## Template Structure

Templates typically have:

```flow
# Header with description
# Template: TDD Implementation
# Description: Implement features using Test-Driven Development
# Parameters: None

# Phase 1: RED
step1 -> step2

# Phase 2: GREEN
step3 -> step4

# Phase 3: REFACTOR
step5 -> step6
```

## Saving Custom Templates

After customizing:

1. Save to examples/ directory
2. Use `.flow` extension
3. Add descriptive header
4. Include usage instructions

```bash
# Save your custom template
cat > examples/my-custom-workflow.flow << 'EOF'
# My Custom Workflow
# Description: Custom automation for X
...
EOF
```

## Template Categories

### Development Workflows

- TDD implementation
- Bug fixing
- Refactoring
- Code review

### Testing Workflows

- Test automation
- Integration testing
- Security scanning
- Performance testing

### Deployment Workflows

- CI/CD pipelines
- Staged deployment
- Rollback procedures

### Data Workflows

- Data aggregation
- Data validation
- Data transformation
- Report generation

## Best Practices

✅ **DO**:
- Start with existing template
- Customize incrementally
- Test modifications
- Save successful customizations

❌ **DON'T**:
- Modify original templates (copy first)
- Skip testing customizations
- Over-complicate simple templates

## Template Parameters

Common parameters in templates:

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `{{TARGET}}` | Target file/directory | `src/components` |
| `{{SCAN_TYPE}}` | Type of scan | `security`, `performance` |
| `{{ENV}}` | Environment | `staging`, `production` |
| `{{BRANCH}}` | Git branch | `main`, `develop` |

## Related Skills

- **creating-workflows**: Create new templates
- **executing-workflows**: Execute templates
- **managing-agents**: Use agents in templates

---

**Want to use a template? Ask me to show available templates or execute one!**
