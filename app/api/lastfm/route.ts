export const revalidate = 30;

export async function GET() {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = process.env.LASTFM_USERNAME;

  if (!apiKey || !username) {
    return Response.json({ error: "Last.fm credentials not configured" }, { status: 503 });
  }

  const base = `https://ws.audioscrobbler.com/2.0/?api_key=${apiKey}&user=${username}&format=json`;

  try {
    const [recentRes, infoRes, topArtistRes] = await Promise.all([
      fetch(`${base}&method=user.getRecentTracks&limit=1`),
      fetch(`${base}&method=user.getInfo`),
      fetch(`${base}&method=user.getTopArtists&period=1month&limit=1`),
    ]);

    if (!recentRes.ok) {
      return Response.json({ error: "Last.fm API error" }, { status: 502 });
    }

    const recentData = await recentRes.json();
    const infoData = infoRes.ok ? await infoRes.json() : null;
    const topArtistData = topArtistRes.ok ? await topArtistRes.json() : null;

    const track = recentData.recenttracks?.track?.[0] ?? null;
    const isNowPlaying = track?.["@attr"]?.nowplaying === "true";

    const albumArt =
      track?.image?.find((img: { size: string; "#text": string }) => img.size === "medium")?.["#text"] ||
      track?.image?.[1]?.["#text"] ||
      null;

    const scrobbles = infoData?.user?.playcount ? parseInt(infoData.user.playcount) : null;
    const topArtist = topArtistData?.topartists?.artist?.[0]?.name ?? null;

    return Response.json({
      nowPlaying: track
        ? {
            track: track.name,
            artist: track.artist?.["#text"] ?? track.artist,
            album: track.album?.["#text"] ?? null,
            albumArt: albumArt || null,
            isLive: isNowPlaying,
            url: track.url ?? null,
          }
        : null,
      scrobbles,
      topArtist,
      username,
      profileUrl: `https://www.last.fm/user/${username}`,
    });
  } catch {
    return Response.json({ error: "Failed to fetch Last.fm data" }, { status: 502 });
  }
}
