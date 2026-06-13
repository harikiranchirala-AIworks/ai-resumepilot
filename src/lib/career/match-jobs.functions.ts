import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/tailor/ai-gateway.server";
import { parseAgentJson } from "@/lib/tailor/parse-agent-json";
import type { AdzunaJob, JobSource } from "./adzuna.server";
import { fetchAggregatedJobs } from "./job-aggregator.server";

const InputSchema = z.object({
  profile: z.string().min(50).max(20000),
  keywords: z.string().max(200).optional().default(""),
  locations: z.array(z.string()).max(10).optional(),
  remoteOnly: z.boolean().optional().default(false),
  minSalary: z.number().min(0).optional(),
  page: z.number().int().min(1).max(10).optional().default(1),
  excludeIds: z.array(z.string().max(200)).max(180).optional().default([]),
});

export interface RankedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  salary?: string;
  description: string;
  sources: JobSource[];
  fitmentPercent: number;
  whyFit: string;
  gaps: string;
}

export interface MatchJobsResult {
  jobs: RankedJob[];
  overallNote: string;
  candidateSummary: string;
  totalScanned: number;
  totalCollected: number;
  duplicatesRemoved: number;
  sourceStats: Partial<Record<JobSource, number>>;
  page: number;
  hasMore: boolean;
}

const SYSTEM = `You are an expert career advisor and technical recruiter.
You receive a candidate profile and a list of real job postings. You must:
1. Read the candidate profile carefully (current role, skills, years of experience, domain).
2. Score every job 0-100 on how well the candidate's CURRENT profile fits the role (skills overlap, seniority, domain).
3. Pick the BEST 20 jobs the candidate should apply for, balancing fit and growth potential. Rank them by fitment descending.
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

    let jobs: AdzunaJob[] = [];
    let totalCollected = 0;
    let duplicatesRemoved = 0;
    let sourceStats: Partial<Record<JobSource, number>> = {};
    try {
      const aggregated = await fetchAggregatedJobs(data.keywords || "", {
        locations: data.locations,
        remoteOnly: data.remoteOnly,
        minSalary: data.minSalary,
        page: data.page,
      });
      const excludedIds = new Set(data.excludeIds);
      jobs = aggregated.jobs.filter((job) => !excludedIds.has(job.id));
      totalCollected = aggregated.totalCollected;
      duplicatesRemoved = aggregated.duplicatesRemoved;
      sourceStats = aggregated.sourceStats;
    } catch (err) {
      console.error("[matchJobs] fetchJobs failed:", err);
      throw new Error("Job search is temporarily unavailable. Please try again.");
    }
    console.log(`[matchJobs] collected ${totalCollected} jobs; ${jobs.length} after deduplication`);
    if (jobs.length === 0) {
      return {
        jobs: [],
        overallNote: "No jobs matched your filters. Try widening locations, removing remote-only, or lowering salary minimum.",
        candidateSummary: "",
        totalScanned: 0,
        totalCollected: 0,
        duplicatesRemoved: 0,
        sourceStats,
        page: data.page,
        hasMore: false,
      };
    }

    const compactJobs = jobs.slice(0, 80).map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      snippet: j.description.slice(0, 500),
      sources: j.sources,
    }));

    const locLabel =
      data.locations && data.locations.length
        ? data.locations.join(", ")
        : "Hyderabad, Bangalore, Remote";

    const prompt = `CANDIDATE PROFILE:
"""
${data.profile}
"""

JOB POSTINGS (${compactJobs.length} jobs from ${locLabel}):
${JSON.stringify(compactJobs, null, 2)}

Return JSON in this exact shape:
{
  "candidateSummary": "1-2 sentence summary of the candidate's current profile",
  "overallNote": "3-4 sentence note: theme of recommendations + the candidate's overall fitment range with this market (e.g. 'Overall fitment 65-82% — strong on X, lighter on Y')",
  "picks": [
    { "id": "<job id from list>", "fitmentPercent": 0-100, "whyFit": "2-3 sentences", "gaps": "1 sentence on what to close" }
  ]
}
Pick up to 20 picks ranked by fitment descending (fewer if <20 jobs available). Use ONLY ids from the list above.`;

    const gateway = createLovableAiGatewayProvider(apiKey);
    let text = "";
    try {
      const out = await generateText({
        model: gateway("google/gemini-2.5-flash"),
        system: SYSTEM,
        prompt,
      });
      text = out.text;
    } catch (err) {
      console.error("[matchJobs] AI gateway failed:", err);
      throw new Error("Job ranking is temporarily unavailable. Please try again.");
    }

    let parsed: AIResponse;
    try {
      parsed = parseAgentJson<AIResponse>(text);
    } catch (err) {
      console.error("[matchJobs] JSON parse failed. Raw text:", text.slice(0, 500));
      throw new Error("AI returned unparseable response. Please try again.");
    }
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
        description: job.description,
        sources: job.sources,
        fitmentPercent: Math.max(0, Math.min(100, Math.round(p.fitmentPercent))),
        whyFit: p.whyFit,
        gaps: p.gaps,
      });
      if (ranked.length >= 20) break;
    }
    ranked.sort((a, b) => b.fitmentPercent - a.fitmentPercent);

    return {
      jobs: ranked,
      overallNote: parsed.overallNote ?? "",
      candidateSummary: parsed.candidateSummary ?? "",
      totalScanned: jobs.length,
      totalCollected,
      duplicatesRemoved,
      sourceStats,
      page: data.page,
      hasMore: ranked.length === 20,
    };
  });
