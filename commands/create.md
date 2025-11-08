---
description: Create workflow from natural language description
deprecated: true
---

# ⚠️ DEPRECATED: Create Workflow from Description

**This command is deprecated.** Use the **creating-workflows** skill instead for better auto-discovery and context compression.

The skill automatically activates when you describe workflows or mention automation.

## Migration Guide

**Instead of:** `/orchestration:create deploy with security validation`

**Just say:** "Create a workflow that deploys with security validation"

The `creating-workflows` skill will automatically activate and guide you through workflow creation using Socratic questioning.

---

## Legacy Usage (Still Works)

Launch the Socratic workflow designer to create workflows from natural language.

## Usage

- `/orchestration:create` - Start with no context, ask what to build
- `/orchestration:create <description>` - Start with initial description

## Examples

```
/orchestration:create
/orchestration:create deploy with security validation
/orchestration:create implement auth feature with TDD
```

## Action

Parse arguments:
```javascript
const description = args.trim() || null;
```

Launch the workflow-socratic-designer agent and handle its response:

**Step 1**: Call the subagent
```javascript
Task({
  subagent_type: "orchestration:workflow-socratic-designer",
  description: "Create workflow from description",
  prompt: `Create an orchestration workflow from natural language description.

Initial description: ${description || "Ask user what they want to build"}

IMPORTANT: You are a subagent and do NOT have access to AskUserQuestion.
When you need to ask the user questions, return them in JSON format with "needsUserInput": true.
The main agent will use AskUserQuestion to prompt the user and call you again with answers.

Follow this process:

1. **Understand Request**
   ${description ?
     "- Assess specificity of provided description\n   - Identify workflow pattern hints" :
     "- Ask user what they want to build\n   - Gather initial context"}
   - Read existing templates for pattern matching from: ~/.claude/plugins/repos/orchestration/examples/*.flow
   - Reference agent registry for available agents: ~/.claude/plugins/repos/orchestration/agents/registry.json

2. **Socratic Questioning**
   Return questions in JSON format (you cannot use AskUserQuestion directly).

   For vague requests:
   - Problem identification (single-select)
   - Scope clarification (multi-select)
   - Constraints (multi-select)
   - Pattern suggestion (single-select)

   For specific requests:
   - Pattern recognition
   - Customization (multi-select)
   - Validation (single-select)

   For medium requests:
   - Scope first (multi-select)
   - Details drilling
   - Connection logic

3. **Build WorkflowRequirements**
   Create structured object:
   {
     intent: "user's goal",
     pattern: "identified-pattern",
     agents: ["list", "of", "agents"],
     structure: "sequential|parallel|conditional|hybrid",
     errorHandling: ["retry", "rollback"],
     checkpoints: ["@review"],
     conditions: ["if passed"],
     guards: ["require-clean-working-tree"],
     tools: ["npm:test"],
     mcps: [],
     customSyntaxNeeded: []
   }

4. **Custom Syntax (if needed)**
   If customSyntaxNeeded has elements:
   - Call workflow-syntax-designer for each
   - Use Task tool with subagent_type: "orchestration:workflow-syntax-designer"

5. **Generate Workflow**
   - Map requirements to orchestration syntax
   - Add variable bindings: operation (condition):var~>
   - Use negative conditions: (if !var)~>
   - Format for readability

6. **Explain to User**
   - Plain language explanation of workflow
   - Show generated syntax with highlighting
   - Explain any custom syntax created

7. **Save as Template**
   Return JSON to request user input for:
   - Ask if user wants to save as template
   - Collect template name (suggest based on pattern)
   - Confirm description
   - Confirm parameters
   - Save to ~/.claude/plugins/repos/orchestration/examples/<name>.flow
   - Ask which custom syntax to promote to global library
   - Copy promoted syntax to library/syntax/<type>/<name>.md

Context files:
- Templates: ~/.claude/plugins/repos/orchestration/examples/
- Global syntax: ~/.claude/plugins/repos/orchestration/library/syntax/
- Agent registry: ~/.claude/plugins/repos/orchestration/agents/registry.json
- Temp agents: ~/.claude/plugins/repos/orchestration/temp-agents/
- Natural language docs: ~/.claude/plugins/repos/orchestration/docs/features/natural-language.md
- Best practices: ~/.claude/plugins/repos/orchestration/docs/reference/best-practices.md
- Workflow syntax: ~/.claude/plugins/repos/orchestration/docs/topics/syntax.md

Remember:
- Use variable binding for explicit conditions
- Support negative conditions with !
- Follow reuse-first for custom syntax
- Make workflow self-documenting with clear variable names
`
})
```

**Step 2**: Handle the subagent response

After receiving the response from the subagent:

1. **Check for needsUserInput**: Look for JSON with `"needsUserInput": true` in the response
2. **If questions found**: Extract the questions array and use AskUserQuestion tool
3. **Pass answers back**: Call the subagent again with user's answers included in the prompt
4. **Repeat**: Continue this loop until the subagent returns a complete workflow (no needsUserInput)

Example interaction flow:
```
Subagent returns: {"needsUserInput": true, "questions": [...]}
  ↓
Main agent uses: AskUserQuestion({questions: [...]})
  ↓
User provides answers
  ↓
Main agent calls subagent again with: "User answered: {answers}"
  ↓
Repeat until workflow is complete
```

## Notes

This command is the primary entry point for natural language workflow creation.

**Key responsibilities**:
1. Delegate to the workflow-socratic-designer subagent
2. Parse the subagent's JSON responses for questions
3. Use AskUserQuestion tool to actually prompt the user (subagents can't do this directly)
4. Pass user answers back to the subagent
5. Continue the loop until the workflow is complete
