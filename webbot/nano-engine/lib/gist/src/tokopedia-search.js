import axios from "axios";
import crypto from "crypto";

const KEYWORD = "vivo x300";
const PAGE = 1;
const ROWS = 60;
const LIMIT = 2;
const TIMEOUT = 30000;

const ENDPOINT = "https://gql.tokopedia.com/graphql/SearchProductV5Query";
const DEVICE_ID = String(Math.floor(7000000000000000000 + Math.random() * 999999999999999999));
const UNIQUE_ID = crypto.randomBytes(16).toString("hex");

const QUERY = `
query SearchProductV5Query($params: String!) {
  searchProductV5(params: $params) {
    header {
      totalData
      responseCode
      isQuerySafe
      additionalParams
    }
    data {
      totalDataText
      products {
        oldID: id
        id: id_str_auto_
        ttsProductID
        name
        url
        applink
        mediaURL {
          image
          image300
          videoCustom
        }
        shop {
          oldID: id
          id: id_str_auto_
          ttsSellerID
          name
          url
          city
          tier
        }
        stock {
          ttsSKUID
        }
        badge {
          oldID: id
          id: id_str_auto_
          title
          url
        }
        price {
          text
          number
          range
          original
          discountPercentage
        }
        labelGroups {
          position
          title
          type
          url
        }
        category {
          oldID: id
          id: id_str_auto_
          name
          breadcrumb
          gaKey
        }
        rating
        wishlist
        ads {
          id
          productClickURL
          productViewURL
          productWishlistURL
          tag
        }
      }
    }
  }
}
`;

function buildParams(keyword, page, rows) {
  return new URLSearchParams({
    device: "desktop",
    enter_method: "normal_search",
    l_name: "sre",
    navsource: "home",
    ob: "23",
    page: String(page),
    q: keyword,
    related: "true",
    rows: String(rows),
    safe_search: "false",
    sc: "",
    scheme: "https",
    shipping: "",
    show_adult: "false",
    source: "universe",
    st: "product",
    start: String((page - 1) * rows),
    topads_bucket: "true",
    unique_id: UNIQUE_ID,
    user_addressId: "",
    user_cityId: "176",
    user_districtId: "2274",
    user_id: "",
    user_lat: "",
    user_long: "",
    user_postCode: "",
    user_warehouseId: "",
    variants: "",
    warehouses: ""
  }).toString();
}

function cleanProduct(x) {
  return {
    Id: x?.id || null,
    Tts_product_id: x?.ttsProductID || null,
    Name: x?.name || null,
    Url: x?.url || null,
    Applink: x?.applink || null,
    Image: x?.mediaURL?.image || null,
    Image_300: x?.mediaURL?.image300 || null,
    Video: x?.mediaURL?.videoCustom || null,
    Price: x?.price?.text || null,
    Price_number: x?.price?.number || null,
    Original_price: x?.price?.original || null,
    Discount: x?.price?.discountPercentage || 0,
    Rating: x?.rating || null,
    Sold: x?.labelGroups?.find(v => v.position === "ri_product_credibility")?.title || null,
    Shop: {
      Id: x?.shop?.id || null,
      Name: x?.shop?.name || null,
      Url: x?.shop?.url || null,
      City: x?.shop?.city || null,
      Tier: x?.shop?.tier ?? null
    },
    Category: {
      Id: x?.category?.id || null,
      Name: x?.category?.name || null,
      Breadcrumb: x?.category?.breadcrumb || null
    },
    Badge: x?.badge?.title || null,
    Ads: {
      Id: x?.ads?.id || null,
      Tag: x?.ads?.tag ?? null,
      Click_url: x?.ads?.productClickURL || null,
      View_url: x?.ads?.productViewURL || null
    }
  };
}

async function searchTokopedia() {
  const started = Date.now();

  try {
    const payload = [
      {
        operationName: "SearchProductV5Query",
        variables: {
          params: buildParams(KEYWORD, PAGE, ROWS)
        },
        query: QUERY
      }
    ];

    const res = await axios.post(ENDPOINT, payload, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0",
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        origin: "https://www.tokopedia.com",
        referer: "https://www.tokopedia.com/",
        "x-tkpd-lite-service": "zeus",
        "x-price-center": "true",
        "bd-device-id": DEVICE_ID,
        "bd-web-id": DEVICE_ID,
        "x-version": "bab78f7",
        "x-device": "desktop-0.0",
        "x-dark-mode": "false",
        "x-source": "tokopedia-lite",
        "tkpd-userid": "",
        "iris_session_id": ""
      },
      timeout: TIMEOUT,
      validateStatus: () => true
    });

    const root = Array.isArray(res.data) ? res.data[0] : res.data;
    const search = root?.data?.searchProductV5;
    const header = search?.header || {};
    const products = search?.data?.products || [];
    const limitedProducts = products.slice(0, LIMIT);

    console.log(JSON.stringify({
      Status: res.status >= 200 && res.status < 300 && Array.isArray(products),
      Code: res.status,
      Input: KEYWORD,
      Page: PAGE,
      Rows: ROWS,
      Limit: LIMIT,
      Total: Number(header?.totalData || products.length || 0),
      Total_fetched: products.length,
      Total_showed: limitedProducts.length,
      Total_text: search?.data?.totalDataText || String(products.length),
      Response_code: header?.responseCode ?? null,
      Is_query_safe: header?.isQuerySafe ?? null,
      Additional_params: header?.additionalParams || null,
      Result: limitedProducts.map(cleanProduct),
      Time_ms: Date.now() - started
    }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      Status: false,
      Code: err?.response?.status || 500,
      Input: KEYWORD,
      Error: err?.message || String(err),
      Time_ms: Date.now() - started
    }, null, 2));
  }
}

searchTokopedia();

/*
cara setting page, rows, dan limit

PAGE:
Untuk pindah halaman.
Contoh:
const PAGE = 1; berarti halaman pertama
const PAGE = 2; berarti halaman kedua

ROWS:
Jumlah data yang diminta dari Tokopedia.
Kadang Tokopedia tetap balikin banyak data walaupun rows kecil.
Contoh:
const ROWS = 60;

LIMIT:
Jumlah data yang ditampilkan di output JSON.
Ini yang paling aman buat membatasi hasil.
Contoh:
const LIMIT = 2; berarti cuma tampil 2 produk

Rekomendasi:
const ROWS = 60;
const LIMIT = 2;

Jadi request tetap ambil data cukup banyak, tapi output tetap pendek.
*/