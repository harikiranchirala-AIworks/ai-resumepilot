export type JobSource = "Adzuna" | "Remotive" | "Arbeitnow";

export interface AdzunaJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  salaryMin?: number;
  created?: string;
  isRemote?: boolean;
  sources: JobSource[];
}

export interface JobFilters {
  locations?: string[];
  remoteOnly?: boolean;
  minSalary?: number;
  page?: number;
}

interface AdzunaApiJob {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  description?: string;
  redirect_url?: string;
  salary_min?: number;
  salary_max?: number;
  created?: string;
}

async function fetchAdzuna(
  appId: string,
  appKey: string,
  where: string,
  what: string,
  resultsPerPage = 20,
  page = 1,
): Promise<AdzunaJob[]> {
  const url = new URL(`https://api.adzuna.com/v1/api/jobs/in/search/${page}`);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("results_per_page", String(resultsPerPage));
  if (where) url.searchParams.set("where", where);
  if (what) url.searchParams.set("what", what);
  url.searchParams.set("content-type", "application/json");

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Adzuna ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { results?: AdzunaApiJob[] };
  return (data.results ?? []).map((j) => {
    const text = `${j.title ?? ""} ${j.description ?? ""}`.toLowerCase();
    const isRemote = /\bremote\b|work from home|wfh/i.test(text);
    return {
      id: j.id,
      title: j.title,
      company: j.company?.display_name ?? "Unknown",
      location: j.location?.display_name ?? where,
      description: (j.description ?? "").slice(0, 1200),
      url: j.redirect_url ?? "",
      salary:
        j.salary_min && j.salary_max
          ? `₹${Math.round(j.salary_min).toLocaleString()} – ₹${Math.round(j.salary_max).toLocaleString()}`
          : undefined,
      salaryMin: j.salary_min,
      created: j.created,
      isRemote,
      sources: ["Adzuna"],
    };
  });
}

export async function fetchJobs(
  keywords: string,
  filters: JobFilters = {},
): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    throw new Error("Adzuna credentials not configured.");
  }

  const locations =
    filters.locations && filters.locations.length
      ? filters.locations
      : ["Hyderabad", "Bangalore", "Remote"];

  // Each result page uses a fresh pair of provider pages so "Next 20" widens the pool.
  const batchPage = Math.max(1, Math.floor(filters.page ?? 1));
  const firstProviderPage = (batchPage - 1) * 2 + 1;
  const tasks: Promise<AdzunaJob[]>[] = [];
  for (const loc of locations) {
    tasks.push(fetchAdzuna(appId, appKey, loc, keywords, 20, firstProviderPage));
    tasks.push(fetchAdzuna(appId, appKey, loc, keywords, 20, firstProviderPage + 1));
  }
  const results = await Promise.allSettled(tasks);

  const merged: AdzunaJob[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const job of r.value) {
      if (seen.has(job.id)) continue;
      seen.add(job.id);
      merged.push(job);
    }
  }

  let filtered = merged;
  if (filters.remoteOnly) {
    filtered = filtered.filter(
      (j) => j.isRemote || /remote/i.test(j.location),
    );
  }
  if (filters.minSalary && filters.minSalary > 0) {
    const minimumSalary = filters.minSalary;
    filtered = filtered.filter(
      (j) => (j.salaryMin ?? 0) >= minimumSalary,
    );
  }
  return filtered;
}
