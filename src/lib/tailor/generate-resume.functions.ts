import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { buildTailorPrompt } from "./prompts";
import { parseAgentJson } from "./parse-agent-json";
import { buildFallbackLatex, buildLatexDocument } from "./latex";
import { analyzeATSHeuristic, analyzeMatchHeuristic } from "./ats";
import type { ATSAnalysis, GenerateResult, MatchAnalysis } from "./types";

const SYSTEM_PROMPT = `You are an expert resume writer and ATS optimization specialist.
Given a candidate profile and a job description, produce a tailored, honest LaTeX resume body (content only, no document preamble).
Rules:
- Never fabricate experience, employers, degrees, or skills the candidate does not have
- Reframe and prioritize existing experience to match the JD
- Use strong action verbs and quantified bullets where the source material supports it
- Use ATS-friendly structure: Summary, Experience, Skills, Education
- Output valid JSON only`;

const InputSchema = z.object({
  profileMode: z.enum(["profileId", "resumeText"]),
  profileContent: z.string().min(1),
  jobDescription: z.string().min(50),
});

interface AIResponse {
  latexBody: string;
  summary: string;
  tailoredHighlights: string[];
  match?: MatchAnalysis;
  ats?: ATSAnalysis;
}

export const generateResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<GenerateResult> => {
    const { profileMode, profileContent, jobDescription } = data;
    const profileText =
      profileMode === "profileId"
        ? `Profile ID: ${profileContent} (no resolver configured — using ID as profile reference)`
        : profileContent;

    const apiKey = process.env.LOVABLE_API_KEY;
    if (apiKey) {
      try {
        const gateway = createLovableAiGatewayProvider(apiKey);
        const { text } = await generateText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          prompt: buildTailorPrompt(profileText, jobDescription, profileMode),
        });

        const parsed = parseAgentJson<AIResponse>(text);
        const latex = buildLatexDocument(parsed.latexBody);
        return {
          resume: {
            latex,
            summary: parsed.summary,
            tailoredHighlights: parsed.tailoredHighlights ?? [],
          },
          match:
            parsed.match ?? analyzeMatchHeuristic(profileText, jobDescription),
          ats:
            parsed.ats ??
            analyzeATSHeuristic(latex, profileText, jobDescription),
        };
      } catch (err) {
        console.error("Lovable AI generation failed:", err);
      }
    }

    // Fallback: template + heuristic scoring
    const latex = buildFallbackLatex(profileText, jobDescription);
    return {
      resume: {
        latex,
        summary:
          "Template fallback used (AI unavailable). Edit the LaTeX to personalize.",
        tailoredHighlights: [],
      },
      match: analyzeMatchHeuristic(profileText, jobDescription),
      ats: analyzeATSHeuristic(latex, profileText, jobDescription),
    };
  });
