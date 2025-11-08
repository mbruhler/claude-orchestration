---
description: Display examples gallery for orchestration workflows
deprecated: true
---

# ⚠️ DEPRECATED: Orchestration Examples Gallery

**This command is deprecated.** Examples are now integrated into skills with detailed explanations.

## Migration Guide

See examples in skills:
- **creating-workflows/examples.md** - Complete workflow examples
- **creating-workflows/patterns.md** - Common patterns

Or browse `examples/` directory for `.flow` files.

---

## Legacy Usage (Still Works)

Display the examples gallery for the Workflow Orchestration System.

## Arguments: {{ARGS}}

## Load and Display Examples

**Primary Source:** `~/.claude/plugins/repos/orchestration/docs/reference/examples.md` - Curated examples documentation

**Template Source:** Use the Glob tool to list available example workflows:

```
Glob('~/.claude/plugins/repos/orchestration/examples/*.flow')
```

For each template found, read the file to extract its name and description from the YAML frontmatter.

**Template Documentation:** Reference `~/.claude/plugins/repos/orchestration/examples/README.md` for detailed template information.

Display a formatted list combining both documentation examples and available templates to the user.

## After Displaying Examples

Ask the user what they'd like to do next:

```javascript
AskUserQuestion({
  questions: [{
    question: "What would you like to do with these examples?",
    header: "Next",
    multiSelect: false,
    options: [
      {label: "Try an example", description: "Execute one of these workflows"},
      {label: "Learn more", description: "Get detailed docs on a topic"},
      {label: "Create custom", description: "Build your own workflow"},
      {label: "Return to menu", description: "Go back to main menu"}
    ]
  }]
})
```

**Handler Actions:**
- **Try an example** → Prompt user to paste/specify which example syntax, then execute `/orchestration:run <syntax>`
- **Learn more** → Execute `/orchestration:explain`
- **Create custom** → Prompt for syntax and execute `/orchestration:run <syntax>`
- **Return to menu** → Execute `/orchestration:menu`

## Implementation Note

**Documentation:**
- Examples gallery: `~/.claude/plugins/repos/orchestration/docs/reference/examples.md`
- Template documentation: `~/.claude/plugins/repos/orchestration/examples/README.md`

If the examples documentation doesn't exist, display a friendly message and offer to:
1. Show inline examples (from help reference)
2. List available templates from examples/ directory
3. Return to menu
