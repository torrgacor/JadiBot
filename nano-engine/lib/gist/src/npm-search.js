const q = "express";

const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(q)}&size=20`, {
  method: "GET",
  headers: {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
    accept: "application/json",
    "accept-encoding": "gzip, deflate, br",
  },
});

const data = await res.json();

const result = data?.objects?.map((obj) => ({
  name: obj.package?.name,
  version: obj.package?.version,
  description: obj.package?.description,
  license: obj.package?.license,
  author: obj.package?.author?.name,
  date: obj.package?.date,
  links: obj.package?.links,
  keywords: obj.package?.keywords,
  searchScore: obj.score?.detail?.matchedFields?.length || obj.score?.final,
  maintainers: obj.package?.maintainers?.map((m) => m.username),
})) || data;

const output = {
  status: res.ok ? "success" : "failed",
  code: res.status,
  input: q,
  total: data?.total,
  result: result,
};

console.log(JSON.stringify(output, null, 2));