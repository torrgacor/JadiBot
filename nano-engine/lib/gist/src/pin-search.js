import { CookieJar } from "tough-cookie";

const q = "idle rossie";
const jar = new CookieJar();

var initRes = await fetch("https://id.pinterest.com/", {
  method: "GET",
  headers: {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9",
  },
});

var setCookies = initRes.headers.getSetCookie();
if (setCookies) {
  for (var i = 0; i < setCookies.length; i++) {
    await jar.setCookie(setCookies[i], "https://id.pinterest.com");
  }
}

var cookieString = await jar.getCookieString("https://id.pinterest.com");

var sourceUrl = "/search/pins/?q=" + encodeURIComponent(q) + "&rs=typed";
var dataPayload = JSON.stringify({
  options: {
    query: q,
    scope: "pins",
    appliedProductFilters: "---",
    domains: null,
    user: null,
    seoDrawerEnabled: false,
    applied_unified_filters: null,
    auto_correction_disabled: false,
    journey_depth: null,
    source_id: null,
    source_module_id: null,
    source_url: sourceUrl,
    static_feed: false,
    selected_one_bar_modules: null,
    query_pin_sigs: null,
    page_size: null,
    price_max: null,
    price_min: null,
    query_image_pins: null,
    request_params: null,
    top_pin_ids: null,
    article: null,
    corpus: null,
    customized_rerank_type: null,
    filters: null,
    rs: "typed",
    redux_normalize_feed: true
  },
  context: {}
});

var url = "https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=" + encodeURIComponent(sourceUrl) + "&data=" + encodeURIComponent(dataPayload) + "&_=" + Date.now();

var res = await fetch(url, {
  method: "GET",
  headers: {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0",
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "en-US,en;q=0.9",
    "accept-encoding": "gzip, deflate, br, zstd",
    "referer": "https://id.pinterest.com/",
    "x-requested-with": "XMLHttpRequest",
    "x-app-version": "8048c97",
    "x-pinterest-appstate": "active",
    "x-pinterest-source-url": "/",
    "x-pinterest-pws-handler": "www/index.js",
    "screen-dpr": "1.25",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "cookie": cookieString
  },
});

var text = await res.text();
var data;
try {
  data = JSON.parse(text);
} catch {
  data = text;
}

var results = data?.resource_response?.data?.results || [];
var result = results.map(function(pin) {
  return {
    id: pin.id,
    title: pin.grid_title || pin.title || null,
    description: pin.description || null,
    image: pin.images?.orig?.url || null,
    link: pin.link || null,
    domain: pin.domain || null,
    pinner: pin.pinner?.full_name || null,
    username: pin.pinner?.username || null,
    likes: pin.reaction_counts?.["1"] || 0,
    created_at: pin.created_at || null,
  };
});

var output = {
  status: data?.resource_response?.status === "success" ? "success" : "failed",
  code: res.status,
  input: q,
  total: result.length,
  result: result,
};

console.log(JSON.stringify(output, null, 2));