"use client";

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ExternalLink, Briefcase, MapPin, Sparkles, FileDown } from "lucide-react";
import { matchJobs, type MatchJobsResult } from "@/lib/career/match-jobs.functions";
import { fetchJobDescription } from "@/lib/career/fetch-jd.functions";
import { useAppStore, getProfileContent } from "@/lib/tailor/store";

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function AvailableJobsTab({ onBack, onNext }: Props) {
  const matchFn = useServerFn(matchJobs);
  const { profile } = useAppStore();
  const profileContent = getProfileContent(profile);

  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchJobsResult | null>(null);

  const profileReady = profileContent.length >= 50;

  async function handleRun() {
    setError(null);
    setResult(null);
    if (!profileReady) {
      setError("Go back to Profile and add at least 50 characters of your background.");
      return;
    }
    setLoading(true);
    try {
      const res = await matchFn({
        data: { profile: profileContent, keywords: keywords.trim() },
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="card card-accent space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
            Step 2
          </p>
          <h2 className="text-xl font-bold text-brand-900">Available Jobs</h2>
          <p className="mt-1 text-sm text-slate-600">
            We&apos;ll read your profile, pull live jobs from Hyderabad, Bangalore &amp; Remote,
            then AI picks your top 5 with fitment %.
          </p>
        </div>

        {!profileReady ? (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
            Your profile is too short ({profileContent.length} chars). Go back to Step 1 and paste your resume, then return here.
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-brand-50 border border-brand-100 text-xs text-brand-700">
            ✓ Using profile from Step 1 ({profileContent.length} characters)
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-brand-800">
            Keywords / job titles to filter (optional)
          </label>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. product manager, fintech, react"
            className="input-field"
          />
        </div>

        <div className="flex justify-between items-center pt-1">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-brand-600 hover:text-brand-800 font-medium"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRun}
              disabled={loading || !profileReady}
              className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Analyzing..." : result ? "Re-run" : "Find my jobs"}
            </button>
            <button
              type="button"
              onClick={onNext}
              className="text-sm text-brand-600 hover:text-brand-800 font-medium"
            >
              Next →
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">{error}</div>
        )}
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-brand-900">Overall fitment</h3>
            {result.candidateSummary && (
              <p className="text-sm text-brand-700 italic">{result.candidateSummary}</p>
            )}
            <p className="text-sm text-brand-800">{result.overallNote}</p>
            <p className="text-xs text-brand-500">
              Scanned {result.totalScanned} live postings · showing top {result.jobs.length}
            </p>
          </div>

          {result.jobs.map((job, idx) => (
            <article
              key={job.id}
              className="bg-white rounded-2xl border border-brand-100 shadow-card p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-brand-500 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-semibold">
                      #{idx + 1}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                  </div>
                  <h4 className="font-semibold text-brand-900 leading-tight">{job.title}</h4>
                  {job.salary && (
                    <p className="text-xs text-brand-600 mt-1">{job.salary}</p>
                  )}
                </div>
                <FitmentRing percent={job.fitmentPercent} />
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-brand-800">Why it fits: </span>
                  <span className="text-brand-700">{job.whyFit}</span>
                </div>
                <div>
                  <span className="font-medium text-brand-800">Gap to close: </span>
                  <span className="text-brand-700">{job.gaps}</span>
                </div>
              </div>

              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 font-medium"
                >
                  View posting <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function FitmentRing({ percent }: { percent: number }) {
  const color =
    percent >= 80 ? "text-green-600" : percent >= 60 ? "text-brand-600" : "text-amber-600";
  const ringColor =
    percent >= 80 ? "stroke-green-500" : percent >= 60 ? "stroke-brand-500" : "stroke-amber-500";
  const circumference = 2 * Math.PI * 22;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="22" fill="none" className="stroke-brand-100" strokeWidth="4" />
        <circle
          cx="25"
          cy="25"
          r="22"
          fill="none"
          className={ringColor}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>
        {percent}%
      </div>
    </div>
  );
}
