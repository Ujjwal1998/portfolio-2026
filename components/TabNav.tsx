"use client";

export type TabType = "about" | "experience" | "projects";

interface TabNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string }[] = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
];

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="flex gap-6 text-sm border-b border-card-border pb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`transition-colors relative pb-1 ${
            activeTab === tab.id
              ? "text-accent"
              : "text-foreground hover:text-accent"
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute left-0 right-0 -bottom-[17px] h-[2px] bg-accent" />
          )}
        </button>
      ))}
    </nav>
  );
}
