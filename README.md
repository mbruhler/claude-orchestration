
<div align="right">
  <details>
    <summary >🌐 Language</summary>
    <div>
      <div align="center">
        <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=en">English</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=zh-CN">简体中文</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=zh-TW">繁體中文</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=ja">日本語</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=ko">한국어</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=hi">हिन्दी</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=th">ไทย</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=fr">Français</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=de">Deutsch</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=es">Español</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=it">Italiano</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=ru">Русский</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=pt">Português</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=nl">Nederlands</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=pl">Polski</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=ar">العربية</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=fa">فارسی</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=tr">Türkçe</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=vi">Tiếng Việt</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=id">Bahasa Indonesia</a>
        | <a href="https://openaitx.github.io/view.html?user=mbruhler&project=claude-orchestration&lang=as">অসমীয়া</
      </div>
    </div>
  </details>
</div>

# 🎭 Orchestration Plugin for Claude Code

> _Like N8N in Claude Code_

### If you like the project, consider ⭐ it!<br/>

---
## Advertisment
Check out my new SaaS VideoEffectVibe - turn prompts into editable, configurable overlays, texts, lower thirds. Forget boring templates, make it custom and yours, from just a prompt!

[Video Effect Vibe - Click to go to the website](https://videoeffectvibe.com)
---
## **Multi-agent workflow orchestration.** Chain AI agents to automate complex tasks using natural language or declarative syntax.

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-blue)](https://claude.com/claude-code)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Contributing
Feel free to open a PR and contribute to the project!

## Installation

### 1. Add Plugin Marketplace

First, add the orchestration marketplace to your Claude Code:

```bash
/plugin marketplace add mbruhler/claude-orchestration
```

### 2. Install the Plugin

```bash
/plugin install orchestration@mbruhler
```

Or use the interactive menu:

```bash
/plugin
```

Then select **"Browse Plugins"** → find **orchestration** → **Install**

### 3. Verify Installation

Check that the plugin is installed:

```bash
/help
```

You should see orchestration commands like `/orchestration:menu`, `/orchestration:init`, etc.

---

## Quick Start

### 0. Import Your Custom Agents (Optional)
```
/orchestration:init
```

Import your custom agents from `~/.claude/agents/` into the orchestration plugin.

**Example:**
```
/orchestration:init
→ Select agents to import
→ Agents become available as expert-code-implementer, etc. and the plugin can create workflows using them
```

### 1. Natural Language
```
"Create a workflow that fetches 10 Reddit posts about startups,
analyzes competition, and shows a ratings table"
```

The plugin:
- ✅ Creates necessary temp scripts (Python/Node.js)
- ✅ Guides you through clickable questions
- ✅ Generates and executes optimized workflow
- ✅ Returns formatted results

### 2. Direct Syntax
```flow
# Parallel bug investigation
[
  Explore:"Find related code":code ||
  general-purpose:"Check recent changes":changes ||
  general-purpose:"Search similar issues":similar
] ->
general-purpose:"Identify root cause from {code}, {changes}, {similar}":analysis ->
@review:"Approve fix?" ->
general-purpose:"Implement fix and run tests":fix ->
general-purpose:"Commit changes with detailed message"
```

### 3. Templates
```
"Use the TDD implementation template"
```

---

## Core Features

### Flow Control
```flow
# Sequential
step1 -> step2 -> step3

# Parallel
[task1 || task2 || task3]

# Conditional
test -> (if passed)~> deploy
     -> (if failed)~> rollback
```

### Auto Temp Scripts
Automatically creates Python/Node.js scripts for:
- 🌐 Web scraping (BeautifulSoup, Selenium)
- 📡 APIs (Reddit, Twitter, GitHub)
- 📊 Data processing (pandas, NumPy)
- 🗄️ Database queries

### Manual Checkpoints
```flow
build:"Compile app" ->
@review:"Check output. Continue?" ->
deploy:"Deploy to production"
```

### Visual Progress
```
╔════════════════════════════════════╗
║  TDD Implementation                ║
╠════════════════════════════════════╣
║    [Write Test] ●                  ║
║         │                          ║
║    [Implement] ○                   ║
║         │                          ║
║    [@Review] ○                     ║
╠════════════════════════════════════╣
║ Status: Writing test...            ║
╚════════════════════════════════════╝
```

---

## ⏰ Autonomous Scheduling & Headless Mode

With Claude Code's native `/loop` and Desktop Scheduling tools, your workflows don't have to be run manually. Turn your orchestrations into autonomous background workers!

### Syntax Integration
Add the `@schedule` directive to the top of your `.flow` file to instruct Claude to run it repeatedly:

```flow
# Runs daily at 8:00 AM automatically
@schedule("0 8 * * *")

[
  Explore:"Check recent GitHub PRs":prs ||
  general-purpose:"Check open Sentry issues":bugs
] ->
general-purpose:"Draft daily standup summary from {prs} and {bugs}":summary ->
general-purpose:"Append {summary} to standup_log.md"
```

### Unattended Checkpoints
When running in the background, you can't manually approve checkpoints. Use fallback behaviors to keep things moving:

```flow
# Skip manual review if running headless/scheduled
@review(fallback=skip):"Approve code changes?" 

# Log to a file instead of blocking the terminal
@approval(fallback=notify):"Verify system state"
```

---

## 🛡️ Reliability & Ecosystem (NEW!)

### State Snapshots & Recovery
Never lose workflow progress to a rate-limit, crash, or accidental exit. The plugin automatically saves variables and node status to `.orchestration/state.json`. 

If your workflow dies at step 14 of 15, simply tell Claude:
`"Resume the orchestration workflow"` 
It will load the state, skip steps 1-13, inject the variables, and finish step 14.

### Community Workflow Registry (The "NPM" for Agents)
Stop writing workflows from scratch. Pull proven architectures from the community registry directly into your workspace.

```bash
# Pull from the official registry
/orchestration:pull tdd-autopilot

# Pull directly from any GitHub repo
/orchestration:pull username/repo/my-workflow.flow
```
*(Want to publish yours? Submit a PR to `registry/index.json` in this repo!)*

### 🧠 Semantic Routing (LLM Switch Statements)
Replace rigid text-matching conditions with dynamic, "thinking" trees.

```flow
general-purpose:"Read the latest user support ticket":ticket ->
route({ticket}) => [
  (if "UI, CSS, or layout bug") ~> frontend-agent:"Fix styling" ||
  (if "Database, 500 error, crash") ~> backend-agent:"Fix server" 
]
```

### 🧑‍💻 Human-as-a-Tool (Reverse Delegation)
When Claude gets stuck (e.g. Needs an MFA code or Captcha solved), the AI can pause and orchestrate *you* to help it out, capturing your input as a variable.

```flow
@ask-human:"Please solve the Captcha and paste the success token here":token ->
general-purpose:"Resume scraping using {token}"
```

### 🧪 Dry-Run Workflow Unit Tests (`.flow.test`)
Test your massive orchestration files without making expensive API calls. Mock your variables in the YAML frontmatter and the CLI will visually trace the execution path based on the mocked data.

---

## Syntax Reference

| Syntax | Meaning | Example |
|--------|---------|---------|
| `->` | Sequential | `step1 -> step2` |
| `||` | Parallel | `[step1 \|\| step2]` |
| `~>` | Conditional | `(if passed)~> next` |
| `@label` | Checkpoint | `@review-code` |
| `:var` | Capture output | `analyze:"task":result` |
| `{var}` | Use variable | `"Process {result}"` |
| `$agent` | Temp agent | `$scanner:"Scan"` |

---

## Built-in Agents

- **Explore** - Fast codebase exploration and search
- **Plan** - Planning and breaking down tasks
- **general-purpose** - Versatile agent for complex multi-step tasks

---

## Examples

### Autonomous Social Scraper (Scheduled)
```flow
# Run every 6 hours in the background
@schedule("every 6h")

general-purpose:"Create Python PRAW script to fetch 10 r/startups posts.
                 Return JSON with title, url, description":posts ->

[
  general-purpose:"Research competition for post {posts[0]}":a1 ||
  general-purpose:"Research competition for post {posts[1]}":a2 
] ->

general-purpose:"Rate ideas (1-10) on competition, market, feasibility.
                 Create markdown table":ratings ->

# Unattended Checkpoint logs to file instead of hanging the scheduler
@review(fallback=notify):"Review {ratings}. Ban any?" ->

general-purpose:"Append top 3 opportunities summary to startup_leads.md"
```

### Reddit Startup Analyzer (Manual)
```flow
general-purpose:"Create Python PRAW script to fetch 10 r/startups posts.
                 Return JSON with title, url, description":posts ->

[
  general-purpose:"Research competition for post {posts[0]}":a1 ||
  general-purpose:"Research competition for post {posts[1]}":a2 ||
  # ... parallel analyses
] ->

general-purpose:"Rate ideas (1-10) on competition, market, feasibility.
                 Create markdown table":ratings ->

@review:"Review {ratings}. Ban any?" ->

general-purpose:"Generate top 3 opportunities summary"
```

### TDD Implementation
```flow
# RED: Write failing test
general-purpose:"Write failing test for the feature":test ->
general-purpose:"Run test suite - verify it fails":red_result ->
@review-coverage:"Test coverage sufficient?" ->

# GREEN: Minimal implementation
general-purpose:"Write minimal code to pass the test":impl ->
general-purpose:"Run test suite - verify it passes":green_result ->
@review:"Code quality OK?" ->

# REFACTOR: Clean up
general-purpose:"Refactor code and add documentation":refactored ->
general-purpose:"Final test run and commit"
```

### Bug Investigation
```flow
# Parallel investigation
[
  Explore:"Find error pattern in codebase":code ||
  general-purpose:"Analyze error logs":logs ||
  general-purpose:"Check recent commits":commits ||
  general-purpose:"Search for similar bugs":known
] ->

# Diagnosis
general-purpose:"Identify root cause from {code}, {logs}, {commits}, {known}":cause ->
@review:"Diagnosis correct?" ->

# Fix with testing
general-purpose:"Write regression test for the bug":test ->
general-purpose:"Implement fix":fix ->

# Verification
[
  general-purpose:"Run regression test" ||
  general-purpose:"Run full test suite" ||
  general-purpose:"Perform smoke test"
] ->

@review:"Approve deployment?" ->
general-purpose:"Commit with detailed bug fix message"
```

---

## Project Structure

```
orchestration/
├── skills/              # Auto-activating skills
│   ├── creating-workflows/
│   ├── executing-workflows/
│   ├── managing-agents/
│   ├── managing-temp-scripts/
│   ├── designing-syntax/
│   ├── debugging-workflows/
│   └── using-templates/
├── agents/              # Permanent agents
├── temp-agents/         # Ephemeral (auto-cleaned)
├── temp-scripts/        # Generated scripts
├── examples/            # Templates (.flow)
└── docs/                # Documentation
```

---

## Advanced

### Standalone Execution
```bash
# Headless (no checkpoints)
claude -p "Execute @examples/tdd-implementation.flow"

# With parameters
claude -p "/orchestration:run $(cat workflow.flow)" \
  --output-format json
```

### Agent Promotion
```
Workflow complete!

Temp agents: security-scanner, api-wrapper

Save as permanent?
[Save all] [Save security-scanner] [Delete all]
```

### Template Parameters
```yaml
---
name: api-integration
parameters:
  - API_URL: "https://api.example.com"
  - NUM_ITEMS: 10
---

workflow: |
  general-purpose:"Fetch {{NUM_ITEMS}} from {{API_URL}}":data ->
  general-purpose:"Format results":output
```

---

## Troubleshooting

**Workflow hangs**
→ Checkpoint requires user response or remove for headless

**Temp script fails**
→ Check `temp-scripts/` for generated file
→ Verify API credentials and dependencies

**Agent not found**
→ Built-in: exact names (Explore, general-purpose)
→ Plugin: use `orchestration:` prefix
→ Temp: use `$` prefix

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=mbruhler/claude-orchestration&type=date&legend=top-left)](https://www.star-history.com/#mbruhler/claude-orchestration&type=date&legend=top-left)

---

## Support

- 📖 [Documentation](docs/)
- 💬 [Discussions](https://github.com/anthropics/orchestration/discussions)
- 🐛 [Issues](https://github.com/anthropics/orchestration/issues)

---

**MIT License** | Built for Claude Code community
