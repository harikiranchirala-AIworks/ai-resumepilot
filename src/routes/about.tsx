import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Eye,
  FileCheck2,
  MessageSquareText,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ATS Resume Ready | Honest Career AI (V4)" },
      {
        name: "description",
        content:
          "Learn why ATS Resume Ready builds AI career tools around honest tailoring, human review, and candidate control. Now with interview prep, PDF/Word export, and funnel insights.",
      },
      {
        property: "og:title",
        content: "About ATS Resume Ready | Honest Career AI (V4)",
      },
      {
        property: "og:description",
        content:
          "Career tools should sharpen your story without manufacturing it. Profile intelligence, job matching, resume tailoring, cover letters, interview prep, and shareable feedback.",
      },
      { property: "og:url", content: "https://atsresumeready.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://atsresumeready.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const values = [
    {
      icon: ShieldCheck,
      title: "Truth before polish",
      copy: "We reframe evidence already present in your profile. ATS Resume Ready is designed not to invent employers, skills, credentials, or outcomes.",
    },
    {
      icon: Eye,
      title: "Review before action",
      copy: "Generated content remains visible and editable. AI can draft; the candidate decides what represents them.",
    },
    {
      icon: Scale,
      title: "Fit over volume",
      copy: "A thoughtful shortlist and a specific application beat indiscriminate applying. We help you see both alignment and gaps.",
    },
  ];

  const capabilities = [
    {
      icon: FileCheck2,
      title: "Profile Intelligence",
      copy: "Paste your resume and AI parses it into structured fields you can edit. Your facts stay the source of truth for every downstream step.",
    },
    {
      icon: Search,
      title: "Top-20 Job Matching",
      copy: "Scan live job feeds, normalize listings across sources, and rank the best 20 matches by fitment score with honest gap notes.",
    },
    {
      icon: Sparkles,
      title: "ATS-Ready Resume Tailoring",
      copy: "Generate a tailored LaTeX resume with match analysis, keyword breakdown, ATS compatibility scoring, and real-time source editing.",
    },
    {
      icon: MessageSquareText,
      title: "Cover Letter & Interview Prep",
      copy: "Generate a role-specific cover letter and 10 balanced interview questions — technical and behavioral — based on your profile and the job.",
    },
    {
      icon: Users,
      title: "Share for Feedback",
      copy: "Create a 90-day shareable link so mentors or reviewers can see the job fit and tailored preview without accessing your source profile.",
    },
    {
      icon: FileCheck2,
      title: "Export & Download",
      copy: "Download your tailored resume as PDF or Word, and export the LaTeX source. Take your application anywhere.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-page-gradient">
          <div className="mx-auto max-w-5xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                About ATS Resume Ready
              </p>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                V4
              </span>
            </div>
            <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-6xl">
              Career AI should make your evidence clearer—not make your story less true.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              ATS Resume Ready exists to reduce the fragmented work between finding a role and
              submitting a credible application. We connect profile intelligence, job discovery,
              resume tailoring, cover letters, interview prep, and mentor feedback in one calm
              workspace.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our principles</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Built around honesty, review, and fit.
            </h2>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
            {values.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="bg-background p-8">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-8 font-display text-xl font-semibold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Capabilities */}
        <section className="border-y border-border bg-muted/35">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">What we do</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                One workspace from search to submission.
              </h2>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map(({ icon: Icon, title, copy }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-border bg-background p-7"
                >
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Version history */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Version history</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Where we started and where we are.
            </h2>
          </div>
          <div className="mt-10 space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  V4
                </span>
                <div className="mt-2 h-full w-px bg-border" />
              </div>
              <div className="pb-6">
                <h3 className="font-display text-lg font-semibold">Interview prep, export, and funnel tracking</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Added 10-question interview prep generator, PDF/Word resume export, a homepage before/after example, clearer CTAs, and basic funnel analytics.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                  V3
                </span>
                <div className="mt-2 h-full w-px bg-border" />
              </div>
              <div className="pb-6">
                <h3 className="font-display text-lg font-semibold">Editable LaTeX, cover letters, and share links</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Real-time LaTeX source editing, tailored cover letter generation, 90-day shareable feedback links, and external job board quick links.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  V2
                </span>
                <div className="mt-2 h-full w-px bg-border" />
              </div>
              <div className="pb-6">
                <h3 className="font-display text-lg font-semibold">Profile intelligence and top-20 job matching</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  AI resume parsing, multi-source job aggregation with deduplication, fitment scoring, and ATS compatibility analysis.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  V1
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Basic resume tailoring</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  First release with ATS scoring and LaTeX resume output from a single job description.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-page-gradient">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:flex-row sm:items-center lg:px-8">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Build one application with us.
              </h2>
              <p className="mt-2 text-muted-foreground">
                Bring the experience. ATS Resume Ready will help you focus it.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/workspace">
                Check my resume match <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
