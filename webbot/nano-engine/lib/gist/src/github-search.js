// Isi dengan personal access token GitHub kalau mau mode rate limit lebih lega
// Contoh: const GITHUB_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxx";
// Kosongkan ("") kalau mau pakai mode normal (tanpa token)
const GITHUB_TOKEN = "";

const QUERY = "Claude code";

async function searchRepos(q) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=10`;

  const headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "node-github-search"
  };

  if (GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    console.log(JSON.stringify({ error: true, status: res.status, message: res.statusText }, null, 2));
    return;
  }

  const data = await res.json();

  const result = {
    mode: GITHUB_TOKEN ? "token" : "normal",
    query: q,
    total_count: data.total_count || 0,
    items: (data.items || []).map((repo) => ({
      full_name: repo.full_name,
      stars: repo.stargazers_count,
      language: repo.language || null,
      description: repo.description || null,
      url: repo.html_url
    }))
  };

  console.log(JSON.stringify(result, null, 2));
}

searchRepos(QUERY);