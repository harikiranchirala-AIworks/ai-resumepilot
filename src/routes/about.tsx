import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Eye, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About ResumePilot | Honest AI Career Tools" },
    { name: "description", content: "Learn why ResumePilot builds AI career tools around honest tailoring, human review, and candidate control." },
    { property: "og:title", content: "About ResumePilot | Honest AI Career Tools" },
    { property: "og:description", content: "Career tools should sharpen your story without manufacturing it." },
    { property: "og:url", content: "https://ai-resumepilot.lovable.app/about" },
  ], links: [{ rel: "canonical", href: "https://ai-resumepilot.lovable.app/about" }] }),
  component: AboutPage,
});

function AboutPage() {
  const values = [
    { icon: ShieldCheck, title: "Truth before polish", copy: "We reframe evidence already present in your profile. ResumePilot is designed not to invent employers, skills, credentials, or outcomes." },
    { icon: Eye, title: "Review before action", copy: "Generated content remains visible and editable. AI can draft; the candidate decides what represents them." },
    { icon: Scale, title: "Fit over volume", copy: "A thoughtful shortlist and a specific application beat indiscriminate applying. We help you see both alignment and gaps." },
  ];
  return <div className="min-h-screen bg-background"><SiteHeader /><main><section className="border-b border-border bg-page-gradient"><div className="mx-auto max-w-5xl px-5 py-20 lg:px-8 lg:py-28"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">About ResumePilot</p><h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-6xl">Career AI should make your evidence clearer—not make your story less true.</h1><p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">ResumePilot exists to reduce the fragmented work between finding a role and submitting a credible application.</p></div></section><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">{values.map(({ icon: Icon, title, copy }) => <article key={title} className="bg-background p-8"><Icon className="h-6 w-6 text-primary"/><h2 className="mt-8 font-display text-xl font-semibold text-foreground">{title}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p></article>)}</div><div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-border pt-10 sm:flex-row sm:items-center"><div><h2 className="font-display text-2xl font-semibold text-foreground">Build one application with us.</h2><p className="mt-2 text-muted-foreground">Bring the experience. ResumePilot will help you focus it.</p></div><Button asChild size="lg"><Link to="/workspace">Open workspace <ArrowRight /></Link></Button></div></section></main><SiteFooter /></div>;
}