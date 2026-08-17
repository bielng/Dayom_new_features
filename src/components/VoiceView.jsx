import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { translateText, getLangName } from "../services/translate";
import { synthesizeSpeech, speakWithBrowser } from "../services/tts";

const LANGUAGES = [
  { code: "nus", name: "Nuer (Thok Naath)" },
  { code: "din", name: "Dinka (Thuɔŋjäŋ)" },
];

/* Exact live blob from video — morphing shape + rotating gradient + waveform bars */
function LiveBlob({ active, size = 130 }) {
  const bars = [
    { h: 28, d: 0.0 },
    { h: 48, d: 0.07 },
    { h: 36, d: 0.14 },
    { h: 60, d: 0.21 },
    { h: 44, d: 0.28 },
    { h: 56, d: 0.35 },
    { h: 32, d: 0.42 },
    { h: 52, d: 0.49 },
    { h: 28, d: 0.56 },
  ];

  return (
    <div className='relative' style={{ width: size, height: size }}>
      {/* Outer glow when active */}
      {active && (
        <div
          className='absolute inset-0'
          style={{
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            background:
              "conic-gradient(from 0deg, #3b82f6, #a855f7, #f97316, #ec4899, #3b82f6)",
            animation:
              "blobMorph 8s ease-in-out infinite, blobSpin 10s linear infinite",
            filter: "blur(18px)",
            opacity: 0.45,
            transform: "scale(1.25)",
            zIndex: 0,
          }}
        />
      )}

      {/* The blob */}
      <div
        className='relative flex items-center justify-center overflow-hidden'
        style={{
          width: size,
          height: size,
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          animation: "blobMorph 8s ease-in-out infinite",
          zIndex: 1,
        }}
      >
        {/* Rotating gradient layer */}
        <div
          className='absolute inset-[-50%]'
          style={{
            background:
              "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #f97316, #ec4899, #06b6d4, #3b82f6)",
            animation: "blobSpin 10s linear infinite",
            filter: "blur(2px)",
          }}
        />

        {/* Inner soft highlight */}
        <div
          className='absolute inset-0'
          style={{
            background:
              "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, transparent 55%)",
            zIndex: 2,
          }}
        />

        {/* Waveform bars */}
        <div
          className='relative z-10 flex items-center justify-center'
          style={{ gap: 5 }}
        >
          {bars.map((bar, i) => (
            <span
              key={i}
              className='block rounded-full bg-white/90'
              style={{
                width: 3,
                height: active ? undefined : bar.h,
                minHeight: 6,
                animation: active
                  ? `waveBar 0.55s ease-in-out ${bar.d}s infinite alternate`
                  : `waveBarIdle 2.5s ease-in-out ${bar.d * 2}s infinite alternate`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes blobMorph {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          25%  { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          50%  { border-radius: 50% 60% 30% 60% / 30% 40% 70% 50%; }
          75%  { border-radius: 40% 60% 60% 40% / 60% 40% 30% 70%; }
        }
        @keyframes blobSpin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes waveBar {
          0%   { height: 10px; transform: scaleY(0.35); opacity: 0.7; }
          100% { height: 52px; transform: scaleY(1); opacity: 1; }
        }
        @keyframes waveBarIdle {
          0%   { height: 14px; transform: scaleY(0.5); opacity: 0.6; }
          100% { height: 36px; transform: scaleY(1); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

export default function VoiceView() {
  const [lang, setLang] = useState("nus");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakError, setSpeakError] = useState(null);
  const [browserSupport, setBrowserSupport] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupport(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        }
      }
      if (final) {
        setTranscript((prev) => (prev ? prev + " " + final : final));
      }
    };

    rec.onerror = (event) => {
      if (event.error !== "aborted") {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      rec.abort();
    };
  }, []);

  const handleToggleListen = () => {
    setError(null);
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setTranslation("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleTranslate = async () => {
    if (!transcript.trim() || isTranslating) return;
    setIsTranslating(true);
    setError(null);
    setTranslation("");
    try {
      const direction = `en-to-${lang}`;
      const result = await translateText(transcript.trim(), direction);
      setTranslation(result);
    } catch (err) {
      console.error("Translation error:", err);
      setError("Couldn't translate. Try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = async () => {
    if (!translation || isSpeaking) return;
    setSpeakError(null);
    setIsSpeaking(true);

    try {
      const url = await synthesizeSpeech(translation, lang);
      const audio = new Audio(url);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      await audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      try {
        await speakWithBrowser(translation, lang);
        setIsSpeaking(false);
      } catch {
        setSpeakError("Voice playback unavailable.");
        setIsSpeaking(false);
      }
    }
  };

  if (!browserSupport) {
    return (
      <div className='w-full max-w-3xl mx-auto flex flex-col items-center animate-fade-in'>
        <div className='text-center mb-4'>
          <h1 className='text-2xl sm:text-3xl font-bold text-[#2B2723] tracking-tight'>
            Voice Transcribe
          </h1>
          <p className='text-xs sm:text-sm text-[#8A7D68] mt-1'>
            Speak in English and get a translated transcript
          </p>
        </div>
        <div className='w-full bg-[#F2E6CE]/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#E3D2B0] shadow-xl text-center'>
          <AlertCircle className='w-10 h-10 text-[#9C5A22] mx-auto mb-3' />
          <p className='text-sm sm:text-base text-[#4A4038] font-medium'>
            Your browser does not support speech recognition.
          </p>
          <p className='text-xs sm:text-sm text-[#8A7D68] mt-2'>
            Please use Chrome, Edge, or Safari for voice features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-3xl mx-auto flex flex-col items-center animate-fade-in'>
      <div className='text-center mb-4'>
        <h1 className='text-2xl sm:text-3xl font-bold text-[#2B2723] tracking-tight'>
          Voice Transcribe
        </h1>
        <p className='text-xs sm:text-sm text-[#8A7D68] mt-1 max-w-lg mx-auto'>
          Speak in English — get a live transcript and translation into Nuer or
          Dinka
        </p>
      </div>

      {/* Language dropdown */}
      <div className='relative mb-4'>
        <select
          value={lang}
          onChange={(e) => {
            setLang(e.target.value);
            setTranslation("");
          }}
          className='appearance-none bg-[#EDE0C4] hover:bg-[#E4D2A9] text-[#4A4038] text-base sm:text-lg font-semibold px-6 sm:px-8 py-2.5 sm:py-3 pr-12 rounded-full border border-[#D9C098] focus:outline-none focus:ring-2 focus:ring-[#BD5A26]/40 cursor-pointer transition-colors'
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
        <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C5A22] pointer-events-none' />
      </div>

      <div className='w-full bg-[#F2E6CE]/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-[#E3D2B0] shadow-xl flex flex-col gap-4 sm:gap-5'>
        {/* Live blob mic button */}
        <div className='flex flex-col items-center gap-3'>
          <button
            onClick={handleToggleListen}
            className='relative cursor-pointer transition-transform active:scale-95'
            title={isListening ? "Stop listening" : "Start listening"}
          >
            <LiveBlob active={isListening} size={120} />
          </button>
          <span className='text-xs sm:text-sm font-medium text-[#4A4038]'>
            {isListening ? "Listening... tap to stop" : "Tap to speak"}
          </span>
        </div>

        {/* Transcript */}
        <div>
          <div className='flex items-center justify-between px-1 mb-1.5'>
            <span className='text-[11px] sm:text-xs font-bold text-[#9C5A22] uppercase tracking-wider'>
              English Transcript
            </span>
            {transcript && (
              <button
                onClick={() => handleCopy(transcript)}
                className='text-xs text-[#4A4038] hover:text-[#2B2723] flex items-center gap-1 px-2 py-1 rounded-full bg-[#EDE0C4] hover:bg-[#E4D2A9] cursor-pointer transition-colors'
              >
                {copied ? (
                  <Check className='w-3.5 h-3.5 text-emerald-600' />
                ) : (
                  <Copy className='w-3.5 h-3.5' />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          <div className='min-h-[5rem] bg-[#FFFCF6] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-[#DFC9A4] text-[#2B2723] text-sm sm:text-base'>
            {transcript ? (
              <p className='animate-fade-in'>{transcript}</p>
            ) : (
              <span className='text-[#A79880] text-xs sm:text-sm italic'>
                Your speech will appear here...
              </span>
            )}
          </div>
        </div>

        {/* Translate button */}
        <div className='flex justify-center'>
          <button
            onClick={handleTranslate}
            disabled={isTranslating || !transcript.trim()}
            className='bg-[#BD5A26] hover:bg-[#A84E20] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm sm:text-base px-6 sm:px-7 py-2 sm:py-2.5 rounded-full shadow-md shadow-amber-900/15 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]'
          >
            {isTranslating ? (
              <>
                <RefreshCw className='w-4 h-4 animate-spin' />
                Translating...
              </>
            ) : (
              <>
                <Sparkles className='w-4 h-4' />
                Translate to {getLangName(lang)}
              </>
            )}
          </button>
        </div>

        {/* Translation output */}
        <div>
          <div className='flex items-center justify-between px-1 mb-1.5'>
            <span className='text-[11px] sm:text-xs font-bold text-[#9C5A22] uppercase tracking-wider'>
              {getLangName(lang)} Translation
            </span>
            {translation && (
              <div className='flex items-center gap-1.5 sm:gap-2'>
                <button
                  onClick={handleSpeak}
                  disabled={isSpeaking}
                  className='text-xs text-[#4A4038] hover:text-[#2B2723] flex items-center gap-1 px-2 py-1 rounded-full bg-[#EDE0C4] hover:bg-[#E4D2A9] cursor-pointer transition-colors'
                >
                  <Volume2
                    className={`w-3.5 h-3.5 ${isSpeaking ? "animate-pulse text-[#BD5A26]" : ""}`}
                  />
                  Speak
                </button>
                <button
                  onClick={() => handleCopy(translation)}
                  className='text-xs text-[#4A4038] hover:text-[#2B2723] flex items-center gap-1 px-2 py-1 rounded-full bg-[#EDE0C4] hover:bg-[#E4D2A9] cursor-pointer transition-colors'
                >
                  <Copy className='w-3.5 h-3.5' />
                  Copy
                </button>
              </div>
            )}
          </div>
          <div className='min-h-[5rem] bg-[#FFFCF6] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-[#DFC9A4] text-[#2B2723] text-sm sm:text-lg flex items-center justify-start'>
            {translation ? (
              <div className='w-full font-medium animate-fade-in'>
                {translation}
              </div>
            ) : (
              <span className='text-[#A79880] font-normal text-xs sm:text-base'>
                Translation will appear here...
              </span>
            )}
          </div>
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
