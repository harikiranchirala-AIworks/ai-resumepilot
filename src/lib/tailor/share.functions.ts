import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { GenerateResult } from "./types";

const GenerateResultSchema = z.object({
  resume: z.object({
    latex: z.string().min(1).max(80000),
    summary: z.string().max(4000),
    tailoredHighlights: z.array(z.string().max(1000)).max(30),
  }),
  match: z.object({
    overallScore: z.number().min(0).max(100),
    keywordMatch: z.number().min(0).max(100),
    skillsMatch: z.number().min(0).max(100),
    experienceMatch: z.number().min(0).max(100),
    matchedKeywords: z.array(z.string().max(200)).max(100),
    missingKeywords: z.array(z.string().max(200)).max(100),
    recommendations: z.array(z.string().max(1000)).max(30),
  }),
  ats: z.object({
    score: z.number().min(0).max(100),
    issues: z.array(z.string().max(1000)).max(30),
    strengths: z.array(z.string().max(1000)).max(30),
    formattingTips: z.array(z.string().max(1000)).max(30),
  }),
});

const CreateShareSchema = z.object({
  jobTitle: z.string().trim().min(1).max(200),
  company: z.string().trim().min(1).max(200),
  location: z.string().trim().max(200),
  jobUrl: z.string().url().max(2000).or(z.literal("")),
  jobSummary: z.string().trim().min(1).max(12000),
  tailoredResult: GenerateResultSchema,
});

export const createResumeShare = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CreateShareSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin
      .from("resume_shares")
      .insert({
        job_title: data.jobTitle,
        company: data.company,
        location: data.location,
        job_url: data.jobUrl || null,
        job_summary: data.jobSummary,
        tailored_result: data.tailoredResult,
      })
      .select("id")
      .single();
    if (error) throw new Error("Could not create the share link.");
    return { id: created.id };
  });

const GetShareSchema = z.object({ id: z.string().uuid() });

export const getResumeShare = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => GetShareSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: share, error } = await supabaseAdmin
      .from("resume_shares")
      .select("id, job_title, company, location, job_url, job_summary, tailored_result, created_at, expires_at")
      .eq("id", data.id)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (error || !share) return null;
    const parsed = GenerateResultSchema.safeParse(share.tailored_result);
    if (!parsed.success) return null;
    return { ...share, tailored_result: parsed.data as GenerateResult };
  });