export interface AdzunaJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  created?: string;
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
): Promise<AdzunaJob[]> {
  const url = new URL("https://api.adzuna.com/v1/api/jobs/in/search/1");
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("results_per_page", String(resultsPerPage));
  url.searchParams.set("where", where);
  if (what) url.searchParams.set("what", what);
  url.searchParams.set("content-type", "application/json");

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Adzuna ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { results?: AdzunaApiJob[] };
  return (data.results ?? []).map((j) => ({
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
    created: j.created,
  }));
}

export async function fetchJobs(keywords: string): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    throw new Error("Adzuna credentials not configured.");
  }

  const locations = ["Hyderabad", "Bangalore", "Remote"];
  const results = await Promise.allSettled(
    locations.map((loc) => fetchAdzuna(appId, appKey, loc, keywords, 15)),
  );

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
  return merged;
}
