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
    <nav aria-label="Resume tailoring steps" className="grid grid-cols-4 gap-1 rounded-2xl bg-sidebar-accent/50 p-1 lg:grid-cols-1 lg:gap-2 lg:bg-transparent lg:p-0">
      {TABS.map((tab, index) => {
        const isActive = activeTab === tab.id;
        const isDone = index < activeIndex;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-label={`Step ${tab.step}: ${tab.label}`}
            aria-current={isActive ? "step" : undefined}
            className={`tab-btn group flex min-w-0 items-center justify-center gap-2 lg:justify-start lg:gap-3 ${
              isActive
                ? "tab-btn-active"
                : isDone
                  ? "tab-btn-done"
                  : "tab-btn-inactive"
            }`}
          >
            <span
              className={`step-pill shrink-0 ${isActive ? "ring-2 ring-sidebar-ring/30 ring-offset-2 ring-offset-sidebar" : isDone ? "bg-accent text-accent-foreground" : "bg-sidebar-accent text-sidebar-foreground/55"}`}
            >
              {tab.step}
            </span>
            <span className="hidden min-w-0 truncate text-left lg:block">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
