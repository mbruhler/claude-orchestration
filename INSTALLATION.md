# Orchestration Plugin Installation

## Plugin Structure

The orchestration plugin has been created with the following structure:

```
~/.claude/plugins/repos/orchestration/
├── .claude-plugin/
│   ├── plugin.json           # Plugin metadata
│   └── marketplace.json      # Marketplace configuration
├── commands/
│   └── orchestrate.md        # Main orchestration command (13KB)
├── skills/
│   └── using-orchestration/
│       └── SKILL.md          # Discovery skill (2.1KB)
├── docs/
│   ├── reference/
│   │   ├── examples.md       # Example gallery
│   │   └── best-practices.md # Guidelines and patterns
│   ├── features/
│   │   ├── templates.md      # Template system docs
│   │   └── error-handling.md # Error recovery docs
│   └── topics/
│       └── syntax.md         # Syntax reference
├── README.md                  # Plugin documentation
└── INSTALLATION.md            # This file
```

## Installation Options

### Option 1: Use from Current Location (Recommended for Development)

The plugin is already in a standard plugin location. To activate it, add it to your Claude Code configuration.

**No action needed** - The plugin is ready to use from its current location.

### Option 2: Install via Plugin Command

If you want to formally install the plugin:

1. Add as local marketplace:
```
/plugin marketplace add ~/.claude/plugins/repos/orchestration
```

2. Install the plugin:
```
/plugin install orchestration@local
```

### Option 3: Create Git Repository and Share

To share with others or use across machines:

1. Initialize git repository:
```bash
cd ~/.claude/plugins/repos/orchestration
git init
git add .
git commit -m "Initial commit: Orchestration plugin v1.0.0"
```

2. Push to remote (GitHub, GitLab, etc.):
```bash
git remote add origin <your-repo-url>
git push -u origin main
```

3. Others can install from your repository:
```
/plugin marketplace add https://github.com/your-username/orchestration
/plugin install orchestration
```

## Verification

### Check Plugin Files

```bash
ls -lh ~/.claude/plugins/repos/orchestration/{.claude-plugin,commands,skills/using-orchestration}/*.{json,md}
```

Expected output:
- plugin.json (364B)
- marketplace.json (491B)
- orchestrate.md (13KB)
- SKILL.md (2.1KB)
- README.md (5.6KB)
- Plus documentation files

### Test the Command

In Claude Code, try:
```
/orchestrate help
```

You should see the orchestration quick reference.

### Test the Skill

The `using-orchestration` skill should automatically be available. When you mention coordinating multiple agents or describe a workflow, Claude should proactively suggest using `/orchestrate`.

## Usage

### Basic Commands

- `/orchestrate` - Interactive menu
- `/orchestrate help` - Quick reference
- `/orchestrate examples` - Example gallery
- `/orchestrate explain <topic>` - Topic documentation
- `/orchestrate <workflow-syntax>` - Execute workflow

### Example Workflows

**Simple sequential:**
```
/orchestrate explore:"find bugs" -> review -> implement
```

**Parallel execution:**
```
/orchestrate [test || lint || security] -> deploy
```

**With retry loop:**
```
/orchestrate @try -> fix -> test (if failed)~> @try
```

## Features

### 1. Discovery Skill

Claude will proactively suggest orchestration when you:
- Mention coordinating multiple agents
- Describe workflows or pipelines
- Talk about parallel execution
- Need retry logic or conditionals

### 2. Slash Command

The `/orchestrate` command provides:
- Interactive menu for easy access
- Workflow parsing and execution
- Real-time visualization
- Interactive steering
- Error recovery
- Template management

### 3. Comprehensive Documentation

All documentation is split into focused files:
- **commands/orchestrate.md** - Main entry point (13KB)
- **docs/reference/** - Examples and best practices
- **docs/features/** - Template system and error handling
- **docs/topics/** - Topic-specific documentation

## What Changed

### From Original Slash Command

**Before:**
- Single monolithic file: 72KB (2232 lines)
- All documentation inline
- Hard to maintain
- Slow to load

**After:**
- Plugin structure with focused files
- Main command: 13KB (376 lines) - 83% reduction
- Documentation split into contextual files
- Fast loading - only loads what's needed
- Easy to maintain and extend

### File Size Comparison

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| Main command | 72KB | 13KB | 83% |
| Total (with docs) | 72KB | ~50KB | More organized |

The total size is smaller, but more importantly, the documentation is now modular and only loaded when needed.

## Configuration

### Plugin Metadata

Defined in `.claude-plugin/plugin.json`:
- **Name:** orchestration
- **Version:** 1.0.0
- **Description:** Multi-agent workflow orchestration
- **Keywords:** workflows, orchestration, multi-agent, parallel-execution

### Marketplace Configuration

Defined in `.claude-plugin/marketplace.json`:
- Can be added to plugin marketplaces
- Supports local and remote installation
- Version managed through git

## Troubleshooting

### Plugin Not Found

**Symptom:** `/orchestrate` command not available

**Solutions:**
1. Verify files exist in `~/.claude/plugins/repos/orchestration/`
2. Check plugin.json is valid JSON
3. Try restarting Claude Code
4. Install via `/plugin install` command

### Skill Not Working

**Symptom:** Claude doesn't suggest orchestration

**Solutions:**
1. Verify SKILL.md exists in `skills/using-orchestration/`
2. Check skill frontmatter is valid YAML
3. Skills may take a moment to load on first use
4. Try explicitly mentioning "workflow" or "coordinate agents"

### Documentation Not Loading

**Symptom:** "explain" or "examples" commands don't show content

**Solutions:**
1. Verify docs/ directory structure is correct
2. Check file paths in orchestrate.md match actual files
3. Ensure markdown files are properly formatted
4. File paths are relative to plugin root

### Command Not Executing

**Symptom:** Command parses but doesn't execute

**Solutions:**
1. Check for syntax errors in workflow
2. Verify agent names are correct
3. Ensure all subgraphs are closed
4. Check quotes are balanced
5. Try simpler workflow first

## Next Steps

### For Development

1. Add more topic documentation files
2. Create additional skills for specific contexts
3. Add example templates in docs/reference/
4. Enhance error messages
5. Add visualization improvements

### For Distribution

1. Initialize git repository
2. Push to GitHub/GitLab
3. Create marketplace entry
4. Share with team
5. Collect feedback and iterate

### For Users

1. Read the README.md for overview
2. Try `/orchestrate help` for quick reference
3. Explore `/orchestrate examples` for patterns
4. Create templates for common workflows
5. Share useful templates with team

## Support

- **Documentation:** Use `/orchestrate explain <topic>`
- **Examples:** Use `/orchestrate examples`
- **Quick Reference:** Use `/orchestrate help`
- **README:** See `README.md` in plugin directory

## Version History

### v1.0.0 (Current)
- Initial plugin structure
- Main orchestration command (13KB)
- Discovery skill for proactive suggestions
- Comprehensive documentation split into focused files
- Example gallery
- Template system documentation
- Error handling documentation
- Syntax reference
- Best practices guide

## Migration Notes

### From Original Slash Command

The original `/orchestrate` command at `~/.claude/commands/orchestrate.md` has been:
1. **Removed** - Deleted to avoid conflicts
2. **Replaced** - With plugin version at `~/.claude/plugins/repos/orchestration/commands/orchestrate.md`
3. **Enhanced** - Now includes skill for discovery
4. **Modularized** - Documentation split into focused files

All functionality from the original is preserved and enhanced in the plugin version.

## License

[Add your license here]

## Credits

Created by: mbroler
Plugin system: Claude Code plugin architecture
Based on: Original orchestration slash command
