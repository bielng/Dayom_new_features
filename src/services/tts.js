import { Client } from "@gradio/client";

// Nuer TTS — hosted on Hugging Face Spaces
const NUER_TTS_SPACE = "dayomtechnologies/Text_To_Speech_Thok_Naath";

// Dinka TTS — using Meta MMS (din) via a generic approach
// For now, Dinka falls back to browser speech synthesis or can be hooked to another space.
const DINKA_TTS_SPACE = "dayomtechnologies/Text_To_Speech_Thok_Naath"; // placeholder — swap when ready

let nuerClientPromise = null;
let dinkaClientPromise = null;

function getNuerClient() {
  if (!nuerClientPromise) {
    nuerClientPromise = Client.connect(NUER_TTS_SPACE);
  }
  return nuerClientPromise;
}

function getDinkaClient() {
  if (!dinkaClientPromise) {
    dinkaClientPromise = Client.connect(DINKA_TTS_SPACE);
  }
  return dinkaClientPromise;
}

/**
 * Synthesize speech from text.
 * @param {string} text - Text to speak.
 * @param {string} lang - 'nus' | 'din'
 * @param {number} seed - Optional seed.
 * @returns {Promise<string>} Playable audio URL.
 */
export async function synthesizeSpeech(text, lang = "nus", seed = 42) {
  if (lang === "nus") {
    const client = await getNuerClient();
    const result = await client.predict("/synthesize", { text, seed });
    const audioData = result?.data?.[0];
    const url = audioData?.url || audioData?.path;
    if (!url) throw new Error("No audio returned from Nuer TTS model.");
    return url;
  }

  if (lang === "din") {
    // Try Dinka HF Space first
    try {
      const client = await getDinkaClient();
      const result = await client.predict("/synthesize", { text, seed });
      const audioData = result?.data?.[0];
      const url = audioData?.url || audioData?.path;
      if (url) return url;
    } catch {
      // Fallback to browser TTS for Dinka if space fails
    }
    throw new Error("Dinka TTS model not available yet. Browser speech synthesis will be used as fallback.");
  }

  throw new Error(`Unsupported TTS language: ${lang}`);
}

/**
 * Browser-native speech synthesis for any language.
 * Best for English; limited voice quality for Nuer/Dinka.
 * @param {string} text - Text to speak.
 * @param {string} lang - BCP-47 language tag.
 */
export function speakWithBrowser(text, lang = "en-US") {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("Browser does not support speech synthesis."));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.onend = resolve;
    utterance.onerror = reject;
    window.speechSynthesis.speak(utterance);
  });
}
