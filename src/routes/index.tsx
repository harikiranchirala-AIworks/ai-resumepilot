import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import { TabNavigation, type TabId } from "@/components/tailor/TabNavigation";
import { ProfileTab } from "@/components/tailor/ProfileTab";
import { JDTab } from "@/components/tailor/JDTab";
import { ResumeTab } from "@/components/tailor/ResumeTab";
import { AvailableJobsTab } from "@/components/tailor/AvailableJobsTab";
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumePilot — AI Resume Tailoring" },
      {
        name: "description",
        content:
          "Find matching jobs and tailor ATS-friendly resumes and cover letters with AI.",
      },
      { property: "og:title", content: "ResumePilot — AI Resume Tailoring" },
      {
        property: "og:description",
        content:
          "Find matching jobs and tailor ATS-friendly resumes and cover letters with AI.",
      },
      { property: "og:url", content: "https://ai-resumepilot.lovable.app" },
      { name: "twitter:title", content: "ResumePilot — AI Resume Tailoring" },
      {
        name: "twitter:description",
        content: "Find matching jobs and tailor ATS-friendly resumes and cover letters with AI.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://ai-resumepilot.lovable.app" },
    ],
  }),
  component: Home,
});

function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <main className="min-h-screen bg-page-gradient p-3 sm:p-5 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-3xl border border-sidebar-border bg-card shadow-workspace sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex flex-col bg-sidebar px-4 py-5 text-sidebar-foreground sm:px-6 lg:min-h-full lg:py-7">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground shadow-logo">
              RP
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-semibold tracking-tight">ResumePilot</h1>
              <p className="text-xs text-sidebar-foreground/60">AI career workspace</p>
            </div>
          </div>

          <div className="mt-7 hidden lg:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/45">Your workflow</p>
          </div>
          <div className="mt-4 lg:flex-1">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="mt-6 hidden rounded-2xl border border-sidebar-border bg-sidebar-accent/45 p-4 lg:block">
            <Sparkles className="h-4 w-4 text-sidebar-primary" />
            <p className="mt-3 text-sm font-semibold">Built for honest tailoring</p>
            <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/60">
              ResumePilot reframes your real experience—it never invents qualifications.
            </p>
          </div>
        </aside>

        <section className="min-w-0 bg-background">
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-5 py-5 sm:px-8 lg:px-10 lg:py-7">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Application studio</p>
              <h2 className="mt-1 truncate font-display text-xl font-semibold text-foreground sm:text-2xl">
                Build your strongest application
              </h2>
            </div>
            <div className="hidden shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground sm:flex">
              <ShieldCheck className="h-4 w-4 text-accent-foreground" />
              Private workspace
            </div>
          </header>

          <div className="animate-fade-in px-4 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10" key={activeTab}>
            {activeTab === "profile" && <ProfileTab onNext={() => setActiveTab("jobs")} />}
            {activeTab === "jobs" && (
              <AvailableJobsTab onBack={() => setActiveTab("profile")} onNext={() => setActiveTab("jd")} />
            )}
            {activeTab === "jd" && (
              <JDTab onBack={() => setActiveTab("jobs")} onNext={() => setActiveTab("resume")} />
            )}
            {activeTab === "resume" && <ResumeTab onBack={() => setActiveTab("jd")} />}

            <footer className="pb-2 pt-8 text-center text-xs text-muted-foreground">
              Review generated content before submitting. Never misrepresent your qualifications.
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
