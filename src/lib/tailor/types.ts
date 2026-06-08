export type ProfileInputMode = "profileId" | "resumeText";

export interface ProfileState {
  mode: ProfileInputMode;
  profileId: string;
  resumeText: string;
}

export interface JDState {
  jobDescription: string;
}

export interface MatchAnalysis {
  overallScore: number;
  keywordMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendations: string[];
}

export interface ATSAnalysis {
  score: number;
  issues: string[];
  strengths: string[];
  formattingTips: string[];
}

export interface GeneratedResume {
  latex: string;
  summary: string;
  tailoredHighlights: string[];
}

export interface GenerateResult {
  resume: GeneratedResume;
  match: MatchAnalysis;
  ats: ATSAnalysis;
}
