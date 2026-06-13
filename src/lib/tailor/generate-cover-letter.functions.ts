import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const InputSchema = z.object({
  profileContent: z.string().min(50),
  jobDescription: z.string().min(50),
});

const SYSTEM_PROMPT = `You are an expert career writer. Write a concise, persuasive cover letter using only facts found in the candidate profile.
Rules:
- Never invent experience, employers, qualifications, metrics, names, or contact details
- Tailor the letter to the role and its most important requirements
- Use a confident, natural tone without clichés or exaggerated claims
- Keep it between 250 and 350 words
- Return only the finished cover letter as plain text`;

export const generateCoverLetter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("Cover letter generation is temporarily unavailable.");
    }

    const gateway = createLovableAiGatewayProvider(apiKey);
    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system: SYSTEM_PROMPT,
      prompt: `Candidate profile:\n---\n${data.profileContent}\n---\n\nJob description:\n---\n${data.jobDescription}\n---`,
    });

    return { coverLetter: text.trim() };
  });