/**
 * Google Translate (unofficial) — free, no API key.
 * Supports Nuer (nus) and Dinka (din) via Google's 2024+ language expansion.
 */

const LANG_NAMES = {
  nus: "Nuer (Thok Naath)",
  din: "Dinka (Thuɔŋjäŋ)",
  en: "English",
};

export function getLangName(code) {
  return LANG_NAMES[code] || code;
}

async function googleTranslate(text, sourceLang, targetLang) {
  if (!text || !text.trim()) return "";

  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", sourceLang);
  url.searchParams.set("tl", targetLang);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Google Translate failed (${res.status}). Try again.`);
  }

  const data = await res.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    return text;
  }
  return data[0].map((chunk) => chunk[0]).join("");
}

/**
 * Translate text between English and a Nilotic language.
 * @param {string} text - Text to translate.
 * @param {string} direction - 'en-to-nus' | 'nus-to-en' | 'en-to-din' | 'din-to-en'
 * @returns {Promise<string>} Translated text.
 */
export async function translateText(text, direction) {
  const map = {
    "en-to-nus": ["en", "nus"],
    "nus-to-en": ["nus", "en"],
    "en-to-din": ["en", "din"],
    "din-to-en": ["din", "en"],
  };
  const pair = map[direction];
  if (!pair) throw new Error(`Invalid direction: ${direction}`);
  return googleTranslate(text, pair[0], pair[1]);
}
