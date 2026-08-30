import { generateText } from "./aiTextApi.js";
export const AGENT_PLANNER_PROMPT_MAX_CHARS = 46000;
const AGENT_PLANNER_HISTORY_LIMIT = 12;
const AGENT_PLANNER_HISTORY_TEXT_LIMIT = 2400;
export const AGENT_SYSTEM_PROMPT = ["You are the AI Canvas action planner.", "Return only one strict JSON object.", "The first non-whitespace character must be { and the last non-whitespace character must be }.", "Do not use Markdown, code fences, lead-in prose, comments, or trailing commas.", "Do not return JavaScript.", "Do not request unregistered tools.", "Use only actions listed in context.commands.", "context.capabilityRouting and context.skillCatalog are compact discovery indexes; deferred command or skill IDs are not executable in the current turn.", "If the required action is not present in context.commands and an agent discovery command is available, call agent.capabilities.search or agent.command.describe first; its result will disclose the complete target schema on the next turn.", "Use agent.models.search when the requested model is absent from context.canvas.availableModels; use only the returned planning-safe fields after they are disclosed on the next turn.", "Discovery commands are read-only. They never execute the discovered Canvas Command or generation model. If discovery is unavailable or still ambiguous, ask one concise clarification question.", "Use context.commands[].argsSchema, capabilitySchema, and returnAliasFields as the source of truth for action args, selection fallback, runtime requirements, and $alias fields.", "Use context.skills only as planning guidance; skills must produce action plans and must not execute directly.", "Default to status chat with actions [] for greetings, capability questions, brainstorming, critique, explanation, or any message that does not clearly ask to create, generate, export, download, edit, connect, arrange, select, delete, or otherwise modify the canvas.", "Only return canvas actions when the user has explicit canvas action intent. Mere discussion of an image, video, material, or idea is not enough.", "For status chat, include a helpful reply and keep actions empty.", "Use status need_clarification only when a required node, material, input source, or non-inferable modality choice is missing.", "For an explicit creative request, choose reasonable professional defaults for optional details such as style, composition, color, camera, and prompt. Do not ask the user to make choices you can safely make yourself.", "If an action is risky, return status need_confirmation.", "Prefer model and workflow capabilities from manifest data in context.", "Use the languagePolicy in the JSON prompt for all user-facing reply, question, and option labels.", "When a later action needs an earlier result, set as on the earlier action and reference it as $alias.nodeId.", "Use generation.run only after the target node exists; generation.run will require confirmation. When two or more prepared nodes should generate together and generation.runBatch is available, prefer one generation.runBatch action with all nodeIds so the user confirms the batch once.", "Before generation.run or generation.runBatch, ensure every target node already has a concrete prompt or a usable material input. If it does not, use node.setPrompt first and infer a reasonable professional prompt from the creative request.", "When the user asks to create one generation node and duplicate N copies for a batch or collage, the generation target set includes the original node and all N copies unless the user explicitly says to generate only the copies.", "When agentLoop.enabled is true, return at most one action. Use agentLoop.toolResults as the only record of completed tools, then choose the next single action or finish with actions [].", "When agentLoop.precreatedNode is present, it is only a visual reservation and is not a completed tool. Return the normal matching node.create action with complete args; the runtime will hydrate that reserved node instead of creating a duplicate.", "When agentLoop.validationFeedback is present, the previous action was rejected before execution. Correct its command or args using context.commands schemas; do not claim it ran.", "When agentLoop.recoveryInstruction is present, continue the original task from existing toolResults and apply that instruction to the unfinished steps. Do not start a replacement task or recreate completed nodes.", "Never repeat an action reported as successful in agentLoop.toolResults.", "Local command policy is authoritative for risk and confirmation. Do not request confirmation for safe preparation such as node.create, node.duplicate, collage creation, connection to a newly created node, or layout; generation.run, generation.runBatch, and other locally marked risky commands will be confirmed by the runtime.", "When creating an AI node, include model and provider from context.canvas.availableModels if a listed model better matches the user's selected inputs.", "For model args, copy the exact modelId from context.canvas.availableModels; never use displayName as model or modelId.", "context.canvas.inputRefs and context.canvas.referenceContext are explicit material inputs supplied by the user from the Agent panel.", "When context.canvas.inputRefs is non-empty, prefer those node IDs over guessing from selectedNodes or the wider canvas.", "For image-to-video, first use an image input from context.canvas.inputRefs/referenceContext before falling back to selected image nodes.", "If the user says this, these, the attached material, or the just-added material, resolve that wording to context.canvas.inputRefs.", "For wording such as the node just created, the previous created node, or the nodes from the last batch, resolve targets from context.canvas.agentReferences.recentCreationGroups in newest-first order. Use only its exact nodeIds and do not recreate those nodes.", "If multiple inputRefs could match and the user's intent does not identify which one to use, ask a clarification question instead of guessing.", "Use node.setParams only with field IDs present in the chosen model's uiSchema.fields; omit unsupported requested params instead of inventing fields.", "For batch node renaming, use node.rename with ids or selection fallback. Use orderBy such as top-to-bottom when the user specifies order, and use names, nameTemplate, or name plus numbered/startIndex for ordered numbering.", "When no explicit image inputRef is available, image-to-video using the current or selected image must use the exact selected image node id from context.canvas.selectedNodes or context.canvas.selectedNodeIds.", "For image-to-video, always create an ai-video node, graph.connect the selected image node to the new video node, optionally arrange them, then generation.run the video node.", "If the user asks for text-to-video or provides a clear text-only video idea and no usable image is selected, create an ai-video node, set text-to-video params supported by its model, then generation.run it.", "If the user asks for video but the source or content is ambiguous, ask a clarification question instead of guessing.", "If the user asks to batch download or export selected nodes, use node.exportSelected. Include directory or outputPath only when the user explicitly provides the destination."].join("\n");
const BASE_AGENT_PLAN_EXAMPLES = Object.freeze([{
  user: "What can you help me do on this canvas?",
  plan: {
    status: "chat",
    reply: "I can help discuss ideas first. When you want me to act, tell me to create, generate, connect, arrange, or edit something on the canvas.",
    actions: []
  }
}, {
  user: "Create an image node with prompt cyberpunk city night, then generate.",
  plan: {
    status: "ready",
    reply: "I will create the image node first, then ask before generation.",
    actions: [{
      type: "node.create",
      as: "imageNode",
      args: {
        type: "ai-image",
        prompt: "cyberpunk city night"
      }
    }, {
      type: "generation.run",
      args: {
        nodeId: "$imageNode.nodeId"
      }
    }]
  }
}, {
  user: "Arrange selected nodes horizontally with gap 80 and align top.",
  plan: {
    status: "ready",
    reply: "I will arrange and align the selected nodes.",
    actions: [{
      type: "layout.arrangeRow",
      args: {
        gap: 80
      }
    }, {
      type: "layout.align",
      args: {
        mode: "top"
      }
    }]
  }
}, {
  user: "Rename the selected nodes from top to bottom to 1 Video, 2 Video, 3 Video.",
  plan: {
    status: "ready",
    reply: "I will rename the selected nodes in top-to-bottom order.",
    actions: [{
      type: "node.rename",
      args: {
        orderBy: "top-to-bottom",
        name: "Video",
        numbered: true,
        startIndex: 1
      }
    }]
  }
}, {
  user: "Batch download the selected nodes to D:/Exports.",
  plan: {
    status: "need_confirmation",
    reply: "I will export the selected nodes into a ZIP package in the requested directory.",
    actions: [{
      type: "node.exportSelected",
      args: {
        directory: "D:/Exports"
      }
    }]
  }
}, {
  user: "Create a 5 second video from text: a paper boat floating through a neon canal.",
  plan: {
    status: "ready",
    reply: "I will create a text-to-video node, set supported parameters, then ask before generation.",
    actions: [{
      type: "node.create",
      as: "videoNode",
      args: {
        type: "ai-video",
        prompt: "a paper boat floating through a neon canal"
      }
    }, {
      type: "node.setParams",
      args: {
        nodeId: "$videoNode.nodeId",
        params: {
          duration: 5
        }
      }
    }, {
      type: "generation.run",
      args: {
        nodeId: "$videoNode.nodeId"
      }
    }]
  }
}, {
  user: "Generate a video.",
  plan: {
    status: "need_clarification",
    reply: "I need one detail before creating the video.",
    question: "Should this be text-to-video or image-to-video? If image-to-video, select or provide a reference image.",
    options: [{
      id: "text-to-video",
      label: "Text-to-video"
    }, {
      id: "image-to-video",
      label: "Image-to-video"
    }],
    actions: []
  }
}]);
function isImageNodeType(_0x2ec8ac = "") {
  return String(_0x2ec8ac || "") === "ai-image" || String(_0x2ec8ac || "") === "source-image";
}
function findImageInputRefNodeId(_0x2c9ce3 = {}) {
  const _0x1630c5 = _0x2c9ce3?.canvas || {};
  const _0x582b58 = _0x1630c5.referenceContext || {};
  const _0x596273 = [...(Array.isArray(_0x1630c5.inputRefs) ? _0x1630c5.inputRefs : []), ...(Array.isArray(_0x582b58.inputRefs) ? _0x582b58.inputRefs : [])];
  const _0x3227e8 = _0x596273.find(_0x26a65e => isImageNodeType(_0x26a65e?.type) || String(_0x26a65e?.kind || "") === "image");
  if (_0x3227e8?.nodeId || _0x3227e8?.id) {
    return String(_0x3227e8.nodeId || _0x3227e8.id);
  }
  const _0x24b727 = Array.isArray(_0x582b58.referencedNodes) ? _0x582b58.referencedNodes : [];
  const _0x48a692 = _0x24b727.find(_0x4daf9d => isImageNodeType(_0x4daf9d?.type) || String(_0x4daf9d?.kind || "") === "image");
  if (_0x48a692?.nodeId || _0x48a692?.id) {
    return String(_0x48a692.nodeId || _0x48a692.id);
  } else {
    return "";
  }
}
function findSelectedImageNodeId(_0x554b16 = {}) {
  const _0x2103ee = findImageInputRefNodeId(_0x554b16);
  if (_0x2103ee) {
    return _0x2103ee;
  }
  const _0x4c2423 = _0x554b16?.canvas || {};
  const _0x2c253f = Array.isArray(_0x4c2423.selectedNodes) ? _0x4c2423.selectedNodes : [];
  const _0x25449f = _0x2c253f.find(_0x4c312a => isImageNodeType(_0x4c312a?.type));
  if (_0x25449f?.id) {
    return String(_0x25449f.id);
  }
  const _0x349f43 = Array.isArray(_0x4c2423.selectedNodeIds) ? _0x4c2423.selectedNodeIds.map(_0x55a414 => String(_0x55a414 || "")).filter(Boolean) : [];
  if (_0x349f43.length === 0) {
    return "";
  }
  const _0x3119ff = Array.isArray(_0x4c2423.nodes) ? _0x4c2423.nodes : [];
  const _0x2f65a0 = new Set(_0x349f43);
  const _0x1c8e00 = _0x3119ff.find(_0x3e1fe4 => _0x2f65a0.has(String(_0x3e1fe4?.id || "")) && isImageNodeType(_0x3e1fe4?.type));
  if (_0x1c8e00?.id) {
    return String(_0x1c8e00.id);
  } else {
    return "";
  }
}
function modelAllowsImageInput(_0x82462d = {}) {
  const _0x1f0de3 = _0x82462d?.inputSlots && typeof _0x82462d.inputSlots === "object" ? _0x82462d.inputSlots : {};
  const _0xb6dd09 = Array.isArray(_0x1f0de3.allowedKinds) ? _0x1f0de3.allowedKinds : [];
  if (_0xb6dd09.includes("image")) {
    return true;
  }
  const _0x4419a6 = Number(_0x1f0de3.maxByKind?.image);
  return Number.isFinite(_0x4419a6) && _0x4419a6 > 0;
}
function modelRequiresMissingMedia(_0x5e994e = {}) {
  const _0x343989 = _0x5e994e?.inputSlots && typeof _0x5e994e.inputSlots === "object" ? _0x5e994e.inputSlots : {};
  const _0x41bfaf = _0x343989.minByKind || {};
  if (Number(_0x41bfaf.video) > 0) {
    return true;
  }
  if (Number(_0x41bfaf.audio) > 0) {
    return true;
  }
  const _0x1b60f6 = Array.isArray(_0x343989.fixedSlots) ? _0x343989.fixedSlots : [];
  return _0x1b60f6.some(_0x500d3d => _0x500d3d?.required === true && (String(_0x500d3d?.kind || "") === "video" || String(_0x500d3d?.kind || "") === "audio"));
}
function getModelFieldIds(_0x179ddb = {}) {
  return new Set((Array.isArray(_0x179ddb?.uiSchema?.fields) ? _0x179ddb.uiSchema.fields : []).map(_0x4898de => String(_0x4898de?.id || "").trim()).filter(Boolean));
}
function findImageToVideoModel(_0x172d12 = {}) {
  const _0x8b9c1 = Array.isArray(_0x172d12?.canvas?.availableModels) ? _0x172d12.canvas.availableModels : [];
  return _0x8b9c1.find(_0x38e9e6 => _0x38e9e6?.kind === "video" && _0x38e9e6?.modelId && modelAllowsImageInput(_0x38e9e6) && !modelRequiresMissingMedia(_0x38e9e6)) || null;
}
function buildImageToVideoExample(_0x23f370, _0xc6e5d0 = null, {
  fromInputRefs = false,
  availableCommandIds = new Set()
} = {}) {
  const _0x28437c = {
    type: "ai-video",
    prompt: "slow camera push in"
  };
  if (_0xc6e5d0?.modelId) {
    _0x28437c.model = _0xc6e5d0.modelId;
    _0x28437c.provider = _0xc6e5d0.provider || "";
  }
  const _0x4a3f7a = [{
    type: "node.create",
    as: "videoNode",
    args: _0x28437c
  }];
  const _0x117d52 = getModelFieldIds(_0xc6e5d0);
  if (availableCommandIds.has("node.setParams") && (!_0xc6e5d0 || _0x117d52.has("duration"))) {
    _0x4a3f7a.push({
      type: "node.setParams",
      args: {
        nodeId: "$videoNode.nodeId",
        params: {
          duration: 5
        }
      }
    });
  }
  _0x4a3f7a.push({
    type: "graph.connect",
    args: {
      sourceId: _0x23f370,
      targetId: "$videoNode.nodeId"
    }
  });
  if (availableCommandIds.has("layout.arrangeRow")) {
    _0x4a3f7a.push({
      type: "layout.arrangeRow",
      args: {
        ids: [_0x23f370, "$videoNode.nodeId"],
        gap: 80
      }
    });
  }
  _0x4a3f7a.push({
    type: "generation.run",
    args: {
      nodeId: "$videoNode.nodeId"
    }
  });
  return {
    user: fromInputRefs ? "Use the explicit image inputRef to create a 5 second video with a slow push in, then generate." : "Use the currently selected image to create a 5 second video with a slow push in, then generate.",
    plan: {
      status: "ready",
      reply: fromInputRefs ? "I will create a video node, connect the referenced image to it, arrange the nodes, then ask before generation." : "I will create a video node, connect the selected image to it, arrange the nodes, then ask before generation.",
      actions: _0x4a3f7a
    }
  };
}
function buildAgentPlanExamples(_0x5b0010 = {}) {
  const _0xd4ef88 = new Set((Array.isArray(_0x5b0010?.commands) ? _0x5b0010.commands : []).map(_0x5dc110 => String(_0x5dc110?.id || _0x5dc110 || "").trim()).filter(Boolean));
  const _0x1aa68a = _0x5e3a78 => _0x5e3a78.filter(_0x59bd77 => (_0x59bd77.plan?.actions || []).every(_0xbd18c1 => _0xd4ef88.has(String(_0xbd18c1?.type || "").trim())));
  const _0x3cfbb0 = findImageInputRefNodeId(_0x5b0010);
  const _0x16d1f4 = _0x3cfbb0 || findSelectedImageNodeId(_0x5b0010);
  if (!_0x16d1f4) {
    return _0x1aa68a(BASE_AGENT_PLAN_EXAMPLES);
  }
  const _0x2b5677 = findImageToVideoModel(_0x5b0010);
  return _0x1aa68a([BASE_AGENT_PLAN_EXAMPLES[0], buildImageToVideoExample(_0x16d1f4, _0x2b5677, {
    fromInputRefs: Boolean(_0x3cfbb0),
    availableCommandIds: _0xd4ef88
  }), BASE_AGENT_PLAN_EXAMPLES[1], BASE_AGENT_PLAN_EXAMPLES[2], BASE_AGENT_PLAN_EXAMPLES[3], BASE_AGENT_PLAN_EXAMPLES[4], BASE_AGENT_PLAN_EXAMPLES[5]]);
}
const AGENT_RESPONSE_CONTRACT = Object.freeze({
  format: "strict-json-object",
  firstNonWhitespaceChar: "{",
  lastNonWhitespaceChar: "}",
  forbidden: ["markdown", "code fences", "lead-in prose", "comments", "trailing commas"],
  noExecutionOutsidePlan: true
});
const AGENT_ACTION_PLAN_STRUCTURED_OUTPUT = Object.freeze({
  name: "agent_action_plan",
  strict: false,
  fallback: "prompt",
  schema: Object.freeze({
    type: "object",
    additionalProperties: false,
    required: ["status", "reply", "question", "actions"],
    properties: {
      status: {
        type: "string",
        enum: ["chat", "ready", "need_clarification", "need_confirmation", "failed"]
      },
      reply: {
        type: "string"
      },
      question: {
        type: "string"
      },
      options: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "label"],
          properties: {
            id: {
              type: "string"
            },
            label: {
              type: "string"
            }
          }
        }
      },
      requiresConfirmation: {
        type: "boolean"
      },
      riskLevel: {
        type: "string",
        enum: ["safe", "confirm", "danger", "blocked"]
      },
      actions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "args"],
          properties: {
            type: {
              type: "string"
            },
            alias: {
              type: "string"
            },
            args: {
              type: "object",
              additionalProperties: true
            }
          }
        }
      }
    }
  })
});
function mergeAgentCommandArgProperties(_0x265ac6 = []) {
  const _0x416032 = {};
  for (const _0x3bf060 of Array.isArray(_0x265ac6) ? _0x265ac6 : []) {
    for (const [_0x5c325f, _0x3fd708] of Object.entries(_0x3bf060?.argsSchema?.properties || {})) {
      if (!_0x416032[_0x5c325f]) {
        _0x416032[_0x5c325f] = cloneJson(_0x3fd708) || {};
        continue;
      }
      if (JSON.stringify(_0x416032[_0x5c325f]) === JSON.stringify(_0x3fd708)) {
        continue;
      }
      const _0x1687da = Array.isArray(_0x416032[_0x5c325f].anyOf) ? _0x416032[_0x5c325f].anyOf : [_0x416032[_0x5c325f]];
      if (!_0x1687da.some(_0x5df4f2 => JSON.stringify(_0x5df4f2) === JSON.stringify(_0x3fd708))) {
        _0x416032[_0x5c325f] = {
          anyOf: [..._0x1687da, cloneJson(_0x3fd708) || {}]
        };
      }
    }
  }
  return _0x416032;
}
function createAgentActionPlanStructuredOutput(_0x413192 = {}, {
  maxActions = 0
} = {}) {
  const _0x2f5d1e = Array.isArray(_0x413192?.commands) ? _0x413192.commands : [];
  const _0x55bdc4 = _0x2f5d1e.map(_0xb3efd0 => String(_0xb3efd0?.id || _0xb3efd0 || "").trim()).filter(Boolean);
  const _0x37727f = AGENT_ACTION_PLAN_STRUCTURED_OUTPUT.schema;
  const _0x2cbd8c = _0x37727f.properties.actions;
  const _0x4b2de4 = _0x2cbd8c.items;
  return {
    ...AGENT_ACTION_PLAN_STRUCTURED_OUTPUT,
    schema: {
      ..._0x37727f,
      properties: {
        ..._0x37727f.properties,
        actions: {
          ..._0x2cbd8c,
          ...(maxActions > 0 ? {
            maxItems: maxActions
          } : {}),
          items: {
            ..._0x4b2de4,
            properties: {
              ..._0x4b2de4.properties,
              type: {
                type: "string",
                ...(_0x55bdc4.length > 0 ? {
                  enum: _0x55bdc4
                } : {})
              },
              args: {
                type: "object",
                additionalProperties: true,
                required: [],
                properties: mergeAgentCommandArgProperties(_0x2f5d1e)
              }
            }
          }
        }
      }
    }
  };
}
function truncatePlannerText(_0x4ccf39, _0x17943d = AGENT_PLANNER_HISTORY_TEXT_LIMIT) {
  const _0x5e348e = String(_0x4ccf39 || "");
  if (_0x5e348e.length <= _0x17943d) {
    return _0x5e348e;
  }
  return _0x5e348e.slice(0, Math.max(0, _0x17943d - 3)) + "...";
}
function normalizeAgentLocale(_0x4b1217 = "") {
  const _0x1be7c3 = String(_0x4b1217 || "").trim().toLowerCase().replace("_", "-");
  if (_0x1be7c3.startsWith("en")) {
    return "en-US";
  }
  return "zh-CN";
}
function getPlannerLanguagePolicy(_0x3e2656) {
  const _0x4ab439 = normalizeAgentLocale(_0x3e2656);
  if (_0x4ab439 === "en-US") {
    return {
      locale: "en-US",
      responseLanguage: "English",
      instruction: "All user-facing reply, question, and option labels must be in English."
    };
  }
  return {
    locale: "zh-CN",
    responseLanguage: "简体中文",
    instruction: "所有面向用户的 reply、question、options.label 必须使用简体中文。"
  };
}
function normalizePlannerHistory(_0x53fc2b = [], {
  limit = AGENT_PLANNER_HISTORY_LIMIT,
  textLimit = AGENT_PLANNER_HISTORY_TEXT_LIMIT
} = {}) {
  if (!Array.isArray(_0x53fc2b)) {
    return [];
  }
  return _0x53fc2b.slice(-limit).map((_0x2523f1 = {}) => ({
    role: String(_0x2523f1.role || "assistant"),
    status: String(_0x2523f1.status || ""),
    content: truncatePlannerText(_0x2523f1.content || _0x2523f1.reply || _0x2523f1.message || _0x2523f1.question || "", textLimit)
  })).filter(_0x3411b2 => _0x3411b2.content || _0x3411b2.status);
}
function cloneJson(_0x32f19c) {
  try {
    return JSON.parse(JSON.stringify(_0x32f19c || {}));
  } catch {
    return {};
  }
}
function compactSchemaValue(_0x41af8a, {
  key = ""
} = {}) {
  if (_0x41af8a == null || typeof _0x41af8a === "number" || typeof _0x41af8a === "boolean") {
    return _0x41af8a;
  }
  if (typeof _0x41af8a === "string") {
    if (key === "description" || key === "title") {
      return truncatePlannerText(_0x41af8a, 180);
    } else {
      return _0x41af8a;
    }
  }
  if (Array.isArray(_0x41af8a)) {
    return _0x41af8a.map(_0x1a1a88 => compactSchemaValue(_0x1a1a88, {
      key: key
    }));
  }
  if (typeof _0x41af8a !== "object") {
    return _0x41af8a;
  }
  return Object.fromEntries(Object.entries(_0x41af8a).map(([_0xa5abd3, _0x5e55f7]) => [_0xa5abd3, compactSchemaValue(_0x5e55f7, {
    key: _0xa5abd3
  })]));
}
function compactAgentLoopValue(_0xd929da, _0x45edbd = 0) {
  if (_0xd929da == null || typeof _0xd929da === "number" || typeof _0xd929da === "boolean") {
    return _0xd929da;
  }
  if (typeof _0xd929da === "string") {
    return truncatePlannerText(_0xd929da, 240);
  }
  if (_0x45edbd >= 4) {
    return "[truncated]";
  }
  if (Array.isArray(_0xd929da)) {
    return _0xd929da.slice(0, 8).map(_0x20ca3d => compactAgentLoopValue(_0x20ca3d, _0x45edbd + 1));
  }
  if (typeof _0xd929da !== "object") {
    return String(_0xd929da);
  }
  return Object.fromEntries(Object.entries(_0xd929da).filter(([_0x3e9620]) => !["data", "base64", "raw", "headers", "request", "response"].includes(String(_0x3e9620 || "").toLowerCase())).slice(0, 10).map(([_0x2c803f, _0x2b0d85]) => [_0x2c803f, compactAgentLoopValue(_0x2b0d85, _0x45edbd + 1)]));
}
function compactPlannerLoopState(_0x4885a2 = null) {
  if (_0x4885a2?.enabled !== true) {
    return null;
  }
  const _0x5b9af1 = {
    enabled: true,
    step: Number(_0x4885a2.step || 0),
    maxSteps: Number(_0x4885a2.maxSteps || 0),
    instruction: truncatePlannerText(_0x4885a2.instruction || "", 360),
    runtimeProvenance: compactAgentLoopValue(_0x4885a2.runtimeProvenance || {}),
    ...(_0x4885a2.precreatedNode ? {
      precreatedNode: compactAgentLoopValue(_0x4885a2.precreatedNode)
    } : {}),
    validationFeedback: (Array.isArray(_0x4885a2.validationFeedback) ? _0x4885a2.validationFeedback : []).slice(-4).map(_0x524157 => compactAgentLoopValue(_0x524157)),
    ...(_0x4885a2.recoveryInstruction ? {
      recoveryInstruction: truncatePlannerText(_0x4885a2.recoveryInstruction, 480)
    } : {}),
    ...(_0x4885a2.clarificationAnswer ? {
      clarificationAnswer: truncatePlannerText(_0x4885a2.clarificationAnswer, 480)
    } : {}),
    toolResults: (Array.isArray(_0x4885a2.toolResults) ? _0x4885a2.toolResults : []).slice(-8).map(_0x3b9cfc => compactAgentLoopValue(_0x3b9cfc))
  };
  while (JSON.stringify(_0x5b9af1).length > 8000 && _0x5b9af1.toolResults.length > 1) {
    _0x5b9af1.toolResults.shift();
  }
  if (JSON.stringify(_0x5b9af1).length > 8000) {
    _0x5b9af1.toolResults = _0x5b9af1.toolResults.map((_0x34af35 = {}) => ({
      step: _0x34af35.step,
      commandId: _0x34af35.commandId,
      ok: _0x34af35.ok,
      status: _0x34af35.status,
      errorCode: _0x34af35.errorCode,
      message: truncatePlannerText(_0x34af35.message || "", 320),
      truncated: true
    }));
  }
  return _0x5b9af1;
}
function truncateList(_0x1f818c, _0xdebcbc) {
  if (Array.isArray(_0x1f818c)) {
    return _0x1f818c.slice(0, _0xdebcbc);
  } else {
    return [];
  }
}
function truncatePlannerNodes(_0x4cdd60 = {}, _0x4c87f7 = 30) {
  const _0x2e5e94 = Array.isArray(_0x4cdd60.nodes) ? _0x4cdd60.nodes : [];
  const _0x239ed2 = [];
  const _0x3cb380 = new Set();
  const _0x5432c3 = _0x1d76e6 => {
    const _0x41c038 = String(_0x1d76e6 || "").trim();
    if (!_0x41c038 || _0x3cb380.has(_0x41c038)) {
      return;
    }
    _0x3cb380.add(_0x41c038);
    _0x239ed2.push(_0x41c038);
  };
  (_0x4cdd60.selectedNodes || []).forEach(_0x36adb6 => _0x5432c3(_0x36adb6?.id || _0x36adb6?.nodeId));
  (_0x4cdd60.inputRefs || []).forEach(_0x38716e => _0x5432c3(_0x38716e?.nodeId || _0x38716e?.id));
  (_0x4cdd60.agentReferences?.recentCreatedNodeIds || []).forEach(_0x5432c3);
  const _0x5be373 = new Map(_0x2e5e94.map(_0x2ad794 => [String(_0x2ad794?.id || _0x2ad794?.nodeId || "").trim(), _0x2ad794]).filter(([_0x40ed69]) => Boolean(_0x40ed69)));
  const _0xe96ab2 = _0x239ed2.map(_0x5befe7 => _0x5be373.get(_0x5befe7)).filter(Boolean);
  const _0x1cc556 = _0x2e5e94.filter(_0x43d1cd => !_0x3cb380.has(String(_0x43d1cd?.id || _0x43d1cd?.nodeId || "").trim()));
  return [..._0xe96ab2, ..._0x1cc556.slice(0, Math.max(0, _0x4c87f7 - _0xe96ab2.length))];
}
function compactCommand(_0x4dd27e = {}) {
  const _0x3a27ce = _0x4dd27e.argsSchema && typeof _0x4dd27e.argsSchema === "object" ? _0x4dd27e.argsSchema : {};
  const _0x4779c1 = _0x4dd27e.capabilitySchema && typeof _0x4dd27e.capabilitySchema === "object" ? _0x4dd27e.capabilitySchema : {};
  return {
    id: _0x4dd27e.id,
    riskLevel: _0x4dd27e.riskLevel,
    argsSchema: {
      required: Array.isArray(_0x3a27ce.required) ? _0x3a27ce.required : [],
      properties: compactSchemaValue(_0x3a27ce.properties && typeof _0x3a27ce.properties === "object" ? _0x3a27ce.properties : {}),
      defaults: _0x3a27ce.defaults && typeof _0x3a27ce.defaults === "object" ? _0x3a27ce.defaults : {},
      selectionFallback: _0x3a27ce.selectionFallback === true
    },
    capabilitySchema: {
      selectionFallback: _0x4779c1.selectionFallback === true,
      requiresMountedRuntime: _0x4779c1.requiresMountedRuntime === true,
      requiresSystemAccess: _0x4779c1.requiresSystemAccess === true
    },
    returnAliasFields: Array.isArray(_0x4dd27e.returnAliasFields) ? _0x4dd27e.returnAliasFields : []
  };
}
function compactPlannerContext(_0x1e9eb7, _0x37959d = 0) {
  const _0x407cb9 = cloneJson(_0x1e9eb7);
  const _0x2e1388 = _0x407cb9.canvas || {};
  if (Array.isArray(_0x407cb9.commands) && _0x37959d >= 1) {
    _0x407cb9.commands = _0x407cb9.commands.map(compactCommand);
  }
  if (Array.isArray(_0x2e1388.recentCommands) && _0x37959d >= 1) {
    _0x2e1388.recentCommands = _0x2e1388.recentCommands.slice(-5);
  }
  if (Array.isArray(_0x2e1388.availableModels)) {
    const _0x4f6856 = [22, 14, 10, 6, 3, 0];
    const _0x55b83a = _0x4f6856[Math.min(_0x37959d, _0x4f6856.length - 1)];
    _0x2e1388.availableModels = truncateList(_0x2e1388.availableModels, _0x55b83a);
    if (_0x2e1388.modelCatalog) {
      _0x2e1388.modelCatalog.truncated = true;
      _0x2e1388.modelCatalog.includedModels = _0x2e1388.availableModels.length;
    }
  }
  if (Array.isArray(_0x2e1388.availableWorkflows) && _0x37959d >= 2) {
    _0x2e1388.availableWorkflows = [];
  }
  if (Array.isArray(_0x2e1388.nodes) && _0x37959d >= 2) {
    const _0x10de50 = _0x37959d >= 4 ? 60 : 160;
    const _0x428a99 = _0x37959d >= 5 ? 10 : 30;
    _0x2e1388.nodes = truncatePlannerNodes(_0x2e1388, _0x428a99).map(_0x319a08 => ({
      ..._0x319a08,
      promptPreview: truncatePlannerText(_0x319a08.promptPreview, _0x10de50),
      contentPreview: truncatePlannerText(_0x319a08.contentPreview, _0x10de50)
    }));
  }
  if (Array.isArray(_0x2e1388.edges) && _0x37959d >= 3) {
    _0x2e1388.edges = _0x2e1388.edges.slice(0, 20);
  }
  if (_0x37959d >= 5) {
    _0x2e1388.edges = [];
    _0x2e1388.recentCommands = [];
  }
  _0x407cb9.canvas = _0x2e1388;
  _0x407cb9.contextBudget &&= {
    ..._0x407cb9.contextBudget,
    plannerCompacted: _0x37959d > 0
  };
  return _0x407cb9;
}
function buildPlannerPayload({
  message: _0x3d4899,
  context: _0x32ed05,
  history = [],
  locale = "",
  loopState = null
} = {}) {
  const _0x3881cd = buildAgentPlanExamples(_0x32ed05);
  const _0x3bc224 = compactPlannerLoopState(loopState);
  const _0x4bf9b5 = _0x3bc224?.enabled === true;
  const _0x199474 = _0x3bc224?.toolResults?.length > 0;
  return {
    system: AGENT_SYSTEM_PROMPT,
    responseContract: AGENT_RESPONSE_CONTRACT,
    languagePolicy: getPlannerLanguagePolicy(locale),
    userMessage: String(_0x3d4899 || ""),
    history: normalizePlannerHistory(history),
    context: _0x32ed05,
    ...(_0x4bf9b5 ? {
      agentLoop: _0x3bc224
    } : {}),
    examples: _0x4bf9b5 ? _0x199474 ? [] : _0x3881cd.map(_0x243367 => ({
      ..._0x243367,
      plan: {
        ..._0x243367.plan,
        actions: Array.isArray(_0x243367.plan?.actions) ? _0x243367.plan.actions.slice(0, 1) : []
      }
    })) : _0x3881cd,
    outputSchema: {
      reply: "string",
      status: "chat|ready|need_clarification|need_confirmation|failed",
      requiresConfirmation: "boolean",
      question: "string when clarification is needed",
      options: [{
        id: "string",
        label: "string"
      }],
      actions: [{
        type: "canvas command id",
        as: "optional action result alias",
        args: "object matching context.commands[].argsSchema; may reference earlier aliases with $alias.path from returnAliasFields. node.create may include model/provider from context.canvas.availableModels."
      }]
    }
  };
}
function buildPlannerPrompt({
  message: _0x17e40b,
  context: _0x34b88d,
  history = [],
  locale = "",
  loopState = null
} = {}) {
  let _0x69ffb6 = buildPlannerPayload({
    message: _0x17e40b,
    context: _0x34b88d,
    history: history,
    locale: locale,
    loopState: loopState
  });
  let _0x1f5b11 = JSON.stringify(_0x69ffb6);
  if (_0x1f5b11.length <= AGENT_PLANNER_PROMPT_MAX_CHARS) {
    return _0x1f5b11;
  }
  _0x69ffb6.history = normalizePlannerHistory(history, {
    limit: 4,
    textLimit: 180
  });
  _0x1f5b11 = JSON.stringify(_0x69ffb6);
  if (_0x1f5b11.length <= AGENT_PLANNER_PROMPT_MAX_CHARS) {
    return _0x1f5b11;
  }
  for (let _0x1092f0 = 1; _0x1092f0 <= 5; _0x1092f0 += 1) {
    _0x69ffb6 = {
      ..._0x69ffb6,
      context: compactPlannerContext(_0x34b88d, _0x1092f0)
    };
    _0x1f5b11 = JSON.stringify(_0x69ffb6);
    if (_0x1f5b11.length <= AGENT_PLANNER_PROMPT_MAX_CHARS) {
      return _0x1f5b11;
    }
  }
  return JSON.stringify({
    system: AGENT_SYSTEM_PROMPT,
    userMessage: String(_0x17e40b || ""),
    history: [],
    context: compactPlannerContext(_0x34b88d, 5),
    ...(loopState?.enabled === true ? {
      agentLoop: compactPlannerLoopState(loopState)
    } : {}),
    responseContract: AGENT_RESPONSE_CONTRACT,
    examples: buildPlannerPayload({
      message: _0x17e40b,
      context: _0x34b88d,
      locale: locale,
      loopState: loopState
    }).examples.slice(0, 2),
    outputSchema: buildPlannerPayload({
      locale: locale
    }).outputSchema
  });
}
function buildPlannerRetryPrompt(_0x4e2300, _0x287abf = "") {
  let _0x5af82a = null;
  try {
    _0x5af82a = JSON.parse(String(_0x4e2300 || ""));
  } catch {
    return _0x4e2300;
  }
  const _0x417ecb = JSON.stringify({
    ..._0x5af82a,
    retry: {
      previousAttemptRejectedBeforeExecution: true,
      reason: String(_0x287abf || "invalid JSON"),
      instruction: "Return the corrected strict JSON object only. Do not include Markdown, prose, comments, or code fences."
    }
  });
  if (_0x417ecb.length <= AGENT_PLANNER_PROMPT_MAX_CHARS) {
    return _0x417ecb;
  } else {
    return _0x4e2300;
  }
}
function extractJsonObject(_0x33fd02) {
  if (_0x33fd02 && typeof _0x33fd02 === "object") {
    return _0x33fd02;
  }
  const _0x2353d0 = String(_0x33fd02 || "").trim();
  if (!_0x2353d0) {
    throw new Error("Agent planner returned empty text.");
  }
  try {
    return JSON.parse(_0x2353d0);
  } catch {
    throw new Error("Agent planner returned invalid JSON.");
  }
}
function getPlannerText(_0x45ea7d) {
  if (typeof _0x45ea7d === "string") {
    return _0x45ea7d;
  } else {
    return _0x45ea7d?.text || _0x45ea7d?.outputText || _0x45ea7d?.content || "";
  }
}
export async function requestAgentActionPlan({
  message: _0x595003,
  context: _0x4990a2,
  history = [],
  settings = {},
  request = generateText,
  onTrace = null,
  loopState = null,
  signal = null
} = {}) {
  const _0x5f03af = String(settings.model || "").trim();
  const _0x336716 = String(settings.provider || "").trim();
  const _0x34031d = String(settings.providerProfileId || "").trim();
  if (!_0x5f03af || !_0x336716) {
    return {
      status: "failed",
      reply: "Agent model is not configured.",
      actions: []
    };
  }
  const _0x244ca0 = buildPlannerPrompt({
    message: _0x595003,
    context: _0x4990a2,
    history: history,
    locale: settings.locale,
    loopState: loopState
  });
  onTrace?.({
    type: "planner_model_selected",
    provider: _0x336716,
    model: _0x5f03af,
    reason: "agentModelSettings"
  });
  const _0xca0a80 = {
    model: _0x5f03af,
    provider: _0x336716,
    ...(_0x34031d ? {
      providerProfileId: _0x34031d
    } : {}),
    prompt: _0x244ca0,
    systemPrompt: AGENT_SYSTEM_PROMPT,
    structuredOutput: createAgentActionPlanStructuredOutput(_0x4990a2, {
      maxActions: loopState?.enabled === true ? 1 : 0
    }),
    temperature: Number.isFinite(Number(settings.temperature)) ? Number(settings.temperature) : 0,
    ...(signal ? {
      signal: signal
    } : {})
  };
  const _0xefb74c = await request(_0xca0a80);
  try {
    return extractJsonObject(getPlannerText(_0xefb74c));
  } catch (_0x58fd5e) {
    onTrace?.({
      type: "planner_json_retry",
      reason: _0x58fd5e?.message || "invalid JSON",
      rawPreview: truncatePlannerText(getPlannerText(_0xefb74c), 160)
    });
    const _0x31a0a1 = buildPlannerRetryPrompt(_0x244ca0, _0x58fd5e?.message);
    const _0x5d4c44 = await request({
      ..._0xca0a80,
      prompt: _0x31a0a1
    });
    try {
      return extractJsonObject(getPlannerText(_0x5d4c44));
    } catch (_0x30f9b5) {
      onTrace?.({
        type: "planner_json_retry_failed",
        reason: _0x30f9b5?.message || "invalid JSON",
        rawPreview: truncatePlannerText(getPlannerText(_0x5d4c44), 160)
      });
      throw _0x30f9b5;
    }
  }
}