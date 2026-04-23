"use client";

import { useEffect, useState } from "react";
import WidgetSkeleton from "./WidgetSkeleton";

interface SteamData {
  recentGame: {
    name: string;
    appid: number;
    playtime2Weeks: number;
    playtimeTotal: number;
    iconUrl: string;
  } | null;
  player: {
    name: string;
    avatarUrl: string;
    profileUrl: string;
    isOnline: boolean;
  } | null;
  totalGames: number | null;
}

export default function SteamWidget() {
  const [data, setData] = useState<SteamData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/steam")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (!data && !error) return <WidgetSkeleton />;

  if (error || !data) {
    return (
      <div className="p-4 rounded-xl bg-card-bg border border-card-border">
        <div className="flex items-center gap-2 mb-1 text-text-muted text-xs">
          <SteamIcon />
          <span>Steam</span>
        </div>
        <p className="text-text-muted text-sm">Unavailable</p>
      </div>
    );
  }

  const profileUrl = data.player?.profileUrl ?? "https://store.steampowered.com";

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl bg-card-bg border border-card-border hover:border-accent/50 transition-colors group"
    >
      <div className="flex items-center gap-2 mb-3 text-text-muted text-xs">
        <SteamIcon />
        <span>Steam</span>
        {data.player?.isOnline && (
          <span className="ml-auto w-2 h-2 rounded-full bg-green-400" title="Online" />
        )}
      </div>

      {data.recentGame ? (
        <>
          <p className="text-sm font-medium text-foreground truncate leading-tight mb-1">
            {data.recentGame.name}
          </p>
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <span>{data.recentGame.playtime2Weeks}h this fortnight</span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            {data.recentGame.playtimeTotal}h total
          </p>
        </>
      ) : (
        <p className="text-sm text-text-muted">No recent games</p>
      )}

      {data.totalGames !== null && (
        <p className="text-xs text-text-muted mt-2">{data.totalGames} games owned</p>
      )}
    </a>
  );
}

function SteamIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.718L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.662 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z" />
    </svg>
  );
}
