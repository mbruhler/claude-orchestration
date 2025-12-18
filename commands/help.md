---
description: Quick reference guide for orchestration syntax
---

# Orchestration Help

Display the quick reference guide for the Workflow Orchestration System.

## Arguments: {{ARGS}}

## Display Quick Reference

```
+--------------------------------------------------------------+
|                Orchestration Quick Reference                 |
+--------------------------------------------------------------+
|                                                              |
|  OPERATORS                                                   |
|  step1 -> step2           Sequential                         |
|  step1 || step2           Parallel                           |
|  step (if cond)~> next    Conditional                        |
|  @label                   Checkpoint                         |
|  [...]                    Subgraph                           |
|                                                              |
|  AGENTS                                                      |
|  explore:"task"           Investigation                      |
|  general-purpose:"task"   Implementation                     |
|  code-reviewer:"task"     Quality check                      |
|                                                              |
|  EXAMPLES                                                    |
|  explore:"find bugs" -> review -> implement                  |
|  [test || lint] (all success)~> deploy                       |
|  @try -> fix -> test (if failed)~> @try                      |
|                                                              |
|  COMMANDS                                                    |
|  /orchestration:init              Import custom agents       |
|  /orchestration:create            Natural language creation  |
|  /orchestration:run <syntax>      Execute workflow           |
|  /orchestration:template <name>   Load and run template      |
|  /orchestration:menu              Main menu                  |
|  /orchestration:help              This quick reference       |
|  /orchestration:examples          View example workflows     |
|  /orchestration:explain           Detailed topic docs        |
|                                                              |
+--------------------------------------------------------------+
```

## Next Steps

Ask the user what they'd like to do next:

```javascript
AskUserQuestion({
  questions: [{
    question: "What would you like to do next?",
    header: "Next",
    multiSelect: false,
    options: [
      {label: "Create workflow", description: "Start building a workflow"},
      {label: "Load template", description: "Execute a saved template"},
      {label: "View examples", description: "See example workflows"},
      {label: "Return to menu", description: "Go back to main menu"}
    ]
  }]
})
```

**Handler Actions:**
- **Create workflow** -> Execute `/orchestration:create`
- **Load template** -> Execute `/orchestration:template`
- **View examples** -> Execute `/orchestration:examples`
- **Return to menu** -> Execute `/orchestration:menu`
