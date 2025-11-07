// DEPRECATED: Old $name := {base: "agent"} syntax removed
// This file will be refactored to support new temp agent system

/**
 * Temporary Agents Parser
 *
 * Handles parse-time expansion of temporary agent syntax ($agent-name)
 * into standard agent nodes with enhanced instructions.
 */

/*
// COMMENTED OUT: Old temp agent definition syntax - no longer supported
/**
 * Parse temporary agent definitions from workflow syntax
 * @param {string} syntax - Raw workflow syntax
 * @returns {{registry: Map, cleanedSyntax: string}}
 */
/*
function extractTempAgentDefinitions(syntax) {
  const registry = new Map();
  let cleanedSyntax = syntax;

  // Pattern: $name := {base: "...", prompt: "...", model: "..."}
  // Support both single and double quotes, optional model
  const definitionPattern = /\$(\w+)\s*:=\s*\{([^}]+)\}/gm;

  let match;
  while ((match = definitionPattern.exec(syntax)) !== null) {
    const [fullMatch, agentName, defContent] = match;

    try {
      const definition = parseDefinitionContent(defContent);

      // Validate required fields
      if (!definition.base) {
        throw new Error(`Temporary agent '${agentName}' missing required field: base`);
      }
      if (!definition.prompt) {
        throw new Error(`Temporary agent '${agentName}' missing required field: prompt`);
      }

      // Set defaults
      definition.model = definition.model || 'sonnet';

      registry.set(agentName, definition);

      // Remove definition from syntax (keep as single line for cleaner output)
      cleanedSyntax = cleanedSyntax.replace(fullMatch, '');

    } catch (error) {
      throw new Error(`Failed to parse temporary agent '${agentName}': ${error.message}`);
    }
  }

  // Clean up extra newlines left by definition removal
  cleanedSyntax = cleanedSyntax.replace(/\n{3,}/g, '\n\n').trim();

  return { registry, cleanedSyntax };
}
*/

/*
/**
 * Parse the content of a definition block
 * @param {string} content - Content inside the {...}
 * @returns {{base: string, prompt: string, model?: string}}
 */
/*
function parseDefinitionContent(content) {
  const definition = {};

  // Try JSON parsing first (with relaxed format)
  try {
    const jsonStr = '{' + content
      .replace(/(\w+):/g, '"$1":')  // Quote keys
      .replace(/:\s*"([^"]+)"/g, ': "$1"')  // Already has double quotes
      .replace(/:\s*'([^']+)'/g, ': "$1"')  // Convert single to double quotes
      .replace(/,\s*}/g, '}') + '}';  // Remove trailing commas

    return JSON.parse(jsonStr);
  } catch (e) {
    // Fallback to manual parsing
    const fields = content.split(',');

    for (const field of fields) {
      const colonIndex = field.indexOf(':');
      if (colonIndex === -1) continue;

      const key = field.substring(0, colonIndex).trim().replace(/['"]/g, '');
      const value = field.substring(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');

      if (key && value) {
        definition[key] = value;
      }
    }

    return definition;
  }
}
*/

/*
/**
 * Expand temporary agent invocations into standard agent syntax
 * @param {string} syntax - Syntax with temp agents removed
 * @param {Map} registry - Temp agent definitions
 * @returns {string} Expanded syntax with standard agent syntax
 */
/*
function expandTempAgentInvocations(syntax, registry) {
  let expanded = syntax;

  // Pattern: $name:"instruction":varname or $name:"instruction"
  const invocationPattern = /\$(\w+):"([^"]+)"(?::(\w+))?/g;

  let match;
  const replacements = [];

  while ((match = invocationPattern.exec(syntax)) !== null) {
    const [fullMatch, agentName, instruction, outputVar] = match;

    if (!registry.has(agentName)) {
      throw new Error(
        `Undefined temporary agent '$${agentName}'. ` +
        `Available agents: ${Array.from(registry.keys()).map(n => '$' + n).join(', ')}`
      );
    }

    const definition = registry.get(agentName);

    // Build enhanced instruction
    const enhancedInstruction = definition.prompt + '\n\n' + instruction;

    // Create standard agent invocation syntax with metadata
    // We'll use a special marker format that the main parser can handle
    const replacement = `${definition.base}:"${enhancedInstruction}"`;

    replacements.push({
      original: fullMatch,
      replacement: replacement,
      outputVar: outputVar,
      model: definition.model,
      agentName: agentName,
      baseAgent: definition.base
    });
  }

  // Apply replacements
  for (const {original, replacement} of replacements) {
    expanded = expanded.replace(original, replacement);
  }

  return { expanded, replacements };
}
*/

/**
 * Extract variable references from instructions
 * @param {string} instruction - Instruction text
 * @returns {string[]} Array of variable names referenced
 */
function extractVariableReferences(instruction) {
  const varPattern = /\{(\w+)\}/g;
  const variables = [];
  let match;

  while ((match = varPattern.exec(instruction)) !== null) {
    variables.push(match[1]);
  }

  return variables;
}

/**
 * Main entry point: Parse workflow syntax with temporary agents
 * @param {string} syntax - Raw workflow syntax
 * @returns {Object} Parsed result with expanded syntax and metadata
 */
function parseTempAgents(syntax) {
  // Step 1: Extract temporary agent definitions
  const { registry, cleanedSyntax } = extractTempAgentDefinitions(syntax);

  // Step 2: Expand temporary agent invocations
  const { expanded, replacements } = expandTempAgentInvocations(cleanedSyntax, registry);

  // Step 3: Build metadata for executor
  const metadata = {
    tempAgents: Array.from(registry.entries()).map(([name, def]) => ({
      name,
      base: def.base,
      model: def.model
    })),
    nodeMetadata: replacements.map(r => ({
      agentName: r.agentName,
      baseAgent: r.baseAgent,
      outputVar: r.outputVar,
      model: r.model,
      originalSyntax: r.original
    })),
    variables: {} // Will be populated during execution
  };

  return {
    success: true,
    expandedSyntax: expanded,
    metadata: metadata,
    registry: registry
  };
}

/**
 * Enhance existing graph with temporary agent metadata
 * This is called after the main parser creates the graph
 * @param {Object} graph - Parsed graph from main parser
 * @param {Object} tempAgentMetadata - Metadata from parseTempAgents
 * @returns {Object} Enhanced graph
 */
function enhanceGraphWithTempAgents(graph, tempAgentMetadata) {
  if (!tempAgentMetadata || !tempAgentMetadata.nodeMetadata) {
    return graph;
  }

  // Add temp agent metadata to graph
  graph.tempAgents = tempAgentMetadata;
  graph.variables = {};

  // Enhance nodes with temp agent info
  let metadataIndex = 0;
  for (const node of graph.nodes) {
    if (node.type === 'agent' && metadataIndex < tempAgentMetadata.nodeMetadata.length) {
      const metadata = tempAgentMetadata.nodeMetadata[metadataIndex];

      // Check if this node matches (by comparing agent type)
      if (node.agent === metadata.baseAgent) {
        node.tempAgentName = metadata.agentName;
        node.outputVar = metadata.outputVar;
        node.model = metadata.model;

        // Extract variable references from instruction
        if (node.instruction) {
          node.templateVars = extractVariableReferences(node.instruction);
        }

        // Initialize variable in graph
        if (metadata.outputVar) {
          graph.variables[metadata.outputVar] = null;
        }

        metadataIndex++;
      }
    }
  }

  return graph;
}

// Export functions
module.exports = {
  parseTempAgents,
  enhanceGraphWithTempAgents,
  extractVariableReferences,
  // DEPRECATED - commented out:
  // extractTempAgentDefinitions,
  // expandTempAgentInvocations
};
