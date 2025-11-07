#!/bin/bash

# Orchestration Plugin Installation Script
# This script installs the orchestration plugin and associated workflows

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Script directory (where this script is located)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Target directories
CLAUDE_DIR="$HOME/.claude"
PLUGIN_TARGET="$CLAUDE_DIR/plugins/repos/orchestration"
WORKFLOWS_TARGET="$CLAUDE_DIR/workflows"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Orchestration Plugin Installer          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if directory exists
check_directory() {
    if [ -d "$1" ]; then
        return 0
    else
        return 1
    fi
}

# Function to backup existing installation
backup_existing() {
    local target=$1
    if check_directory "$target"; then
        local backup="${target}.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${YELLOW}⚠ Existing installation found at: $target${NC}"
        echo -e "${YELLOW}  Creating backup at: $backup${NC}"
        mv "$target" "$backup"
        echo -e "${GREEN}✓ Backup created${NC}"
    fi
}

# Create .claude directory if it doesn't exist
echo -e "${BLUE}→ Checking Claude Code directory...${NC}"
if ! check_directory "$CLAUDE_DIR"; then
    echo -e "${YELLOW}  Creating $CLAUDE_DIR${NC}"
    mkdir -p "$CLAUDE_DIR"
fi
echo -e "${GREEN}✓ Claude directory ready${NC}"
echo ""

# Install plugin
echo -e "${BLUE}→ Installing plugin...${NC}"

# Backup existing plugin if present
backup_existing "$PLUGIN_TARGET"

# Create plugin directory structure
mkdir -p "$(dirname "$PLUGIN_TARGET")"

# Copy plugin files
if [ "$SCRIPT_DIR" != "$PLUGIN_TARGET" ]; then
    echo -e "  Copying plugin files from: $SCRIPT_DIR"
    echo -e "  To: $PLUGIN_TARGET"
    cp -r "$SCRIPT_DIR" "$PLUGIN_TARGET"
    echo -e "${GREEN}✓ Plugin files copied${NC}"
else
    echo -e "${GREEN}✓ Plugin already in target location${NC}"
fi
echo ""

# Install workflows if they exist in the distribution
echo -e "${BLUE}→ Installing workflow templates...${NC}"

# Check if workflows exist in the parent directory (for zip distribution)
WORKFLOWS_SOURCE=""
if [ -d "$SCRIPT_DIR/../../../workflows" ]; then
    WORKFLOWS_SOURCE="$SCRIPT_DIR/../../../workflows"
elif [ -d "$SCRIPT_DIR/../../workflows" ]; then
    WORKFLOWS_SOURCE="$SCRIPT_DIR/../../workflows"
fi

if [ -n "$WORKFLOWS_SOURCE" ]; then
    # Backup existing workflows
    backup_existing "$WORKFLOWS_TARGET"

    # Copy workflows
    mkdir -p "$WORKFLOWS_TARGET"
    cp -r "$WORKFLOWS_SOURCE"/* "$WORKFLOWS_TARGET/"
    echo -e "${GREEN}✓ Workflow templates installed${NC}"

    # Count installed workflows
    WORKFLOW_COUNT=$(find "$WORKFLOWS_TARGET" -name "*.flow" -type f | wc -l | tr -d ' ')
    echo -e "  Installed $WORKFLOW_COUNT workflow templates"
else
    echo -e "${YELLOW}⚠ No workflows found in distribution${NC}"
    echo -e "  Workflows can be created manually in: $WORKFLOWS_TARGET"
fi
echo ""

# Verify installation
echo -e "${BLUE}→ Verifying installation...${NC}"

ERRORS=0

# Check plugin files
if [ ! -f "$PLUGIN_TARGET/.claude-plugin/plugin.json" ]; then
    echo -e "${RED}✗ Missing: plugin.json${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ ! -f "$PLUGIN_TARGET/.claude-plugin/marketplace.json" ]; then
    echo -e "${RED}✗ Missing: marketplace.json${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ ! -f "$PLUGIN_TARGET/commands/orchestrate.md" ]; then
    echo -e "${RED}✗ Missing: orchestrate.md command${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ ! -f "$PLUGIN_TARGET/skills/using-orchestration/SKILL.md" ]; then
    echo -e "${RED}✗ Missing: SKILL.md${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All plugin files verified${NC}"
else
    echo -e "${RED}✗ Installation incomplete - $ERRORS files missing${NC}"
    exit 1
fi
echo ""

# Display summary
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Installation Complete!                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Plugin installed at:${NC}"
echo -e "  $PLUGIN_TARGET"
echo ""

if [ -n "$WORKFLOWS_SOURCE" ]; then
    echo -e "${BLUE}Workflows installed at:${NC}"
    echo -e "  $WORKFLOWS_TARGET"
    echo ""
fi

echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Restart Claude Code (if running)"
echo -e "  2. Try: ${GREEN}/orchestrate help${NC}"
echo -e "  3. Try: ${GREEN}/orchestrate examples${NC}"
echo -e "  4. Read: ${GREEN}$PLUGIN_TARGET/README.md${NC}"
echo ""

echo -e "${BLUE}Quick test:${NC}"
echo -e "  In Claude Code, type: ${GREEN}/orchestrate help${NC}"
echo -e "  You should see the orchestration quick reference."
echo ""

echo -e "${YELLOW}Note: If the command isn't recognized immediately,${NC}"
echo -e "${YELLOW}      restart Claude Code to reload plugins.${NC}"
echo ""
