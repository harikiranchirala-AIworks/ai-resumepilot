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
      : "Candidate resume (verbatim — this is the ONLY source of truth about the candidate)";

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

ABSOLUTE RULES — violating any of these is a failed response:
1. Use ONLY information that appears in the candidate profile above. Do NOT invent a name, email, phone, location, employer, job title, date range, degree, university, certification, project, or metric.
2. Extract the candidate's real NAME, EMAIL, PHONE, LOCATION, and LINKEDIN/GITHUB/PORTFOLIO links from the profile text and place them in a centered header block at the very top of the LaTeX body using \\begin{center} ... \\end{center}. If a contact field is genuinely missing from the profile, OMIT it — never write "[Name]", "[Email]", "Your Name", "TBD", "N/A", or any placeholder.
3. Every Experience entry MUST use the exact company name, role title, and date range from the profile. Reorder bullets and reword them to emphasize JD-relevant impact, but the underlying facts must come from the profile.
4. Skills section: list ONLY skills/tools that appear in the profile (you may group/rename, e.g. "React.js" → "React"). Do not add skills just because the JD mentions them.
5. Education section: use the exact degree, institution, and year(s) from the profile.
6. If the profile is too thin to fill a section (e.g. no projects listed), omit the section entirely instead of inventing content.
7. Quantified bullets are only allowed when the number actually appears in the profile. Otherwise write qualitative bullets.

Structure: Header (centered name + contacts) → Professional Summary → Experience → Skills → Education → (Projects / Certifications only if present in profile).

Reply with ONLY valid JSON matching this shape (no markdown fences, no commentary):
${TAILOR_JSON_SCHEMA}`;
}
