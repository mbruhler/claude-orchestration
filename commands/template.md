---
description: Load and execute saved workflow templates
deprecated: true
---

# ⚠️ DEPRECATED: Orchestration Template Execution

**This command is deprecated.** Use the **using-templates** skill instead for better template discovery and customization.

## Migration Guide

**Instead of:** `/orchestration:template tdd-implementation`

**Just say:** "Use the TDD implementation template"

The `using-templates` skill will automatically activate.

---

## Legacy Usage (Still Works)

Load and execute a saved workflow template with parameter substitution.

## Arguments: {{ARGS}}

## Template Location

Templates are stored at: `~/.claude/plugins/repos/orchestration/examples/{{ARGS}}.flow`

## Template Format

```yaml
---
name: template-name
description: What this template does
params:
  param1: Description (default: value)
  param2: Another parameter (default: another value)
visualization: |
  ╔════════════════════════════════════════════════════════════════════════════╗
  ║  Workflow Name                                                             ║
  ╠════════════════════════════════════════════════════════════════════════════╣
  ║  [Static ASCII visualization of your workflow]                             ║
  ║  This will be displayed consistently every time                            ║
  ╚════════════════════════════════════════════════════════════════════════════╝
workflow: |
  step1:"{{param1}}" -> step2:"{{param2}}"
---
```

**Notes:**
- The `visualization` field is optional but recommended. If provided, this static ASCII art will be displayed instead of dynamically generating the visualization from the workflow syntax.
- The `workflow` field contains the raw workflow syntax (with `->`, `[]`, `||`, etc.). Keep it compact without comments.
- Both fields ensure consistent display and execution across all runs.

## Execution Flow

### 1. Check Template Exists

Read template file:
```javascript
Read(`~/.claude/plugins/repos/orchestration/examples/${templateName}.flow`)
```

If file doesn't exist:
- Display friendly error message
- List available templates from `~/.claude/plugins/repos/orchestration/examples/*.flow`
- Offer to:
  - Select another template
  - Create new workflow from scratch
  - Return to menu

### 2. Parse Template

Extract from template YAML frontmatter (between `---` delimiters):
- **name** - Template identifier
- **description** - What this template does
- **params** - Parameters with descriptions and defaults
- **visualization** - Optional static ASCII art (displayed consistently)
- **workflow** - Raw workflow syntax with operators (`->`, `[]`, `||`, etc.)

**Important:**
- Both `visualization` and `workflow` are read from the YAML frontmatter
- No dynamic generation occurs - the template is used exactly as written
- This ensures 100% consistent display and execution every time

### 3. Prompt for Parameters

If template has parameters, use AskUserQuestion to collect values:

For each parameter, show:
- Parameter name
- Description from template
- Default value

Example:
```javascript
AskUserQuestion({
  questions: [{
    question: "Enter value for 'feature' parameter",
    header: "Parameters",
    multiSelect: false,
    options: [
      {label: "Use default", description: `Default value: ${defaultValue}`},
      {label: "Custom value", description: "Enter a custom value"}
    ]
  }]
})
```

If user selects "Custom value", prompt for the actual value.

### 4. Substitute Parameters

Replace all `{{param}}` placeholders in the workflow with provided values.

Example:
- Template workflow: `implement:"{{feature}}" -> test:"{{feature}}"`
- Values: `{feature: "authentication"}`
- Result: `implement:"authentication" -> test:"authentication"`

### 5. Execute Workflow

Pass the substituted workflow syntax from the frontmatter to `/orchestration:run`.

The static visualization (if present) is also passed along to ensure consistent display.

This will trigger the parse → visualize → execute flow using the exact syntax stored in the template.

## After Execution

When workflow completes, ask if user wants to:
- Run template again with different parameters
- Save current workflow as new template
- Return to menu

## Error Handling

### Invalid Template Format
- Display clear error message explaining what's wrong
- Show example of correct format
- Offer to fix template or choose another

### Missing Parameters
- Detect any unsubstituted `{{...}}` in workflow
- Show which parameters are missing
- Re-prompt for those specific values

### Workflow Execution Errors
- Let `/orchestration:run` handle execution errors
- Its error recovery system will take over

## Implementation Notes

**Parameter Defaults:**
- Always show default values to user
- Allow empty input to use default
- Validate parameter values before substitution

**Template Discovery:**
- Use Glob to find all `*.flow` files in ~/.claude/plugins/repos/orchestration/examples/
- Parse frontmatter to get names and descriptions
- Reference examples/README.md for template documentation
- Cache for quick listing

**Parameter Types:**
- All parameters are strings
- No type validation needed at template level
- Let workflow execution validate usage

**Nested Placeholders:**
- Support `{{param}}` anywhere in workflow
- Including in agent instructions, conditions, etc.
- Multiple occurrences of same parameter are all replaced
