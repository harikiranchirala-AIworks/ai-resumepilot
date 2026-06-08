"use client";

import { useCallback } from "react";
import { useAppStore, canGenerate, getProfileContent } from "@/lib/tailor/store";
import { ScoreBadge } from "./ScoreBadge";
import { TabActions } from "./TabActions";
import { ResumePdfPreview } from "./ResumePdfPreview";
import type { GenerateResult } from "@/lib/tailor/types";

interface ResumeTabProps {
  onBack: () => void;
}

export function ResumeTab({ onBack }: ResumeTabProps) {
  const {
    profile,
    jd,
    result,
    isGenerating,
    error,
    setResult,
    setIsGenerating,
    setError,
  } = useAppStore();

  const handleGenerate = useCallback(async () => {
    if (!canGenerate(profile, jd)) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileMode: profile.mode,
          profileContent: getProfileContent(profile),
          jobDescription: jd.jobDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Generation failed");
      }

      setResult(data as GenerateResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }, [profile, jd, setResult, setIsGenerating, setError]);

  const ready = canGenerate(profile, jd);

  return (
    <div className="space-y-6">
      <div className="card card-accent">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
            Step 3
          </p>
          <h2 className="text-xl font-bold text-brand-900">Tailored LaTeX Resume</h2>
          <p className="mt-1 text-sm text-slate-600">
            Generate an ATS-friendly resume customized for your target job.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!ready || isGenerating}
          className="btn-primary w-full sm:w-auto"
        >
          {isGenerating ? "Generating…" : "Generate Resume"}
        </button>

        <TabActions showBack onBack={onBack} />

        {!ready && (
          <p className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            Complete Profile and Job Description with at least 50 characters each.
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
      </div>

      {result && (
        <>
          <div className="card">
            <h3 className="text-sm font-bold text-brand-900 mb-4">
              Profile ↔ Job Description Match
            </h3>
            <div className="flex flex-wrap justify-around gap-6 mb-6">
              <ScoreBadge label="Overall match" score={result.match.overallScore} />
              <ScoreBadge label="Keywords" score={result.match.keywordMatch} size="sm" />
              <ScoreBadge label="Skills" score={result.match.skillsMatch} size="sm" />
              <ScoreBadge label="Experience" score={result.match.experienceMatch} size="sm" />
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-brand-50/60 border border-brand-100 p-4">
                <h4 className="font-semibold text-brand-800 mb-2">Matched keywords</h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.match.matchedKeywords.length ? (
                    result.match.matchedKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-xs font-medium"
                      >
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-xs">None detected yet</span>
                  )}
                </div>
              </div>
              <div className="rounded-xl bg-amber-50/80 border border-amber-100 p-4">
                <h4 className="font-semibold text-amber-900 mb-2">Missing keywords</h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.match.missingKeywords.length ? (
                    result.match.missingKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-medium"
                      >
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-xs">Great coverage!</span>
                  )}
                </div>
              </div>
            </div>

            <ul className="mt-4 text-xs text-slate-600 space-y-1 list-disc list-inside">
              {result.match.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-brand-900">ATS Compatibility</h3>
              <ScoreBadge label="ATS score" score={result.ats.score} size="sm" />
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-xl bg-brand-50/50 p-3 border border-brand-100">
                <h4 className="font-semibold text-brand-800 mb-2">Strengths</h4>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {result.ats.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-rose-50/50 p-3 border border-rose-100">
                <h4 className="font-semibold text-rose-800 mb-2">Issues</h4>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {result.ats.issues.length ? (
                    result.ats.issues.map((s, i) => <li key={i}>{s}</li>)
                  ) : (
                    <li className="list-none text-slate-500">No major issues</li>
                  )}
                </ul>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <h4 className="font-semibold text-brand-800 mb-2">Formatting tips</h4>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {result.ats.formattingTips.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <ResumePdfPreview
            latex={result.resume.latex}
            summary={result.resume.summary}
            highlights={result.resume.tailoredHighlights}
          />
        </>
      )}
    </div>
  );
}
