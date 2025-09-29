import fs from "node:fs/promises";
import path from "node:path";

const SRC =
  "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/geography.json";

const outFile = path.join(process.cwd(), "public", "th-address.json");

const res = await fetch(SRC);
if (!res.ok) throw new Error(`Fetch geography.json failed: ${res.status}`);
const rows = await res.json();

/**
 * โครงสร้าง
 * {
 *   provinces: [{ code, name }],                                 // name = อังกฤษ
 *   districtsByProvince: { [provinceCode]: [{ code, name }] },   // อังกฤษ
 *   subdistrictsByDistrict: {
 *     [districtCode]: [{ code, name, postalCode }]
 *   }
 * }
 */
const provinces = [];
const districtsByProvince = {};
const subdistrictsByDistrict = {};

const pSeen = new Set();
const dSeen = new Set();

for (const r of rows) {
  // province (English only)
  if (!pSeen.has(r.provinceCode)) {
    pSeen.add(r.provinceCode);
    provinces.push({
      code: String(r.provinceCode),
      name: r.provinceNameEn ?? "", 
    });
  }

  // district (group per province)
  const dKey = `${r.provinceCode}:${r.districtCode}`;
  if (!dSeen.has(dKey)) {
    dSeen.add(dKey);
    (districtsByProvince[String(r.provinceCode)] ||= []).push({
      code: String(r.districtCode),
      name: r.districtNameEn ?? "",
    });
  }

  // subdistrict (group per district)
  (subdistrictsByDistrict[String(r.districtCode)] ||= []).push({
    code: String(r.subdistrictCode),
    name: r.subdistrictNameEn ?? "",
    postalCode: String(r.postalCode ?? ""), // auto-fill postcodeได้
  });
}

provinces.sort((a, b) => a.name.localeCompare(b.name));
for (const k of Object.keys(districtsByProvince)) {
  districtsByProvince[k].sort((a, b) => a.name.localeCompare(b.name));
}
for (const k of Object.keys(subdistrictsByDistrict)) {
  subdistrictsByDistrict[k].sort((a, b) => a.name.localeCompare(b.name));
}

await fs.mkdir(path.dirname(outFile), { recursive: true });
await fs.writeFile(
  outFile,
  JSON.stringify({ provinces, districtsByProvince, subdistrictsByDistrict })
);
console.log("✓ Wrote public/th-address.json");
