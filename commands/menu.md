---
description: Interactive menu for orchestration system
---

# Orchestration Menu

You are in **Menu Mode** of the Workflow Orchestration System. Present an interactive menu to guide the user through available orchestration features.

## Arguments: {{ARGS}}

## Display Menu

Use AskUserQuestion to present the main menu:

```javascript
AskUserQuestion({
  questions: [{
    question: "What would you like to do?",
    header: "Menu",
    multiSelect: false,
    options: [
      {label: "Import agents", description: "Import custom agents from Claude Code"},
      {label: "Create from description", description: "Natural language workflow creation"},
      {label: "New workflow", description: "Create workflow from syntax"},
      {label: "Load template", description: "Execute saved flow"},
      {label: "List templates", description: "Show all templates"},
      {label: "Manage syntax", description: "View/edit global syntax library"},
      {label: "View docs", description: "Help, examples, or topic guides"}
    ]
  }]
})
```

## Handler Actions

### Import agents
- Execute `/orchestration:init`
- Imports custom agents from ~/.claude/agents/ to orchestration plugin
- Makes them available for use in workflows with orchestration: namespace

### Create from description
- Execute `/orchestration:create`
- This launches the natural language workflow creation flow

### New workflow
- Prompt for workflow syntax
- Execute `/orchestration:run <syntax>`

### Load template
- Show available templates from ~/.claude/plugins/repos/orchestration/examples/
- Let user select template
- Execute `/orchestration:template <template-name>`

### List templates
- Use Glob: `~/.claude/plugins/repos/orchestration/examples/*.flow`
- Display table:
  ```
  ╔════════════════════════════════════════════════════════╗
  ║ Name              | Description         | Parameters  ║
  ╠════════════════════════════════════════════════════════╣
  ║ tdd-feature       | TDD workflow        | feature     ║
  ║ debug-fix         | Debug and fix       | issue       ║
  ║ ...               | ...                 | ...         ║
  ╚════════════════════════════════════════════════════════╝
  ```
- Offer to execute or view any template

### Manage syntax
Present submenu for global syntax management using AskUserQuestion:

```javascript
AskUserQuestion({
  questions: [{
    question: "Manage global syntax library:",
    header: "Syntax",
    multiSelect: false,
    options: [
      {label: "List all syntax", description: "Show all global syntax elements"},
      {label: "View by type", description: "Browse operators, actions, etc."},
      {label: "Search syntax", description: "Find specific syntax elements"},
      {label: "Back to menu", description: "Return to main menu"}
    ]
  }]
})
```

#### List all syntax
- Use Glob: `~/.claude/plugins/repos/orchestration/library/syntax/**/*.md`
- Read frontmatter from each file
- Display table:
  ```
  ╔════════════════════════════════════════════╗
  ║ Type      | Name     | Description         ║
  ╠════════════════════════════════════════════╣
  ║ operator  | ->       | Sequential flow     ║
  ║ operator  | ||       | Parallel execution  ║
  ║ ...       | ...      | ...                 ║
  ╚════════════════════════════════════════════╝
  ```
- Return to syntax submenu

#### View by type
- Ask which type to view (operators, actions, checkpoints, etc.)
- List files in that directory
- Show name and description for each
- Allow viewing full content
- Return to syntax submenu

#### Search syntax
- Ask for search term
- Use Grep to search descriptions and content in `~/.claude/plugins/repos/orchestration/library/syntax/`
- Display matching syntax elements
- Allow viewing full content
- Return to syntax submenu

### View docs
Present documentation submenu using AskUserQuestion:

```javascript
AskUserQuestion({
  questions: [{
    question: "What documentation would you like to view?",
    header: "Docs",
    multiSelect: false,
    options: [
      {label: "Help", description: "Quick reference guide"},
      {label: "Examples", description: "Examples gallery"},
      {label: "Explain topic", description: "Detailed topic documentation"},
      {label: "Back to menu", description: "Return to main menu"}
    ]
  }]
})
```

**Handler Actions:**
- **Help** → Execute `/orchestration:help`
- **Examples** → Execute `/orchestration:examples`
- **Explain topic** → Execute `/orchestration:explain`
- **Back to menu** → Redisplay main menu

---

## Notes

- Always show clear navigation options
- Allow returning to main menu from any submenu
- Display content in formatted, readable boxes
- Keep menu interactions conversational
