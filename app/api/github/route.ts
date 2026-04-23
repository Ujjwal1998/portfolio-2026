export const dynamic = 'force-dynamic';

export async function GET() {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  if (!username) {
    return Response.json({ error: "GITHUB_USERNAME not configured" }, { status: 503 });
  }

  const headers: HeadersInit = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&type=owner`, { headers }),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      return Response.json({ error: "GitHub API error" }, { status: 502 });
    }

    const user = await userRes.json();
    const repos = await reposRes.json();

    const stars = (repos as { stargazers_count: number }[]).reduce(
      (sum: number, repo: { stargazers_count: number }) => sum + repo.stargazers_count,
      0
    );

    const languageCounts: Record<string, number> = {};
    for (const repo of repos as { language: string | null }[]) {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] ?? 0) + 1;
      }
    }
    const topLanguage = Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return Response.json({
      username,
      publicRepos: user.public_repos,
      followers: user.followers,
      stars,
      topLanguage,
      profileUrl: `https://github.com/${username}`,
    });
  } catch {
    return Response.json({ error: "Failed to fetch GitHub data" }, { status: 502 });
  }
}
