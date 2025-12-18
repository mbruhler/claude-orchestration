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

## Template Locations

Templates are searched in the following locations (in order of priority):

1. **Project root**: `./workflows/*.flow` - Project-specific templates
2. **Claude root**: `~/.claude/workflows/*.flow` - User's global templates
3. **Plugin examples**: `~/.claude/plugins/repos/orchestration/examples/*.flow` - Built-in examples

Project-local templates take precedence over global templates.

## Built-in Example Templates

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
# List project templates
ls ./workflows/*.flow 2>/dev/null

# List user's global templates
ls ~/.claude/workflows/*.flow 2>/dev/null

# List built-in examples
ls ~/.claude/plugins/repos/orchestration/examples/*.flow
```

### 2. View Template

```bash
# View from any location
cat ./workflows/my-template.flow
cat ~/.claude/workflows/my-template.flow
cat ~/.claude/plugins/repos/orchestration/examples/tdd-implementation.flow
```

### 3. Execute Template

Use `/orchestration:template` command (searches all locations automatically):

```
/orchestration:template tdd-implementation
```

Or reference directly with path:

```
Use ./workflows/my-workflow.flow
Use ~/.claude/workflows/my-workflow.flow
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

After customizing, save to your preferred location:

### Project-specific templates (recommended for project workflows)
```bash
mkdir -p ./workflows
cat > ./workflows/my-project-workflow.flow << 'EOF'
# My Project Workflow
# Description: Custom automation for this project
...
EOF
```

### User's global templates (shared across all projects)
```bash
mkdir -p ~/.claude/workflows
cat > ~/.claude/workflows/my-global-workflow.flow << 'EOF'
# My Global Workflow
# Description: Custom automation available everywhere
...
EOF
```

### Plugin examples (for contributing back)
```bash
cat > ~/.claude/plugins/repos/orchestration/examples/my-workflow.flow << 'EOF'
# My Example Workflow
# Description: Custom automation for X
...
EOF
```

**Guidelines:**
1. Use `.flow` extension
2. Add descriptive header
3. Include usage instructions
4. Project templates take precedence if same name exists globally

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
