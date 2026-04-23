"use client";

import { useState, useEffect, useRef } from "react";
import TabNav, { TabType } from "@/components/TabNav";
import GitHubWidget from "@/components/widgets/GitHubWidget";
import SteamWidget from "@/components/widgets/SteamWidget";
import LastFmWidget from "@/components/widgets/LastFmWidget";
import { about, experience, projects } from "@/content";

const TAB_ORDER: TabType[] = ["about", "experience", "projects"];

const TAB_THEMES: Record<TabType, string> = {
  about: "0",
  experience: "1",
  projects: "2",
};

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const [slideDirection, setSlideDirection] = useState<"up" | "down">("down");
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const scrollCooldown = 1000;
  const scrollThreshold = 50;
  const swipeThreshold = 100;
  const fastSwipeVelocity = 2.5;

  const currentIndex = TAB_ORDER.indexOf(activeTab);
  const prevSection = currentIndex > 0 ? TAB_ORDER[currentIndex - 1] : null;
  const nextSection = currentIndex < TAB_ORDER.length - 1 ? TAB_ORDER[currentIndex + 1] : null;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", TAB_THEMES[activeTab]);
  }, [activeTab]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < scrollCooldown) return;
      const idx = TAB_ORDER.indexOf(activeTab);
      if (e.deltaY > scrollThreshold && idx < TAB_ORDER.length - 1) {
        setSlideDirection("down");
        setActiveTab(TAB_ORDER[idx + 1]);
        lastScrollTime.current = now;
      } else if (e.deltaY < -scrollThreshold && idx > 0) {
        setSlideDirection("up");
        setActiveTab(TAB_ORDER[idx - 1]);
        lastScrollTime.current = now;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < scrollCooldown) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY.current - touchEndY;
      const elapsed = now - touchStartTime.current;
      const velocity = Math.abs(deltaY) / elapsed;
      const idx = TAB_ORDER.indexOf(activeTab);
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const atTop = scrollTop <= 5;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 5;
      const isFastSwipe = velocity > fastSwipeVelocity;

      if (deltaY > swipeThreshold && idx < TAB_ORDER.length - 1) {
        if (isFastSwipe || atBottom) {
          setSlideDirection("down");
          setActiveTab(TAB_ORDER[idx + 1]);
          lastScrollTime.current = now;
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      } else if (deltaY < -swipeThreshold && idx > 0) {
        if (isFastSwipe || atTop) {
          setSlideDirection("up");
          setActiveTab(TAB_ORDER[idx - 1]);
          lastScrollTime.current = now;
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => {
    const currentIdx = TAB_ORDER.indexOf(activeTab);
    const newIdx = TAB_ORDER.indexOf(tab);
    setSlideDirection(newIdx > currentIdx ? "down" : "up");
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[720px] px-6 py-12">

        {/* Header */}
        <header className="mb-8">
          <h1 className="font-title text-4xl md:text-5xl text-foreground mb-1">
            Ujjwal Talwar
          </h1>
          <p className="text-text-muted text-xl">
            Network Production Engineer · London
          </p>
        </header>

        {/* Widget bento grid — always visible */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <GitHubWidget />
            <SteamWidget />
            <LastFmWidget />
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-card-border mb-6" />

        {/* Tab navigation */}
        <TabNav activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Previous section hint */}
        {prevSection && (
          <button
            onClick={() => handleTabChange(prevSection)}
            className="w-full text-center text-text-muted mt-4 mb-2 animate-pulse hover:text-accent transition-colors cursor-pointer text-sm"
          >
            ↑ {prevSection.charAt(0).toUpperCase() + prevSection.slice(1)}
          </button>
        )}

        {/* Tab content with slide animation */}
        <div className="relative overflow-hidden mt-6">
          {activeTab === "about" && (
            <section
              key="about"
              className={`mb-16 ${slideDirection === "down" ? "animate-slideInFromTop" : "animate-slideInFromBottom"}`}
            >
              <div className="space-y-4 text-foreground leading-relaxed">
                {about.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {activeTab === "experience" && (
            <section
              key="experience"
              className={`mb-16 ${slideDirection === "down" ? "animate-slideInFromBottom" : "animate-slideInFromTop"}`}
            >
              <div className="space-y-4">
                {experience.map((job, index) => (
                  <div key={index} className="p-5 rounded-lg bg-card-bg border border-card-border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <h3 className="font-medium text-foreground">{job.title}</h3>
                      <span className="text-sm text-text-muted font-mono">{job.period}</span>
                    </div>
                    <p className="text-accent mb-2">{job.company}</p>
                    <p className="text-text-muted leading-relaxed">{job.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "projects" && (
            <section
              key="projects"
              className={`mb-16 ${slideDirection === "down" ? "animate-slideInFromBottom" : "animate-slideInFromTop"}`}
            >
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <a
                    key={index}
                    href={project.link}
                    className="block p-5 rounded-lg bg-card-bg border border-card-border hover:border-accent/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {project.title}
                      </h3>
                      <ExternalLinkIcon />
                    </div>
                    <p className="text-text-muted leading-relaxed mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 text-xs font-mono bg-accent/10 text-accent rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Next section hint */}
        {nextSection && (
          <button
            onClick={() => handleTabChange(nextSection)}
            className="w-full text-center text-text-muted mb-8 animate-pulse hover:text-accent transition-colors cursor-pointer text-sm"
          >
            ↓ {nextSection.charAt(0).toUpperCase() + nextSection.slice(1)}
          </button>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-card-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-6">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors inline-flex items-center gap-1">
                LinkedIn <ExternalLinkIcon />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors inline-flex items-center gap-1">
                GitHub <ExternalLinkIcon />
              </a>
            </div>
            <p className="text-text-muted">&copy; 2026</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
