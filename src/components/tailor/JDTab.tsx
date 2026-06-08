"use client";

import { useAppStore, canProceedFromJD } from "@/lib/tailor/store";
import { TabActions } from "./TabActions";

interface JDTabProps {
  onBack: () => void;
  onNext: () => void;
}

export function JDTab({ onBack, onNext }: JDTabProps) {
  const { jd, setJobDescription } = useAppStore();
  const canNext = canProceedFromJD(jd);

  return (
    <div className="card card-accent space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
          Step 2
        </p>
        <h2 className="text-xl font-bold text-brand-900">Job Description</h2>
        <p className="mt-1 text-sm text-slate-600">
          Paste the full job posting you are applying to. We will align your resume
          with its requirements and keywords.
        </p>
      </div>

      <div>
        <label
          htmlFor="jobDescription"
          className="block text-sm font-semibold text-brand-800 mb-1.5"
        >
          Job description
        </label>
        <textarea
          id="jobDescription"
          rows={16}
          className="input-field text-sm leading-relaxed"
          placeholder="Paste the complete job description — responsibilities, requirements, qualifications, nice-to-haves..."
          value={jd.jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-slate-500">
          {jd.jobDescription.length} characters
          {jd.jobDescription.length < 50 && jd.jobDescription.length > 0 && (
            <span className="text-amber-600">
              {" "}
              — paste the full JD for accurate matching
            </span>
          )}
        </p>
      </div>

      <div className="tip-box">
        <h3 className="text-sm font-semibold text-brand-800">Tips for best results</h3>
        <ul className="mt-2 text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li>Include the full posting, not just the title</li>
          <li>Required skills and years of experience improve match scoring</li>
          <li>We never invent qualifications — only reframe what you already have</li>
        </ul>
      </div>

      <TabActions
        showBack
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!canNext}
      />
    </div>
  );
}
