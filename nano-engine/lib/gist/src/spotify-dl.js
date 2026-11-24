import axios from "axios";

const API = "https://musicfab.io/api/spotify";
const DEFAULT_URL = "https://open.spotify.com/track/4bCoqCjwZggHxHcUSRpFDG?si=Ut8ZXhcVSay1Cdjg8KhThg";

const input = process.argv[2] || DEFAULT_URL;

async function spotifyDownload(url) {
  try {
    const response = await axios.post(
      API,
      { url },
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
          "Accept": "*/*",
          "Content-Type": "application/json",
          "Origin": "https://musicfab.io",
          "Referer": "https://musicfab.io/",
          "Sec-CH-UA": '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
          "Sec-CH-UA-Mobile": "?1",
          "Sec-CH-UA-Platform": '"Android"',
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
        },
        validateStatus: () => true
      }
    );

    const metadata = response.data?.data?.metadata || null;

    if (!metadata?.download) {
      return {
        Status: false,
        Code: response.status,
        Input: url,
        Result_url: null,
        Metadata: metadata,
        Error: response.data
      };
    }

    return {
      Status: true,
      Code: response.status,
      Input: url,
      Result_url: metadata.download,
      Metadata: {
        Name: metadata.name || null,
        Artist: metadata.artist || null,
        Album: metadata.album || null,
        Duration: metadata.duration || null,
        Image: metadata.image || null
      }
    };
  } catch (error) {
    return {
      Status: false,
      Code: error.response?.status || 500,
      Input: url,
      Result_url: null,
      Error: error.message
    };
  }
}

const result = await spotifyDownload(input);
console.log(JSON.stringify(result, null, 2));