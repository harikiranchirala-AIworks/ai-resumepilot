import type { ATSAnalysis } from "./types";

const ATS_POSITIVE_PATTERNS = [
  /\b(experience|skills|education|summary|projects|certifications)\b/i,
  /\b(led|managed|developed|implemented|achieved|increased|reduced)\b/i,
  /\d+%|\$\d+|\d+\+/,
];

const ATS_NEGATIVE_PATTERNS = [
  /\b(photo|image|graphic|chart|table of contents)\b/i,
  /[^\x00-\x7F]/,
  /\b(see attached|click here)\b/i,
];

export function analyzeATSHeuristic(
  latex: string,
  profileText: string,
  jobDescription: string
): ATSAnalysis {
  const issues: string[] = [];
  const strengths: string[] = [];
  const formattingTips: string[] = [];

  const sections = ["section", "textbf", "itemize"];
  const hasSections = sections.every((s) => latex.includes(s));
  if (hasSections) {
    strengths.push("Uses clear section headings and bullet lists");
  } else {
    issues.push("Missing standard resume sections or bullet formatting");
  }

  if (!latex.includes("includegraphics")) {
    strengths.push("No embedded images — good for ATS parsing");
  } else {
    issues.push("Contains images which ATS systems may ignore");
  }

  if (latex.includes("hyperref")) {
    formattingTips.push("Hyperlinks are enabled; ensure URLs are plain text too");
  }

  const jdKeywords = extractKeywords(jobDescription);
  const resumeLower = (latex + profileText).toLowerCase();
  const matched = jdKeywords.filter((kw) => resumeLower.includes(kw.toLowerCase()));
  const matchRatio = jdKeywords.length ? matched.length / jdKeywords.length : 0;

  if (matchRatio >= 0.6) {
    strengths.push(`Strong keyword alignment (${Math.round(matchRatio * 100)}% of JD terms)`);
  } else if (matchRatio >= 0.35) {
    formattingTips.push("Add more job-description keywords where honestly applicable");
  } else {
    issues.push("Low keyword overlap with the job description");
  }

  let score = 70;
  score += strengths.length * 5;
  score -= issues.length * 8;
  score += Math.round(matchRatio * 20);
  score = Math.min(100, Math.max(0, score));

  if (!formattingTips.length) {
    formattingTips.push(
      "Use standard section names: Experience, Education, Skills",
      "Keep one column; avoid tables and text boxes",
      "Use consistent date formats (e.g., Jan 2022 – Present)"
    );
  }

  return { score, issues, strengths, formattingTips };
}

export function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "the", "and", "for", "with", "you", "your", "our", "will", "this", "that",
    "are", "have", "from", "able", "work", "team", "role", "job", "years",
    "experience", "required", "preferred", "including", "using", "must",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const bigrams: string[] = [];
  const tokens = text.toLowerCase().match(/[a-z]+(?:\s+[a-z]+){1,2}/g) ?? [];
  for (const t of tokens) {
    if (!stopWords.has(t.split(" ")[0])) bigrams.push(t);
  }

  const freq = new Map<string, number>();
  for (const w of [...words, ...bigrams]) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([w]) => w);
}

export function analyzeMatchHeuristic(
  profileText: string,
  jobDescription: string
): import("./types").MatchAnalysis {
  const keywords = extractKeywords(jobDescription);
  const profileLower = profileText.toLowerCase();
  const matchedKeywords = keywords.filter((kw) => profileLower.includes(kw));
  const missingKeywords = keywords.filter((kw) => !profileLower.includes(kw));

  const keywordMatch = keywords.length
    ? Math.round((matchedKeywords.length / keywords.length) * 100)
    : 0;

  const skillPatterns = [
    /\b(javascript|typescript|python|java|react|node|sql|aws|docker|kubernetes|agile|leadership|communication)\b/gi,
  ];
  const jdSkills = new Set<string>();
  const profileSkills = new Set<string>();
  for (const pattern of skillPatterns) {
    for (const m of jobDescription.matchAll(pattern)) jdSkills.add(m[0].toLowerCase());
    for (const m of profileText.matchAll(pattern)) profileSkills.add(m[0].toLowerCase());
  }
  const skillOverlap = [...jdSkills].filter((s) => profileSkills.has(s));
  const skillsMatch = jdSkills.size
    ? Math.round((skillOverlap.length / jdSkills.size) * 100)
    : keywordMatch;

  const expMatch = /\d+\+?\s*(years?|yrs?)/i.test(profileText) ? 75 : 50;
  const experienceMatch = Math.min(100, expMatch + (keywordMatch > 50 ? 15 : 0));
  const overallScore = Math.round(
    keywordMatch * 0.45 + skillsMatch * 0.35 + experienceMatch * 0.2
  );

  const recommendations: string[] = [];
  if (missingKeywords.length > 0) {
    recommendations.push(
      `Incorporate these JD terms where accurate: ${missingKeywords.slice(0, 6).join(", ")}`
    );
  }
  if (skillsMatch < 60) {
    recommendations.push("Highlight transferable skills that map to the role's tech stack");
  }
  if (keywordMatch < 50) {
    recommendations.push("Rewrite bullet points to mirror the job description language");
  }
  recommendations.push("Quantify achievements with metrics relevant to the role");

  return {
    overallScore,
    keywordMatch,
    skillsMatch,
    experienceMatch,
    matchedKeywords: matchedKeywords.slice(0, 15),
    missingKeywords: missingKeywords.slice(0, 15),
    recommendations,
  };
}
