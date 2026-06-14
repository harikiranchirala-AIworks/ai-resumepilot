import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { buildInterviewPrepPrompt } from "./prompts";
import { parseAgentJson } from "./parse-agent-json";
import type { InterviewPrep } from "./types";

const SYSTEM_PROMPT = `You are an expert interview coach and hiring manager.
Your goal is to prepare a candidate for an interview based on their profile, a specific job description, and the match analysis.
Output valid JSON only.`;

const InputSchema = z.object({
  profileContent: z.string().min(1),
  jobDescription: z.string().min(50),
  matchData: z.any().optional(),
});

export const generateInterviewPrep = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<InterviewPrep> => {
    const { profileContent, jobDescription, matchData } = data;

    const apiKey = process.env.LOVABLE_API_KEY;
    if (apiKey) {
      try {
        const gateway = createLovableAiGatewayProvider(apiKey);
        const { text } = await generateText({
          model: gateway("google/gemini-2.0-flash-exp"),
          system: SYSTEM_PROMPT,
          prompt: buildInterviewPrepPrompt(profileContent, jobDescription, matchData),
        });

        return parseAgentJson<InterviewPrep>(text);
      } catch (err) {
        console.error("Interview prep generation failed:", err);
        throw err;
      }
    }

    // Fallback or error
    throw new Error("AI generation unavailable (missing API key)");
  });
