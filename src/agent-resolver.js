const agentManager = require('./agent-manager');

/**
 * Parse agent invocation from workflow syntax
 * @param {string} agentInvocation - e.g., "code-analyzer:\"Do something\":var"
 * @returns {Object} {agentType, instruction, capturesVariable}
 */
function parseAgentInvocation(agentInvocation) {
  // Pattern: agent-name:"instruction":var or agent-name:"instruction"
  const match = agentInvocation.match(/^([a-zA-Z0-9-_]+):"([^"]+)"(?::([a-zA-Z0-9_]+))?$/);

  if (!match) {
    throw new Error(`Invalid agent invocation syntax: ${agentInvocation}`);
  }

  const [, agentType, instruction, capturesVariable] = match;

  return {
    agentType,
    instruction,
    capturesVariable: capturesVariable || null
  };
}

/**
 * Resolve agent type to its source (builtin, defined, temp)
 * @param {string} agentType - Agent name
 * @returns {Object} {source: string, path: string|null}
 * @throws {Error} If agent not found
 */
function resolveAgent(agentType) {
  const agent = agentManager.findAgent(agentType);

  if (!agent) {
    throw new Error(`Unknown agent: ${agentType}. Agent not found in built-in, defined, or temp agents.`);
  }

  return agent;
}

/**
 * Extract variables used in instruction (e.g., "Fix {bugs}" -> ["bugs"])
 * @param {string} instruction - Agent instruction
 * @returns {Array<string>} Array of variable names
 */
function extractUsedVariables(instruction) {
  const matches = instruction.matchAll(/\{([a-zA-Z0-9_]+)\}/g);
  return Array.from(matches, m => m[1]);
}

/**
 * Interpolate variables in instruction
 * @param {string} instruction - Instruction with {var} placeholders
 * @param {Object} variables - Map of variable values
 * @returns {string} Interpolated instruction
 */
function interpolateVariables(instruction, variables) {
  return instruction.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, varName) => {
    if (!(varName in variables)) {
      throw new Error(`Variable not found: ${varName}`);
    }
    return variables[varName];
  });
}

/**
 * Enhance graph nodes with agent metadata
 * @param {Array<Object>} nodes - Graph nodes
 * @returns {Array<Object>} Enhanced nodes with agentSource and usesVariables
 */
function enhanceNodesWithAgentMetadata(nodes) {
  return nodes.map(node => {
    const agent = resolveAgent(node.agentType);
    const usesVariables = extractUsedVariables(node.instruction);

    return {
      ...node,
      agentSource: agent.source,
      agentPath: agent.path,
      usesVariables
    };
  });
}

module.exports = {
  parseAgentInvocation,
  resolveAgent,
  extractUsedVariables,
  interpolateVariables,
  enhanceNodesWithAgentMetadata
};
