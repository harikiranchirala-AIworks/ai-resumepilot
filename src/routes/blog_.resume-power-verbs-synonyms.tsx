import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const PAGE_URL = "https://atsresumeready.lovable.app/blog/resume-power-verbs-synonyms";

const verbGroups = [
  { overused: "Managed", alternatives: ["Coordinated", "Directed", "Oversaw", "Administered", "Supervised"], note: "Choose based on whether you organized work, set direction, controlled operations, or led people." },
  { overused: "Led", alternatives: ["Guided", "Spearheaded", "Chaired", "Mobilized", "Mentored"], note: "Use a leadership verb only when you can explain the people, decision, or initiative you led." },
  { overused: "Developed", alternatives: ["Built", "Designed", "Created", "Engineered", "Implemented"], note: "Match the verb to what you actually produced: a plan, system, process, product, or program." },
  { overused: "Improved", alternatives: ["Optimized", "Streamlined", "Strengthened", "Accelerated", "Reduced"], note: "Pair improvement language with a truthful before-and-after result whenever possible." },
  { overused: "Helped", alternatives: ["Supported", "Enabled", "Advised", "Facilitated", "Contributed"], note: "Clarify your exact contribution instead of overstating ownership of a team result." },
];

export const Route = createFileRoute("/blog_/resume-power-verbs-synonyms")({
  head: () => ({
    meta: [
      { title: "Resume Power Verbs & Synonyms | ATS Guide" },
      { name: "description", content: "Replace overused resume words with accurate power verbs and synonyms that clarify your impact without exaggerating your experience." },
      { property: "og:title", content: "Resume Power Verbs and Synonyms That Stay Truthful" },
      { property: "og:description", content: "A practical guide to choosing stronger resume wording for clearer, ATS-friendly accomplishments." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Resume Power Verbs and Synonyms That Stay Truthful",
        description: "Professional alternatives to overused resume verbs, with guidance for choosing accurate wording.",
        author: { "@type": "Organization", name: "ATS Resume Ready" },
        publisher: { "@type": "Organization", name: "ATS Resume Ready" },
        mainEntityOfPage: PAGE_URL,
      }),
    }],
  }),
  component: ResumePowerVerbsGuide,
});

function ResumePowerVerbsGuide() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <article>
          <header className="border-b border-border bg-page-gradient">
            <div className="mx-auto max-w-4xl px-5 py-20 lg:px-8 lg:py-28">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary"><ShieldCheck className="h-4 w-4" /> Honest resume writing guide</p>
              <h1 className="mt-5 font-display text-5xl font-semibold leading-tight tracking-[-0.04em] sm:text-6xl">Resume power verbs and synonyms that stay truthful</h1>
              <p className="mt-7 max-w-3xl text-xl leading-relaxed text-muted-foreground">Strong resume words make your contribution precise. They do not turn participation into leadership or routine work into a result you cannot defend.</p>
            </div>
          </header>

          <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
            <section aria-labelledby="choose-verbs">
              <h2 id="choose-verbs" className="font-display text-3xl font-semibold">How to choose the right action verb</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Start with what you actually did, then choose the most specific verb that describes your level of ownership. Add the task, its scope, and a verified outcome. This approach is more useful than copying a generic “resume worded” list because context determines whether a synonym is accurate.</p>
              <div className="mt-7 border-l-4 border-primary bg-muted/45 px-6 py-5">
                <p className="font-semibold">Simple formula</p>
                <p className="mt-2 text-muted-foreground">Accurate action verb + specific work + scope or method + verified result.</p>
              </div>
            </section>

            <section className="mt-14" aria-labelledby="verb-list">
              <h2 id="verb-list" className="font-display text-3xl font-semibold">Power verb alternatives by meaning</h2>
              <div className="mt-7 divide-y divide-border border-y border-border">
                {verbGroups.map((group) => (
                  <div key={group.overused} className="grid gap-4 py-7 sm:grid-cols-[150px_1fr]">
                    <h3 className="font-display text-xl font-semibold">Instead of “{group.overused}”</h3>
                    <div><p className="font-semibold text-primary">{group.alternatives.join(" · ")}</p><p className="mt-2 leading-relaxed text-muted-foreground">{group.note}</p></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-14" aria-labelledby="examples">
              <h2 id="examples" className="font-display text-3xl font-semibold">Turn vague bullets into credible evidence</h2>
              <div className="mt-7 space-y-6">
                <div className="border-l-4 border-border pl-5"><p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Before</p><p className="mt-2">Managed customer support improvements.</p></div>
                <div className="border-l-4 border-primary pl-5"><p className="text-sm font-bold uppercase tracking-wider text-primary">After</p><p className="mt-2">Streamlined the support triage process across three queues, reducing median first-response time by 18%.</p></div>
                <div className="border-l-4 border-border pl-5"><p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Before</p><p className="mt-2">Helped develop a new onboarding program.</p></div>
                <div className="border-l-4 border-primary pl-5"><p className="text-sm font-bold uppercase tracking-wider text-primary">After</p><p className="mt-2">Created three onboarding modules and facilitated weekly sessions for 24 new hires.</p></div>
              </div>
            </section>

            <section className="mt-14" aria-labelledby="truth-check">
              <h2 id="truth-check" className="font-display text-3xl font-semibold">Run a truth check before using a synonym</h2>
              <ul className="mt-6 space-y-3 text-muted-foreground">
                {["Can I explain exactly what I did in an interview?", "Does the verb reflect my actual ownership—not the whole team's?", "Can I verify every number, scope, tool, and result?", "Would a former manager recognize this description as fair?"].map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />{item}</li>)}
              </ul>
            </section>

            <section className="mt-14 bg-primary px-6 py-10 text-primary-foreground sm:px-10">
              <h2 className="font-display text-3xl font-semibold">Put stronger verbs into context.</h2>
              <p className="mt-3 max-w-2xl leading-relaxed">Compare your real experience with a target job, then tailor each bullet without inventing qualifications.</p>
              <Button asChild size="lg" variant="secondary" className="mt-7"><Link to="/workspace">Tailor your resume <ArrowRight /></Link></Button>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}