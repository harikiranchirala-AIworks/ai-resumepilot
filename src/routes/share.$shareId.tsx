import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, MapPin } from "lucide-react";
import { getResumeShare } from "@/lib/tailor/share.functions";
import { renderResumeHtml } from "@/components/tailor/ResumePdfPreview";
import { ScoreBadge } from "@/components/tailor/ScoreBadge";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

function ShareNotFound() {
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto flex max-w-xl flex-col items-center px-5 py-28 text-center"><h1 className="font-display text-3xl font-semibold text-foreground">This feedback link is unavailable.</h1><p className="mt-3 text-muted-foreground">It may have expired or the address may be incomplete.</p><Button asChild className="mt-7"><Link to="/">Visit ResumePilot</Link></Button></main><SiteFooter /></div>;
}

export const Route = createFileRoute("/share/$shareId")({
  loader: ({ params }) => getResumeShare({ data: { id: params.shareId } }),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.job_title} at ${loaderData.company} | Feedback Preview` : "Feedback Preview | ResumePilot" },
      { name: "description", content: loaderData ? `Review a tailored application for ${loaderData.job_title} at ${loaderData.company}.` : "Review a shared ResumePilot application." },
      { property: "og:title", content: loaderData ? `${loaderData.job_title} at ${loaderData.company} | Feedback Preview` : "Feedback Preview | ResumePilot" },
      { property: "og:description", content: "A job-specific resume preview shared for trusted feedback." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SharedPreviewPage,
  notFoundComponent: ShareNotFound,
});

function SharedPreviewPage() {
  const share = Route.useLoaderData();
  if (!share) return <ShareNotFound />;
  const result = share.tailored_result;
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Shared for feedback</p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div><h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">{share.job_title}</h1><p className="mt-2 text-lg text-muted-foreground">{share.company}</p>{share.location && <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{share.location}</p>}</div>
            {share.job_url && <Button asChild variant="outline"><a href={share.job_url} target="_blank" rel="noopener noreferrer">View posting <ExternalLink /></a></Button>}
          </div>
          <p className="mt-6 border-t border-border pt-5 text-xs text-muted-foreground">Shared {new Date(share.created_at).toLocaleDateString()} · Expires {new Date(share.expires_at).toLocaleDateString()}</p>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-card"><h2 className="text-sm font-semibold text-foreground">Application signals</h2><div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-1"><ScoreBadge label="Overall match" score={result.match.overallScore} /><ScoreBadge label="ATS score" score={result.ats.score} size="sm" /></div></div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-card"><h2 className="text-sm font-semibold text-foreground">Focus areas</h2><div className="mt-3 flex flex-wrap gap-1.5">{result.match.missingKeywords.slice(0, 12).map((keyword: string) => <span key={keyword} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{keyword}</span>)}</div></div>
          </aside>
          <article className="rounded-3xl border border-border bg-card p-4 shadow-card sm:p-6"><div className="mb-5"><h2 className="font-display text-xl font-semibold text-foreground">Tailored resume preview</h2><p className="mt-1 text-sm text-muted-foreground">{result.resume.summary}</p></div><div className="latex-preview max-h-[900px] overflow-auto rounded-xl border border-border bg-card p-4 sm:p-6" dangerouslySetInnerHTML={{ __html: renderResumeHtml(result.resume.latex) }} /></article>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}