import type { AdzunaJob, JobFilters, JobSource } from "./adzuna.server";

const stripHtml = (value: string) =>
  value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

function matchesFilters(job: AdzunaJob, keywords: string, filters: JobFilters) {
  const haystack = `${job.title} ${job.company} ${job.location} ${job.description}`.toLowerCase();
  const terms = keywords.toLowerCase().split(/[,\s]+/).filter((term) => term.length > 1);
  if (terms.length && !terms.some((term) => haystack.includes(term))) return false;
  if (filters.remoteOnly && !job.isRemote) return false;

  const locations = filters.locations?.map((location) => location.toLowerCase()).filter(Boolean) ?? [];
  if (!locations.length || locations.some((location) => location === "remote")) return true;
  return locations.some((location) => job.location.toLowerCase().includes(location));
}

async function fetchJson(url: string) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} from ${new URL(url).hostname}`);
  return response.json() as Promise<unknown>;
}

interface RemotiveResponse {
  jobs?: Array<{
    id: number;
    url: string;
    title: string;
    company_name: string;
    candidate_required_location?: string;
    description?: string;
    salary?: string;
    publication_date?: string;
  }>;
}

export async function fetchRemotiveJobs(keywords: string, filters: JobFilters): Promise<AdzunaJob[]> {
  const url = new URL("https://remotive.com/api/remote-jobs");
  if (keywords.trim()) url.searchParams.set("search", keywords.trim());
  url.searchParams.set("limit", "60");
  const data = (await fetchJson(url.toString())) as RemotiveResponse;

  return (data.jobs ?? [])
    .map((job): AdzunaJob => ({
      id: `remotive-${job.id}`,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || "Remote",
      description: stripHtml(job.description ?? "").slice(0, 1600),
      url: job.url,
      salary: job.salary || undefined,
      created: job.publication_date,
      isRemote: true,
      sources: ["Remotive"],
    }))
    .filter((job) => matchesFilters(job, keywords, filters));
}

interface ArbeitnowResponse {
  data?: Array<{
    slug: string;
    company_name: string;
    title: string;
    description?: string;
    remote?: boolean;
    url: string;
    location?: string;
    created_at?: number;
  }>;
}

export async function fetchArbeitnowJobs(keywords: string, filters: JobFilters): Promise<AdzunaJob[]> {
  const data = (await fetchJson("https://www.arbeitnow.com/api/job-board-api")) as ArbeitnowResponse;
  return (data.data ?? [])
    .map((job): AdzunaJob => ({
      id: `arbeitnow-${job.slug}`,
      title: job.title,
      company: job.company_name,
      location: job.location || (job.remote ? "Remote" : "Not specified"),
      description: stripHtml(job.description ?? "").slice(0, 1600),
      url: job.url,
      created: job.created_at ? new Date(job.created_at * 1000).toISOString() : undefined,
      isRemote: Boolean(job.remote),
      sources: ["Arbeitnow"],
    }))
    .filter((job) => matchesFilters(job, keywords, filters));
}

export const publicJobSources: JobSource[] = ["Remotive", "Arbeitnow"];