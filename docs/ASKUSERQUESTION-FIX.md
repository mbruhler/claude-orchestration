# AskUserQuestion Tool Fix

## Problem

The `workflow-socratic-designer` subagent was trying to use the `AskUserQuestion` tool directly, but **subagents cannot access this tool**. Only the main Claude agent can use `AskUserQuestion`.

This caused the agent to return text-based questions instead of using the proper interactive question prompts.

## Solution

### 1. Updated Subagent Behavior (`agents/workflow-socratic-designer.md`)

**Changes**:
- Removed `AskUserQuestion` from the tools list
- Added clear instructions that the subagent is NOT allowed to use AskUserQuestion directly
- Instructed the subagent to return questions in a structured JSON format

**JSON Format for Questions**:
```json
{
  "needsUserInput": true,
  "questions": [
    {
      "question": "What problem are you solving?",
      "header": "Problem",
      "multiSelect": false,
      "options": [
        {"label": "Option 1", "description": "Description 1"},
        {"label": "Option 2", "description": "Description 2"}
      ]
    }
  ]
}
```

### 2. Updated Command Handler (`commands/create.md`)

**Added responsibilities**:
1. Call the `workflow-socratic-designer` subagent
2. Parse the subagent's response for JSON containing `"needsUserInput": true`
3. Extract the questions array from the JSON
4. Use the `AskUserQuestion` tool (which only the main agent can use)
5. Pass the user's answers back to the subagent in the next call
6. Repeat until the workflow is complete

**Interaction Flow**:
```
User: /orchestration:create <description>
  ↓
Main Agent calls subagent
  ↓
Subagent returns: {"needsUserInput": true, "questions": [...]}
  ↓
Main Agent extracts questions and uses AskUserQuestion tool
  ↓
User provides answers via interactive prompts
  ↓
Main Agent calls subagent again with: "User answered: {answers}"
  ↓
Repeat until subagent returns complete workflow (no needsUserInput)
```

## Key Principles

1. **Subagents cannot use AskUserQuestion** - This tool is only available to the main agent
2. **Structured communication** - Subagents return JSON to indicate they need user input
3. **Main agent mediates** - The main agent acts as a bridge between the subagent and the AskUserQuestion tool
4. **Iterative refinement** - The process loops until all questions are answered and the workflow is complete

## Files Modified

1. `agents/workflow-socratic-designer.md` - Updated to return JSON instead of using AskUserQuestion
2. `commands/create.md` - Updated to:
   - Use scoped agent name: `orchestration:workflow-socratic-designer`
   - Use scoped syntax designer name: `orchestration:workflow-syntax-designer`
   - Parse JSON responses and use AskUserQuestion on behalf of the subagent
   - Remove confusing references to subagent using AskUserQuestion directly

## Testing

To test this fix:
```bash
/orchestration:create Create a simple test workflow
```

The main agent should now properly use the AskUserQuestion tool to display interactive prompts based on the subagent's questions.
