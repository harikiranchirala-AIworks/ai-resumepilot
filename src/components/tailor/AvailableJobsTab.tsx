"use client";

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ExternalLink, Briefcase, MapPin, Sparkles, FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import { matchJobs, type MatchJobsResult } from "@/lib/career/match-jobs.functions";
import { fetchJobDescription } from "@/lib/career/fetch-jd.functions";
import { useAppStore, getProfileContent } from "@/lib/tailor/store";
import { Button } from "@/components/ui/button";

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function AvailableJobsTab({ onBack, onNext }: Props) {
  const matchFn = useServerFn(matchJobs);
  const fetchJdFn = useServerFn(fetchJobDescription);
  const { profile, setJobDescription, setSelectedJob } = useAppStore();
  const profileContent = getProfileContent(profile);

  const [keywords, setKeywords] = useState("");
  const [locationsInput, setLocationsInput] = useState("Hyderabad, Bangalore, Remote");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minSalary, setMinSalary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchJobsResult | null>(null);
  const [page, setPage] = useState(1);
  const [pageResults, setPageResults] = useState<Record<number, MatchJobsResult>>({});
  const [pickingId, setPickingId] = useState<string | null>(null);
  const [pickNote, setPickNote] = useState<string | null>(null);

  const profileReady = profileContent.length >= 50;

  async function handleRun(targetPage = 1, freshSearch = false) {
    setError(null);
    if (freshSearch) {
      setResult(null);
      setPageResults({});
      setPage(1);
    }
    if (!profileReady) {
      setError("Go back to Profile and add at least 50 characters of your background.");
      return;
    }
    setLoading(true);
    try {
      const locations = locationsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const minSal = minSalary ? Number(minSalary) : undefined;
      const excludeIds = freshSearch
        ? []
        : Object.values(pageResults).flatMap((pageResult) => pageResult.jobs.map((job) => job.id));
      const res = await matchFn({
        data: {
          profile: profileContent,
          keywords: keywords.trim(),
          locations: locations.length ? locations : undefined,
          remoteOnly,
          minSalary: minSal && !Number.isNaN(minSal) ? minSal : undefined,
          page: targetPage,
          excludeIds,
        },
      });
      setResult(res);
      setPage(targetPage);
      setPageResults((current) => freshSearch ? { [targetPage]: res } : { ...current, [targetPage]: res });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  }

  function showPage(targetPage: number) {
    const cached = pageResults[targetPage];
    if (cached) {
      setResult(cached);
      setPage(targetPage);
      return;
    }
    void handleRun(targetPage);
  }

  const boardQuery = [keywords.trim(), locationsInput.trim()].filter(Boolean).join(" ");
  const externalBoards = [
    { name: "LinkedIn", href: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(boardQuery)}` },
    { name: "Indeed", href: `https://in.indeed.com/jobs?q=${encodeURIComponent(keywords.trim())}&l=${encodeURIComponent(locationsInput.trim())}` },
    { name: "Naukri", href: `https://www.naukri.com/${encodeURIComponent(keywords.trim() || "jobs")}-jobs?k=${encodeURIComponent(keywords.trim())}&l=${encodeURIComponent(locationsInput.trim())}` },
  ];

  return (
    <section className="space-y-6">
      <div className="card card-accent space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
            Step 2
          </p>
          <h2 className="text-xl font-bold text-brand-900">Available Jobs</h2>
          <p className="mt-1 text-sm text-slate-600">
            We&apos;ll scan Adzuna, Remotive, and Arbeitnow, remove duplicates, then AI ranks 20 jobs at a time by fitment.
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

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-800">
              Keywords / job titles (optional)
            </label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. product manager, fintech, react"
              className="input-field"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-800">
              Locations (comma-separated)
            </label>
            <input
              value={locationsInput}
              onChange={(e) => setLocationsInput(e.target.value)}
              placeholder="Hyderabad, Bangalore, Remote"
              className="input-field"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-800">
              Minimum salary (₹/year, optional)
            </label>
            <input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              placeholder="e.g. 1500000"
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-brand-800 cursor-pointer">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="w-4 h-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
              />
              Remote only
            </label>
          </div>
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
              onClick={() => void handleRun(1, true)}
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
        {pickNote && (
          <div className="p-3 rounded-lg bg-brand-50 border border-brand-200 text-sm text-brand-800">{pickNote}</div>
        )}

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search more job boards</p>
          <div className="flex flex-wrap gap-2">
            {externalBoards.map((board) => (
              <Button key={board.name} asChild variant="outline" size="sm">
                <a href={board.href} target="_blank" rel="noopener noreferrer">
                  {board.name} <ExternalLink />
                </a>
              </Button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">These open the same search directly on each board.</p>
        </div>
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
              Collected {result.totalCollected} live postings across {Object.keys(result.sourceStats).length} sources
              {result.duplicatesRemoved > 0 ? ` · removed ${result.duplicatesRemoved} duplicates` : ""}
              {` · ranked ${result.totalScanned} unique jobs · showing ${result.jobs.length} on page ${page}`}
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
                      #{(page - 1) * 20 + idx + 1}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                  </div>
                  <h4 className="font-semibold text-brand-900 leading-tight">{job.title}</h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.sources.map((source) => (
                      <span
                        key={source}
                        className="rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
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

              <div className="flex flex-wrap items-center gap-3 pt-1">
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
                <button
                  type="button"
                  disabled={pickingId === job.id}
                  onClick={async () => {
                    setPickNote(null);
                    setPickingId(job.id);
                    try {
                      let jdText = job.description;
                      let source: "url" | "fallback" = "fallback";
                      if (job.url) {
                        const res = await fetchJdFn({
                          data: { url: job.url, fallback: job.description },
                        });
                        jdText = res.text;
                        source = res.source;
                      }
                      const header = `# ${job.title} — ${job.company} (${job.location})\nSource: ${job.url || "Job feed snippet"}\n\n`;
                      setJobDescription(header + jdText);
                      setSelectedJob({
                        title: job.title,
                        company: job.company,
                        location: job.location,
                        url: job.url,
                      });
                      setPickNote(
                        source === "url"
                          ? "Fetched full JD from the posting."
                          : "Couldn't fetch the page — used the job feed snippet instead.",
                      );
                      onNext();
                    } catch (e) {
                      setPickNote(e instanceof Error ? e.message : "Failed to load JD");
                    } finally {
                      setPickingId(null);
                    }
                  }}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {pickingId === job.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5" />
                  )}
                  Use this JD →
                </button>
              </div>
            </article>
          ))}

          {result.jobs.length > 0 && (
            <nav aria-label="Job result pages" className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page <span className="font-semibold text-foreground">{page}</span> · jobs {(page - 1) * 20 + 1}–{(page - 1) * 20 + result.jobs.length}
              </p>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" disabled={loading || page === 1} onClick={() => showPage(page - 1)}>
                  <ChevronLeft /> Previous 20
                </Button>
                <Button type="button" disabled={loading || !result.hasMore} onClick={() => showPage(page + 1)}>
                  {loading ? <Loader2 className="animate-spin" /> : <ChevronRight />}
                  Next 20
                </Button>
              </div>
            </nav>
          )}
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
