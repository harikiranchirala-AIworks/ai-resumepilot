import { create } from "zustand";
import type {
  GenerateResult,
  JDState,
  ParsedProfile,
  ProfileInputMode,
  ProfileState,
  SelectedJob,
} from "./types";

interface AppStore {
  profile: ProfileState;
  jd: JDState;
  result: GenerateResult | null;
  selectedJob: SelectedJob | null;
  isGenerating: boolean;
  error: string | null;

  setProfileMode: (mode: ProfileInputMode) => void;
  setProfileId: (id: string) => void;
  setResumeText: (text: string) => void;
  setParsed: (parsed: ParsedProfile | null) => void;
  updateParsed: (patch: Partial<ParsedProfile>) => void;
  setJobDescription: (text: string) => void;
  setSelectedJob: (job: SelectedJob | null) => void;
  setResult: (result: GenerateResult | null) => void;
  setIsGenerating: (value: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  profile: {
    mode: "resumeText",
    profileId: "",
    resumeText: "",
    parsed: null,
  },
  jd: {
    jobDescription: "",
  },
  result: null,
  selectedJob: null,
  isGenerating: false,
  error: null,

  setProfileMode: (mode) =>
    set((state) => ({
      profile: { ...state.profile, mode },
      result: null,
      error: null,
    })),
  setProfileId: (profileId) =>
    set((state) => ({
      profile: { ...state.profile, profileId },
      result: null,
      error: null,
    })),
  setResumeText: (resumeText) =>
    set((state) => ({
      // Editing raw resume invalidates the parsed structure
      profile: { ...state.profile, resumeText, parsed: null },
      result: null,
      error: null,
    })),
  setParsed: (parsed) =>
    set((state) => ({
      profile: { ...state.profile, parsed },
      result: null,
      error: null,
    })),
  updateParsed: (patch) =>
    set((state) => ({
      profile: {
        ...state.profile,
        parsed: state.profile.parsed
          ? { ...state.profile.parsed, ...patch }
          : state.profile.parsed,
      },
      result: null,
      error: null,
    })),
  setJobDescription: (jobDescription) =>
    set((state) => ({
      jd: { jobDescription },
      result: null,
      error: null,
    })),
  setSelectedJob: (selectedJob) => set({ selectedJob }),
  setResult: (result) => set({ result }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setError: (error) => set({ error }),
}));

export function formatParsedProfile(p: ParsedProfile): string {
  const lines: string[] = [];
  if (p.name) lines.push(p.name);
  const contact = [p.email, p.phone, p.location].filter(Boolean).join(" | ");
  if (contact) lines.push(contact);
  if (p.links.length) lines.push(p.links.join(" | "));
  if (p.headline) lines.push(`\nHeadline: ${p.headline}`);
  if (p.summary) lines.push(`\nSummary:\n${p.summary}`);
  if (p.skills.length) lines.push(`\nSkills: ${p.skills.join(", ")}`);
  if (p.experience.length) {
    lines.push(`\nExperience:`);
    for (const e of p.experience) {
      lines.push(
        `- ${e.title} @ ${e.company}${e.location ? ` (${e.location})` : ""} — ${e.dates}`,
      );
      for (const b of e.bullets) lines.push(`  • ${b}`);
    }
  }
  if (p.education.length) {
    lines.push(`\nEducation:`);
    for (const e of p.education)
      lines.push(`- ${e.degree}, ${e.institution} — ${e.dates}`);
  }
  if (p.projects.length) {
    lines.push(`\nProjects:`);
    for (const p2 of p.projects) lines.push(`- ${p2.name}: ${p2.description}`);
  }
  if (p.certifications.length)
    lines.push(`\nCertifications: ${p.certifications.join(", ")}`);
  return lines.join("\n");
}

export function getProfileContent(profile: ProfileState): string {
  if (profile.parsed) return formatParsedProfile(profile.parsed);
  if (profile.mode === "profileId") return profile.profileId.trim();
  return profile.resumeText.trim();
}

export function canProceedFromProfile(profile: ProfileState): boolean {
  if (profile.parsed) return true;
  return profile.mode === "profileId"
    ? profile.profileId.trim().length > 0
    : profile.resumeText.trim().length > 0;
}

export function canProceedFromJD(jd: JDState): boolean {
  return jd.jobDescription.trim().length > 0;
}

export function canGenerate(profile: ProfileState, jd: JDState): boolean {
  const hasProfile = getProfileContent(profile).length > 50;
  const hasJD = jd.jobDescription.trim().length > 50;
  return hasProfile && hasJD;
}
