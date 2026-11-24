import https from "node:https";
import crypto from "node:crypto";

const inputUrl = "https://www.youtube.com";
const boundary = "----geckoformboundary" + crypto.randomBytes(16).toString("hex");

const body = `--${boundary}\r\nContent-Disposition: form-data; name="url"\r\n\r\n${inputUrl}\r\n--${boundary}--\r\n`;

const options = {
  hostname: "kua.lat",
  path: "/shorten",
  method: "POST",
  headers: {
    "content-type": `multipart/form-data; boundary=${boundary}`,
    "content-length": Buffer.byteLength(body),
    "x-requested-with": "XMLHttpRequest",
    "accept": "application/json, text/javascript, */*; q=0.01",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0",
    "origin": "https://kua.lat",
    "referer": "https://kua.lat/"
  }
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      parsed = null;
    }

    const output = {
      status: res.statusCode,
      code: res.statusCode,
      input_url: inputUrl,
      result_url: parsed?.data?.shorturl ?? null
    };

    console.log(JSON.stringify(output, null, 2));
  });
});

req.on("error", (err) => {
  console.log(JSON.stringify({
    status: null,
    code: null,
    input_url: inputUrl,
    result_url: null,
    error: err.message
  }, null, 2));
});

req.write(body);
req.end();