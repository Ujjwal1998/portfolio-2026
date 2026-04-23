export const revalidate = 300;

export async function GET() {
  const apiKey = process.env.STEAM_API_KEY;
  const steamId = process.env.STEAM_ID;

  if (!apiKey || !steamId) {
    return Response.json({ error: "Steam credentials not configured" }, { status: 503 });
  }

  try {
    const [recentRes, profileRes, ownedRes] = await Promise.all([
      fetch(
        `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${apiKey}&steamid=${steamId}&count=1&format=json`
      ),
      fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}&format=json`
      ),
      fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json`
      ),
    ]);

    if (!recentRes.ok || !profileRes.ok) {
      return Response.json({ error: "Steam API error" }, { status: 502 });
    }

    const recentData = await recentRes.json();
    const profileData = await profileRes.json();
    const ownedData = ownedRes.ok ? await ownedRes.json() : null;

    const recentGame = recentData.response?.games?.[0] ?? null;
    const player = profileData.response?.players?.[0] ?? null;
    const totalGames = ownedData?.response?.game_count ?? null;

    return Response.json({
      recentGame: recentGame
        ? {
            name: recentGame.name,
            appid: recentGame.appid,
            playtime2Weeks: Math.round(recentGame.playtime_2weeks / 60),
            playtimeTotal: Math.round(recentGame.playtime_forever / 60),
            iconUrl: `https://media.steampowered.com/steamcommunity/public/images/apps/${recentGame.appid}/${recentGame.img_icon_url}.jpg`,
          }
        : null,
      player: player
        ? {
            name: player.personaname,
            avatarUrl: player.avatarfull,
            profileUrl: player.profileurl,
            isOnline: player.personastate !== 0,
          }
        : null,
      totalGames,
    });
  } catch {
    return Response.json({ error: "Failed to fetch Steam data" }, { status: 502 });
  }
}
