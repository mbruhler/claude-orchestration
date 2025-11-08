---
description: Detailed topic documentation for orchestration features
deprecated: true
---

# ⚠️ DEPRECATED: Orchestration Topic Documentation

**This command is deprecated.** Skills now contain embedded documentation with progressive disclosure.

## Migration Guide

Documentation is now integrated into skills:
- **creating-workflows** skill - Workflow creation docs
- **executing-workflows** skill - Execution and syntax docs
- **managing-agents** skill - Agent lifecycle docs
- **designing-syntax** skill - Custom syntax docs
- **debugging-workflows** skill - Debugging guides

---

## Legacy Usage (Still Works)

Provide detailed documentation on specific orchestration topics.

## Arguments: {{ARGS}}

## Available Topics

**Core Topics (docs/topics/):**
- **syntax** - Complete syntax guide (operators, agents, patterns)
- **custom-syntax** - Custom syntax elements and definitions

**Features (docs/features/):**
- **natural-language** - Natural language workflow creation
- **templates** - Template system and parameter substitution
- **error-handling** - Error recovery strategies
- **defined-agents** - Reusable agent definitions
- **temporary-agents** - Inline agent definitions ($agent syntax)
- **agent-promotion** - Converting temp to defined agents
- **custom-definitions** - Extension system

**Reference (docs/reference/):**
- **syntax** - Quick reference card
- **examples** - Examples gallery
- **best-practices** - Guidelines and patterns
- **variable-binding** - Conditional variables
- **temp-agents-syntax** - Temporary agent syntax reference

## Handle Topic Selection

### No Topic Specified

If {{ARGS}} is empty, present topic selection menu:

```javascript
AskUserQuestion({
  questions: [{
    question: "Which topic would you like to learn about?",
    header: "Topic",
    multiSelect: false,
    options: [
      {label: "syntax", description: "Complete syntax guide"},
      {label: "custom-syntax", description: "Custom syntax elements"},
      {label: "natural-language", description: "Natural language creation"},
      {label: "templates", description: "Template system"},
      {label: "defined-agents", description: "Reusable agents"},
      {label: "temporary-agents", description: "Inline agents ($agent)"},
      {label: "agent-promotion", description: "Temp to defined agents"},
      {label: "error-handling", description: "Error recovery"},
      {label: "examples", description: "Examples gallery"},
      {label: "best-practices", description: "Guidelines and patterns"}
    ]
  }]
})
```

### Topic Specified

If {{ARGS}} contains a topic name, load the corresponding documentation:

**Available topic files:**
- Core topics: `~/.claude/plugins/repos/orchestration/docs/topics/${topic}.md`
- Features: `~/.claude/plugins/repos/orchestration/docs/features/${topic}.md`
- Reference: `~/.claude/plugins/repos/orchestration/docs/reference/${topic}.md`

```javascript
// Try topics directory first
Read(`~/.claude/plugins/repos/orchestration/docs/topics/${topic}.md`)

// If not found, try features directory
// If not found, try reference directory
```

Display the full content to the user.

### File Not Found

If the topic file doesn't exist:
1. Display friendly message: "Documentation for '{topic}' is not available yet."
2. Show list of available topics above
3. Offer to explain what we know about the topic based on general knowledge
4. Prompt to select another topic

## After Displaying Topic

Ask the user what they'd like to do next:

```javascript
AskUserQuestion({
  questions: [{
    question: "What would you like to do next?",
    header: "Next",
    multiSelect: false,
    options: [
      {label: "Learn another topic", description: "View different topic documentation"},
      {label: "See examples", description: "View example workflows"},
      {label: "Try it out", description: "Create a workflow using this concept"},
      {label: "Return to menu", description: "Go back to main menu"}
    ]
  }]
})
```

**Handler Actions:**
- **Learn another topic** → Execute `/orchestration:explain` (without args to show menu)
- **See examples** → Execute `/orchestration:examples`
- **Try it out** → Prompt for syntax and execute `/orchestration:run <syntax>`
- **Return to menu** → Execute `/orchestration:menu`

## Implementation Notes

- Parse {{ARGS}} to extract topic name (handle variations like "explain syntax", "syntax", etc.)
- Be flexible with topic names (case-insensitive, handle plurals)
- If multiple topics match, ask for clarification
- Keep documentation display clean and well-formatted
