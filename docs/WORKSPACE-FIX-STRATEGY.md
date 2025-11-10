# Workspace Fix Strategy

## Problem
Plugin obecnie używa globalnych ścieżek `~/.claude/` co powoduje:
- Pliki są tworzone poza workspace'm pluginu
- Brak automatycznego cleanup
- Konflikty z innymi pluginami
- Trudności w zarządzaniu plikami tymczasowymi

## Solution

### 1. Use Plugin Workspace Only

**Replace all `~/.claude/` paths with `${CLAUDE_PLUGIN_ROOT}`**

| Current | Fixed |
|---------|-------|
| `~/.claude/agents/` | `~/.claude/agents/` (external agents - read only) |
| `~/.claude/plugins/repos/orchestration/temp-scripts/` | `${CLAUDE_PLUGIN_ROOT}/temp-scripts/` |
| `~/.claude/plugins/repos/orchestration/temp-agents/` | `${CLAUDE_PLUGIN_ROOT}/temp-agents/` |
| `~/.claude/plugins/repos/orchestration/agents/` | `${CLAUDE_PLUGIN_ROOT}/agents/` |
| `~/.claude/plugins/repos/orchestration/examples/` | `${CLAUDE_PLUGIN_ROOT}/examples/` |
| `~/.claude/plugins/repos/orchestration/skills/` | `${CLAUDE_PLUGIN_ROOT}/skills/` |

### 2. Temporary Files Management

**Files that MUST be deleted after workflow:**
- `${CLAUDE_PLUGIN_ROOT}/temp-scripts/*.py`
- `${CLAUDE_PLUGIN_ROOT}/temp-scripts/*.js`
- `${CLAUDE_PLUGIN_ROOT}/temp-scripts/*.sh`
- `${CLAUDE_PLUGIN_ROOT}/temp-agents/*.md` (already in .gitignore)

**Cleanup strategy:**
```javascript
// At end of every workflow execution:
1. List all files in temp-scripts/
2. Delete files created during this workflow session
3. Log cleanup actions
4. Confirm all temp files removed
```

### 3. AskUserQuestion Fixes

**Current problem:** Commands use text descriptions instead of interactive picker

**Fix:** All user interactions MUST use AskUserQuestion tool

**Example:**
```javascript
// WRONG - just text
"Which agents would you like to import?"

// CORRECT - interactive picker
AskUserQuestion({
  questions: [{
    question: "Which agents would you like to import?",
    header: "Import Agents",
    multiSelect: true,
    options: [
      {label: "expert-code-implementer", description: "Code implementation"},
      {label: "code-optimizer", description: "Performance optimization"}
    ]
  }]
})
```

### 4. Files to Fix

**Commands:**
- [x] commands/init.md - Uses ~/.claude/agents/ (read-only OK) + fix AskUserQuestion
- [ ] commands/create.md - Fix paths and AskUserQuestion
- [ ] commands/menu.md - Already uses AskUserQuestion ✓
- [ ] commands/run.md - Fix temp-scripts cleanup
- [ ] commands/template.md - Fix examples path
- [ ] commands/examples.md - Fix examples path
- [ ] commands/orchestrate.md - Fix temp cleanup

**Skills:**
- [ ] skills/managing-temp-scripts/*.md - Fix temp-scripts paths
- [ ] skills/managing-agents/*.md - Fix agents paths
- [ ] skills/creating-workflows/*.md - Fix template paths
- [ ] skills/executing-workflows/*.md - Add cleanup instructions

**Documentation:**
- [ ] README.md - Update paths in examples
- [ ] docs/features/*.md - Update paths
- [ ] examples/*.flow - Update any hardcoded paths

### 5. Environment Variables

Use these Claude Code variables:
- `${CLAUDE_PLUGIN_ROOT}` - Plugin workspace directory
- `${CLAUDE_PLUGIN_NAME}` - Plugin name
- `${CLAUDE_CWD}` - Current working directory (user's project)

### 6. Cleanup Workflow

Add to all workflow execution commands:

```markdown
## Cleanup Phase (MANDATORY)

After workflow completes:

1. **Identify temp files**
   ```javascript
   const tempFiles = Glob({
     pattern: "**/*",
     path: "${CLAUDE_PLUGIN_ROOT}/temp-scripts/"
   })
   ```

2. **Delete each temp file**
   ```javascript
   for (const file of tempFiles) {
     Bash({ command: `rm "${file}"` })
   }
   ```

3. **Verify cleanup**
   ```javascript
   const remaining = Glob({
     pattern: "**/*",
     path: "${CLAUDE_PLUGIN_ROOT}/temp-scripts/"
   })
   if (remaining.length > 0) {
     console.error("Cleanup failed - files remain:", remaining)
   }
   ```

4. **Log cleanup**
   ```
   Deleted X temporary files:
   - temp-scripts/script1.py
   - temp-scripts/script2.js
   ```
```

### 7. Implementation Order

1. ✅ Create this strategy document
2. [ ] Fix commands/init.md (AskUserQuestion)
3. [ ] Fix commands/run.md (cleanup + paths)
4. [ ] Fix commands/orchestrate.md (cleanup + paths)
5. [ ] Fix all skills (paths)
6. [ ] Update documentation
7. [ ] Test workflow with cleanup
8. [ ] Commit and push

## Testing Checklist

- [ ] Run workflow - temp files created in plugin workspace
- [ ] Workflow completes - all temp files deleted
- [ ] Run /orchestration:init - interactive picker shows
- [ ] Run /orchestration:menu - interactive menu works
- [ ] Check temp-scripts/ after workflow - should be empty
- [ ] Check temp-agents/ after workflow - should be empty
