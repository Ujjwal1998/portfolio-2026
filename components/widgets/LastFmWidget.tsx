"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import WidgetSkeleton from "./WidgetSkeleton";

interface LastFmData {
  nowPlaying: {
    track: string;
    artist: string;
    album: string | null;
    albumArt: string | null;
    isLive: boolean;
    url: string | null;
  } | null;
  scrobbles: number | null;
  topArtist: string | null;
  username: string;
  profileUrl: string;
}

export default function LastFmWidget() {
  const [data, setData] = useState<LastFmData | null>(null);
  const [error, setError] = useState(false);

  const fetchData = useCallback(() => {
    fetch("/api/lastfm")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    fetchData();
    // Poll every 30s to catch now-playing changes
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (!data && !error) return <WidgetSkeleton />;

  if (error || !data) {
    return (
      <div className="p-4 rounded-xl bg-card-bg border border-card-border">
        <div className="flex items-center gap-2 mb-1 text-text-muted text-xs">
          <LastFmIcon />
          <span>Last.fm</span>
        </div>
        <p className="text-text-muted text-sm">Unavailable</p>
      </div>
    );
  }

  const track = data.nowPlaying;
  const href = track?.url ?? data.profileUrl;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl bg-card-bg border border-card-border hover:border-accent/50 transition-colors group"
    >
      <div className="flex items-center gap-2 mb-3 text-text-muted text-xs">
        <LastFmIcon />
        <span>Last.fm</span>
        {track?.isLive && (
          <span className="ml-auto flex items-center gap-1 text-accent text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Now Playing
          </span>
        )}
      </div>

      {track ? (
        <div className="flex gap-3 items-start">
          {track.albumArt ? (
            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
              <Image
                src={track.albumArt}
                alt={track.album ?? track.track}
                fill
                sizes="40px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded bg-card-border flex-shrink-0 flex items-center justify-center">
              <LastFmIcon />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate leading-tight">
              {track.track}
            </p>
            <p className="text-xs text-text-muted truncate">{track.artist}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-text-muted">No recent tracks</p>
      )}

      <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
        {data.scrobbles !== null && (
          <span>{data.scrobbles.toLocaleString()} scrobbles</span>
        )}
        {data.topArtist && <span>Top: {data.topArtist}</span>}
      </div>
    </a>
  );
}

function LastFmIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.599 15.413l-.881-2.393s-1.43 1.596-3.573 1.596c-1.897 0-3.244-1.649-3.244-4.286 0-3.381 1.704-4.591 3.381-4.591 2.416 0 3.182 1.566 3.842 3.573l.881 2.587c.881 2.667 2.53 4.809 7.293 4.809 3.413 0 5.722-1.046 5.722-3.793 0-2.22-1.267-3.37-3.628-3.924l-1.753-.385c-1.211-.275-1.568-.77-1.568-1.594 0-.935.742-1.486 1.953-1.486 1.32 0 2.031.494 2.143 1.649l2.747-.33c-.22-2.47-1.924-3.463-4.78-3.463-2.5 0-4.862.935-4.862 3.959 0 1.896.935 3.106 3.271 3.682l1.871.44c1.375.33 1.787.88 1.787 1.706 0 1.017-.99 1.43-2.91 1.43-2.823 0-3.996-1.485-4.69-3.519l-.908-2.613c-1.155-3.49-2.998-4.78-6.628-4.78C1.732 4.487 0 7.207 0 10.426c0 3.16 1.622 6.016 5.2 6.016 2.693 0 4.04-1.029 5.399-1.029z" />
    </svg>
  );
}
