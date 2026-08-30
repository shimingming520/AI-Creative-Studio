import { describeAgentCommand, searchAgentCommands, searchAgentModels } from "./agentCapabilityDiscovery.js";
export const AGENT_DISCOVERY_COMMAND_IDS = Object.freeze(["agent.capabilities.search", "agent.command.describe", "agent.models.search"]);
const SAFE_DISCOVERY_CAPABILITY = Object.freeze({
  reads: ["agent.capabilityCatalog"],
  writes: []
});
export function registerAgentDiscoveryCommands(_0x191a4d) {
  if (!_0x191a4d?.register || !_0x191a4d?.has) {
    return _0x191a4d;
  }
  if (!_0x191a4d.has("agent.capabilities.search")) {
    _0x191a4d.register({
      id: "agent.capabilities.search",
      description: "Search registered Canvas Commands by user intent without executing them.",
      riskLevel: "safe",
      argsSchema: {
        type: "object",
        required: ["query"],
        properties: {
          query: {
            type: "string"
          },
          limit: {
            type: "integer",
            minimum: 1,
            maximum: 12,
            default: 6
          }
        }
      },
      capabilitySchema: SAFE_DISCOVERY_CAPABILITY,
      returnSchema: {
        properties: {
          commandIds: {
            type: "array",
            items: {
              type: "string"
            }
          },
          commands: {
            type: "array"
          }
        }
      },
      execute(_0x4ded17 = {}) {
        return searchAgentCommands({
          commandRegistry: _0x191a4d,
          ..._0x4ded17
        });
      }
    });
  }
  if (!_0x191a4d.has("agent.command.describe")) {
    _0x191a4d.register({
      id: "agent.command.describe",
      description: "Load the complete planning schema for one registered Canvas Command.",
      riskLevel: "safe",
      argsSchema: {
        type: "object",
        required: ["commandId"],
        properties: {
          commandId: {
            type: "string"
          }
        }
      },
      capabilitySchema: SAFE_DISCOVERY_CAPABILITY,
      returnSchema: {
        properties: {
          commandId: {
            type: "string"
          },
          argsSchema: {
            type: "object"
          },
          capabilitySchema: {
            type: "object"
          }
        }
      },
      execute(_0x3ec018 = {}) {
        return describeAgentCommand({
          commandRegistry: _0x191a4d,
          ..._0x3ec018
        });
      }
    });
  }
  if (!_0x191a4d.has("agent.models.search")) {
    _0x191a4d.register({
      id: "agent.models.search",
      description: "Search model manifests and return planning-safe model fields and input slots.",
      riskLevel: "safe",
      argsSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            default: ""
          },
          kind: {
            type: "string",
            enum: ["image", "video", "audio", "text"]
          },
          provider: {
            type: "string"
          },
          inputKinds: {
            type: "array",
            items: {
              type: "string",
              enum: ["image", "video", "audio", "text"]
            }
          },
          limit: {
            type: "integer",
            minimum: 1,
            maximum: 12,
            default: 6
          }
        }
      },
      capabilitySchema: SAFE_DISCOVERY_CAPABILITY,
      returnSchema: {
        properties: {
          modelIds: {
            type: "array",
            items: {
              type: "string"
            }
          },
          models: {
            type: "array"
          }
        }
      },
      execute(_0x5e0a33 = {}) {
        return searchAgentModels(_0x5e0a33);
      }
    });
  }
  return _0x191a4d;
}