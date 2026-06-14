import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home as HomeIcon, ShieldCheck, Sparkles } from "lucide-react";
import { TabNavigation, type TabId } from "@/components/tailor/TabNavigation";
import { ProfileTab } from "@/components/tailor/ProfileTab";
import { JDTab } from "@/components/tailor/JDTab";
import { ResumeTab } from "@/components/tailor/ResumeTab";
import { InterviewTab } from "@/components/tailor/InterviewTab";
import { AvailableJobsTab } from "@/components/tailor/AvailableJobsTab";
import logoAsset from "@/assets/ats-resume-ready-logo.png.asset.json";
import { ThemeToggle } from "@/components/ThemeToggle";
import { trackFunnelEvent } from "@/lib/analytics";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "AI Resume Workspace | ATS Resume Ready" },
      {
        name: "description",
        content:
          "Match with relevant jobs and create ATS-friendly resumes and cover letters tailored to each role with ATS Resume Ready's AI career workspace.",
      },
      {
        name: "keywords",
        content:
          "AI resume tailoring, ATS resume, job matching, cover letter generator, resume builder",
      },
      {
        property: "og:title",
        content: "AI Resume Tailoring & Job Matching | ATS Resume Ready",
      },
      {
        property: "og:description",
        content:
          "Match with relevant jobs and tailor ATS-friendly resumes and cover letters for every application.",
      },
      { property: "og:url", content: "https://atsresumeready.lovable.app/workspace" },
      {
        property: "og:image",
        content: `https://atsresumeready.lovable.app${logoAsset.url}`,
      },
      { property: "og:image:alt", content: "ATS Resume Ready logo" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "AI Resume Tailoring & Job Matching | ATS Resume Ready",
      },
      {
        name: "twitter:description",
        content:
          "Match with relevant jobs and tailor ATS-friendly resumes and cover letters for every application.",
      },
      {
        name: "twitter:image",
        content: `https://atsresumeready.lovable.app${logoAsset.url}`,
      },
    ],
    links: [{ rel: "canonical", href: "https://atsresumeready.lovable.app/workspace" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "ATS Resume Ready",
          url: "https://atsresumeready.lovable.app/",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description:
            "An AI career workspace for job matching, ATS-friendly resume tailoring, and cover letter generation.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  useEffect(() => {
    trackFunnelEvent("workspace_viewed");
  }, []);

  return (
    <main className="min-h-screen bg-page-gradient p-3 sm:p-5 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-3xl border border-sidebar-border bg-card shadow-workspace sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex flex-col bg-sidebar px-4 py-5 text-sidebar-foreground sm:px-6 lg:min-h-full lg:py-7">
          <div className="flex items-center gap-3">
            <img
              src={logoAsset.url}
              alt="ATS Resume Ready logo"
              className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-logo"
              width={44}
              height={44}
            />
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-semibold tracking-tight">
                ATS Resume Ready — AI Career Workspace
              </h1>
              <p className="text-xs text-sidebar-foreground">AI career workspace</p>
            </div>
          </div>

          <div className="mt-7 hidden lg:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground">
              Your workflow
            </p>
          </div>
          <div className="mt-4 lg:flex-1">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="mt-6 hidden rounded-2xl border border-sidebar-border bg-sidebar-accent/45 p-4 lg:block">
            <Sparkles className="h-4 w-4 text-sidebar-primary" />
            <p className="mt-3 text-sm font-semibold">Built for honest tailoring</p>
            <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground">
              ATS Resume Ready reframes your real experience—it never invents qualifications.
            </p>
          </div>
        </aside>

        <section className="min-w-0 bg-background">
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-5 py-5 sm:px-8 lg:px-10 lg:py-7">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Application studio
              </p>
              <h2 className="mt-1 truncate font-display text-xl font-semibold text-foreground sm:text-2xl">
                Build your strongest application
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground sm:flex">
                <ShieldCheck className="h-4 w-4 text-accent-foreground" />
                Private workspace
              </div>
              <ThemeToggle />
              <Link
                to="/"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Back to home"
              >
                <HomeIcon className="h-4 w-4" />
              </Link>
            </div>
          </header>

          <div
            className="animate-fade-in px-4 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10"
            key={activeTab}
          >
            {activeTab === "profile" && <ProfileTab onNext={() => setActiveTab("jobs")} />}
            {activeTab === "jobs" && (
              <AvailableJobsTab
                onBack={() => setActiveTab("profile")}
                onNext={() => setActiveTab("jd")}
              />
            )}
            {activeTab === "jd" && (
              <JDTab onBack={() => setActiveTab("jobs")} onNext={() => setActiveTab("resume")} />
            )}
            {activeTab === "resume" && (
              <ResumeTab
                onBack={() => setActiveTab("jd")}
                onNext={() => setActiveTab("interview")}
              />
            )}
            {activeTab === "interview" && <InterviewTab onBack={() => setActiveTab("resume")} />}

            <footer className="pb-2 pt-8 text-center text-xs text-muted-foreground">
              Review generated content before submitting. Never misrepresent your qualifications.
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
