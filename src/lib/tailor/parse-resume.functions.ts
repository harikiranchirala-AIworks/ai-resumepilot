import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { parseAgentJson } from "./parse-agent-json";
import type { ParsedProfile } from "./types";

const InputSchema = z.object({
  resumeText: z.string().min(50).max(40000),
});

const SYSTEM = `You are a precise resume parser. You convert raw pasted resume text into a clean structured JSON profile.
RULES:
- Extract ONLY what is present in the text. Never invent a name, email, phone, employer, title, date, degree, or skill.
- If a field is missing, return an empty string or empty array — never placeholders like "N/A" or "TBD".
- Preserve dates exactly as written (e.g. "Jan 2022 – Present").
- Bullets: keep each as a single concise line, strip leading "•" / "-" / numbering.
- Skills: list discrete tools, languages, frameworks, methodologies. Deduplicate. No sentences.
- Return ONLY valid JSON. No prose. No markdown fences.`;

export const parseResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<ParsedProfile> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI gateway not configured.");

    const prompt = `Parse this resume into structured JSON.

RESUME TEXT:
"""
${data.resumeText}
"""

Return JSON in exactly this shape:
{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "links": ["linkedin/portfolio/github urls"],
  "headline": "current role / one-line headline if present",
  "summary": "professional summary or about section, verbatim if present, else empty",
  "skills": ["skill1", "skill2"],
  "experience": [
    { "company": "", "title": "", "dates": "", "location": "", "bullets": ["", ""] }
  ],
  "education": [
    { "degree": "", "institution": "", "dates": "" }
  ],
  "projects": [
    { "name": "", "description": "" }
  ],
  "certifications": ["cert1"]
}`;

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
      console.error("[parseResume] AI failed:", err);
      throw new Error("Resume parsing is temporarily unavailable. Please try again.");
    }

    let parsed: Partial<ParsedProfile>;
    try {
      parsed = parseAgentJson<Partial<ParsedProfile>>(text);
    } catch (err) {
      console.error("[parseResume] JSON parse failed. Raw:", text.slice(0, 500));
      throw new Error("Couldn't parse AI response. Please try again.");
    }

    // Normalize with safe defaults
    return {
      name: parsed.name ?? "",
      email: parsed.email ?? "",
      phone: parsed.phone ?? "",
      location: parsed.location ?? "",
      links: Array.isArray(parsed.links) ? parsed.links.filter(Boolean) : [],
      headline: parsed.headline ?? "",
      summary: parsed.summary ?? "",
      skills: Array.isArray(parsed.skills) ? parsed.skills.filter(Boolean) : [],
      experience: Array.isArray(parsed.experience)
        ? parsed.experience.map((e) => ({
            company: e?.company ?? "",
            title: e?.title ?? "",
            dates: e?.dates ?? "",
            location: e?.location ?? "",
            bullets: Array.isArray(e?.bullets) ? e.bullets.filter(Boolean) : [],
          }))
        : [],
      education: Array.isArray(parsed.education)
        ? parsed.education.map((e) => ({
            degree: e?.degree ?? "",
            institution: e?.institution ?? "",
            dates: e?.dates ?? "",
          }))
        : [],
      projects: Array.isArray(parsed.projects)
        ? parsed.projects.map((p) => ({
            name: p?.name ?? "",
            description: p?.description ?? "",
          }))
        : [],
      certifications: Array.isArray(parsed.certifications)
        ? parsed.certifications.filter(Boolean)
        : [],
    };
  });
