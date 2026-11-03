// SEO launch checks. Runs with plain Node 22+ (type stripping), no dependencies.
//
//   node scripts/seo-audit.ts crawl     --base http://localhost:3000 [--expect-indexable]
//   node scripts/seo-audit.ts redirects --base http://localhost:3000
//
// crawl:     reads /sitemap.xml and checks every URL: 200 with no redirect, one <title> ≤ 60 chars,
//            meta description ≤ 155 chars, no duplicate titles or descriptions, exactly one <h1>,
//            exactly one canonical pointing at the www URL, Open Graph + Twitter tags, valid JSON-LD,
//            no <img> without alt, no "XXXX" or {{SEO_DESK_BRIEF placeholders, and noindex only
//            where expected (pre-launch everything is noindex; with --expect-indexable nothing is).
// redirects: requests each URL in docs/old-sitemap.xml (old apex URLs) and expects exactly one
//            permanent redirect (301/308) to a www URL that answers 200.
//
// --base points the checks at another server (local build, preview). Requests keep the original
// Host header (phantombiopeptides.com / www.phantombiopeptides.com), so host-based redirects are
// exercised exactly as in production.

import { readFileSync } from "node:fs";
import http from "node:http";
import https from "node:https";

const CANONICAL_ORIGIN = "https://www.phantombiopeptides.com";
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;

type Res = { status: number; headers: http.IncomingHttpHeaders; body: string };

const args = process.argv.slice(2);
const mode = args[0];
const flag = (name: string) => args.includes(name);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const base = option("--base");

/** GET `url`, sent to `--base` when given but with the URL's own Host header. Never follows redirects. */
function get(url: string): Promise<Res> {
  const target = new URL(url);
  const conn = base ? new URL(base) : target;
  const client = conn.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(
      {
        protocol: conn.protocol,
        hostname: conn.hostname,
        port: conn.port || undefined,
        path: target.pathname + target.search,
        method: "GET",
        headers: { Host: target.host, "User-Agent": "phantom-seo-audit/1.0", Accept: "text/html,application/xml;q=0.9,*/*;q=0.8" },
        servername: conn.hostname,
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body }));
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error(`timeout: ${url}`)));
    req.end();
  });
}

/** "https://host" and "https://host/" are the same URL. */
const sameUrl = (a: string, b: string) => a.replace(/\/$/, "") === b.replace(/\/$/, "");

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .trim();

function metaContent(html: string, attr: "name" | "property", key: string): string[] {
  const out: string[] = [];
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const k = tag.match(new RegExp(`${attr}="([^"]*)"`, "i"))?.[1];
    if (k?.toLowerCase() === key.toLowerCase()) out.push(decode(tag.match(/content="([^"]*)"/i)?.[1] ?? ""));
  }
  return out;
}

function locs(xml: string) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
}

const problems: string[] = [];
const fail = (url: string, msg: string) => problems.push(`${url}\n    ${msg}`);

async function crawl() {
  const expectIndexable = flag("--expect-indexable");
  const sitemap = await get(`${CANONICAL_ORIGIN}/sitemap.xml`);
  const type = String(sitemap.headers["content-type"] ?? "");
  if (sitemap.status !== 200 || !/xml/.test(type) || !sitemap.body.includes("<urlset")) {
    console.error(`sitemap.xml: expected 200 XML, got ${sitemap.status} ${type}`);
    process.exit(1);
  }
  const urls = locs(sitemap.body);
  console.log(`sitemap.xml: ${urls.length} URLs`);

  const robots = await get(`${CANONICAL_ORIGIN}/robots.txt`);
  console.log(`robots.txt (${robots.status}):\n${robots.body.trim().replace(/^/gm, "    ")}`);

  const titles = new Map<string, string[]>();
  const descriptions = new Map<string, string[]>();
  const schemaTypes = new Map<string, Set<string>>();

  for (const url of urls) {
    if (!url.startsWith(CANONICAL_ORIGIN + "/")) fail(url, `not on ${CANONICAL_ORIGIN}`);
    const res = await get(url);
    if (res.status !== 200) {
      fail(url, `status ${res.status}${res.headers.location ? ` -> ${res.headers.location}` : ""}`);
      continue;
    }
    const html = res.body;
    const head = html.slice(0, html.indexOf("</head>") > 0 ? html.indexOf("</head>") : html.length);

    const titleTags = head.match(/<title>([\s\S]*?)<\/title>/gi) ?? [];
    const title = decode(titleTags[0]?.replace(/<\/?title>/gi, "") ?? "");
    if (titleTags.length !== 1) fail(url, `${titleTags.length} <title> tags`);
    if (!title) fail(url, "empty title");
    if (title.length > TITLE_MAX) fail(url, `title is ${title.length} chars: "${title}"`);
    titles.set(title, [...(titles.get(title) ?? []), url]);

    const desc = metaContent(head, "name", "description");
    if (desc.length !== 1) fail(url, `${desc.length} meta descriptions`);
    else {
      if (desc[0].length > DESCRIPTION_MAX) fail(url, `description is ${desc[0].length} chars`);
      descriptions.set(desc[0], [...(descriptions.get(desc[0]) ?? []), url]);
    }

    const h1 = (html.match(/<h1[\s>]/gi) ?? []).length;
    if (h1 !== 1) fail(url, `${h1} <h1> elements`);

    const canonicals = [...head.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/gi)].map((m) => m[0].match(/href="([^"]*)"/)?.[1] ?? "");
    if (canonicals.length !== 1) fail(url, `${canonicals.length} canonical links`);
    else if (!sameUrl(canonicals[0], url)) fail(url, `canonical is ${canonicals[0]}`);

    const robotsMeta = metaContent(head, "name", "robots").join(",");
    const headerRobots = String(res.headers["x-robots-tag"] ?? "");
    const noindex = /noindex/i.test(robotsMeta) || /noindex/i.test(headerRobots);
    if (expectIndexable && noindex) fail(url, `noindex (meta: "${robotsMeta}", header: "${headerRobots}")`);
    if (!expectIndexable && !noindex) fail(url, "indexable, but this is a pre-launch check (pass --expect-indexable after launch)");

    for (const [attr, key] of [
      ["property", "og:title"],
      ["property", "og:description"],
      ["property", "og:url"],
      ["property", "og:image"],
      ["property", "og:site_name"],
      ["name", "twitter:card"],
    ] as const) {
      const v = metaContent(head, attr, key);
      if (!v.length) fail(url, `missing ${key}`);
      if (key === "og:url" && v[0] && !sameUrl(v[0], url)) fail(url, `og:url is ${v[0]}`);
      if (key === "og:site_name" && v[0] && v[0] !== "Phantom Bio Labs") fail(url, `og:site_name is ${v[0]}`);
      if (key === "twitter:card" && v[0] && v[0] !== "summary_large_image") fail(url, `twitter:card is ${v[0]}`);
    }

    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {
        const node = JSON.parse(m[1]);
        const t = Array.isArray(node["@type"]) ? node["@type"].join("+") : String(node["@type"]);
        schemaTypes.set(url, (schemaTypes.get(url) ?? new Set()).add(t));
        if (/AggregateRating|"Review"/.test(m[1])) fail(url, "rating/review schema found");
      } catch {
        fail(url, "invalid JSON-LD");
      }
    }

    for (const img of html.match(/<img\b[^>]*>/gi) ?? []) if (!/\balt="/i.test(img)) fail(url, `<img> without alt: ${img.slice(0, 120)}`);
    if (/XXXX/.test(html)) fail(url, 'contains "XXXX"');
    // Placeholders are visible on previews by design and hidden in production.
    if (expectIndexable && /\{\{SEO_DESK_BRIEF/.test(html)) fail(url, "contains an unfilled {{SEO_DESK_BRIEF}} placeholder");
    if (/Phantom Bio Peptides/i.test(html)) fail(url, 'contains "Phantom Bio Peptides"');
    console.log(`  checked  ${url.replace(CANONICAL_ORIGIN, "") || "/"}  [${[...(schemaTypes.get(url) ?? [])].join(", ")}]`);
  }

  for (const [t, us] of titles) if (us.length > 1) problems.push(`duplicate title "${t}":\n    ${us.join("\n    ")}`);
  for (const [d, us] of descriptions) if (us.length > 1) problems.push(`duplicate description "${d.slice(0, 60)}…":\n    ${us.join("\n    ")}`);
}

async function redirects() {
  const old = locs(readFileSync(new URL("../docs/old-sitemap.xml", import.meta.url), "utf8"));
  console.log(`docs/old-sitemap.xml: ${old.length} URLs`);
  for (const url of old) {
    const first = await get(url);
    const location = first.headers.location;
    if (first.status !== 301 && first.status !== 308) {
      fail(url, `expected a permanent redirect, got ${first.status}`);
      continue;
    }
    if (!location) {
      fail(url, `${first.status} without Location`);
      continue;
    }
    const next = new URL(location, url).toString();
    if (!next.startsWith(CANONICAL_ORIGIN + "/")) fail(url, `redirects to ${next}, not the www origin`);
    const second = await get(next);
    if (second.status !== 200) fail(url, `-> ${next} answered ${second.status}${second.headers.location ? ` (chain to ${second.headers.location})` : ""}`);
    else console.log(`  ${first.status}  ${url.replace("https://phantombiopeptides.com", "") || "/"}  ->  ${next.replace(CANONICAL_ORIGIN, "") || "/"}`);
  }
}

if (mode === "crawl") await crawl();
else if (mode === "redirects") await redirects();
else {
  console.error("usage: node scripts/seo-audit.ts crawl|redirects [--base URL] [--expect-indexable]");
  process.exit(2);
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n${problems.map((p) => `- ${p}`).join("\n")}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
