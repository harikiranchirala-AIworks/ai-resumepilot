import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/tailor/ai-gateway.server";
import { parseAgentJson } from "@/lib/tailor/parse-agent-json";
import { fetchJobs, type AdzunaJob } from "./adzuna.server";

const InputSchema = z.object({
  profile: z.string().min(50).max(20000),
  keywords: z.string().max(200).optional().default(""),
});

export interface RankedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  salary?: string;
  description: string;
  fitmentPercent: number;
  whyFit: string;
  gaps: string;
}

export interface MatchJobsResult {
  jobs: RankedJob[];
  overallNote: string;
  candidateSummary: string;
  totalScanned: number;
}

const SYSTEM = `You are an expert career advisor and technical recruiter.
You receive a candidate profile and a list of real job postings. You must:
1. Read the candidate profile carefully (current role, skills, years of experience, domain).
2. Score every job 0-100 on how well the candidate's CURRENT profile fits the role (skills overlap, seniority, domain).
3. Pick the BEST 5 jobs the candidate should apply for, balancing fit and growth potential.
4. For each, write a concise honest justification and the main gap to close.
5. Write an overall note explaining the theme of the recommendations and the candidate's overall fitment percentage range with this market.
Return ONLY valid JSON. No prose, no markdown fences.`;

interface AIResponse {
  candidateSummary: string;
  overallNote: string;
  picks: Array<{
    id: string;
    fitmentPercent: number;
    whyFit: string;
    gaps: string;
  }>;
}

export const matchJobs = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<MatchJobsResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI gateway not configured.");

    const jobs = await fetchJobs(data.keywords || "");
    if (jobs.length === 0) {
      return {
        jobs: [],
        overallNote: "No jobs found from Adzuna for the requested locations. Try different keywords.",
        candidateSummary: "",
        totalScanned: 0,
      };
    }

    const compactJobs = jobs.slice(0, 40).map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      snippet: j.description.slice(0, 600),
    }));

    const prompt = `CANDIDATE PROFILE:
"""
${data.profile}
"""

JOB POSTINGS (${compactJobs.length} jobs from Hyderabad, Bangalore, Remote):
${JSON.stringify(compactJobs, null, 2)}

Return JSON in this exact shape:
{
  "candidateSummary": "1-2 sentence summary of the candidate's current profile",
  "overallNote": "3-4 sentence note: theme of recommendations + the candidate's overall fitment range with this market (e.g. 'Overall fitment 65-82% — strong on X, lighter on Y')",
  "picks": [
    { "id": "<job id from list>", "fitmentPercent": 0-100, "whyFit": "2-3 sentences", "gaps": "1 sentence on what to close" }
  ]
}
Pick exactly 5 picks (or fewer if <5 jobs available). Use ONLY ids from the list above.`;

    const gateway = createLovableAiGatewayProvider(apiKey);
    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system: SYSTEM,
      prompt,
    });

    const parsed = parseAgentJson<AIResponse>(text);
    const byId = new Map<string, AdzunaJob>(jobs.map((j) => [j.id, j]));

    const ranked: RankedJob[] = [];
    for (const p of parsed.picks ?? []) {
      const job = byId.get(p.id);
      if (!job) continue;
      ranked.push({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        salary: job.salary,
        fitmentPercent: Math.max(0, Math.min(100, Math.round(p.fitmentPercent))),
        whyFit: p.whyFit,
        gaps: p.gaps,
      });
      if (ranked.length >= 5) break;
    }

    return {
      jobs: ranked,
      overallNote: parsed.overallNote ?? "",
      candidateSummary: parsed.candidateSummary ?? "",
      totalScanned: jobs.length,
    };
  });
