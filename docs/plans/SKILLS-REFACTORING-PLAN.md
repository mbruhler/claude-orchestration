# Orchestration Plugin - Skills Refactoring Plan

## Executive Summary

Refaktor pluginu orchestration z **command-centric** na **skills-centric** architekturę aby wykorzystać:
- ✅ Context compression (tylko potrzebne pliki są ładowane)
- ✅ Auto-discovery (Claude automatycznie aktywuje skills)
- ✅ Lepsze zarządzanie kontekstem
- ✅ Mniejsze zużycie tokenów
- ✅ Szybsza praca

## Current State Analysis

### Struktura Obecna
```
orchestration/
├── commands/     7 plików  ← PROBLEM: Większość powinna być Skills
├── skills/       2 skills  ← ZA MAŁO
├── agents/       2 agents  ← Powinny być Skills
├── docs/         30+ plików ← Niedostępne dla Claude
├── library/      syntax    ← Nieintegrowane ze Skills
```

### Kluczowe Problemy

1. **Commands zamiast Skills** (7 commands → powinno być 2-3)
2. **Dokumentacja niedostępna** (30+ plików w docs/ nie są używane)
3. **Brak progressive disclosure** (wszystko w jednym SKILL.md)
4. **Agents zamiast Skills** (workflow-socratic-designer etc.)
5. **Library nie jest zintegrowana** (custom syntax nie jest odkrywalna)

## Target Architecture

### Nowa Struktura
```
orchestration/
├── commands/                    # TYLKO 2-3 core commands
│   ├── orchestrate.md          # Quick invocation
│   └── help.md                 # Plugin help
│
├── skills/                      # 6-8 comprehensive skills
│   ├── creating-workflows/     # Workflow creation (Socratic method)
│   │   ├── SKILL.md           # Overview + triggers
│   │   ├── socratic-method.md # Questioning approach
│   │   ├── patterns.md        # Common patterns
│   │   └── examples.md        # Real examples
│   │
│   ├── executing-workflows/    # Workflow execution
│   │   ├── SKILL.md           # Overview
│   │   ├── syntax-reference.md
│   │   ├── operators.md
│   │   ├── agents.md
│   │   └── examples/
│   │       ├── sequential.md
│   │       ├── parallel.md
│   │       └── conditional.md
│   │
│   ├── designing-syntax/       # Custom syntax design
│   │   ├── SKILL.md
│   │   ├── reuse-first.md
│   │   ├── syntax-types.md
│   │   └── library-integration.md
│   │
│   ├── managing-agents/        # Agent lifecycle
│   │   ├── SKILL.md
│   │   ├── temp-agents.md
│   │   ├── promotion.md
│   │   ├── cleanup.md
│   │   └── namespacing.md
│   │
│   ├── debugging-workflows/    # Error handling & debugging
│   │   ├── SKILL.md
│   │   ├── common-errors.md
│   │   ├── steering.md
│   │   └── recovery.md
│   │
│   ├── optimizing-workflows/   # Performance optimization
│   │   ├── SKILL.md
│   │   ├── parallel-execution.md
│   │   ├── variable-passing.md
│   │   └── best-practices.md
│   │
│   ├── using-templates/        # Template management
│   │   ├── SKILL.md
│   │   ├── template-format.md
│   │   ├── parameters.md
│   │   └── examples.md
│   │
│   └── meta/                   # Meta skills
│       └── writing-orchestration-skills/
│           └── SKILL.md
│
├── library/                     # Referenced from skills
│   └── syntax/                  # Custom syntax library
│
├── examples/                    # Workflow templates
│   └── *.flow
│
└── docs/                        # Developer docs only
    └── architecture/            # Not for Claude, for humans
```

## Implementation Plan

### Phase 1: Create Core Skills (Priority: HIGH)

#### 1.1 Creating Workflows Skill
**Migracja:** agents/workflow-socratic-designer.md → skills/creating-workflows/

```markdown
---
name: creating-workflows
description: Creates orchestration workflows from natural language using Socratic questioning. Use when user wants to create, design, or plan a multi-agent workflow, mentions automation, or asks "how do I orchestrate this?"
---

# Creating Orchestration Workflows

## When to Use

Activate when user:
- Describes multi-step process they want to automate
- Mentions "workflow", "orchestration", "automate", "coordinate"
- Asks "how do I create a workflow?"
- Wants to connect multiple agents

## Socratic Method Approach

See [socratic-method.md](socratic-method.md) for complete questioning strategy.

**Quick Start:**
1. Understand intent (what user wants to achieve)
2. Identify pattern (sequential, parallel, conditional)
3. Ask clarifying questions
4. Generate workflow syntax
5. Offer to save as template

## Common Patterns

See [patterns.md](patterns.md):
- Sequential processing
- Parallel execution
- Conditional branching
- Error handling with retry
- Review checkpoints

## Examples

See [examples.md](examples.md) for complete workflow examples.
```

**Files to create:**
- `skills/creating-workflows/SKILL.md` (overview)
- `skills/creating-workflows/socratic-method.md` (from agents/workflow-socratic-designer.md)
- `skills/creating-workflows/patterns.md` (from docs/reference/examples.md)
- `skills/creating-workflows/examples.md` (from examples/*.flow with explanations)

#### 1.2 Executing Workflows Skill
**Migracja:** commands/run.md + docs/core/ → skills/executing-workflows/

```markdown
---
name: executing-workflows
description: Executes orchestration workflows with visualization, steering, and error recovery. Use when user wants to run a workflow, mentions execution, or when workflow syntax is provided.
---

# Executing Orchestration Workflows

## Quick Execution

```flow
step1:"task" -> step2:"task" -> step3:"task"
```

Just provide workflow syntax, I'll handle execution automatically.

## Syntax Reference

See [syntax-reference.md](syntax-reference.md) for complete syntax.

**Operators:**
- `->` Sequential
- `||` Parallel
- `~>` Conditional
- `@label` Checkpoint
- `[]` Subgraph

## Execution Process

1. **Parse** - Analyze workflow syntax
2. **Visualize** - Show execution graph
3. **Execute** - Run agents with progress updates
4. **Steer** - Interactive control at checkpoints
5. **Recover** - Handle errors gracefully

See [execution-flow.md](execution-flow.md) for details.

## Agent Types

See [agents.md](agents.md):
- Built-in agents (Explore, general-purpose)
- Plugin agents (orchestration:agent-name)
- Temp agents ($custom-name)

## Examples

See [examples/](examples/):
- [sequential.md](examples/sequential.md) - Linear workflows
- [parallel.md](examples/parallel.md) - Concurrent execution
- [conditional.md](examples/conditional.md) - If/else logic
```

**Files to create:**
- `skills/executing-workflows/SKILL.md`
- `skills/executing-workflows/syntax-reference.md` (from docs/reference/syntax.md)
- `skills/executing-workflows/operators.md` (detailed operator docs)
- `skills/executing-workflows/agents.md` (agent types & namespacing)
- `skills/executing-workflows/execution-flow.md` (from docs/core/executor.md)
- `skills/executing-workflows/examples/*.md` (categorized examples)

#### 1.3 Managing Agents Skill
**Nowy:** Konsolidacja agent management

```markdown
---
name: managing-agents
description: Manages temporary and defined agents, including creation, promotion, cleanup, and namespacing. Use when user creates custom agents, asks about agent lifecycle, or mentions temp agents.
---

# Managing Orchestration Agents

## Agent Types

**Built-in agents**: Explore, general-purpose, code-reviewer
**Plugin agents**: orchestration:agent-name (from this plugin)
**Temp agents**: $custom-name (workflow-specific, auto-cleanup)

## Creating Temp Agents

Temp agents are markdown files in `temp-agents/` directory.

See [temp-agents.md](temp-agents.md) for format and examples.

## Agent Promotion

After workflow completion, temp agents can be promoted to permanent.

See [promotion.md](promotion.md) for promotion process.

## Cleanup Process

See [cleanup.md](cleanup.md):
- Automatic cleanup after workflow
- JSON files removed
- Temp agents deleted (unless promoted)
- Templates preserved

## Namespacing

See [namespacing.md](namespacing.md):
- Plugin agents: `orchestration:agent-name`
- Automatic prefixing
- Resolution algorithm
```

**Files to create:**
- `skills/managing-agents/SKILL.md`
- `skills/managing-agents/temp-agents.md` (from docs/features/temporary-agents.md)
- `skills/managing-agents/promotion.md` (from docs/features/agent-promotion.md)
- `skills/managing-agents/cleanup.md` (from docs/reference/cleanup-and-namespacing.md)
- `skills/managing-agents/namespacing.md` (namespace conventions)

### Phase 2: Create Supporting Skills (Priority: MEDIUM)

#### 2.1 Designing Syntax Skill
**Migracja:** agents/workflow-syntax-designer.md → skills/designing-syntax/

#### 2.2 Debugging Workflows Skill
**Migracja:** docs/features/error-handling.md + docs/core/steering.md

#### 2.3 Using Templates Skill
**Migracja:** commands/template.md + docs/features/templates.md

#### 2.4 Optimizing Workflows Skill
**Nowy:** Best practices i performance

### Phase 3: Deprecate Commands (Priority: LOW)

**Keep:**
- `/orchestrate` - Quick workflow execution (thin wrapper)
- `/help` - Plugin help

**Remove:**
- `/create` → Use `creating-workflows` skill (auto-activated)
- `/run` → Use `executing-workflows` skill (auto-activated)
- `/template` → Use `using-templates` skill (auto-activated)
- `/explain` → Use `executing-workflows` skill
- `/examples` → Embedded in skills
- `/menu` → Not needed with skills

## Benefits Analysis

### Context Compression

**Before (Commands):**
```
User: "Create a workflow that..."
Claude loads: ALL of run.md (500+ lines)
Token usage: ~1500 tokens
```

**After (Skills):**
```
User: "Create a workflow that..."
Claude loads: creating-workflows/SKILL.md (100 lines)
Token usage: ~300 tokens
If needed: Load socratic-method.md (+200 tokens)
Total: ~500 tokens (66% reduction)
```

### Auto-Discovery

**Before:**
```
User: "I need to coordinate multiple agents"
Claude: Doesn't know about orchestration
User has to: Manually discover /orchestrate command
```

**After:**
```
User: "I need to coordinate multiple agents"
Claude: Automatically activates creating-workflows skill
Suggests: "I can help create an orchestration workflow..."
```

### Progressive Disclosure

**Before:**
```
SKILL.md: 500 lines of everything
Always loaded: All content (wasted tokens)
```

**After:**
```
SKILL.md: 100 lines overview + links
Loaded on demand:
  - socratic-method.md (only when questioning)
  - patterns.md (only when user asks about patterns)
  - examples.md (only when user needs examples)
```

## Migration Strategy

### Step 1: Create Parallel Structure
- Create new skills/ directory structure
- Don't delete old commands yet
- Test skills in parallel

### Step 2: Update Documentation
- Update README to point to skills
- Add deprecation notices to old commands
- Update examples to use skills

### Step 3: Gradual Deprecation
- Mark old commands as deprecated
- Redirect to skills
- Remove after 2-week transition

### Step 4: Cleanup
- Remove deprecated commands
- Remove unused docs
- Archive old structure

## Implementation Checklist

### Phase 1: Core Skills
- [ ] Create skills/creating-workflows/ structure
- [ ] Migrate workflow-socratic-designer.md content
- [ ] Create socratic-method.md with progressive disclosure
- [ ] Create patterns.md from examples
- [ ] Test auto-discovery

- [ ] Create skills/executing-workflows/ structure
- [ ] Migrate run.md content with progressive disclosure
- [ ] Create syntax-reference.md
- [ ] Create operators.md
- [ ] Create agents.md with namespacing docs
- [ ] Create execution-flow.md
- [ ] Test execution with new skill

- [ ] Create skills/managing-agents/ structure
- [ ] Consolidate agent management docs
- [ ] Create temp-agents.md
- [ ] Create promotion.md
- [ ] Create cleanup.md
- [ ] Create namespacing.md
- [ ] Test agent lifecycle

### Phase 2: Supporting Skills
- [ ] Create skills/designing-syntax/
- [ ] Create skills/debugging-workflows/
- [ ] Create skills/using-templates/
- [ ] Create skills/optimizing-workflows/

### Phase 3: Deprecation
- [ ] Add deprecation notices to old commands
- [ ] Update README
- [ ] Test migration path
- [ ] Remove deprecated commands after 2 weeks

## Success Metrics

### Token Usage
- **Target**: 40-60% reduction in average token usage per workflow creation
- **Measure**: Compare token counts before/after for same tasks

### Auto-Discovery
- **Target**: 80%+ of workflow tasks auto-discover skills without manual invocation
- **Measure**: Test common user phrases, track skill activation

### User Experience
- **Target**: Faster response times (less context to process)
- **Measure**: Time from user request to first response

### Maintainability
- **Target**: Easier to update docs (change one file, not multiple commands)
- **Measure**: Time to add new feature to documentation

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Create Phase 1.1** (creating-workflows skill) as proof of concept
3. **Measure impact** (tokens, discovery, speed)
4. **Iterate** based on results
5. **Roll out** Phase 1.2 and 1.3
6. **Complete** Phase 2 and 3

## Appendix: Skill Naming Reference

Following Claude best practices (gerund form):

- ✅ `creating-workflows` (gerund)
- ✅ `executing-workflows` (gerund)
- ✅ `managing-agents` (gerund)
- ✅ `designing-syntax` (gerund)
- ✅ `debugging-workflows` (gerund)
- ✅ `optimizing-workflows` (gerund)
- ✅ `using-templates` (gerund)

Avoid:
- ❌ `workflow-creator` (not gerund)
- ❌ `orchestrate` (too generic)
- ❌ `helper` (vague)

## References

- [Claude Code Skills Documentation](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Skill Authoring Best Practices](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices)
- [superpowers plugin](https://github.com/obra/superpowers) - Example structure
- [anthropics/skills](https://github.com/anthropics/skills) - Official examples
