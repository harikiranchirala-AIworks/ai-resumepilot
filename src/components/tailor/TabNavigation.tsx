"use client";

export type TabId = "profile" | "jobs" | "jd" | "resume";

const TABS: { id: TabId; label: string; step: number }[] = [
  { id: "profile", label: "Profile", step: 1 },
  { id: "jobs", label: "Available Jobs", step: 2 },
  { id: "jd", label: "Job Description", step: 3 },
  { id: "resume", label: "Resume", step: 4 },
];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const activeIndex = TABS.findIndex((t) => t.id === activeTab);

  return (
    <nav className="flex flex-wrap gap-2 p-2 bg-white/70 backdrop-blur rounded-2xl border border-brand-100 shadow-card">
      {TABS.map((tab, index) => {
        const isActive = activeTab === tab.id;
        const isDone = index < activeIndex;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`tab-btn flex-1 min-w-[100px] flex items-center justify-center gap-2 ${
              isActive
                ? "tab-btn-active"
                : isDone
                  ? "tab-btn-done"
                  : "tab-btn-inactive"
            }`}
          >
            <span
              className={`step-pill ${isActive ? "ring-2 ring-brand-300 ring-offset-1" : isDone ? "bg-brand-500" : "bg-brand-300"}`}
            >
              {tab.step}
            </span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
