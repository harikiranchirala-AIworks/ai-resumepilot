import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TabNavigation, type TabId } from "@/components/tailor/TabNavigation";
import { ProfileTab } from "@/components/tailor/ProfileTab";
import { JDTab } from "@/components/tailor/JDTab";
import { ResumeTab } from "@/components/tailor/ResumeTab";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tailor Resume — AI-powered LaTeX resume tailoring" },
      {
        name: "description",
        content:
          "Tailor your resume to any job description. AI-powered LaTeX output with match scoring and ATS compatibility checks.",
      },
      { property: "og:title", content: "Tailor Resume" },
      {
        property: "og:description",
        content:
          "Customize your LaTeX resume for any job — with match scoring and ATS compatibility checks.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <main className="min-h-screen bg-page-gradient">
      <header className="bg-header-gradient text-white shadow-lg shadow-brand-900/20">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-lg font-bold">
              TR
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Tailor Resume
            </h1>
          </div>
          <p className="text-brand-100 text-sm md:text-base max-w-xl">
            Customize your LaTeX resume for any job — with match scoring and ATS
            compatibility checks.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "profile" && (
          <ProfileTab onNext={() => setActiveTab("jd")} />
        )}
        {activeTab === "jd" && (
          <JDTab
            onBack={() => setActiveTab("profile")}
            onNext={() => setActiveTab("resume")}
          />
        )}
        {activeTab === "resume" && (
          <ResumeTab onBack={() => setActiveTab("jd")} />
        )}

        <footer className="text-center text-xs text-brand-600/70 pt-4 pb-8">
          Review generated content before submitting. Never misrepresent your
          qualifications.
        </footer>
      </div>
    </main>
  );
}
