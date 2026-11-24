const fs = await import("fs");
const path = await import("path");

const packageUrl = "https://www.npmjs.com/package/express";

var urlPath = new URL(packageUrl).pathname;
var pkg = urlPath.split("/package/")[1];
var ver = null;

if (pkg.includes("/v/")) {
  var parts = pkg.split("/v/");
  pkg = parts[0];
  ver = parts[1];
}

var endpoint = ver ? "https://registry.npmjs.org/" + encodeURIComponent(pkg) + "/" + ver : "https://registry.npmjs.org/" + encodeURIComponent(pkg) + "/latest";

var meta = await fetch(endpoint).then(function(r) { return r.json(); });

var tarballUrl = meta.dist.tarball;
var fileName = path.basename(new URL(tarballUrl).pathname);

var res = await fetch(tarballUrl);

if (!res.ok) {
  console.log(JSON.stringify({ status: "failed", code: res.status, input: packageUrl }, null, 2));
  process.exit(1);
}

var buffer = Buffer.from(await res.arrayBuffer());
fs.default.writeFileSync(fileName, buffer);

var stats = fs.default.statSync(fileName);

console.log(JSON.stringify({
  status: "success",
  code: res.status,
  input: packageUrl,
  name: meta.name,
  version: meta.version,
  file: fileName,
  size: stats.size,
  sizeFormatted: (stats.size / 1024).toFixed(2) + " KB",
  tarball: tarballUrl,
}, null, 2));