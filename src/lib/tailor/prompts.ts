export const TAILOR_JSON_SCHEMA = `{
  "latexBody": "LaTeX body only (sections, no documentclass). Escape special chars.",
  "summary": "2-3 sentence tailoring summary",
  "tailoredHighlights": ["bullet 1", "bullet 2"],
  "match": {
    "overallScore": 0,
    "keywordMatch": 0,
    "skillsMatch": 0,
    "experienceMatch": 0,
    "matchedKeywords": ["..."],
    "missingKeywords": ["..."],
    "recommendations": ["..."]
  },
  "ats": {
    "score": 0,
    "issues": ["..."],
    "strengths": ["..."],
    "formattingTips": ["..."]
  }
}`;

export function buildTailorPrompt(
  profileText: string,
  jobDescription: string,
  profileMode: "profileId" | "resumeText"
): string {
  const profileLabel =
    profileMode === "profileId"
      ? "Candidate profile ID / structured profile data"
      : "Candidate resume";

  return `You are an expert resume writer and ATS optimization specialist.

${profileLabel}:
---
${profileText}
---

Job Description:
---
${jobDescription}
---

Produce a tailored, honest LaTeX resume body (content only, no document preamble) aligned to this job.

Rules:
- Never fabricate experience, employers, degrees, or skills the candidate does not have
- Reframe and prioritize existing experience to match the JD
- Use strong action verbs and quantified bullets where the source material supports it
- Use ATS-friendly structure: Summary, Experience, Skills, Education
- Score match and ATS honestly based on the profile vs JD

Reply with ONLY valid JSON matching this shape (no markdown fences, no commentary):
${TAILOR_JSON_SCHEMA}`;
}
