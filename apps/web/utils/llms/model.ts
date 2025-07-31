import type { LanguageModelV1 } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createOllama } from "ollama-ai-provider";
import { env } from "@/env";
import { Model, Provider } from "@/utils/llms/config";
import type { UserAIFields } from "@/utils/llms/types";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("llms/model");

export type ModelType = "default" | "economy" | "chat";

export function getModel(
  userAi: UserAIFields,
  modelType: ModelType = "default",
) {
  const data = selectModelByType(userAi, modelType);

  logger.info("Using model", {
    modelType,
    provider: data.provider,
    model: data.model,
    providerOptions: data.providerOptions,
  });

  return data;
}

function selectModelByType(userAi: UserAIFields, modelType: ModelType) {
  switch (modelType) {
    case "economy":
      return selectEconomyModel(userAi);
    case "chat":
      return selectChatModel(userAi);
    default:
      return selectDefaultModel(userAi);
  }
}

function selectModel(
  {
    aiProvider,
    aiModel,
    aiApiKey,
  }: {
    aiProvider: string;
    aiModel: string | null;
    aiApiKey: string | null;
  },
  providerOptions?: Record<string, any>,
): {
  provider: string;
  model: string;
  llmModel: LanguageModelV1;
  providerOptions?: Record<string, any>;
} {
  switch (aiProvider) {
    case Provider.OPEN_AI: {
      const model = aiModel || Model.GPT_4O;
      return {
        provider: Provider.OPEN_AI,
        model,
        llmModel: createOpenAI({ apiKey: aiApiKey || env.OPENAI_API_KEY })(
          model,
        ),
      };
    }
    case Provider.GOOGLE: {
      const mod = aiModel || Model.GEMINI_2_0_FLASH;
      return {
        provider: Provider.GOOGLE,
        model: mod,
        llmModel: createGoogleGenerativeAI({
          apiKey: aiApiKey || env.GOOGLE_API_KEY,
        })(mod),
      };
    }
    case Provider.GROQ: {
      const model = aiModel || Model.GROQ_LLAMA_3_3_70B;
      return {
        provider: Provider.GROQ,
        model,
        llmModel: createGroq({ apiKey: aiApiKey || env.GROQ_API_KEY })(model),
      };
    }
    case Provider.OPENROUTER: {
      const model = aiModel || Model.CLAUDE_4_SONNET_OPENROUTER;
      const openrouter = createOpenRouter({
        apiKey: aiApiKey || env.OPENROUTER_API_KEY,
        headers: {
          "HTTP-Referer": "https://www.getinboxzero.com",
          "X-Title": "Inbox Zero",
        },
      });
      const chatModel = openrouter.chat(model);

      return {
        provider: Provider.OPENROUTER,
        model,
        llmModel: chatModel,
        providerOptions,
      };
    }
    case Provider.OLLAMA: {
      const model = aiModel || env.NEXT_PUBLIC_OLLAMA_MODEL;
      if (!model) throw new Error("Ollama model is not set");
      return {
        provider: Provider.OLLAMA!,
        model,
        llmModel: createOllama({ baseURL: env.OLLAMA_BASE_URL })(model),
      };
    }

    // this is messy. better to have two providers. one for bedrock and one for anthropic
    case Provider.ANTHROPIC: {
      if (env.BEDROCK_ACCESS_KEY && env.BEDROCK_SECRET_KEY && !aiApiKey) {
        const model = aiModel || Model.CLAUDE_3_7_SONNET_BEDROCK;
        return {
          provider: Provider.ANTHROPIC,
          model,
          // Based on: https://github.com/vercel/ai/issues/4996#issuecomment-2751630936
          llmModel: createAmazonBedrock({
            // accessKeyId: env.BEDROCK_ACCESS_KEY,
            // secretAccessKey: env.BEDROCK_SECRET_KEY,
            // sessionToken: undefined,
            region: env.BEDROCK_REGION,
            credentialProvider: async () => ({
              accessKeyId: env.BEDROCK_ACCESS_KEY!,
              secretAccessKey: env.BEDROCK_SECRET_KEY!,
              sessionToken: undefined,
            }),
          })(model),
        };
      } else {
        const model = aiModel || Model.CLAUDE_3_7_SONNET_ANTHROPIC;
        return {
          provider: Provider.ANTHROPIC,
          model,
          llmModel: createAnthropic({
            apiKey: aiApiKey || env.ANTHROPIC_API_KEY,
          })(model),
        };
      }
    }
    default: {
      logger.error("LLM provider not supported", { aiProvider });
      throw new Error(`LLM provider not supported: ${aiProvider}`);
    }
  }
}

/**
 * Creates OpenRouter provider options from a comma-separated string
 */
function createOpenRouterProviderOptions(
  providers: string,
): Record<string, any> {
  return {
    openrouter: {
      provider: {
        order: providers.split(",").map((p: string) => p.trim()),
      },
    },
  };
}

/**
 * Selects the appropriate economy model for high-volume or context-heavy tasks
 * By default, uses a cheaper model like Gemini Flash for tasks that don't require the most powerful LLM
 *
 * Use cases:
 * - Processing large knowledge bases
 * - Analyzing email history
 * - Bulk processing emails
 * - Any task with large context windows where cost efficiency matters
 */
function selectEconomyModel(userAi: UserAIFields) {
  if (env.ECONOMY_LLM_PROVIDER && env.ECONOMY_LLM_MODEL) {
    const apiKey = getProviderApiKey(env.ECONOMY_LLM_PROVIDER);
    if (!apiKey) {
      logger.warn("Economy LLM provider configured but API key not found", {
        provider: env.ECONOMY_LLM_PROVIDER,
      });
      return selectDefaultModel(userAi);
    }

    // Configure OpenRouter provider options if using OpenRouter for economy
    let providerOptions: Record<string, any> | undefined;
    if (
      env.ECONOMY_LLM_PROVIDER === Provider.OPENROUTER &&
      env.ECONOMY_OPENROUTER_PROVIDERS
    ) {
      providerOptions = createOpenRouterProviderOptions(
        env.ECONOMY_OPENROUTER_PROVIDERS,
      );
    }

    return selectModel(
      {
        aiProvider: env.ECONOMY_LLM_PROVIDER,
        aiModel: env.ECONOMY_LLM_MODEL,
        aiApiKey: apiKey,
      },
      providerOptions,
    );
  }

  return selectDefaultModel(userAi);
}

/**
 * Selects the appropriate chat model for fast conversational tasks
 */
function selectChatModel(userAi: UserAIFields) {
  if (env.CHAT_LLM_PROVIDER && env.CHAT_LLM_MODEL) {
    const apiKey = getProviderApiKey(env.CHAT_LLM_PROVIDER);
    if (!apiKey) {
      logger.warn("Chat LLM provider configured but API key not found", {
        provider: env.CHAT_LLM_PROVIDER,
      });
      return selectDefaultModel(userAi);
    }

    // Configure OpenRouter provider options if using OpenRouter for chat
    let providerOptions: Record<string, any> | undefined;
    if (
      env.CHAT_LLM_PROVIDER === Provider.OPENROUTER &&
      env.CHAT_OPENROUTER_PROVIDERS
    ) {
      providerOptions = createOpenRouterProviderOptions(
        env.CHAT_OPENROUTER_PROVIDERS,
      );
    }

    return selectModel(
      {
        aiProvider: env.CHAT_LLM_PROVIDER,
        aiModel: env.CHAT_LLM_MODEL,
        aiApiKey: apiKey,
      },
      providerOptions,
    );
  }

  return selectDefaultModel(userAi);
}

function selectDefaultModel(userAi: UserAIFields) {
  const defaultProvider = env.DEFAULT_LLM_PROVIDER;
  const aiApiKey = userAi.aiApiKey;
  let aiProvider: string;
  let aiModel: string | null = null;
  const providerOptions: Record<string, any> = {};

  // If user has not api key set, then use default model
  // If they do they can use the model of their choice
  if (aiApiKey) {
    aiProvider = userAi.aiProvider || defaultProvider;
    aiModel = userAi.aiModel || null;
  } else {
    aiProvider = defaultProvider;
    aiModel = env.DEFAULT_LLM_MODEL || null;

    // Allow custom logic in production with fallbacks that doesn't impact self-hosters
    if (aiProvider === Provider.CUSTOM) {
      // choose randomly between bedrock sonnet 3.7, sonnet 4, and openrouter
      const models = [
        // {
        //   provider: Provider.ANTHROPIC,
        //   model: Model.CLAUDE_3_7_SONNET_BEDROCK,
        // },
        // {
        //   provider: Provider.ANTHROPIC,
        //   model: Model.CLAUDE_4_SONNET_BEDROCK,
        // },
        {
          provider: Provider.OPENROUTER,
          model: null,
        },
      ];

      const selectedProviderAndModel =
        models[Math.floor(Math.random() * models.length)];

      aiProvider = selectedProviderAndModel.provider;
      aiModel = selectedProviderAndModel.model;

      if (aiProvider === Provider.OPENROUTER) {
        function selectRandomModel() {
          // to avoid rate limits, we'll select a random model
          const models = [
            "google/gemini-2.5-pro",
            "anthropic/claude-sonnet-4",
            // "anthropic/claude-3.7-sonnet",
          ];
          return models[Math.floor(Math.random() * models.length)];
        }
        aiModel = selectRandomModel() || null;
        providerOptions.openrouter = {
          models: [
            "google/gemini-2.5-pro",
            "anthropic/claude-sonnet-4",
            // "anthropic/claude-3.7-sonnet",
          ],
          provider: {
            // max 3 options
            order: [
              "Google Vertex",
              "Google AI Studio",
              "Anthropic",
              // "Amazon Bedrock",
            ],
          },
        };
      } else {
        return selectModel({
          aiProvider: Provider.ANTHROPIC,
          aiModel,
          aiApiKey: null,
        });
      }
    }
  }

  // Configure OpenRouter provider options if using OpenRouter for default model
  // (but not overriding custom logic which already sets its own provider options)
  if (
    aiProvider === Provider.OPENROUTER &&
    env.DEFAULT_OPENROUTER_PROVIDERS &&
    !providerOptions.openrouter
  ) {
    const openRouterOptions = createOpenRouterProviderOptions(
      env.DEFAULT_OPENROUTER_PROVIDERS,
    );
    Object.assign(providerOptions, openRouterOptions);
  }

  return selectModel(
    {
      aiProvider,
      aiModel,
      aiApiKey,
    },
    providerOptions,
  );
}

function getProviderApiKey(provider: string) {
  const providerApiKeys: Record<string, string | undefined> = {
    [Provider.ANTHROPIC]: env.ANTHROPIC_API_KEY,
    [Provider.OPEN_AI]: env.OPENAI_API_KEY,
    [Provider.GOOGLE]: env.GOOGLE_API_KEY,
    [Provider.GROQ]: env.GROQ_API_KEY,
    [Provider.OPENROUTER]: env.OPENROUTER_API_KEY,
  };

  return providerApiKeys[provider];
}
