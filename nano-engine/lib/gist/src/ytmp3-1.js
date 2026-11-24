import axios from 'axios';

function extractVideoId(input) {
  try {
    const url = new URL(input);
    
    if (url.hostname === "youtu.be") {
      return url.pathname.substring(1);
    }
    
    if (url.pathname.startsWith("/shorts/")) {
      return url.pathname.split("/")[2];
    }
    
    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/")[2];
    }
    
    return url.searchParams.get("v");
  } catch (e) {
    if (/^[A-Za-z0-9_-]{11}$/.test(input)) {
      return input;
    }
    return null;
  }
}

export async function processMedia(youtubeUrl, fileType = 'MP4') {
  try {
    const videoId = extractVideoId(youtubeUrl);

    if (!videoId) {
      return {
        status: false,
        code: 400,
        input_url: youtubeUrl,
        result_url: null
      };
    }

    const converterUrl = 'https://ac.insvid.com/converter';
    const headers = {
      'host': 'ac.insvid.com',
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'origin': 'https://ac.insvid.com',
      'referer': `https://ac.insvid.com/widget?url=https://www.youtube.com/watch?v=${videoId}&el=147`,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0'
    };

    const payload = {
      id: videoId,
      fileType: fileType
    };

    const response = await axios.post(converterUrl, payload, { headers });

    if (response.data && response.data.status === 'ok' && response.data.link) {
      return {
        status: true,
        code: 200,
        input_url: youtubeUrl,
        result_url: response.data.link
      };
    }

    return {
      status: false,
      code: 400,
      input_url: youtubeUrl,
      result_url: null
    };

  } catch (error) {
    return {
      status: false,
      code: error.response?.status || 500,
      input_url: youtubeUrl,
      result_url: null
    };
  }
}

const inputUrl = 'https://youtu.be/fB7qjlBTSqI?si=m5fcw-yECT380k8o';
const fileType = 'MP3';

processMedia(inputUrl, fileType).then(result => {
  console.log(JSON.stringify(result, null, 2));
});