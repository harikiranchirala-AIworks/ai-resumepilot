import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, SearchCheck, Share2, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({ meta: [
    { title: "How ATS Resume Ready Works | AI Tailoring" },
    { name: "description", content: "See how ATS Resume Ready turns your real experience and a target role into an ATS-ready resume and shareable feedback preview." },
    { property: "og:title", content: "How ATS Resume Ready Works | AI Tailoring" },
    { property: "og:description", content: "Four focused steps from your profile to a reviewable, tailored application." },
    { property: "og:url", content: "https://atsresumeready.lovable.app/how-it-works" },
  ], links: [{ rel: "canonical", href: "https://atsresumeready.lovable.app/how-it-works" }] }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  const steps = [
    { icon: FileText, title: "Add your source profile", copy: "Paste a resume or complete the structured profile. This is the factual boundary for every generated document." },
    { icon: SearchCheck, title: "Search and choose a role", copy: "Scan current postings, compare fitment, and select a job description worth tailoring toward." },
    { icon: WandSparkles, title: "Generate and inspect", copy: "Create a targeted resume, review match and ATS signals, edit the output, and optionally draft a cover letter." },
    { icon: Share2, title: "Ask for trusted feedback", copy: "Create a 90-day mentor link containing the selected job and tailored preview—never your source profile." },
  ];
  return <div className="min-h-screen bg-background"><SiteHeader /><main><section className="border-b border-border bg-page-gradient"><div className="mx-auto max-w-6xl px-5 py-20 text-center lg:px-8 lg:py-24"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">How it works</p><h1 className="mx-auto mt-5 max-w-4xl font-display text-5xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl">One focused path from experience to application.</h1><p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">Each step keeps the job, your evidence, and the final document connected.</p></div></section><section className="mx-auto max-w-5xl px-5 py-20 lg:px-8"><ol className="space-y-4">{steps.map(({ icon: Icon, title, copy }, index) => <li key={title} className="grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:grid-cols-[72px_1fr] sm:p-8"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><Icon className="h-6 w-6" /></div><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Step {index + 1}</p><h2 className="mt-2 font-display text-2xl font-semibold text-foreground">{title}</h2><p className="mt-3 leading-relaxed text-muted-foreground">{copy}</p></div></li>)}</ol><div className="mt-12 text-center"><Button asChild size="lg"><Link to="/workspace">Start with your profile <ArrowRight /></Link></Button></div></section></main><SiteFooter /></div>;
}