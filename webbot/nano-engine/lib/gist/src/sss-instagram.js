const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const targetUrl = "https://www.instagram.com/p/DaAFragD2ID/?img_index=1&igsh=eXA4eDhwOTIwdnZ0";

function cleanResponse(rawData) {
  if (!Array.isArray(rawData) || rawData.length === 0) return rawData;

  const firstMeta = rawData[0].meta;

  const postInfo = {
    username: firstMeta.username,
    caption: firstMeta.title,
    source: firstMeta.source,
    likes: firstMeta.like_count,
    total_comments: firstMeta.comment_count,
    posted_at: new Date(firstMeta.taken_at * 1000).toLocaleString(),
    comments_preview: firstMeta.comments
  };

  const medias = rawData.map(item => {
    const best = item.url[0];
    return {
      type: best.type === "jpg" ? "image" : "video",
      quality: best.subname,
      extension: best.ext,
      download_url: best.url,
      thumbnail: item.thumb
    };
  });

  return { post_info: postInfo, medias };
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();

  let reqPayload = null;
  let resPayload = null;

  await page.setRequestInterception(true);

  page.on("request", (req) => {
    if (req.url().includes("/api/convert") && req.method() === "POST") {
      reqPayload = JSON.parse(req.postData());
    }
    req.continue();
  });

  page.on("response", async (res) => {
    if (res.url().includes("/api/convert") && reqPayload) {
      resPayload = await res.json();
    }
  });

  await page.goto("https://sssinstagram.com", { waitUntil: "networkidle2" });

  const input = (await page.$('input[name="url"]')) || (await page.$('input[type="text"]'));
  await input.click({ clickCount: 3 });
  await input.type(targetUrl);

  const button = (await page.$('button[type="submit"]')) || (await page.$('form button'));
  await button.click();

  await page.waitForFunction(() => resPayload !== null, { timeout: 30000 }).catch(() => {});

  const finalOutput = {
    response: resPayload ? cleanResponse(resPayload) : null,
    request: reqPayload
  };

  console.log(JSON.stringify(finalOutput, null, 2));

  await browser.close();
})();