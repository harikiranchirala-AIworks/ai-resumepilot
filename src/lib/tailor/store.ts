import { create } from "zustand";
import type {
  GenerateResult,
  JDState,
  ProfileInputMode,
  ProfileState,
} from "./types";

interface AppStore {
  profile: ProfileState;
  jd: JDState;
  result: GenerateResult | null;
  isGenerating: boolean;
  error: string | null;

  setProfileMode: (mode: ProfileInputMode) => void;
  setProfileId: (id: string) => void;
  setResumeText: (text: string) => void;
  setJobDescription: (text: string) => void;
  setResult: (result: GenerateResult | null) => void;
  setIsGenerating: (value: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  profile: {
    mode: "resumeText",
    profileId: "",
    resumeText: "",
  },
  jd: {
    jobDescription: "",
  },
  result: null,
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
      profile: { ...state.profile, resumeText },
      result: null,
      error: null,
    })),
  setJobDescription: (jobDescription) =>
    set((state) => ({
      jd: { jobDescription },
      result: null,
      error: null,
    })),
  setResult: (result) => set({ result }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setError: (error) => set({ error }),
}));

export function getProfileContent(profile: ProfileState): string {
  if (profile.mode === "profileId") {
    return profile.profileId.trim();
  }
  return profile.resumeText.trim();
}

export function canProceedFromProfile(profile: ProfileState): boolean {
  return profile.mode === "profileId"
    ? profile.profileId.trim().length > 0
    : profile.resumeText.trim().length > 0;
}

export function canProceedFromJD(jd: JDState): boolean {
  return jd.jobDescription.trim().length > 0;
}

export function canGenerate(profile: ProfileState, jd: JDState): boolean {
  const hasProfile =
    profile.mode === "profileId"
      ? profile.profileId.trim().length > 0
      : profile.resumeText.trim().length > 50;
  const hasJD = jd.jobDescription.trim().length > 50;
  return hasProfile && hasJD;
}
