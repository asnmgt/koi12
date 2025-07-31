import { z } from "zod";
import { chatCompletionObject } from "@/utils/llms";
import type { EmailAccountWithAI } from "@/utils/llms/types";
import { createScopedLogger } from "@/utils/logger";
import type { EmailForLLM } from "@/utils/types";
import { stringifyEmailSimple } from "@/utils/stringify-email";

export const schema = z.object({
  type: z.enum(["structured", "unstructured"]).describe("Type of content"),
  content: z
    .union([
      z.array(
        z.object({
          label: z.string(),
          value: z.string(),
        }),
      ),
      z.string(),
    ])
    .describe("The content - either structured entries or summary text"),
});

const logger = createScopedLogger("summarize-digest-email");

export type AISummarizeResult = z.infer<typeof schema>;

export async function aiSummarizeEmailForDigest({
  ruleName,
  emailAccount,
  messageToSummarize,
}: {
  ruleName: string;
  emailAccount: EmailAccountWithAI;
  messageToSummarize: EmailForLLM;
}): Promise<AISummarizeResult | null> {
  // If messageToSummarize somehow is null/undefined, default to null.
  if (!messageToSummarize) return null;

  const userMessageForPrompt = messageToSummarize;

  const system = `You are an AI assistant that processes emails for inclusion in a daily digest.

Your task is to:
1. **Classify** the email as either "structured" or "unstructured".
2. **Summarize** the content accordingly using the provided schema.

**Classification rules:**
- Use "structured" if the email contains extractable fields such as order details, totals, dates, IDs, payment info, or similar.
- Use "unstructured" if the email is a narrative, update, announcement, or message without discrete fields.
- If the email is spam, promotional, or irrelevant, return "null".

**Formatting rules:**
- Follow the schema provided separately (do not describe or return the schema).
- Do not include HTML, markdown, or explanations.
- Return only the final JSON result (or "null").

Now, classify and summarize the following email:
`;

  const prompt = `
<email_content>
${stringifyEmailSimple(userMessageForPrompt)}
</email_content>

Use this category as context to help interpret the email: ${ruleName}.`;

  logger.trace("Input", { system, prompt });

  logger.info("Summarizing email for digest");

  try {
    const aiResponse = await chatCompletionObject({
      userAi: emailAccount.user,
      system,
      prompt,
      schema,
      userEmail: emailAccount.email,
      usageLabel: "Summarize email",
    });

    logger.trace("Result", { response: aiResponse.object });

    // Temporary logging to check the summarization output
    if (aiResponse.object.type === "unstructured") {
      logger.info("Summarized email as summary", {
        length: aiResponse.object.content.length,
      });
    } else if (aiResponse.object.type === "structured") {
      logger.info("Summarized email as entries", {
        length: aiResponse.object.content.length,
      });
    } else {
      logger.info("Content not worth summarizing");
    }

    return aiResponse.object;
  } catch (error) {
    logger.error("Failed to summarize email", { error });

    return null;
  }
}
