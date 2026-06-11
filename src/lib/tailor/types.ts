export type ProfileInputMode = "profileId" | "resumeText";

export interface ParsedExperience {
  company: string;
  title: string;
  dates: string;
  location?: string;
  bullets: string[];
}

export interface ParsedEducation {
  degree: string;
  institution: string;
  dates: string;
}

export interface ParsedProject {
  name: string;
  description: string;
}

export interface ParsedProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  links: string[];
  headline: string;
  summary: string;
  skills: string[];
  experience: ParsedExperience[];
  education: ParsedEducation[];
  projects: ParsedProject[];
  certifications: string[];
}

export interface ProfileState {
  mode: ProfileInputMode;
  profileId: string;
  resumeText: string;
  parsed: ParsedProfile | null;
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
