const API = "https://saveig.in/wp-json/visolix/api/download";

async function saveig(url) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "accept": "*/*",
      "content-type": "application/json",
      "origin": "https://saveig.in",
      "referer": "https://saveig.in/",
      "x-visolix-nonce": "66b14bdf91"
    },
    body: JSON.stringify({
      url,
      format: "",
      captcha_response: null
    })
  });

  const json = await res.json();

  if (!json.status) {
    throw new Error("Failed to fetch media");
  }

  const html = json.data;

  const results = [...html.matchAll(/href="([^"]*dl\.php\?id=[^"]+)"/g)]
    .map(m => m[1].replace(/&amp;/g, "&"));

  return {
    status: true,
    url,
    total: results.length,
    result: results
  };
}


//Usage
(async () => {
  const data = await saveig(
    "https://www.instagram.com/p/DZm4ZVYk00W/?img_index=1&igsh=MXY2emx3Z3I1OWJ1aw=="
  );

  console.log(JSON.stringify(data, null, 2));
})();