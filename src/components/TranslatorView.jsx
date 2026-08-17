import React, { useState } from "react";
import {
  ArrowLeftRight,
  Sparkles,
  Copy,
  Check,
  Volume2,
  RefreshCw,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { translateText, getLangName } from "../services/translate";
import { synthesizeSpeech, speakWithBrowser } from "../services/tts";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "nus", name: "Nuer (Thok Naath)" },
  { code: "din", name: "Dinka (Thuɔŋjäŋ)" },
];

const SAMPLE_INPUTS = {
  "en-nus": [
    "Nuer language preservation.",
    "Many people make a living by herding cattle and farming",
    "I wanna go to Kenya",
    "It contains the Sudd, which is one of the biggest wetlands in the entire world.",
  ],
  "en-din": [
    "Dinka language preservation.",
    "Many people make a living by herding cattle and farming",
    "I want to go to Kenya",
    "South Sudan is the youngest country in Africa.",
  ],
  "nus-en": [
    "Ɣän cieŋä kä Kenya",
    "Ɣän ta̱a̱ kɛ määth mi cɔali Kidit.",
    "Cä jɛ nhɔk ɛn ɣöö ŋotdɛ thiɛlɛ dup ti̱ gɔw rɛy juba",
  ],
  "din-en": [
    "Ŋa cökä ka Kenya",
    "Ŋa tää kɛ määt mi cɔal Kidit.",
    "Ca jɛ nhɔk ɛn ɣöö ŋɔtɛ thiɛlɛ dup ti gɔw rɛy juba",
  ],
  "nus-din": [
    "Ɣän cieŋä kä Kenya",
    "Ɣän ta̱a̱ kɛ määth mi cɔali Kidit.",
    "Cä jɛ nhɔk ɛn ɣöö ŋotdɛ thiɛlɛ dup ti̱ gɔw rɛy juba",
  ],
  "din-nus": [
    "Ŋa cökä ka Kenya",
    "Ŋa tää kɛ määt mi cɔal Kidit.",
    "Ca jɛ nhɔk ɛn ɣöö ŋɔtɛ thiɛlɛ dup ti gɔw rɛy juba",
  ],
};

export default function TranslatorView() {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("nus");
  const [inputText, setInputText] = useState("");
  const [translationResult, setTranslationResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakError, setSpeakError] = useState(null);

  const direction = `${sourceLang}-to-${targetLang}`;
  const sourceLabel = getLangName(sourceLang);
  const targetLabel = getLangName(targetLang);
  const sampleKey = `${sourceLang}-${targetLang}`;

  const handleSourceChange = (e) => {
    const newSource = e.target.value;
    if (newSource === targetLang) {
      setTargetLang(sourceLang);
    }
    setSourceLang(newSource);
    setInputText("");
    setTranslationResult("");
    setError(null);
  };

  const handleTargetChange = (e) => {
    const newTarget = e.target.value;
    if (newTarget === sourceLang) {
      setSourceLang(targetLang);
    }
    setTargetLang(newTarget);
    setInputText("");
    setTranslationResult("");
    setError(null);
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (translationResult) {
      setInputText(translationResult);
      setTranslationResult(inputText);
    } else {
      setInputText("");
      setTranslationResult("");
    }
    setError(null);
  };

  const handleTranslate = async () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setTranslationResult("");
    try {
      const translated = await translateText(inputText.trim(), direction);
      setTranslationResult(translated);
    } catch (err) {
      console.error("Translation error:", err);
      setError("Couldn't reach the translator. Try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translationResult) return;
    navigator.clipboard.writeText(translationResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = async () => {
    if (!translationResult || isSpeaking) return;
    setSpeakError(null);
    setIsSpeaking(true);

    if (targetLang !== "en") {
      try {
        const url = await synthesizeSpeech(translationResult, targetLang);
        const audio = new Audio(url);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        await audio.play();
      } catch (err) {
        console.error("TTS error:", err);
        try {
          await speakWithBrowser(translationResult, targetLang);
          setIsSpeaking(false);
        } catch {
          setSpeakError("Voice playback unavailable for this language.");
          setIsSpeaking(false);
        }
      }
      return;
    }

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(translationResult);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsSpeaking(false), 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleTranslate();
  };

  const placeholder = `Enter ${sourceLabel} text to translate to ${targetLabel}...`;

  return (
    <div className='w-full max-w-3xl mx-auto flex flex-col items-center animate-fade-in'>
      <div className='text-center mb-4'>
        <h1 className='text-2xl sm:text-3xl font-bold text-[#2B2723] tracking-tight'>
          Translation Engine
        </h1>
        <p className='text-xs sm:text-sm text-[#8A7D68] mt-1 max-w-lg mx-auto'>
          English · Nuer · Dinka — translate between any two languages
        </p>
      </div>

      {/* Source & Target dropdowns with swap */}
      <div className='flex items-center gap-2 sm:gap-3 mb-4'>
        <div className='relative'>
          <select
            value={sourceLang}
            onChange={handleSourceChange}
            className='appearance-none bg-[#EDE0C4] hover:bg-[#E4D2A9] text-[#4A4038] text-sm sm:text-base font-semibold px-4 sm:px-5 py-2 sm:py-2.5 pr-10 rounded-full border border-[#D9C098] focus:outline-none focus:ring-2 focus:ring-[#BD5A26]/40 cursor-pointer transition-colors'
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
          <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C5A22] pointer-events-none' />
        </div>

        <button
          onClick={handleSwap}
          className='p-2 rounded-full bg-[#EDE0C4] hover:bg-[#E4D2A9] border border-[#D9C098] text-[#9C5A22] transition-colors cursor-pointer'
          title='Swap languages'
        >
          <ArrowLeftRight className='w-4 h-4 sm:w-5 sm:h-5' />
        </button>

        <div className='relative'>
          <select
            value={targetLang}
            onChange={handleTargetChange}
            className='appearance-none bg-[#EDE0C4] hover:bg-[#E4D2A9] text-[#4A4038] text-sm sm:text-base font-semibold px-4 sm:px-5 py-2 sm:py-2.5 pr-10 rounded-full border border-[#D9C098] focus:outline-none focus:ring-2 focus:ring-[#BD5A26]/40 cursor-pointer transition-colors'
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
          <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C5A22] pointer-events-none' />
        </div>
      </div>

      <div className='w-full bg-[#F2E6CE]/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-[#E3D2B0] shadow-xl flex flex-col gap-4 sm:gap-5'>
        <div className='flex items-center justify-between px-1'>
          <span className='text-[11px] sm:text-xs font-bold text-[#9C5A22] uppercase tracking-wider'>
            {sourceLabel}
          </span>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          className='w-full bg-[#FFFCF6] rounded-xl sm:rounded-2xl p-3 sm:p-3.5 text-sm sm:text-base text-[#2B2723] placeholder:text-[#A79880] resize-none border border-[#DFC9A4] focus:outline-none focus:ring-2 focus:ring-[#BD5A26]/40'
        />

        {SAMPLE_INPUTS[sampleKey] && (
          <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
            <span className='text-[11px] sm:text-xs text-[#8A7D68] font-medium'>
              Try example:
            </span>
            {SAMPLE_INPUTS[sampleKey].map((sample) => (
              <button
                key={sample}
                onClick={() => setInputText(sample)}
                className='text-[11px] sm:text-xs bg-[#EDE0C4] hover:bg-[#E4D2A9] text-[#4A4038] px-2.5 sm:px-3 py-1 rounded-full border border-[#D9C098] transition-colors cursor-pointer'
              >
                {sample.length > 35 ? sample.slice(0, 35) + "..." : sample}
              </button>
            ))}
          </div>
        )}

        <div className='flex justify-center my-0.5 sm:my-1'>
          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            className='bg-[#BD5A26] hover:bg-[#A84E20] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm sm:text-base px-6 sm:px-7 py-2 sm:py-2.5 rounded-full shadow-md shadow-amber-900/15 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]'
          >
            {isLoading ? (
              <>
                <RefreshCw className='w-4 h-4 animate-spin' />
                Translating...
              </>
            ) : (
              <>
                <Sparkles className='w-4 h-4' />
                Translate
              </>
            )}
          </button>
        </div>

        <div className='flex items-center justify-between px-1'>
          <span className='text-[11px] sm:text-xs font-bold text-[#9C5A22] uppercase tracking-wider'>
            {targetLabel}
          </span>
          {translationResult && (
            <div className='flex items-center gap-1.5 sm:gap-2'>
              <button
                onClick={handleSpeak}
                disabled={isSpeaking}
                className='text-xs text-[#4A4038] hover:text-[#2B2723] flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-[#EDE0C4] hover:bg-[#E4D2A9] cursor-pointer transition-colors'
              >
                <Volume2
                  className={`w-3.5 h-3.5 ${isSpeaking ? "animate-pulse text-[#BD5A26]" : ""}`}
                />
                Speak
              </button>
              <button
                onClick={handleCopy}
                className='text-xs text-[#4A4038] hover:text-[#2B2723] flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-[#EDE0C4] hover:bg-[#E4D2A9] cursor-pointer transition-colors'
              >
                {copied ? (
                  <Check className='w-3.5 h-3.5 text-emerald-600' />
                ) : (
                  <Copy className='w-3.5 h-3.5' />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}
        </div>

        <div className='min-h-[6rem] sm:min-h-[6.5rem] bg-[#FFFCF6] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-[#DFC9A4] text-[#2B2723] text-sm sm:text-lg flex items-center justify-start'>
          {translationResult ? (
            <div className='w-full font-medium animate-fade-in'>
              {translationResult}
            </div>
          ) : (
            <span className='text-[#A79880] font-normal text-xs sm:text-base'>
              Translation result will appear here...
            </span>
          )}
        </div>

        {error && (
          <div className='flex items-start gap-2 bg-[#F1E7D4] border border-[#E3D2B0] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#9C5A22]'>
            <AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
            <span>{error}</span>
          </div>
        )}

        {speakError && (
          <div className='flex items-start gap-2 bg-[#F1E7D4] border border-[#E3D2B0] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#9C5A22]'>
            <AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
            <span>{speakError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
