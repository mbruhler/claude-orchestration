# Custom MCP Integrations

Custom MCP integrations wrap MCP server tools for use in orchestration workflows.

## Format

```markdown
---
name: mcp:server:tool
type: mcp
description: What this MCP tool does
server: server-name
tool: tool-name
params: [param1, param2]
---

# MCP Tool Name

Detailed explanation of the MCP tool.

## Server
The MCP server that provides this tool

## Tool
The specific tool from that server

## Parameters
- param1: Description and type
- param2: Description and type

## Usage
previous-step -> mcp:server:tool:"param-value" -> next-step
```

## Naming Convention

Format: `mcp:<server>:<tool>`

Examples:
- `mcp:supabase:execute_sql` - Execute SQL on Supabase
- `mcp:github:create_pr` - Create GitHub PR
- `mcp:slack:send_message` - Send Slack message

Create MCP wrappers when you need to:
- Integrate MCP servers with workflows
- Make MCP tools composable
- Pass workflow data to MCP tools

## Examples

See examples for Supabase, GitHub, and other MCP integrations.
