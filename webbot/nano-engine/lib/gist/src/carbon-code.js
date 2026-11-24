import mql from "@microlink/mql";

const CONFIG = {
  code: `console.log("Hello World");`,
  language: "javascript",
  theme: "dracula-pro",
  font: "Fira Code",
  fontSize: "14px",
  background: "rgba(226,233,239,1)",
  lineNumbers: true,
  width: 1024,
  height: 768,
  waitFor: 3000
};

const THEMES = [
  "dracula-pro",
  "monokai",
  "nord",
  "solarized-dark",
  "solarized-light",
  "one-dark",
  "material",
  "panda-syntax",
  "night-owl",
  "cobalt2"
];

const FONTS = [
  "Fira Code",
  "JetBrains Mono",
  "Hack",
  "Source Code Pro",
  "Inconsolata",
  "Droid Sans Mono",
  "Anonymous Pro"
];

function buildCarbonUrl(config) {
  const theme = THEMES.includes(config.theme) ? config.theme : "dracula-pro";
  const font = FONTS.includes(config.font) ? config.font : "Fira Code";

  const params = new URLSearchParams({
    bg: config.background,
    t: theme,
    wt: "none",
    l: config.language || "auto",
    ds: "false",
    dsyoff: "20px",
    dsblur: "68px",
    wc: "true",
    wa: "true",
    pv: "56px",
    ph: "56px",
    ln: config.lineNumbers ? "true" : "false",
    fl: "1",
    fm: font,
    fs: config.fontSize || "14px",
    lh: "152%",
    si: "false",
    es: "2x",
    wm: "false"
  });

  params.append("code", config.code);

  return `https://carbon.now.sh/?${params.toString()}`;
}

async function carbon(config = CONFIG) {
  const targetUrl = buildCarbonUrl(config);

  const res = await mql(targetUrl, {
    screenshot: {
      element: ".export-container",
      optimizeForSpeed: true
    },
    viewport: {
      width: config.width,
      height: config.height
    },
    waitFor: config.waitFor,
    meta: false
  });

  const imageUrl = res.data?.screenshot?.url || null;
  const ok = !!imageUrl;

  return {
    Status: ok,
    Code: ok ? 200 : 500,
    Input: config.code,
    Result_url: imageUrl,
    Error: ok ? null : res.data?.error?.message || "Carbon screenshot failed"
  };
}

async function main() {
  try {
    const result = await carbon();
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.log(
      JSON.stringify(
        {
          Status: false,
          Code: 500,
          Input: CONFIG.code,
          Result_url: null,
          Error: err.message
        },
        null,
        2
      )
    );
  }
}

main();