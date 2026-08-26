import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  /** Optional server-side model selection. Defaults preserve existing behavior. */
  model?: string;
  /** Optional OpenAI-style reasoning control for GPT family models. */
  reasoning?: { effort: "minimal" | "low" | "medium" | "high" };
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

type ProviderConfig = {
  kind: "groq" | "openai" | "forge";
  apiUrl: string;
  apiKey: string;
  defaultModel: string;
  // Groq supports OpenAI-compatible JSON mode, but not every model accepts strict JSON Schema.
  supportsStrictJsonSchema: boolean;
};

const GROQ_PREFERRED_DRAFT_MODELS = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "llama-3.1-8b-instant",
  "qwen/qwen3.6-27b",
];

async function resolveGroqRecoveryModel(apiKey: string, unavailableModel: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) return null;
    const payload = await response.json() as { data?: Array<{ id?: unknown }> };
    const available = (payload.data || [])
      .map((model) => typeof model.id === "string" ? model.id : "")
      .filter(Boolean);
    const preferred = GROQ_PREFERRED_DRAFT_MODELS.find(
      (model) => model !== unavailableModel && available.includes(model)
    );
    if (preferred) return preferred;
    return available.find(
      (model) => model !== unavailableModel && /^(openai\/gpt-oss-|llama-|qwen\/|minimaxai\/)/.test(model)
    ) || null;
  } catch {
    return null;
  }
}

function resolveProvider(): ProviderConfig {
  // The project already has a production Groq provider with an OpenAI-compatible API.
  // Prefer it for short draft generation so exhausted OpenAI billing never blocks review mode.
  if (ENV.groqApiKey.trim()) {
    return {
      kind: "groq",
      apiUrl: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: ENV.groqApiKey,
      defaultModel: ENV.groqModel.trim() || "llama-3.3-70b-versatile",
      supportsStrictJsonSchema: false,
    };
  }
  // Fall back to the project-owned OpenAI-compatible provider when its balance is available.
  if (ENV.openAiApiKey.trim()) {
    const base = (ENV.openAiBaseUrl.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
    return {
      kind: "openai",
      apiUrl: `${base}/chat/completions`,
      apiKey: ENV.openAiApiKey,
      defaultModel: ENV.openAiModel.trim() || "gpt-5-mini",
      supportsStrictJsonSchema: true,
    };
  }
  if (ENV.forgeApiKey.trim()) {
    const base = (ENV.forgeApiUrl.trim() || "https://forge.manus.im").replace(/\/$/, "");
    return {
      kind: "forge",
      apiUrl: `${base}/v1/chat/completions`,
      apiKey: ENV.forgeApiKey,
      defaultModel: "gpt-5-mini",
      supportsStrictJsonSchema: true,
    };
  }
  throw new Error("No server-side LLM provider is configured");
}

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const provider = resolveProvider();

  const {
    messages,
    model,
    reasoning,
    maxTokens,
    max_tokens,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const selectedModel = model || provider.defaultModel;
  const tokenLimit = maxTokens ?? max_tokens ?? 32768;
  const payload: Record<string, unknown> = {
    model: selectedModel,
    messages: messages.map(normalizeMessage),
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  // GPT 5 models require max_completion_tokens; other providers accept max_tokens.
  if (selectedModel.startsWith("gpt-")) {
    payload.max_completion_tokens = tokenLimit;
    if (reasoning) payload.reasoning = reasoning;
  } else {
    payload.max_tokens = tokenLimit;
  }

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    // Groq's compatible endpoint supports JSON mode but can reject strict JSON Schema
    // on otherwise suitable chat models. The caller's system prompt still defines the
    // exact contract, and downstream parsing remains the final safety gate.
    payload.response_format = !provider.supportsStrictJsonSchema && normalizedResponseFormat.type === "json_schema"
      ? { type: "json_object" }
      : normalizedResponseFormat;
  }

  const invokeProvider = () => fetch(provider.apiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  let response = await invokeProvider();
  let firstErrorText = "";
  // Groq keys can retain a stale GROQ_MODEL value after a model is retired or access changes.
  // On that explicit model-not-found path only, select a supported text model from the account's
  // own live catalog and retry once. Explicit caller model selection is never overridden.
  if (!response.ok && provider.kind === "groq" && !model && response.status === 404) {
    firstErrorText = await response.text();
    const recoveryModel = await resolveGroqRecoveryModel(provider.apiKey, selectedModel);
    if (recoveryModel) {
      payload.model = recoveryModel;
      response = await invokeProvider();
    }
  }

  if (!response.ok) {
    const errorText = firstErrorText || await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}
