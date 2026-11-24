import { CookieJar } from "tough-cookie";

const q = "Ferrari";
const jar = new CookieJar();

const initRes = await fetch("https://id.pinterest.com/", {
  headers: {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9",
  },
});
for (const cookie of initRes.headers.getSetCookie()) {
  await jar.setCookie(cookie, "https://id.pinterest.com");
}
const cookieString = await jar.getCookieString("https://id.pinterest.com");
const sourceUrl = "/search/videos/?q=" + encodeURIComponent(q) + "&rs=content_type_filter&filter_location=1";
const dataPayload = JSON.stringify({
  options: {
    query: q, scope: "videos", appliedProductFilters: "---", domains: null, user: null,
    seoDrawerEnabled: false, applied_unified_filters: null, auto_correction_disabled: false,
    journey_depth: null, source_id: null, source_module_id: null, source_url: sourceUrl,
    static_feed: false, selected_one_bar_modules: null, query_pin_sigs: null, page_size: null,
    price_max: null, price_min: null, query_image_pins: null, request_params: null,
    top_pin_ids: null, article: null, corpus: null, customized_rerank_type: null,
    filters: null, rs: "content_type_filter", redux_normalize_feed: true
  },
  context: {}
});
const searchUrl = "https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=" + encodeURIComponent(sourceUrl) + "&data=" + encodeURIComponent(dataPayload) + "&_=" + Date.now();
const searchRes = await fetch(searchUrl, {
  headers: {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0",
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "en-US,en;q=0.9",
    "referer": "https://id.pinterest.com/search/videos/?q=" + encodeURIComponent(q) + "&rs=content_type_filter&filter_location=1",
    "x-requested-with": "XMLHttpRequest",
    "x-app-version": "8048c97",
    "x-pinterest-appstate": "active",
    "x-pinterest-source-url": sourceUrl,
    "x-pinterest-pws-handler": "www/search/[scope].js",
    "cookie": cookieString,
  },
});
const data = JSON.parse(await searchRes.text());
const results = data?.resource_response?.data?.results || [];
const videos = results
  .filter(p => p.videos?.video_list)
  .map(p => {
    const vList = p.videos.video_list;
    const videoUrl = vList.V_HLSV4?.url || vList.V_HLSV3_MOBILE?.url || null;
    return {
      id: p.id,
      title: p.grid_title || p.title || null,
      description: p.description || null,
      video: videoUrl,
      thumbnail: p.images?.orig?.url || null,
      duration: p.videos?.duration || null,
      link: "https://www.pinterest.com/pin/" + p.id,
      pinner: p.pinner?.full_name || null,
      username: p.pinner?.username || null,
      likes: p.reaction_counts?.["1"] || 0,
    };
  })
  .filter(p => p.video);

console.log(JSON.stringify({
  status: data?.resource_response?.status === "success" ? "success" : "failed",
  code: searchRes.status,
  input: q,
  total: videos.length,
  result: videos,
}, null, 2));