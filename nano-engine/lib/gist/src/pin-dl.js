const imageUrl = "https://i.pinimg.com/originals/48/fe/75/48fe755aa57956af421a3901489d6e9f.jpg";

const fs = await import("fs");
const path = await import("path");

var fileName = path.basename(new URL(imageUrl).pathname);

var res = await fetch(imageUrl);

if (!res.ok) {
  console.log(JSON.stringify({ status: "failed", code: res.status, input: imageUrl }, null, 2));
  process.exit(1);
}

var buffer = Buffer.from(await res.arrayBuffer());
fs.default.writeFileSync(fileName, buffer);

var stats = fs.default.statSync(fileName);

console.log(JSON.stringify({
  status: "success",
  code: res.status,
  input: imageUrl,
  file: fileName,
  size: stats.size,
  sizeFormatted: (stats.size / 1024).toFixed(2) + " KB",
}, null, 2));