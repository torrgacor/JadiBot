import axios from "axios";
import * as cheerio from "cheerio";

const INPUT = "https://www.facebook.com/share/v/14dpuyHMtz1/";

const API_CHALLENGE = "https://fsaver.net/api/challenge";
const API_DOWNLOAD = "https://fsaver.net/en/download";

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

async function fsaver(url = INPUT) {
  try {
    const challenge = await axios.post(
      API_CHALLENGE,
      { url },
      {
        headers: {
          accept: "*/*",
          "content-type": "application/json",
          origin: "https://fsaver.net",
          "user-agent": UA
        }
      }
    );

    const token = challenge.data?.token;

    if (!token) {
      throw new Error("Token tidak ditemukan");
    }

    const body = new URLSearchParams({
      url,
      token
    });

    const page = await axios.post(
      API_DOWNLOAD,
      body.toString(),
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "user-agent": UA
        }
      }
    );

    const $ = cheerio.load(page.data);

    const result = [];

    $("table tr").each((_, el) => {
      const quality = $(el).find("td").eq(0).text().trim();

      const href = $(el)
        .find("a[download]")
        .attr("href");

      if (!href) return;

      result.push({
        Quality: quality,
        Url: href
      });
    });

    const title =
      $(".download__item__profile_pic div")
        .first()
        .clone()
        .children()
        .remove()
        .end()
        .text()
        .trim() || null;

    const thumbnail =
      $(".download__item__profile_pic img").attr("src") ||
      null;

    return {
      Status: result.length > 0,
      Code: 200,
      Input: url,
      Result: result,
      Metadata: {
        Title: title,
        Thumbnail: thumbnail
      }
    };
  } catch (e) {
    return {
      Status: false,
      Code: e.response?.status || 500,
      Input: url,
      Result: [],
      Metadata: {},
      Error: e.message
    };
  }
}

console.log(
  JSON.stringify(
    await fsaver(),
    null,
    2
  )
);