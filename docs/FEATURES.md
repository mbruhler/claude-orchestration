# Orchestration Features

Complete index of orchestration plugin features.

## Core Features

### Workflow Execution
- [Workflow Syntax](topics/syntax.md) - Complete syntax guide
- [Syntax Reference](reference/syntax.md) - Quick reference card (operators, agents, patterns)
- [Defined Agents](features/defined-agents.md) - Reusable agent definitions
- [Temporary Agents](features/temporary-agents.md) - Inline agent definitions
- [Variable Binding](reference/variable-binding.md) - Conditional variables and negative conditions

### Templates
- [Template System](features/templates.md)
- [Template Parameters](features/templates.md#parameter-substitution)
- [Custom Definitions](features/templates.md#custom-definitions)

### Error Handling
- [Error Recovery](features/error-handling.md)
- [Retry Patterns](features/error-handling.md#retry-patterns)
- [Rollback Strategies](features/error-handling.md#rollback)

## Core Implementation

Internal implementation documentation for developers and advanced users.

### Workflow Engine
- [Parser](core/parser.md) - Syntax parsing and AST generation
- [Executor](core/executor.md) - Workflow execution engine
- [Visualizer](core/visualizer.md) - ASCII visualization system
- [Steering](core/steering.md) - Interactive control and checkpoints

### Temporary Agents System
- [Temp Agents Parser](features/temporary-agents.md#parsing) - Parse-time transformation
- [Temp Agents Executor](features/temporary-agents.md#execution) - Variable interpolation and output capture
- [Temp Agents Directory](../temp-agents/) - Defined temp agents

**Available Temp Agents:**
- [Config Scanner](../temp-agents/config-scanner.md) - Configuration file analyzer
- [Reference Updater](../temp-agents/reference-updater.md) - Documentation reference specialist
- [Completeness Validator](../temp-agents/completeness-validator.md) - Structure validation specialist

## Advanced Features

### Natural Language Creation
- [Workflow Creation from Description](features/natural-language.md)
- [Socratic Questioning](features/natural-language.md#socratic-refinement-process)
- [Pattern Recognition](features/natural-language.md#generated-workflow-features)

### Custom Syntax
- [Custom Syntax Guide](topics/custom-syntax.md)
- [Global Syntax Library](topics/custom-syntax.md#scoping)
- [Syntax Types](topics/custom-syntax.md#syntax-types)

### Variable Binding
- [Variable Binding Reference](reference/variable-binding.md)
- [Negative Conditions](reference/variable-binding.md#negative-conditions)
- [Variable Naming Conventions](reference/variable-binding.md#variable-naming)

### Tool Integration
- [External Tools](topics/custom-syntax.md#8-tools)
- [MCP Integration](topics/custom-syntax.md#9-mcps)

## Reference

### Examples
- [Examples Gallery](reference/examples.md)
- [Template Workflows](../examples/README.md)
- [Best Practices](reference/best-practices.md)

### Agent System
- [Agent Registry](../agents/registry.json) - All defined agents
- [Temporary Agents Directory](../temp-agents/) - Active temp agents
- [Temp Agent Syntax](reference/temp-agents-syntax.md) - Syntax reference

### Library Syntax

Custom syntax definitions available globally across all workflows.

**Actions** (Reusable workflow fragments):
- [Plugin Deep Explore](../library/syntax/actions/plugin-deep-explore.md)
- [Find JSX Strings](../library/syntax/actions/find-jsx-strings.md)
- [Generate i18n Key](../library/syntax/actions/generate-i18n-key.md)
- [Update Translation Files](../library/syntax/actions/update-translation-files.md)

**Conditions** (Custom conditionals):
- [Critical Issues](../library/syntax/conditions/critical-issues.md)
- [Improvements Found](../library/syntax/conditions/improvements-found.md)

**Checkpoints** (Named review points):
- [Security Gate](../library/syntax/checkpoints/security-gate.md)

**Guards** (Pre-execution validation):
- [Require Clean Working Tree](../library/syntax/guards/require-clean-working-tree.md)

See [Custom Definitions](features/custom-definitions.md) for creating your own library syntax elements.

### Agents
- [Defined Agents](features/defined-agents.md) - Reusable agent definitions
- [Temporary Agents](features/temporary-agents.md) - Inline agent definitions
- [Agent Promotion](features/agent-promotion.md) - Converting temp to defined agents
- [Agent Registry](../agents/registry.json) - Available defined agents
- [Socratic Designer](../agents/workflow-socratic-designer.md) - Natural language workflow creation
- [Syntax Designer](../agents/workflow-syntax-designer.md) - Custom syntax element design

### Commands
- `/orchestration:create` - Create from natural language
- `/orchestrate` - Execute workflow or template (with interactive menu)
- `/orchestrate help` - Quick reference
- `/orchestrate examples` - Example gallery
- `/orchestrate explain <topic>` - Topic-specific docs

### Skills
- `using-orchestration` - General guidance
- `creating-workflows-from-description` - Proactive workflow creation suggestions

## Getting Started

1. **New to orchestration?** Start with [Quick Start](../README.md#quick-start)
2. **Want to learn syntax?** See [Workflow Syntax](topics/syntax.md)
3. **Prefer natural language?** Use [Natural Language Creation](features/natural-language.md)
4. **Need examples?** Browse [Examples Gallery](reference/examples.md)
5. **Building templates?** Read [Template System](features/templates.md)
6. **Need custom syntax?** See [Custom Syntax Guide](topics/custom-syntax.md)

## By Use Case

### Test-Driven Development
- [Natural Language: "implement with TDD"](features/natural-language.md#example-1-simple-tdd-workflow)
- [Example: TDD Workflow](reference/examples.md#5-tdd-workflow)
- Template: tdd-feature.flow

### Deployment Pipelines
- [Natural Language: "deploy with validation"](features/natural-language.md#example-2-deployment-pipeline)
- [Example: Deployment Pipeline](reference/examples.md#7-deployment-pipeline)
- Template: deploy-safe.flow

### Security Audits
- [Natural Language: "security audit"](features/natural-language.md#example-3-security-audit)
- [Example: Security Audit Pipeline](reference/examples.md#6-security-audit-pipeline)
- Template: security-audit.flow

### Bug Fixing
- [Example: Bug Fix Workflow](reference/examples.md#9-bug-fix-workflow)

### Code Refactoring
- [Example: Refactoring Workflow](reference/examples.md#8-refactoring-workflow)

## Support

- Questions? Use `/orchestrate help`
- Need examples? Use `/orchestrate examples`
- Deep dive? Use `/orchestrate explain <topic>`
- Issues? Check GitHub Issues
