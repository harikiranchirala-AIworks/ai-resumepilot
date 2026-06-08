"use client";

import { useAppStore, canProceedFromProfile } from "@/lib/tailor/store";
import { TabActions } from "./TabActions";

interface ProfileTabProps {
  onNext: () => void;
}

export function ProfileTab({ onNext }: ProfileTabProps) {
  const { profile, setProfileMode, setProfileId, setResumeText } = useAppStore();
  const canNext = canProceedFromProfile(profile);

  return (
    <div className="card card-accent space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
          Step 1
        </p>
        <h2 className="text-xl font-bold text-brand-900">Your Profile</h2>
        <p className="mt-1 text-sm text-slate-600">
          Provide your background so we can tailor a resume for the target role.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-brand-800 mb-2">
          How would you like to provide your profile?
        </legend>

        <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-brand-100 cursor-pointer hover:border-brand-200 hover:bg-brand-50/50 transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:shadow-sm">
          <input
            type="radio"
            name="profileMode"
            value="profileId"
            checked={profile.mode === "profileId"}
            onChange={() => setProfileMode("profileId")}
            className="mt-1 text-brand-600 focus:ring-brand-500"
          />
          <div>
            <span className="block text-sm font-semibold text-brand-900">
              Profile ID
            </span>
            <span className="block text-xs text-slate-500 mt-0.5">
              Enter an existing profile identifier from your account or database.
            </span>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-brand-100 cursor-pointer hover:border-brand-200 hover:bg-brand-50/50 transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:shadow-sm">
          <input
            type="radio"
            name="profileMode"
            value="resumeText"
            checked={profile.mode === "resumeText"}
            onChange={() => setProfileMode("resumeText")}
            className="mt-1 text-brand-600 focus:ring-brand-500"
          />
          <div>
            <span className="block text-sm font-semibold text-brand-900">
              Paste full resume
            </span>
            <span className="block text-xs text-slate-500 mt-0.5">
              Copy and paste your current resume text (recommended for best results).
            </span>
          </div>
        </label>
      </fieldset>

      {profile.mode === "profileId" ? (
        <div>
          <label
            htmlFor="profileId"
            className="block text-sm font-semibold text-brand-800 mb-1.5"
          >
            Profile ID
          </label>
          <input
            id="profileId"
            type="text"
            className="input-field"
            placeholder="e.g. usr_abc123 or employee-0042"
            value={profile.profileId}
            onChange={(e) => setProfileId(e.target.value)}
          />
        </div>
      ) : (
        <div>
          <label
            htmlFor="resumeText"
            className="block text-sm font-semibold text-brand-800 mb-1.5"
          >
            Resume text
          </label>
          <textarea
            id="resumeText"
            rows={14}
            className="input-field font-mono text-xs leading-relaxed"
            placeholder="Paste your full resume here — experience, education, skills, projects..."
            value={profile.resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-slate-500">
            {profile.resumeText.length} characters
            {profile.resumeText.length < 50 && profile.resumeText.length > 0 && (
              <span className="text-amber-600">
                {" "}
                — add more detail for better tailoring
              </span>
            )}
          </p>
        </div>
      )}

      <TabActions onNext={onNext} nextDisabled={!canNext} />
    </div>
  );
}
