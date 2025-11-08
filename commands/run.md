---
description: Parse and execute inline workflow syntax
---

# Orchestration Workflow Execution

Parse and execute a workflow defined using orchestration syntax.

## Arguments: {{ARGS}}

The workflow syntax to execute.

## Execution Phases

### Phase 0: Pre-Parse (Temporary Agents)

**Reference:** `docs/features/temporary-agents.md`, `src/temp-agents-parser.js`

If workflow contains temporary agent syntax (`$agent-name`):

1. **Extract Definitions** - Find `$name := {...}` patterns
   ```javascript
   const { registry, cleanedSyntax } = extractTempAgentDefinitions(syntax)
   ```

2. **Expand Invocations** - Replace `$name:"instruction":var` with standard syntax
   ```javascript
   const { expanded, replacements } = expandTempAgentInvocations(cleanedSyntax, registry)
   ```

3. **Build Metadata** - Track temp agent info for executor
   ```javascript
   const metadata = {
     tempAgents: [...],
     nodeMetadata: [...],
     variables: {}
   }
   ```

**Example:**
```
Input:  $scanner := {base: "general-purpose", prompt: "Security expert", model: "opus"}
        $scanner:"Scan auth code":results

Output: general-purpose:"Security expert\n\nScan auth code"
        + metadata: {outputVar: "results", model: "opus"}
```

**Errors?**
- Missing `base` or `prompt` field
- Undefined temporary agent reference
- Variable referenced but never produced

**If no temp agents detected, skip to Phase 1.**

---

### Phase 1: Parse

**Reference:** `docs/core/parser.md`

1. **Tokenize** - Split by operators: `->`, `||`, `~>`, `@`, `[...]`
2. **Build AST** - Parse tokens into tree (precedence: `[]` > `||` > `->` > `~>`)
3. **Create Graph** - Convert to directed graph with nodes and edges
4. **Enhance Graph** - Add temp agent metadata if present
   ```javascript
   if (tempAgentMetadata) {
     graph = enhanceGraphWithTempAgents(graph, tempAgentMetadata)
   }
   ```
5. **Validate** - Check for:
   - Unclosed subgraphs
   - Unknown agents
   - Orphaned nodes
   - Circular dependencies
   - Invalid conditions
   - Variable dependencies (if temp agents used)

**Output:**
```javascript
{
  nodes: [{
    id, type, agent, instruction, status: "pending",
    outputVar?, model?, templateVars?, tempAgentName?
  }],
  edges: [{from, to, condition}],
  variables: {},  // If temp agents used
  tempAgents: {}  // If temp agents used
}
```

**Errors?** Display clear message with context and abort.

---

### Phase 2: Visualize

**Reference:** `docs/core/visualizer.md`

Display ASCII art visualization:

```
╔════════════════════════════════════════════╗
║  Workflow: [name]                          ║
╠════════════════════════════════════════════╣
║                                            ║
║    [step-1] ○                              ║
║        │                                   ║
║    ┌───┴───┐                               ║
║  [step-2] [step-3] ○ ○                     ║
║    └───┬───┘                               ║
║    [merge] ○                               ║
║                                            ║
╠════════════════════════════════════════════╣
║ Status: Ready to execute                   ║
╠════════════════════════════════════════════╣
║ (c)ontinue  (e)dit  (q)uit                 ║
╚════════════════════════════════════════════╝
```

**Status Indicators:**
- ○ Pending
- ● Executing
- ✓ Completed
- ✗ Failed
- ⊗ Skipped

**Confirm with user before execution.**

---

### Phase 3: Execute

**Reference:** `docs/core/executor.md`, `src/temp-agents-executor.js`

**Algorithm:**
1. Initialize all nodes to ○ pending
2. Initialize variables map if temp agents used: `graph.variables = {}`
3. Loop until complete:
   - Find executable nodes (dependencies satisfied)
   - **If temp agents:** Check variable dependencies are satisfied
   - **If temp agents:** Interpolate variables in instruction
   - Launch agents via Task tool (parallel if multiple)
   - Wait for completion
   - **If temp agents:** Capture output to variable if node has `outputVar`
   - Update status and visualization
   - Evaluate conditionals
   - Handle checkpoints
   - Handle errors
4. Display final results (including variable summary if temp agents used)

**Agent Mapping:**
- `explore` → `Explore` subagent
- `general-purpose` → `general-purpose` subagent
- `code-reviewer` → `superpowers:code-reviewer` subagent
- `implementation-architect` → `implementation-architect` subagent
- `expert-code-implementer` → `expert-code-implementer` subagent
- Other agents → Use subagent_type as specified

**Parallel Execution:**
Launch all parallel agents in single response using multiple Task calls.

**Temporary Agent Execution:**
```javascript
// Before execution: interpolate variables
const instruction = prepareNodeInstruction(node, graph.variables)

// Execute with model override if specified
await Task({
  subagent_type: node.agent,
  description: node.tempAgentName ? `Temp agent: ${node.tempAgentName}` : `Execute ${node.agent}`,
  prompt: instruction,
  model: node.model  // Override model if temp agent specified one
})

// After execution: capture output
if (node.outputVar) {
  captureNodeOutput(node, result, graph.variables)
}
```

**Variable Interpolation:**
Replace `{varname}` in instructions with actual values:
```javascript
"Create report from {scan_results}"
→ "Create report from Found 3 vulnerabilities: ..."
```

**Conditional Evaluation:**
- `if passed` → Check for success indicators
- `if failed` → Check for failure indicators
- `if all success` → All parallel branches succeeded
- `if any success` → At least one succeeded
- Custom conditions → Interpret from output

**Checkpoints:**
When reaching `@label`:
1. Pause execution
2. Show steering menu (see Phase 4)
3. Wait for command
4. Resume based on command

---

### Phase 4: Steering

**Reference:** `docs/core/steering.md`

At checkpoints and after errors, provide control:

```
╠════════════════════════════════════════════╣
║ (c)ontinue  (j)ump  (r)epeat  (e)dit      ║
║ (v)iew-output  (q)uit                      ║
╚════════════════════════════════════════════╝
```

Use AskUserQuestion for steering:

```javascript
AskUserQuestion({
  questions: [{
    question: "What would you like to do?",
    header: "Control",
    multiSelect: false,
    options: [
      {label: "Continue", description: "Resume from current point"},
      {label: "Jump", description: "Jump to specific node"},
      {label: "Repeat", description: "Re-execute last node"},
      {label: "Edit", description: "Modify workflow syntax"},
      {label: "View output", description: "Display full node output"},
      {label: "Quit", description: "Abort with summary"}
    ]
  }]
})
```

**Commands:**
- **Continue** - Resume from current point
- **Jump** - Ask which node, then jump to it
- **Repeat** - Re-execute last node
- **Edit** - Prompt for new syntax, reparse, and restart
- **View** - Display full output from selected node
- **Quit** - Abort and show summary

---

### Phase 5: Error Recovery

**Reference:** `docs/features/error-handling.md`

When agent fails:

```
╔════════════════════════════════════════════╗
║  ERROR: Agent Execution Failed             ║
╠════════════════════════════════════════════╣
║  Node: [failed-node] ✗                     ║
║  Error: [message]                          ║
╠════════════════════════════════════════════╣
║  Recovery options:                         ║
╚════════════════════════════════════════════╝
```

Use AskUserQuestion for recovery:

```javascript
AskUserQuestion({
  questions: [{
    question: "How would you like to recover?",
    header: "Error",
    multiSelect: false,
    options: [
      {label: "Retry", description: "Re-execute failed node"},
      {label: "Edit", description: "Modify workflow"},
      {label: "Skip", description: "Continue past failure"},
      {label: "Debug", description: "Insert debug step"},
      {label: "Fork", description: "Try parallel approaches"},
      {label: "Quit", description: "Abort execution"}
    ]
  }]
})
```

**Context-aware suggestions** based on error type.

---

### Phase 6: Completion

```
╔════════════════════════════════════════════╗
║  Workflow Complete                         ║
╠════════════════════════════════════════════╣
║  Total steps: 12                           ║
║  Completed: 11 ✓                           ║
║  Failed: 1 ✗                               ║
║  Duration: 3m 45s                          ║
╠════════════════════════════════════════════╣
║  Next steps:                               ║
╚════════════════════════════════════════════╝
```

Use AskUserQuestion for completion:

```javascript
AskUserQuestion({
  questions: [{
    question: "What would you like to do?",
    header: "Complete",
    multiSelect: false,
    options: [
      {label: "View results", description: "Display all node outputs"},
      {label: "Save template", description: "Save workflow for reuse"},
      {label: "Run again", description: "Execute workflow again"},
      {label: "Return to menu", description: "Go back to main menu"}
    ]
  }]
})
```

---

### Phase 7: Agent Promotion (if temp agents used)

If the workflow used temp agents and completed successfully, offer to promote them to defined agents.

#### Step 1: Detect Temp Agent Usage

Check if any nodes used temp agents:
```javascript
const tempAgentsUsed = nodes.filter(n => n.agentSource === 'temp');
if (tempAgentsUsed.length === 0) {
  // Skip promotion flow
  continue to phase 6;
}
```

#### Step 2: Generate Smart Suggestions

Use agent-promotion module:
```javascript
const agentPromotion = require('../src/agent-promotion');
const tempAgentNames = tempAgentsUsed.map(n => n.agentType);
const suggestions = agentPromotion.generatePromotionSuggestions(tempAgentNames);
```

#### Step 3: Present Batch Selection

Use AskUserQuestion tool:
```javascript
const options = suggestions.map(s => ({
  label: s.name,
  description: s.reason
}));

AskUserQuestion({
  questions: [{
    question: "Select which temp agents to save as permanent defined agents:",
    header: "Agent Promotion",
    multiSelect: true,
    options: options
  }]
});
```

Mark recommended agents as pre-selected in UI if possible.

#### Step 4: Process Selections

```javascript
const selectedNames = // from user response
const results = agentPromotion.processPromotions(selectedNames);

// Show success message
if (results.promoted.length > 0) {
  console.log(`✓ Saved ${results.promoted.length} agents:`);
  results.promoted.forEach(name => {
    console.log(`  - ${name} → agents/${name}.md`);
  });
  console.log('These agents are now available for future workflows!');
}

// Show failures if any
if (results.failed.length > 0) {
  console.log('Failed to promote:');
  results.failed.forEach(f => {
    console.log(`  - ${f.name}: ${f.reason}`);
  });
}
```

#### Step 5: Cleanup Unselected Agents

```javascript
const deleted = agentPromotion.cleanupTempAgents(tempAgentNames, selectedNames);
console.log(`Cleaned up ${deleted.length} temp agent(s)`);
```

#### Edge Cases

- No temp agents: Skip this phase entirely
- All recommendations are "not recommended": Show message "No reusable agents detected. All temp agents deleted."
- User cancels: Delete all temp agents
- Name conflicts: Handle in processPromotions (offer rename or skip)

---

## State Management

Maintain execution state throughout:
```javascript
{
  workflow: "original syntax",
  graph: {
    nodes,
    edges,
    variables: {},      // If temp agents: varName -> value
    tempAgents: {}      // If temp agents: metadata
  },
  execution: {current, completed, failed, outputs},
  steering: {paused, position, command}
}
```

**Variables Map** (when temp agents used):
- Stores outputs from agents with `outputVar` specified
- Used for interpolating `{varname}` in subsequent instructions
- Display summary at checkpoints and completion

## Key Principles

1. Parse first, execute later
2. Show visualizations throughout
3. Provide user control at checkpoints
4. Fail gracefully with recovery options
5. Context-aware error messages

## Performance

- Launch parallel agents in single response
- Keep visualizations under 80 chars width
- Limit parallel branches to 3-5 for clarity
- Split large workflows (>50 nodes) into templates

## Documentation References

**Core Implementation:**
- `docs/core/parser.md` - Syntax parsing details
- `docs/core/executor.md` - Execution algorithm
- `docs/core/visualizer.md` - Rendering system
- `docs/core/steering.md` - Interactive control
- `src/temp-agents-parser.js` - Temporary agents parsing
- `src/temp-agents-executor.js` - Variable interpolation

**Features:**
- `docs/features/temporary-agents.md` - Temporary agent system ($agent syntax)
- `docs/features/templates.md` - Template system
- `docs/features/error-handling.md` - Recovery strategies
- `docs/features/custom-definitions.md` - Extension system

**Reference:**
- `docs/reference/syntax.md` - Complete syntax specification
- `~/.claude/plugins/repos/orchestration/examples/` - Example workflows directory
- `docs/reference/best-practices.md` - Guidelines and limitations
