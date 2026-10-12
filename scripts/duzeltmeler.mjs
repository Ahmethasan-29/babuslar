// Yönetim panelinde yapılan düzeltmeleri, wikiden yeniden üretilen veri dosyasına tekrar uygular.
// Kullanım: node scripts/duzeltmeler.mjs <klasör>/data.js <SABİT_ADI>
// Düzeltmeler aynı klasördeki duzeltmeler.json'dadır: { "<liste yolu>": { "set": { "<id ya da ad>": kayıt }, "remove": [ ... ] } }
// Kayıtlar id'leriyle (yoksa adlarıyla) eşleşir: "set" kaydı olduğu gibi değiştirir ya da yoksa ekler, "remove" siler.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const [file, name] = process.argv.slice(2);
const patchFile = path.join(path.dirname(file), "duzeltmeler.json");
if (!fs.existsSync(patchFile)) process.exit(0);

const text = fs.readFileSync(file, "utf8");
const decl = `const ${name} = `;
const at = text.indexOf(decl);
if (at < 0) throw new Error(`${file} içinde ${decl} yok`);
const data = vm.runInNewContext(`${text}\n${name}`);
const patches = JSON.parse(fs.readFileSync(patchFile, "utf8"));
const keyOf = (item) => String(item?.id ?? item?.name ?? "");

let count = 0;
for (const [listPath, patch] of Object.entries(patches)) {
  const parts = listPath ? listPath.split(".") : [];
  const parent = parts.slice(0, -1).reduce((o, k) => o[k], data);
  const last = parts.at(-1);
  if (last === undefined) throw new Error("Kök liste desteklenmiyor");
  let list = parent[last];
  if (!Array.isArray(list)) throw new Error(`${listPath} bir liste değil`);
  const removed = new Set(patch.remove || []);
  list = list.filter((item) => !removed.has(keyOf(item)));
  for (const [key, item] of Object.entries(patch.set || {})) {
    const i = list.findIndex((x) => keyOf(x) === key);
    if (i >= 0) list[i] = item;
    else list.push(item);
  }
  count += removed.size + Object.keys(patch.set || {}).length;
  parent[last] = list;
}

fs.writeFileSync(file, `${text.slice(0, at)}${decl}${JSON.stringify(data)};\n`);
console.log(`${file}: ${count} panel düzeltmesi uygulandı`);
