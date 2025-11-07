const fs = require('fs');
const path = require('path');

// Built-in Claude Code agents
const BUILTIN_AGENTS = [
  'general-purpose',
  'Explore',
  'Plan',
  'code-reviewer',
  'expert-code-implementer',
  'implementation-architect',
  'code-optimizer',
  'react-native-component-reviewer',
  'jwt-keycloak-security-auditor',
  'statusline-setup'
];

/**
 * Load the agent registry from disk
 * @returns {Object} Registry object mapping agent names to metadata
 */
function loadRegistry() {
  const registryPath = path.join(__dirname, '../agents/registry.json');
  try {
    return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  } catch (error) {
    console.error('Failed to load agent registry:', error.message);
    return {};
  }
}

/**
 * Save the agent registry to disk
 * @param {Object} registry - Registry object to save
 */
function saveRegistry(registry) {
  const registryPath = path.join(__dirname, '../agents/registry.json');
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
}

/**
 * Find an agent by name and determine its source
 * @param {string} name - Agent name to find
 * @returns {Object|null} {source: 'builtin'|'defined'|'temp', path: string} or null if not found
 */
function findAgent(name) {
  // Check built-in agents
  if (BUILTIN_AGENTS.includes(name)) {
    return { source: 'builtin', path: null };
  }

  // Check defined agents
  const definedPath = path.join(__dirname, '../agents', `${name}.md`);
  if (fs.existsSync(definedPath)) {
    return { source: 'defined', path: definedPath };
  }

  // Check temp agents
  const tempPath = path.join(__dirname, '../temp-agents', `${name}.md`);
  if (fs.existsSync(tempPath)) {
    return { source: 'temp', path: tempPath };
  }

  return null;
}

/**
 * List all defined agents
 * @returns {Array<string>} Array of defined agent names
 */
function listDefinedAgents() {
  const registry = loadRegistry();
  return Object.keys(registry);
}

/**
 * List all temp agents
 * @returns {Array<string>} Array of temp agent names
 */
function listTempAgents() {
  const tempDir = path.join(__dirname, '../temp-agents');
  if (!fs.existsSync(tempDir)) {
    return [];
  }
  return fs.readdirSync(tempDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

/**
 * Check if an agent name exists (any source)
 * @param {string} name - Agent name to check
 * @returns {boolean} True if agent exists
 */
function agentExists(name) {
  return findAgent(name) !== null;
}

/**
 * Extract description from agent markdown frontmatter
 * @param {string} markdown - Agent markdown content
 * @returns {string} Description or empty string
 */
function extractDescription(markdown) {
  const match = markdown.match(/description:\s*(.+)/);
  return match ? match[1].trim() : '';
}

/**
 * Promote a temp agent to a defined agent
 * @param {string} name - Agent name to promote
 * @param {string} newName - Optional new name (defaults to original name)
 * @returns {boolean} True if successful
 */
function promoteAgent(name, newName = null) {
  const targetName = newName || name;
  const tempPath = path.join(__dirname, '../temp-agents', `${name}.md`);
  const definedPath = path.join(__dirname, '../agents', `${targetName}.md`);

  if (!fs.existsSync(tempPath)) {
    console.error(`Temp agent not found: ${name}`);
    return false;
  }

  // Move file
  fs.renameSync(tempPath, definedPath);

  // Update registry
  const registry = loadRegistry();
  const agentContent = fs.readFileSync(definedPath, 'utf8');
  const description = extractDescription(agentContent);

  registry[targetName] = {
    file: `${targetName}.md`,
    description: description,
    created: new Date().toISOString().split('T')[0],
    usageCount: 0
  };

  saveRegistry(registry);
  return true;
}

/**
 * Delete a temp agent
 * @param {string} name - Agent name to delete
 * @returns {boolean} True if successful
 */
function deleteTempAgent(name) {
  const tempPath = path.join(__dirname, '../temp-agents', `${name}.md`);
  if (!fs.existsSync(tempPath)) {
    return false;
  }
  fs.unlinkSync(tempPath);
  return true;
}

/**
 * Increment usage count for a defined agent
 * @param {string} name - Agent name
 */
function incrementUsageCount(name) {
  const registry = loadRegistry();
  if (registry[name]) {
    registry[name].usageCount = (registry[name].usageCount || 0) + 1;
    saveRegistry(registry);
  }
}

module.exports = {
  loadRegistry,
  saveRegistry,
  findAgent,
  listDefinedAgents,
  listTempAgents,
  agentExists,
  extractDescription,
  promoteAgent,
  deleteTempAgent,
  incrementUsageCount,
  BUILTIN_AGENTS
};
