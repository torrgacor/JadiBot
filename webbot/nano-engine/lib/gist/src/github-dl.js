// Isi dengan personal access token GitHub kalau mau mode rate limit lebih lega
// Contoh: const GITHUB_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxx";
// Kosongkan ("") kalau mau pakai mode normal (tanpa token)
const GITHUB_TOKEN = "";

const REPO_URL = "https://github.com/Ditzzx-vibecoder/Ditzzx-vibecoder";

const fs = require("fs");
const path = require("path");

function parseRepoUrl(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?\/?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

async function downloadRepo(url) {
  const parsed = parseRepoUrl(url);

  if (!parsed) {
    console.log(JSON.stringify({ error: true, message: "URL repo tidak valid" }, null, 2));
    return;
  }

  const { owner, repo } = parsed;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/zipball`;

  const headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "node-github-download"
  };

  if (GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  }

  const res = await fetch(apiUrl, { headers, redirect: "follow" });

  if (!res.ok) {
    console.log(JSON.stringify({ error: true, status: res.status, message: res.statusText }, null, 2));
    return;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const outputPath = path.join(__dirname, `${repo}.zip`);

  fs.writeFileSync(outputPath, buffer);

  console.log(JSON.stringify({
    mode: GITHUB_TOKEN ? "token" : "normal",
    owner,
    repo,
    output_file: outputPath,
    size_bytes: buffer.length
  }, null, 2));
}

downloadRepo(REPO_URL);