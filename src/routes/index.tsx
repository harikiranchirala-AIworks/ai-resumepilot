import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, FileCheck2, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Resume Tailoring | ATS Resume Ready" },
      { name: "description", content: "Find relevant jobs, tailor an honest ATS-ready resume, and share your application for feedback with ATS Resume Ready." },
      { property: "og:title", content: "AI Resume Tailoring | ATS Resume Ready" },
      { property: "og:description", content: "Move from job search to a tailored, feedback-ready application in one focused workspace." },
      { property: "og:url", content: "https://atsresumeready.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://atsresumeready.lovable.app/" }],
  }),
  component: LandingPage,
});

const steps = [
  { icon: FileCheck2, label: "Bring your real experience", copy: "Paste your resume or build a structured profile. Your facts remain the source of truth." },
  { icon: Search, label: "Find roles worth your time", copy: "Search live job feeds and see fitment scores, strengths, and gaps before you apply." },
  { icon: Sparkles, label: "Tailor, review, share", copy: "Generate an ATS-ready resume, inspect every change, and invite trusted feedback." },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="overflow-hidden border-b border-border bg-page-gradient">
          <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
            <div className="flex flex-col justify-center">
              <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary"><ShieldCheck className="h-4 w-4" /> Honest AI application studio</p>
              <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.06] tracking-[-0.04em] text-foreground sm:text-6xl">A stronger application, without rewriting who you are.</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">ATS Resume Ready connects job discovery, fit analysis, resume tailoring, and mentor feedback in one calm workspace.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg"><Link to="/workspace">Start tailoring <ArrowRight /></Link></Button>
                <Button asChild size="lg" variant="outline"><Link to="/how-it-works">See how it works</Link></Button>
              </div>
              <p className="mt-5 text-xs font-medium text-muted-foreground">No invented qualifications. Reviewable output. You stay in control.</p>
            </div>

            <div className="relative min-h-[430px] rounded-[2rem] border border-border bg-card p-5 shadow-workspace sm:p-7">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Application studio</p><p className="mt-1 font-display text-lg font-semibold">Senior Product Manager</p></div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">82% match</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {steps.map(({ icon: Icon, label }, index) => (
                  <div key={label} className={`rounded-2xl border border-border p-4 ${index === 2 ? "bg-primary text-primary-foreground sm:col-span-2" : "bg-muted/45"}`}>
                    <Icon className="h-5 w-5" /><p className="mt-7 text-xs font-bold uppercase tracking-wider">Step {index + 1}</p><p className="mt-1 font-semibold">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center gap-3"><BriefcaseBusiness className="h-5 w-5 text-primary" /><div><p className="text-sm font-semibold">Feedback link ready</p><p className="text-xs text-muted-foreground">Share the job and tailored preview—not your source profile.</p></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">One connected workflow</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">From “maybe” to application-ready.</h2></div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
            {steps.map(({ icon: Icon, label, copy }, index) => <article key={label} className="bg-background p-7"><span className="text-xs font-bold text-muted-foreground">0{index + 1}</span><Icon className="mt-8 h-6 w-6 text-primary" /><h3 className="mt-4 font-display text-lg font-semibold">{label}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p></article>)}
          </div>
        </section>

        <section className="border-y border-border bg-primary text-primary-foreground"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.2em]">Your next application</p><h2 className="mt-2 font-display text-3xl font-semibold">Make it specific. Keep it truthful.</h2></div><Button asChild size="lg" variant="secondary"><Link to="/workspace">Open ATS Resume Ready <ArrowRight /></Link></Button></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}