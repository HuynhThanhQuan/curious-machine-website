// scripts/check-site.mjs
// Usage: node scripts/check-site.mjs [dir]   (default: out)
// Walks every HTML page in the exported site and fails on missing <title>,
// broken internal href/src references, missing #anchors or references that
// escape the site root. External URLs are not fetched.
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "out");
const fail = [];
let refs = 0;

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const pages = await htmlFiles(root);
if (pages.length === 0) {
  console.error(`No HTML pages in ${root}: build first`);
  process.exit(1);
}
const cache = new Map();
const read = async (file) => {
  if (!cache.has(file)) cache.set(file, await readFile(file, "utf8"));
  return cache.get(file);
};

for (const file of pages) {
  const page = path.relative(root, file);
  const html = await read(file);
  if (!/<title>[^<]+<\/title>/.test(html)) fail.push(`${page}: missing <title>`);
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const ref = match[1].replaceAll("&amp;", "&");
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref) || ref === "#" || ref.startsWith("{")) continue;
    refs++;
    const [url, fragment] = ref.split("#");
    const pathname = decodeURIComponent(url.split("?")[0]);
    let target = pathname
      ? path.resolve(pathname.startsWith("/") ? root : path.dirname(file), "." + (pathname.startsWith("/") ? pathname : "/" + pathname))
      : file;
    if (target !== root && !target.startsWith(root + path.sep)) {
      fail.push(`${page}: reference outside site root: ${ref}`);
      continue;
    }
    let info = await stat(target).catch(() => null);
    if (!info && !path.extname(target)) {
      // Static hosts resolve /about to /about.html
      info = await stat(target + ".html").catch(() => null);
      if (info) target += ".html";
    }
    if (!info) {
      fail.push(`${page}: broken reference ${ref}`);
      continue;
    }
    if (info.isDirectory()) {
      target = path.join(target, "index.html");
      if (!(await stat(target).catch(() => null))) {
        fail.push(`${page}: ${ref} has no index.html`);
        continue;
      }
    }
    if (fragment && target.endsWith(".html")) {
      const id = decodeURIComponent(fragment);
      const dest = await read(target);
      if (!dest.includes(`id="${id}"`) && !dest.includes(`id='${id}'`)) fail.push(`${page}: missing anchor ${ref}`);
    }
  }
}

if (fail.length) {
  console.error(fail.join("\n"));
  console.error(`\n${fail.length} problem(s) in ${pages.length} pages`);
  process.exit(1);
}
console.log(`${pages.length} pages, ${refs} internal references and anchors OK (external links not fetched)`);
