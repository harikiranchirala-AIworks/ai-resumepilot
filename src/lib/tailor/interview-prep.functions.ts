import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { parseAgentJson } from "./parse-agent-json";

const InputSchema = z.object({
  profileContent: z.string().min(50).max(30000),
  jobDescription: z.string().min(50).max(30000),
  matchedKeywords: z.array(z.string().max(200)).max(100),
  missingKeywords: z.array(z.string().max(200)).max(100),
});

const OutputSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(1).max(1000),
        whyAsked: z.string().min(1).max(1000),
        answerPlan: z.array(z.string().min(1).max(500)).min(2).max(5),
        evidence: z.string().min(1).max(1000),
      }),
    )
    .length(10),
});

export type InterviewPrep = z.infer<typeof OutputSchema>;

const SYSTEM_PROMPT = `You are an expert interview coach. Create likely interview questions and practical answer plans grounded only in the supplied candidate profile and job description.
Rules:
- Never invent candidate experience, achievements, skills, or metrics
- Return exactly 10 questions: 5 technical or role-specific questions and 5 non-technical questions covering behavioral, situational, communication, and honest gap-handling topics
- Use matched keywords to identify strengths the interviewer may probe
- Use missing keywords to prepare honest gap responses, never to imply experience the candidate lacks
- For evidence, cite the most relevant real experience from the profile or explicitly say "No direct evidence—answer honestly and connect adjacent experience"
- Return valid JSON only in this shape: {"questions":[{"question":"...","whyAsked":"...","answerPlan":["..."],"evidence":"..."}]}`;

export const generateInterviewPrep = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<InterviewPrep> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Interview preparation is temporarily unavailable.");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system: SYSTEM_PROMPT,
      prompt: `Candidate profile:\n---\n${data.profileContent}\n---\n\nJob description:\n---\n${data.jobDescription}\n---\n\nMatched keywords: ${data.matchedKeywords.join(", ") || "None identified"}\nMissing keywords: ${data.missingKeywords.join(", ") || "None identified"}`,
    });
    return OutputSchema.parse(parseAgentJson<unknown>(text));
  });
