import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36";

const FALLBACK_CONFIG = {
  auth: "20250901majwlqo",
  domain: "api-ak.savefromins.com",
  reqUrl: "https://api.savefromins.com/api/contentsite_api"
};

async function fetchText(url, ms = 15000) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "*/*" },
    signal: AbortSignal.timeout(ms)
  });
  if (!res.ok) throw new Error("HTTP " + res.status + " " + url);
  return res.text();
}

function pickConfig(jsList) {
  let auth, domain, reqUrl;
  for (const js of jsList) {
    if (!auth) {
      const m = js.match(/auth:"([^"]+)"/);
      if (m && js.includes("media/parse")) auth = m[1];
    }
    if (!domain) {
      const m = js.match(/VIDEODOWNLOAD:"([^"]+)"/);
      if (m) domain = m[1];
    }
    if (!reqUrl) {
      const m = js.match(/REQ_URL:"([^"]+)"/);
      if (m) reqUrl = m[1];
    }
  }
  return { auth, domain, reqUrl };
}

async function getSessionConfig() {
  try {
    const html = await fetchText("https://savefromins.com/");
    const chunks = [...html.matchAll(/src="([^"]*_next\/static\/chunks\/[^"]+\.js)"/g)]
      .map((m) => (m[1].startsWith("http") ? m[1] : "https://savefromins.com" + m[1]));

    let jsList = (await Promise.allSettled([...new Set(chunks)].map((u) => fetchText(u))))
      .map((r) => (r.status === "fulfilled" ? r.value : ""));
    let cfg = pickConfig(jsList);

    if (!cfg.auth || !cfg.domain || !cfg.reqUrl) {
      await new Promise((r) => setTimeout(r, 1000));
      jsList = (await Promise.allSettled([...new Set(chunks)].map((u) => fetchText(u, 20000))))
        .map((r) => (r.status === "fulfilled" ? r.value : ""));
      cfg = pickConfig(jsList);
    }

    if (!cfg.auth || !cfg.domain || !cfg.reqUrl) {
      console.error("DEBUG: config scrape tidak lengkap, pakai FALLBACK_CONFIG");
    }
    return {
      auth: cfg.auth || FALLBACK_CONFIG.auth,
      domain: cfg.domain || FALLBACK_CONFIG.domain,
      reqUrl: cfg.reqUrl || FALLBACK_CONFIG.reqUrl
    };
  } catch (err) {
    console.error("DEBUG: config scrape gagal (" + err.message + "), pakai FALLBACK_CONFIG");
    return FALLBACK_CONFIG;
  }
}

function collectResources(data) {
  if (Array.isArray(data.resources) && data.resources.length) return data.resources;
  const out = [];
  for (const m of data.media || []) {
    if (Array.isArray(m.resources) && m.resources.length) out.push(m.resources[0]);
  }
  return out;
}

async function run(link) {
  if (!/^https?:\/\//i.test(link || "")) {
    return { status: false, code: 400, input: link ?? null, result: null };
  }
  try {
    const cfg = await getSessionConfig();
    const body = new URLSearchParams({
      auth: cfg.auth,
      domain: cfg.domain,
      origin: "source",
      link
    }).toString();

    const res = await fetch(cfg.reqUrl + "/media/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": UA,
        Origin: "https://savefromins.com",
        Referer: "https://savefromins.com/",
        Accept: "*/*"
      },
      body,
      signal: AbortSignal.timeout(45000)
    });
    const payload = await res.json();

    if (payload?.status !== 1 || !payload?.data) {
      return { status: false, code: res.status, input: link, result: null };
    }

    const resources = collectResources(payload.data);
    if (!resources.length) return { status: false, code: 200, input: link, result: null };

    const d = payload.data;
    return {
      status: true,
      code: 200,
      input: link,
      result: {
        title: d.title ?? "",
        thumbnail: d.thumbnail ?? "",
        duration: d.duration ?? 0,
        links: resources.map((r) => ({
          type: r.type ?? "",
          quality: r.quality ?? "",
          format: r.format ?? "",
          url: r.download_url || r.preview_url || ""
        })),
        comments: d.comment_items?.items ?? []
      }
    };
  } catch (err) {
    console.error("DEBUG:", err.message, err.cause?.code ?? "");
    return { status: false, code: 500, input: link, result: null };
  }
}

run(process.argv[2]).then((o) => console.log(JSON.stringify(o, null, 2)));
