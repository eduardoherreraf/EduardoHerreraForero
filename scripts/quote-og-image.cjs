const fs = require("node:fs");
const path = require("node:path");

const file = process.argv[2] || path.join(__dirname, "..", "dist", "index.html");
const html = fs.readFileSync(file, "utf8");
const tagPattern = /<meta\b[^>]*>/gi;
let found = false;
const updated = html.replace(tagPattern, (tag) => {
  if (!/\bproperty=(?:"og:image"|'og:image'|og:image(?=\s|\/?>))/i.test(tag)) return tag;
  found = true;
  return tag.replace(/\b(property|content)=([^\s"'=<>`]+)/gi, '$1="$2"');
});
if (!found) throw new Error("No se encontró la etiqueta og:image en dist/index.html");
fs.writeFileSync(file, updated, "utf8");
