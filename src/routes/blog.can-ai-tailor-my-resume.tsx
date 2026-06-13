import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const PAGE_URL = "https://atsresumeready.lovable.app/blog/can-ai-tailor-my-resume";

export const Route = createFileRoute("/blog/can-ai-tailor-my-resume")({
  head: () => ({
    meta: [
      { title: "Can AI Tailor My Resume to a Job Posting?" },
      { name: "description", content: "Learn how AI can tailor your resume to a job posting honestly—using real evidence, relevant keywords, and no invented experience." },
      { property: "og:title", content: "Can AI Tailor My Resume to a Job Posting?" },
      { property: "og:description", content: "A practical, honest method for tailoring your resume with AI without inventing qualifications." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Can AI Tailor My Resume to a Job Posting?",
        description: "A practical guide to honest AI resume tailoring using real candidate evidence.",
        author: { "@type": "Organization", name: "ATS Resume Ready" },
        publisher: { "@type": "Organization", name: "ATS Resume Ready" },
        mainEntityOfPage: PAGE_URL,
      }),
    }],
  }),
  component: HonestAiResumeGuide,
});

function HonestAiResumeGuide() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <article>
          <header className="border-b border-border bg-page-gradient">
            <div className="mx-auto max-w-4xl px-5 py-20 lg:px-8 lg:py-28">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary"><ShieldCheck className="h-4 w-4" /> Honest AI resume guide</p>
              <h1 className="mt-5 font-display text-5xl font-semibold leading-tight tracking-[-0.04em] sm:text-6xl">Can AI tailor my resume to a job posting?</h1>
              <p className="mt-7 max-w-3xl text-xl leading-relaxed text-muted-foreground">Yes—AI can compare a job posting with your real experience, prioritize the strongest evidence, and improve wording. It should never manufacture skills, employers, credentials, or results.</p>
            </div>
          </header>

          <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
            <section aria-labelledby="short-answer">
              <h2 id="short-answer" className="font-display text-3xl font-semibold">The short answer</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Good AI tailoring is evidence selection, not identity rewriting. The goal is to make the experience you already have easier for a recruiter and an applicant tracking system to connect with the role.</p>
            </section>

            <section className="mt-14" aria-labelledby="safe-method">
              <h2 id="safe-method" className="font-display text-3xl font-semibold">A safe, useful method</h2>
              <ol className="mt-7 space-y-6">
                {[
                  ["Start with a factual source resume", "Give the AI a complete record of roles, responsibilities, tools, outcomes, education, and credentials you can defend in an interview."],
                  ["Add the full job posting", "Include responsibilities and requirements—not just the title—so the comparison reflects the employer's actual language."],
                  ["Ask for an evidence map", "For every important requirement, identify matching proof in your background and clearly label genuine gaps."],
                  ["Rewrite for relevance", "Move the strongest matching bullets upward, clarify vague wording, and use accurate terms from the posting where they describe your real work."],
                  ["Verify every claim", "Check names, dates, numbers, skills, and scope. Delete or correct anything you could not comfortably explain to a hiring manager."],
                ].map(([title, copy], index) => (
                  <li key={title} className="grid gap-4 border-t border-border pt-6 sm:grid-cols-[48px_1fr]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">{index + 1}</span>
                    <div><h3 className="font-display text-xl font-semibold">{title}</h3><p className="mt-2 leading-relaxed text-muted-foreground">{copy}</p></div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-14 grid gap-8 border-y border-border py-10 md:grid-cols-2" aria-labelledby="boundaries">
              <h2 id="boundaries" className="sr-only">Honest tailoring boundaries</h2>
              <div><CheckCircle2 className="h-6 w-6 text-primary" /><h3 className="mt-4 font-display text-xl font-semibold">AI can help you</h3><ul className="mt-4 space-y-3 text-muted-foreground"><li>Identify relevant experience</li><li>Improve clarity and specificity</li><li>Use accurate job-language keywords</li><li>Reorder content for the target role</li><li>Spot missing evidence before applying</li></ul></div>
              <div><XCircle className="h-6 w-6 text-destructive" /><h3 className="mt-4 font-display text-xl font-semibold">AI should not</h3><ul className="mt-4 space-y-3 text-muted-foreground"><li>Invent tools you have not used</li><li>Create employers or qualifications</li><li>Fabricate metrics or outcomes</li><li>Hide meaningful experience gaps</li><li>Make claims you cannot verify</li></ul></div>
            </section>

            <section className="mt-14" aria-labelledby="ats-keywords">
              <h2 id="ats-keywords" className="font-display text-3xl font-semibold">What about ATS keywords?</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">Keywords matter when they truthfully describe your experience. If a posting says “cross-functional roadmap planning” and that is work you have done, using the same clear phrase can help. Adding “SQL” because it appears in the posting when you have never used SQL is not optimization—it is misrepresentation.</p>
              <p className="mt-4 leading-relaxed text-muted-foreground">A strong tailored resume may still show gaps. That is useful information: you can address an adjacent skill in a cover letter, prepare an interview explanation, or decide the role is not the right fit.</p>
            </section>

            <section className="mt-14 bg-primary px-6 py-10 text-primary-foreground sm:px-10">
              <h2 className="font-display text-3xl font-semibold">Tailor one application honestly.</h2>
              <p className="mt-3 max-w-2xl leading-relaxed">ATS Resume Ready keeps your source experience, target job, fit analysis, and final resume connected so every edit remains reviewable.</p>
              <Button asChild size="lg" variant="secondary" className="mt-7"><Link to="/workspace">Open the AI career workspace <ArrowRight /></Link></Button>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}