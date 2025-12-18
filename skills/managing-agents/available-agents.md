# Available Agents for Orchestration Workflows

This document lists all agents available for use in orchestration workflows.

## Built-in Claude Code Agents

These agents are always available in Claude Code and can be used in workflows:

- **general-purpose**: General-purpose agent for researching complex questions, searching for code, and executing multi-step tasks
- **explore**: Fast agent specialized for exploring codebases with configurable thoroughness levels (quick, medium, very thorough)
- **plan**: Fast agent specialized for planning implementations with configurable thoroughness levels

## Registered External Agents

No external agents are currently registered. To import agents from `~/.claude/agents/`, run `/orchestration:init` and select agents to import.

### Available for Import

The following agents were discovered in your `~/.claude/agents/` directory:

1. **implementation-architect**: Plans detailed implementation of features, systems, or components before coding
2. **jwt-keycloak-security-auditor**: Audits and enhances security of JWT authentication and Keycloak implementations
3. **code-optimizer**: Improves performance and efficiency of existing code
4. **react-native-component-reviewer**: Reviews React Native component code for adherence to single responsibility principle
5. **expert-code-implementer**: Implements specific coding tasks or features based on requirements

## Using Agents in Workflows

### Sequential Execution

```
explore -> plan -> implement
```

This runs agents one after another, passing output from one to the next.

### Parallel Execution

```
audit || optimize || review
```

This runs multiple agents concurrently on independent tasks.

### Conditional Execution

```
explore ~> plan
```

This runs the second agent only if the first succeeds.

### Example Workflows

**Feature Implementation:**
```
implementation-architect -> expert-code-implementer -> code-optimizer
```

**Security Review:**
```
explore || jwt-keycloak-security-auditor
```

**Component Development:**
```
expert-code-implementer -> react-native-component-reviewer -> code-optimizer
```

## Notes

- External agents must be imported via `/orchestration:init` before use
- Agent names must match exactly (case-sensitive)
- Use agent registry at `skills/managing-agents/external-agents.json` to see imported agents
