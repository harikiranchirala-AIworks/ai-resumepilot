"use client";

import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Share2 } from "lucide-react";
import { useAppStore, canGenerate, getProfileContent } from "@/lib/tailor/store";
import { generateResume } from "@/lib/tailor/generate-resume.functions";
import { generateCoverLetter } from "@/lib/tailor/generate-cover-letter.functions";
import { ScoreBadge } from "./ScoreBadge";
import { TabActions } from "./TabActions";
import { ResumePdfPreview } from "./ResumePdfPreview";
import { createResumeShare } from "@/lib/tailor/share.functions";
import { Button } from "@/components/ui/button";
import { trackFunnelEvent } from "@/lib/analytics";

interface ResumeTabProps {
  onNext?: () => void;
  onBack: () => void;
}

export function ResumeTab({ onBack, onNext }: ResumeTabProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const {
    profile,
    jd,
    result,
    isGenerating,
    error,
    selectedJob,
    setResult,
    setIsGenerating,
    setError,
  } = useAppStore();

  const generateFn = useServerFn(generateResume);
  const generateCoverLetterFn = useServerFn(generateCoverLetter);
  const createShareFn = useServerFn(createResumeShare);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate(profile, jd)) return;

    setIsGenerating(true);
    setError(null);

    try {
      const data = await generateFn({
        data: {
          profileMode: profile.mode,
          profileContent: getProfileContent(profile),
          jobDescription: jd.jobDescription,
        },
      });
      setResult(data);
      trackFunnelEvent("resume_generated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }, [profile, jd, generateFn, setResult, setIsGenerating, setError]);

  const handleGenerateCoverLetter = useCallback(async () => {
    if (!canGenerate(profile, jd)) return;
    setIsGeneratingLetter(true);
    setCoverLetterError(null);
    try {
      const data = await generateCoverLetterFn({
        data: {
          profileContent: getProfileContent(profile),
          jobDescription: jd.jobDescription,
        },
      });
      setCoverLetter(data.coverLetter);
    } catch (err) {
      setCoverLetterError(err instanceof Error ? err.message : "Could not generate the cover letter");
    } finally {
      setIsGeneratingLetter(false);
    }
  }, [profile, jd, generateCoverLetterFn]);

  const handleLatexChange = useCallback(
    (latex: string) => {
      if (!result) return;
      setResult({ ...result, resume: { ...result.resume, latex } });
    },
    [result, setResult],
  );

  const copyCoverLetter = useCallback(async () => {
    await navigator.clipboard.writeText(coverLetter);
  }, [coverLetter]);

  const handleShare = useCallback(async () => {
    if (!result || !selectedJob) return;
    setIsSharing(true);
    setShareError(null);
    try {
      const created = await createShareFn({
        data: {
          jobTitle: selectedJob.title,
          company: selectedJob.company,
          location: selectedJob.location,
          jobUrl: selectedJob.url,
          jobSummary: jd.jobDescription.slice(0, 12000),
          tailoredResult: result,
        },
      });
      const url = `${window.location.origin}/share/${created.id}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
    } catch (err) {
      setShareError(err instanceof Error ? err.message : "Could not create a share link");
    } finally {
      setIsSharing(false);
    }
  }, [createShareFn, jd.jobDescription, result, selectedJob]);

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

        <TabActions 
          showBack 
          onBack={onBack} 
          onNext={result ? onNext : undefined} 
          nextLabel="Prepare for Interview" 
        />

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
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Invite feedback on this application</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedJob ? "Creates a 90-day link with the selected job and tailored preview only." : "Select a job from Available Jobs to enable a shareable mentor link."}
              </p>
            </div>
            <Button type="button" variant="outline" onClick={handleShare} disabled={!selectedJob || isSharing}>
              {shareUrl ? <Check /> : <Share2 />}
              {isSharing ? "Creating…" : shareUrl ? "Link copied" : "Share for feedback"}
            </Button>
            {shareUrl && <Button type="button" variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(shareUrl)}><Copy /> Copy again</Button>}
          </div>
          {shareError && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{shareError}</p>}
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
            onLatexChange={handleLatexChange}
          />

          <div className="card space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-900">Tailored Cover Letter</h3>
                <p className="mt-1 text-xs text-slate-600">
                  Create an honest, role-specific letter from your profile and this job description.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {coverLetter && (
                  <button type="button" className="btn-secondary text-xs" onClick={copyCoverLetter}>
                    Copy letter
                  </button>
                )}
                <button
                  type="button"
                  className="btn-primary text-xs"
                  onClick={handleGenerateCoverLetter}
                  disabled={isGeneratingLetter}
                >
                  {isGeneratingLetter
                    ? "Writing…"
                    : coverLetter
                      ? "Regenerate"
                      : "Generate Cover Letter"}
                </button>
              </div>
            </div>

            {coverLetterError && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {coverLetterError}
              </p>
            )}

            {coverLetter ? (
              <textarea
                aria-label="Editable cover letter"
                value={coverLetter}
                onChange={(event) => setCoverLetter(event.target.value)}
                className="input-field min-h-[360px] resize-y leading-relaxed"
              />
            ) : (
              <div className="rounded-xl border border-dashed border-brand-200 bg-brand-50/50 px-5 py-8 text-center text-sm text-slate-500">
                Generate a cover letter after reviewing your tailored resume.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
