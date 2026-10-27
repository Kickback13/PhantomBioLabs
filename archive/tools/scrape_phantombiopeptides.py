"""Archive phantombiopeptides.com: raw HTML, page text, WooCommerce product data, images."""
import html, json, os, re, sys, time, urllib.parse, urllib.request, ssl, hashlib

OUT = sys.argv[1]
BASE = "https://www.phantombiopeptides.com"
UA = {"User-Agent": "Mozilla/5.0 (archive of own site)"}
ctx = ssl.create_default_context(cafile=os.environ.get("SSL_CERT_FILE") or "/root/.ccr/ca-bundle.crt")

def get(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40, context=ctx) as r:
        data = r.read()
        return data if binary else data.decode("utf-8", "ignore")

def flight(s):
    chunks = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', s, flags=re.S)
    return "".join(json.loads('"' + c + '"') for c in chunks)

def flight_values(text):
    for line in text.split("\n"):
        m = re.match(r"^([0-9a-f]+):(.*)$", line)
        if not m:
            continue
        body = m.group(2)
        if body[:1] in "[{\"":
            try:
                yield json.loads(body)
            except Exception:
                pass

def walk(v):
    if isinstance(v, dict):
        yield v
        for x in v.values():
            yield from walk(x)
    elif isinstance(v, list):
        for x in v:
            yield from walk(x)

def page_text(s):
    b = re.sub(r"<(script|style|svg)\b.*?</\1>", "", s, flags=re.S)
    m = None
    b = m.group(0) if m else b
    b = re.sub(r"<br\s*/?>|</(p|div|h[1-6]|li|tr|section|article)>", "\n", b)
    t = html.unescape(re.sub(r"<[^>]+>", " ", b))
    lines = [re.sub(r"\s+", " ", l).strip() for l in t.split("\n")]
    out = []
    for l in lines:
        if l and (not out or out[-1] != l):
            out.append(l)
    return "\n".join(out)

def main():
    os.makedirs(f"{OUT}/html", exist_ok=True)
    os.makedirs(f"{OUT}/text", exist_ok=True)
    os.makedirs(f"{OUT}/images", exist_ok=True)
    sm = get(BASE + "/sitemap.xml")
    urls = re.findall(r"<loc>([^<]+)</loc>", sm)
    urls += [u for u in ["https://phantombiopeptides.com/cart", "https://phantombiopeptides.com/login",
                         "https://phantombiopeptides.com/register", "https://phantombiopeptides.com/privacy-policy",
                         "https://phantombiopeptides.com/terms", "https://phantombiopeptides.com/shipping",
                         "https://phantombiopeptides.com/refund-policy"] if u not in urls]
    products, categories, image_urls, report = {}, {}, set(), []
    for u in urls:
        path = urllib.parse.urlparse(u).path.strip("/") or "home"
        name = path.replace("/", "__")
        try:
            s = get(BASE + "/" + (path if path != "home" else ""))
        except Exception as e:
            report.append({"url": u, "error": str(e)})
            continue
        open(f"{OUT}/html/{name}.html", "w").write(s)
        title = html.unescape((re.search(r"<title>(.*?)</title>", s, re.S) or [None, ""])[1]).strip()
        desc = html.unescape((re.search(r'<meta name="description" content="([^"]*)"', s) or [None, ""])[1])
        txt = page_text(s)
        open(f"{OUT}/text/{name}.txt", "w").write(f"URL: {u}\nTITLE: {title}\nDESCRIPTION: {desc}\n\n{txt}\n")
        report.append({"url": u, "title": title, "chars": len(txt)})
        for v in flight_values(flight(s)):
            for d in walk(v):
                # product page: {"product": {...woo product...}, "variations": [...]}
                if isinstance(d.get("product"), dict) and isinstance(d.get("variations"), list):
                    p = dict(d["product"]); p["variations"] = d["variations"]
                    if p.get("slug"):
                        old = products.get(p["slug"], {})
                        merged = {**old, **{k: val for k, val in p.items() if not (isinstance(val, str) and val.startswith("$"))}}
                        products[p["slug"]] = merged
                # full woo product objects anywhere (related products, shop grid)
                elif {"slug", "name", "price", "permalink", "categories"} <= set(d):
                    old = products.get(d["slug"], {})
                    for k, val in d.items():
                        if isinstance(val, str) and val.startswith("$"):
                            continue
                        if k not in old or (not old[k] and val):
                            old[k] = val
                    products[d["slug"]] = old
                # lightweight {id,name,slug,price,images}: keep images if we lack them
                elif {"slug", "name", "images"} <= set(d) and isinstance(d.get("images"), list):
                    old = products.setdefault(d["slug"], {"slug": d["slug"], "name": d["name"]})
                    if not isinstance(old.get("images"), list) or not old.get("images"):
                        old["images"] = d["images"]
                if {"id", "name", "slug", "count"} <= set(d) and isinstance(d.get("count"), int):
                    categories[d["slug"]] = {k: d.get(k) for k in ("id", "name", "slug", "count", "description", "parent")}
                for k in ("src",):
                    if isinstance(d.get(k), str) and "wp-content/uploads" in d[k]:
                        image_urls.add(d[k])
        time.sleep(0.3)
    # resolve image placeholders like "$14:2:props:product:images" by collecting any image lists per product name
    clean = []
    for slug, p in sorted(products.items()):
        imgs = p.get("images") if isinstance(p.get("images"), list) else []
        clean.append({
            "id": p.get("id"), "name": html.unescape(p.get("name", "")), "slug": slug,
            "permalink_old": p.get("permalink"), "type": p.get("type"), "status": p.get("status"),
            "price": p.get("price"), "regular_price": p.get("regular_price"), "sale_price": p.get("sale_price"),
            "on_sale": p.get("on_sale"), "stock_status": p.get("stock_status"),
            "categories": [c.get("name") for c in p.get("categories", []) if isinstance(c, dict)],
            "tags": [t.get("name") for t in p.get("tags", []) if isinstance(t, dict)],
            "attributes": [{"name": a.get("name"), "options": a.get("options")} for a in p.get("attributes", []) if isinstance(a, dict)],
            "variations": [{
                "id": v.get("id"), "attributes": v.get("attributes"), "price": v.get("price"),
                "regular_price": v.get("regular_price"), "sale_price": v.get("sale_price"),
                "stock_status": v.get("stock_status"), "sku": v.get("sku"),
                "image": (v.get("image") or {}).get("src") if isinstance(v.get("image"), dict) else None,
            } for v in p.get("variations", []) if isinstance(v, dict)],
            "images": [i.get("src") for i in imgs if isinstance(i, dict)],
            "short_description_html": p.get("short_description"),
            "description_html": p.get("description"),
            "related_ids": p.get("related_ids"),
        })
    json.dump(clean, open(f"{OUT}/products.json", "w"), indent=2)
    json.dump(products, open(f"{OUT}/products_raw.json", "w"), indent=2)
    json.dump(categories, open(f"{OUT}/categories.json", "w"), indent=2)
    # download images
    img_report = []
    # origin + Jetpack CDN are dead; Vercel's image optimizer cache still holds the w=3840 renditions
    for p in products.values():
        for i in (p.get("images") or []):
            if isinstance(i, dict) and i.get("src"):
                image_urls.add(i["src"])
        for v in (p.get("variations") or []):
            if isinstance(v, dict) and isinstance(v.get("image"), dict) and v["image"].get("src"):
                image_urls.add(v["image"]["src"])
    for src in sorted(image_urls):
        fn = os.path.basename(urllib.parse.urlparse(src.split("?")[0]).path)
        base = os.path.splitext(fn)[0]
        err, done = None, False
        for w in (3840, 2048, 1920, 1200, 1080, 828, 750, 640, 384, 256):
            for accept in ("image/png,image/jpeg,*/*", "image/webp,*/*", "image/avif,image/webp,*/*"):
                u = f"{BASE}/_next/image?url={urllib.parse.quote(src, safe='')}&w={w}&q=75"
                try:
                    req = urllib.request.Request(u, headers={**UA, "Accept": accept})
                    with urllib.request.urlopen(req, timeout=40, context=ctx) as r:
                        data, ctype = r.read(), r.headers.get("content-type", "")
                    ext = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/avif": ".avif"}.get(ctype.split(";")[0], ".bin")
                    open(f"{OUT}/images/{base}{ext}", "wb").write(data)
                    img_report.append({"src": src, "file": base + ext, "width_requested": w, "format": ext, "bytes": len(data)})
                    done = True
                    break
                except Exception as e:
                    err = str(e)
            if done:
                break
        if not done:
            img_report.append({"src": src, "error": err})
    # the site's own static files (hero art, icons, og image)
    statics = set()
    for f in os.listdir(f"{OUT}/html"):
        s = open(f"{OUT}/html/{f}").read()
        statics |= {urllib.parse.unquote(m) for m in re.findall(r'/_next/image\?url=(%2F[^&"]+)', s)}
        statics |= set(re.findall(r'(?:href|src|content)="(/[^"/][^"]*\.(?:png|jpe?g|webp|svg|ico|gif))"', s))
        statics |= set(re.findall(r'content="https://(?:www\.)?phantombiopeptides\.com(/[^"]+\.(?:png|jpe?g|webp))"', s))
    os.makedirs(f"{OUT}/static", exist_ok=True)
    for p in sorted(statics):
        try:
            data = get(BASE + p.split("?")[0], binary=True)
            fn = p.strip("/").split("?")[0].replace("/", "__")
            open(f"{OUT}/static/{fn}", "wb").write(data)
            img_report.append({"static": p, "file": "static/" + fn, "bytes": len(data)})
        except Exception as e:
            img_report.append({"static": p, "error": str(e)})
    json.dump({"pages": report, "images": img_report}, open(f"{OUT}/report.json", "w"), indent=2)
    print(f"pages ok: {sum(1 for r in report if 'error' not in r)}/{len(report)}")
    print(f"products: {len(clean)}  categories: {len(categories)}")
    print(f"images ok: {sum(1 for r in img_report if 'error' not in r)}/{len(img_report)}")
    for r in report:
        if "error" in r:
            print("PAGE ERR", r)

main()
