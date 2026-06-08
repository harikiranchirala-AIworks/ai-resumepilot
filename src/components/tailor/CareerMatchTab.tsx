"use client";

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ExternalLink, Briefcase, MapPin, Sparkles } from "lucide-react";
import { matchJobs, type MatchJobsResult } from "@/lib/career/match-jobs.functions";

interface Props {
  onBack: () => void;
}

export function CareerMatchTab({ onBack }: Props) {
  const matchFn = useServerFn(matchJobs);
  const [profile, setProfile] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchJobsResult | null>(null);

  async function handleRun() {
    setError(null);
    setResult(null);
    if (profile.trim().length < 50) {
      setError("Paste at least a paragraph of your profile (50+ characters).");
      return;
    }
    setLoading(true);
    try {
      const res = await matchFn({ data: { profile: profile.trim(), keywords: keywords.trim() } });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl border border-brand-100 shadow-card p-5 md:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-brand-900">Career Match</h2>
            <p className="text-sm text-brand-600">
              Paste your profile. We pull live jobs from Hyderabad, Bangalore &amp; remote, then AI picks your top 5 with fitment %.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-800">Your profile (paste from LinkedIn "About" + experience)</label>
          <textarea
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            rows={10}
            placeholder="Senior Product Manager with 8 years building B2B SaaS. Currently at Acme leading a 6-person team on the payments product. Skills: SQL, Figma, A/B testing, roadmapping. Domain: fintech, payments..."
            className="w-full p-3 rounded-lg border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm font-mono"
          />
          <p className="text-xs text-brand-500">{profile.length} characters</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-800">
            Keywords / job titles to filter (optional)
          </label>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. product manager, fintech"
            className="w-full p-3 rounded-lg border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-brand-600 hover:text-brand-800"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Analyzing..." : "Find my jobs"}
          </button>
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
                  <div className="flex items-center gap-2 text-xs text-brand-500 mb-1">
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
