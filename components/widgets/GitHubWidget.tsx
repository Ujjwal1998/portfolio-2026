"use client";

import { useEffect, useState } from "react";
import WidgetSkeleton from "./WidgetSkeleton";

interface GitHubData {
  username: string;
  publicRepos: number;
  followers: number;
  stars: number;
  topLanguage: string | null;
  profileUrl: string;
}

export default function GitHubWidget() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (!data && !error) return <WidgetSkeleton />;

  if (error || !data) {
    return (
      <div className="p-4 rounded-xl bg-card-bg border border-card-border">
        <div className="flex items-center gap-2 mb-1 text-text-muted text-xs">
          <GitHubIcon />
          <span>GitHub</span>
        </div>
        <p className="text-text-muted text-sm">Unavailable</p>
      </div>
    );
  }

  return (
    <a
      href={data.profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl bg-card-bg border border-card-border hover:border-accent/50 transition-colors group"
    >
      <div className="flex items-center gap-2 mb-3 text-text-muted text-xs">
        <GitHubIcon />
        <span>GitHub</span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-semibold text-foreground">{data.publicRepos}</span>
        <span className="text-text-muted text-sm">repos</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-text-muted">
        <span>★ {data.stars}</span>
        <span>{data.followers} followers</span>
      </div>
      {data.topLanguage && (
        <span className="mt-2 inline-block px-2 py-0.5 text-xs font-mono bg-accent/10 text-accent rounded">
          {data.topLanguage}
        </span>
      )}
    </a>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
