// Přepis feedu Dobroty z hor pro Zboží.cz (Seznam Nákupy)
// Stáhne původní feed z e-shopu, doplní typ produktu do názvů džemů a koření
// a přiřadí kategorie Zboží.cz. Výsledek uloží do public/zbozi.xml (GitHub Pages).
// Přehled změn: public/kontrola.txt
// Nové příchutě džemů nebo nové kategorie e-shopu doplnit do tabulek NAZVY / KATEGORIE_ZBOZI.
import { mkdirSync, writeFileSync } from "node:fs";

const SOURCE_FEED = "https://www.dobrotyzhor.cz/storage/files/zbozi.xml";

const NAZVY = {
  "Ananas - bílý rum, kokos": "Ananasový džem s bílým rumem a kokosem",
  "Angrešt zelený - bez cukru": "Angreštový džem bez cukru",
  "Angrešt zelený - kardamon, rozmarýn, gin": "Angreštový džem s kardamomem, rozmarýnem a ginem",
  "Angrešt zelený - med, matcha tea": "Angreštový džem s medem a matchou",
  "Aronie - červené víno, hřebíček": "Aroniový džem s červeným vínem a hřebíčkem",
  "Borůvka - bez cukru": "Borůvkový džem bez cukru",
  "Borůvka - chilli, hořká čokoláda": "Borůvková pomazánka s chilli a hořkou čokoládou",
  "Borůvka - levandule": "Borůvkový džem s levandulí",
  "Brusinka - pomerančová kůra, brandy": "Brusinkový džem s pomerančovou kůrou a brandy",
  "Černý rybíz - květ černého bezu": "Džem z černého rybízu s květem černého bezu",
  "Červený rybíz, vanilka, skořice": "Džem z červeného rybízu s vanilkou a skořicí",
  "Hruška - ořechový likér": "Hruškový džem s ořechovým likérem",
  "Jablko - karamel, pečené lískové ořechy, skořice": "Jablečný džem s karamelem, pečenými lískovými ořechy a skořicí",
  "Jahoda - bez cukru": "Jahodový džem bez cukru",
  "Jahoda - rebarbora, sekt z jižní moravy": "Jahodový džem s rebarborou a moravským sektem",
  "Malina - máta": "Malinový džem s mátou",
  "Meruňka - bez cukru": "Meruňkový džem bez cukru",
  "Meruňka - bílá čokoláda, červený pepř, chilli": "Meruňková pomazánka s bílou čokoládou, červeným pepřem a chilli",
  "Meruňka - meruňkovice": "Meruňkový džem s meruňkovicí",
  "Mirabelka - vodka, kardamon": "Mirabelkový džem s vodkou a kardamomem",
  "Ostružina - portské víno": "Ostružinový džem s portským vínem",
  "Šípek - hřebíček, skořice": "Šípkový džem s hřebíčkem a skořicí",
  "Švestka - mák": "Švestkový džem s mákem",
  "Třešeň - badyán": "Třešňový džem s badyánem",
  "Višeň - griotka, hořká čokoláda": "Višňová pomazánka s griotkou a hořkou čokoládou",
};

const P = "Potraviny a nápoje | Potraviny | ";
const CAJE = "Potraviny a nápoje | Nápoje | Nealkoholické nápoje | Horké nápoje | Čaje";
const DARKY = "Kultura a zábava | Volný čas | Oslavy a dárky | ";

const KATEGORIE_ZBOZI = {
  "Džem": P + "Džemy, marmelády a povidla",
  "Džemy a marmelády": P + "Džemy, marmelády a povidla",
  "Dárkové balíčky": P + "Dárkové potravinové koše",
  "Vánoční balíčky": P + "Dárkové potravinové koše",
  "Dárky": P + "Dárkové potravinové koše",
  "Čaj": CAJE,
  "Pečený čaj": CAJE,
  "Porcovaný čaj": CAJE,
  "Sypaný čaj": CAJE,
  "Koření": P + "Dochucovadla a omáčky | Koření",
  "Chilli": P + "Dochucovadla a omáčky | Koření",
  "Omáčky a chutney": P + "Dochucovadla a omáčky | Omáčky",
  "Pesto a masa": P + "Dochucovadla a omáčky | Pesta",
  "Med": P + "Med a pyl",
  "Med a ořechy": P + "Med a pyl",
  "Ochucená sůl": P + "Přísady na vaření a pečení | Kuchyňské soli",
  "Nakládané speciality": P + "Trvanlivé potraviny | Konzervované potraviny | Konzervovaná zelenina",
  "Ořechy": P + "Sušené potraviny | Oříšky a semínka",
  "Podzimní dobroty": P + "Trvanlivé potraviny | Konzervované potraviny | Paštiky a pomazánky",
  "Dárkové poukazy": DARKY + "Dárkové poukazy",
};

function novaKategorie(kategorie, nazev) {
  if (KATEGORIE_ZBOZI[kategorie]) return KATEGORIE_ZBOZI[kategorie];
  if (kategorie === "Dárkové předměty") {
    if (/taška/i.test(nazev)) return DARKY + "Dárkové tašky";
    if (/krabičk|krabice/i.test(nazev)) return DARKY + "Dárkové krabice";
  }
  return null;
}

const KATEGORIE_DZEM = ["Džem", "Džemy a marmelády"];
const KATEGORIE_KORENI = ["Koření"];
const norm = (s) => s.replace(/\s+/g, " ").trim();

function novyNazev(nazev, kategorie) {
  const n = norm(nazev);
  const m = n.match(/^(.*?)\s*\/\s*(\d+\s*g)$/);
  const zaklad = m ? m[1] : n;
  const gramaz = m ? " " + m[2] : "";
  if (NAZVY[zaklad]) return NAZVY[zaklad] + gramaz;
  if (KATEGORIE_DZEM.includes(kategorie)) {
    return /džem|marmelád|pomazánk|povidl/i.test(zaklad) ? n : "Džem " + zaklad + gramaz;
  }
  if (KATEGORIE_KORENI.includes(kategorie) && !/koření|balíček/i.test(n)) {
    return n.replace(/^(.*?)(\s+\d+\s*g)?$/, (_, a, g) => `${a} – sušené koření${g || ""}`);
  }
  return null;
}

const unesc = (s) =>
  s
    .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function upravFeed(xml) {
  const zmeny = [];
  const kategorie = {};
  const bezKategorie = [];
  const out = xml.replace(/<SHOPITEM>([\s\S]*?)<\/SHOPITEM>/g, (blok, obsah) => {
    const km = obsah.match(/<CATEGORYTEXT>([\s\S]*?)<\/CATEGORYTEXT>/);
    const kat = km ? norm(unesc(km[1].trim())) : "";
    const pm = obsah.match(/<PRODUCTNAME>([\s\S]*?)<\/PRODUCTNAME>/);
    if (!pm) return blok;
    const puvodni = unesc(pm[1].trim());
    let vysledek = blok;
    const novy = novyNazev(puvodni, kat);
    if (novy && novy !== puvodni) {
      zmeny.push([puvodni, novy]);
      vysledek = vysledek.replace(pm[0], `<PRODUCTNAME>${esc(novy)}</PRODUCTNAME>`);
    }
    const nk = km && novaKategorie(kat, puvodni);
    if (nk) {
      kategorie[nk] = (kategorie[nk] || 0) + 1;
      vysledek = vysledek.replace(km[0], `<CATEGORYTEXT>${esc(nk)}</CATEGORYTEXT>`);
    } else if (km) {
      bezKategorie.push(`${puvodni} [${kat}]`);
    }
    return vysledek;
  });
  return { out, zmeny, kategorie, bezKategorie };
}

async function main() {
  const res = await fetch(SOURCE_FEED, { headers: { "user-agent": "dobrotyzhor-feed (GitHub Actions)" } });
  if (!res.ok) throw new Error("Zdrojový feed nedostupný: HTTP " + res.status);
  const xml = await res.text();
  const pocetVstup = (xml.match(/<SHOPITEM>/g) || []).length;
  if (!xml.startsWith("<?xml") || pocetVstup === 0) throw new Error("Zdrojový feed nevypadá jako XML feed (položek: " + pocetVstup + ")");

  const { out, zmeny, kategorie, bezKategorie } = upravFeed(xml);
  const pocetVystup = (out.match(/<SHOPITEM>/g) || []).length;
  if (pocetVystup !== pocetVstup) throw new Error(`Nesedí počet položek: vstup ${pocetVstup}, výstup ${pocetVystup}`);

  const kontrola =
    `Vygenerováno: ${new Date().toISOString()}\nPoložek: ${pocetVystup}\n\n` +
    `KATEGORIE ZBOŽÍ.CZ\n` +
    Object.entries(kategorie).map(([k, n]) => `${n}x  ${k}`).join("\n") +
    `\n\nBEZ ZMĚNY KATEGORIE (${bezKategorie.length})\n` +
    bezKategorie.join("\n") +
    `\n\nUPRAVENO ${zmeny.length} NÁZVŮ\n` +
    zmeny.map(([a, b]) => `${a}\n  -> ${b}`).join("\n") +
    "\n";

  mkdirSync("public", { recursive: true });
  writeFileSync("public/zbozi.xml", out);
  writeFileSync("public/kontrola.txt", kontrola);
  writeFileSync("public/robots.txt", "User-agent: *\nAllow: /\n");
  console.log(`OK: ${pocetVystup} položek, ${zmeny.length} upravených názvů`);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
