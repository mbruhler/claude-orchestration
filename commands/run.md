---
description: Parse and execute inline workflow syntax
deprecated: true
---

# ⚠️ DEPRECATED: Orchestration Workflow Execution

**This command is deprecated.** Use the **executing-workflows** skill instead for better visualization, error handling, and progress tracking.

The skill automatically activates when you provide workflow syntax or ask to run a workflow.

## Migration Guide

**Instead of:** `/orchestration:run step1 -> step2 -> step3`

**Just provide syntax:**
```flow
step1:"task" -> step2:"task" -> step3:"task"
```

The `executing-workflows` skill will automatically activate and execute with full visualization and steering support.

---

## Legacy Usage (Still Works)

Parse and execute a workflow defined using orchestration syntax.

## Arguments: {{ARGS}}

The workflow to execute. Can be provided in two formats:

1. **Raw syntax** - Direct workflow operators (e.g., `step1 -> step2`)
2. **Template format** - YAML frontmatter with `workflow` and optional `visualization` fields

## Execution Phases

### Phase -1: Template Detection (if applicable)

**Check for YAML frontmatter:**

If input starts with `---`, it's a template with frontmatter:

```javascript
if (input.startsWith('---')) {
  const { frontmatter, content } = parseYAMLFrontmatter(input)

  // Extract fields
  const visualization = frontmatter.visualization  // Static ASCII art
  const workflow = frontmatter.workflow            // Raw workflow syntax

  // Use workflow syntax from frontmatter, not content after ---
  syntax = workflow

  // Store visualization for Phase 2
  staticVisualization = visualization
}
```

**If no frontmatter detected, use input as-is for raw syntax.**

---

### Phase 0: Pre-Parse (Temporary Agents)

**Reference:** `~/.claude/plugins/repos/orchestration/docs/features/temporary-agents.md`
**Registry:** `~/.claude/plugins/repos/orchestration/temp-agents/`

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

**Reference:** `~/.claude/plugins/repos/orchestration/docs/core/parser.md`

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

**Reference:** `~/.claude/plugins/repos/orchestration/docs/core/visualizer.md`

**Static Visualization Check:**
Before generating a dynamic visualization, check if a static visualization was provided:
- Templates can include a `visualization` field in their YAML frontmatter
- If present, display the static visualization directly without modification
- Static visualizations ensure consistent display across all executions
- Skip dynamic generation when static visualization is available

**Dynamic Visualization:**
If no static visualization is provided, generate and display ASCII art visualization:

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

**Reference:** `~/.claude/plugins/repos/orchestration/docs/core/executor.md`
**Temp Agents:** `~/.claude/plugins/repos/orchestration/temp-agents/`

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

Plugin agents MUST be prefixed with `orchestration:` namespace:
- `explore` → `Explore` subagent (built-in)
- `general-purpose` → `general-purpose` subagent (built-in)
- `code-reviewer` → `superpowers:code-reviewer` subagent (built-in)
- `implementation-architect` → `implementation-architect` subagent (built-in)
- `expert-code-implementer` → `expert-code-implementer` subagent (built-in)
- `workflow-socratic-designer` → `orchestration:workflow-socratic-designer` subagent (plugin)
- `workflow-syntax-designer` → `orchestration:workflow-syntax-designer` subagent (plugin)
- Other defined agents from `agents/registry.json` → `orchestration:{agent-name}` (plugin)
- Temp agents (`$name`) → `orchestration:{agent-name}` (plugin, ephemeral)

**Namespace Rules:**
1. **Built-in agents**: No prefix (Explore, general-purpose, code-reviewer, etc.)
2. **Plugin agents**: Always prefix with `orchestration:`
3. **Temp agents**: Automatically prefixed with `orchestration:` when loaded from temp-agents/
4. **Agent resolution**: Check built-ins first, then try with `orchestration:` prefix

**Example:**
```javascript
// In workflow syntax:
$news-analyzer:"Analyze news articles"

// At execution time:
Task({
  subagent_type: "orchestration:news-analyzer",  // Prefixed!
  description: "Temp agent: news-analyzer",
  prompt: "..."
})
```

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

**Reference:** `~/.claude/plugins/repos/orchestration/docs/core/steering.md`

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

**Reference:** `~/.claude/plugins/repos/orchestration/docs/features/error-handling.md`

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

Analyze temp agents for reusability:
```javascript
// Analyze which temp agents are generic vs workflow-specific
const tempAgentNames = tempAgentsUsed.map(n => n.agentType);
const suggestions = analyzeAgentsForPromotion(tempAgentNames);

// Generic agents should be promoted, workflow-specific ones should be deleted
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

### Phase 8: Cleanup Temporary Files

**IMPORTANT**: After workflow completion (regardless of success/failure), clean up ALL temporary files.

#### What to Clean

1. **Temporary Agent Files** (if not promoted in Phase 7)
   - Location: `~/.claude/plugins/repos/orchestration/temp-agents/*.md`
   - Delete ALL `.md` files that were created for this workflow
   - Keep only pre-existing temp agents (if any)

2. **Temporary JSON Files**
   - Location: `~/.claude/plugins/repos/orchestration/examples/*.json`
   - Delete ALL `.json` files (these are intermediate data files)
   - Keep only `.flow` workflow templates

#### Implementation

```javascript
// After Phase 7 (Agent Promotion) or if no temp agents were used

async function cleanupTemporaryFiles() {
  const cleanupTasks = [];

  // 1. Clean up temp agents (already handled in Phase 7 if promoted)
  // If Phase 7 was skipped (no temp agents), this does nothing

  // 2. Clean up ALL JSON files in examples/
  const jsonFiles = glob('~/.claude/plugins/repos/orchestration/examples/*.json');
  for (const file of jsonFiles) {
    await deleteFile(file);
    cleanupTasks.push(file);
  }

  // 3. Report cleanup
  if (cleanupTasks.length > 0) {
    console.log(`\n🧹 Cleaned up ${cleanupTasks.length} temporary file(s):`);
    cleanupTasks.forEach(file => {
      console.log(`   - ${basename(file)}`);
    });
  }
}

// Execute cleanup
await cleanupTemporaryFiles();
```

#### When to Clean

- **Always**: After workflow completion (success or failure)
- **Exception**: Don't delete files if user explicitly requests to keep them
- **Timing**: After agent promotion phase, before final completion message

#### User Notification

```
╔════════════════════════════════════════════╗
║  Workflow Complete                         ║
╠════════════════════════════════════════════╣
║  Total steps: 12                           ║
║  Completed: 11 ✓                           ║
║  Duration: 3m 45s                          ║
╠════════════════════════════════════════════╣
║  🧹 Cleanup: 3 temporary files removed     ║
╠════════════════════════════════════════════╣
║  Next steps:                               ║
╚════════════════════════════════════════════╝
```

---

## State Management

Maintain execution state throughout:
```javascript
{
  workflow: "original syntax",
  visualization: "...",   // Optional static ASCII art from template
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
- `~/.claude/plugins/repos/orchestration/docs/core/parser.md` - Syntax parsing details
- `~/.claude/plugins/repos/orchestration/docs/core/executor.md` - Execution algorithm
- `~/.claude/plugins/repos/orchestration/docs/core/visualizer.md` - Rendering system
- `~/.claude/plugins/repos/orchestration/docs/core/steering.md` - Interactive control

**Features:**
- `~/.claude/plugins/repos/orchestration/docs/features/temporary-agents.md` - Temporary agent system ($agent syntax)
- `~/.claude/plugins/repos/orchestration/docs/features/defined-agents.md` - Defined agent system
- `~/.claude/plugins/repos/orchestration/docs/features/agent-promotion.md` - Agent promotion workflow
- `~/.claude/plugins/repos/orchestration/docs/features/templates.md` - Template system
- `~/.claude/plugins/repos/orchestration/docs/features/error-handling.md` - Recovery strategies
- `~/.claude/plugins/repos/orchestration/docs/features/custom-definitions.md` - Extension system

**Reference:**
- `~/.claude/plugins/repos/orchestration/docs/reference/syntax.md` - Complete syntax specification
- `~/.claude/plugins/repos/orchestration/docs/reference/temp-agents-syntax.md` - Temporary agent syntax
- `~/.claude/plugins/repos/orchestration/docs/reference/best-practices.md` - Guidelines and limitations

**Examples and Templates:**
- `~/.claude/plugins/repos/orchestration/examples/` - Example workflows directory
- `~/.claude/plugins/repos/orchestration/examples/README.md` - Template documentation

**Agent System:**
- `~/.claude/plugins/repos/orchestration/agents/registry.json` - Defined agents registry
- `~/.claude/plugins/repos/orchestration/agents/workflow-socratic-designer.md` - Socratic workflow designer
- `~/.claude/plugins/repos/orchestration/agents/workflow-syntax-designer.md` - Syntax designer
- `~/.claude/plugins/repos/orchestration/temp-agents/` - Temporary agent definitions
