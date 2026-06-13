import { fetchJobs as fetchAdzunaJobs, type AdzunaJob, type JobFilters, type JobSource } from "./adzuna.server";
import { fetchArbeitnowJobs, fetchRemotiveJobs } from "./public-job-feeds.server";

export interface AggregatedJobsResult {
  jobs: AdzunaJob[];
  totalCollected: number;
  duplicatesRemoved: number;
  sourceStats: Partial<Record<JobSource, number>>;
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/\b(?:limited|ltd|incorporated|inc|llc|pvt|private|corp|corporation|company|co)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const dedupeKey = (job: AdzunaJob) => `${normalize(job.company)}::${normalize(job.title)}`;

function mergeJob(existing: AdzunaJob, incoming: AdzunaJob): AdzunaJob {
  const preferred = incoming.description.length > existing.description.length ? incoming : existing;
  return {
    ...preferred,
    salary: existing.salary ?? incoming.salary,
    salaryMin: existing.salaryMin ?? incoming.salaryMin,
    sources: Array.from(new Set([...existing.sources, ...incoming.sources])),
  };
}

export async function fetchAggregatedJobs(
  keywords: string,
  filters: JobFilters = {},
): Promise<AggregatedJobsResult> {
  const requests = await Promise.allSettled([
    fetchAdzunaJobs(keywords, filters),
    fetchRemotiveJobs(keywords, filters),
    fetchArbeitnowJobs(keywords, filters),
  ]);
  const batches = requests.flatMap((request) => request.status === "fulfilled" ? [request.value] : []);
  if (!batches.length) throw new Error("All configured job sources are temporarily unavailable.");

  const sourceStats: Partial<Record<JobSource, number>> = {};
  for (const batch of batches) {
    for (const job of batch) {
      for (const source of job.sources) sourceStats[source] = (sourceStats[source] ?? 0) + 1;
    }
  }

  const totalCollected = batches.reduce((total, batch) => total + batch.length, 0);
  const deduped = new Map<string, AdzunaJob>();
  const maxLength = Math.max(0, ...batches.map((batch) => batch.length));
  for (let index = 0; index < maxLength; index += 1) {
    for (const batch of batches) {
      const job = batch[index];
      if (!job) continue;
      const key = dedupeKey(job);
      const existing = deduped.get(key);
      deduped.set(key, existing ? mergeJob(existing, job) : job);
    }
  }

  return {
    jobs: Array.from(deduped.values()),
    totalCollected,
    duplicatesRemoved: totalCollected - deduped.size,
    sourceStats,
  };
}