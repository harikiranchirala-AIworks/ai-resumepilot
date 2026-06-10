"use client";

import { useAppStore, canProceedFromProfile } from "@/lib/tailor/store";
import { TabActions } from "./TabActions";

interface ProfileTabProps {
  onNext: () => void;
}

export function ProfileTab({ onNext }: ProfileTabProps) {
  const { profile, setResumeText } = useAppStore();
  const canNext = canProceedFromProfile(profile);

  return (
    <div className="card card-accent space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
          Step 1
        </p>
        <h2 className="text-xl font-bold text-brand-900">Your Profile</h2>
        <p className="mt-1 text-sm text-slate-600">
          Paste your resume so we can read your background and tailor everything to it.
        </p>
      </div>

      <div>
        <label
          htmlFor="resumeText"
          className="block text-sm font-semibold text-brand-800 mb-1.5"
        >
          Resume text
        </label>
        <textarea
          id="resumeText"
          rows={16}
          className="input-field font-mono text-xs leading-relaxed"
          placeholder="Paste your full resume here — name, contact details, experience, education, skills, projects..."
          value={profile.resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-slate-500">
          {profile.resumeText.length} characters
          {profile.resumeText.length > 0 && profile.resumeText.length < 200 && (
            <span className="text-amber-600">
              {" "}
              — add more detail (aim for 800+ chars) for accurate job matching and tailoring
            </span>
          )}
        </p>
      </div>

      <TabActions onNext={onNext} nextDisabled={!canNext} />
    </div>
  );
}
