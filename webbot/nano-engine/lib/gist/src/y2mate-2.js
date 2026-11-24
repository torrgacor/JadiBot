const API = "https://content-service.opa-shan.workers.dev";

const input = {
  url: "https://youtu.be/gs-F5seOoOk?si=JNy4r3pFVh6OmjMx",
  format: "mp4" // ubah ke mp3/mp4
};

const requestInput = {
  ...input,
  format: input.format === "mp4" ? "720" : "mp3"
};

const headers = {
  "sec-ch-ua-platform": "\"Windows\"",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36",
  "sec-ch-ua": "\"Chromium\";v=\"152\", \"Not?A_Brand\";v=\"24\", \"Google Chrome\";v=\"152\"",
  "content-type": "application/json",
  "sec-ch-ua-mobile": "?0",
  "accept": "*/*",
  "origin": "https://www.y2mate.rest",
  "sec-fetch-site": "cross-site",
  "sec-fetch-mode": "cors",
  "sec-fetch-dest": "empty",
  "referer": "https://www.y2mate.rest/",
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "priority": "u=1, i"
};

async function request() {
  const post = await fetch(`${API}/api/v1/downloads`, {
    method: "POST",
    headers,
    body: JSON.stringify(requestInput)
  });

  const postData = await post.json();

  if (!postData.job_id) {
    delete postData.status_url;
    delete postData.created_at;
    delete postData.updated_at;
    delete postData.expires_at;

    return {
      status: postData.status || "failed",
      code: post.status,
      input,
      result: postData
    };
  }

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const get = await fetch(
      `${API}/api/v1/downloads/${postData.job_id}`,
      {
        method: "GET",
        headers
      }
    );

    const result = await get.json();

    if (
      result.status === "ready" ||
      result.status === "failed" ||
      result.status === "error"
    ) {
      delete result.status_url;
      delete result.created_at;
      delete result.updated_at;
      delete result.expires_at;

      return {
        status: result.status,
        code: get.status,
        input,
        result
      };
    }
  }
}

request()
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.log(JSON.stringify({
      status: "error",
      code: 500,
      input,
      result: {
        message: error.message
      }
    }, null, 2));
  });