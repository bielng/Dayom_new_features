import React, { useState } from "react";
import TranslatorView from "./components/TranslatorView";
import VoiceView from "./components/VoiceView";
import TTSView from "./components/TTSView";
import Dock from "./components/Dock";

export default function App() {
  const [mode, setMode] = useState("translate");

  return (
    <div className='min-h-screen bg-[#F9F5EC] text-[#2B2723] flex flex-col'>
      {/* Banner — full width, edge to edge, entire image visible */}
      <div className='w-full'>
        <img
          src='/banner.png'
          alt='South Sudan Translate — Bridge languages. Connect people.'
          className='w-full h-auto block'
        />
      </div>

      {/* Header with logo */}
      <header className='w-full flex items-center justify-center pt-4 sm:pt-5 pb-1 px-4'>
        <div className='flex items-center gap-3'>
          <img
            src='/logo.png'
            alt='Dayom Lab'
            className='w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-sm'
          />
          <div className='flex flex-col'>
            <span className='text-lg sm:text-xl font-bold text-[#2B2723] tracking-tight leading-none'>
              Dayom Lab
            </span>
            <span className='text-[10px] sm:text-xs text-[#8A7D68] font-medium leading-tight mt-0.5'>
              Nuer & Dinka Language Studio
            </span>
          </div>
        </div>
      </header>

      {/* Dock */}
      <Dock mode={mode} onSelectMode={setMode} />

      {/* Main content */}
      <main className='flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-5'>
        {mode === "translate" && <TranslatorView />}
        {mode === "voice" && <VoiceView />}
        {mode === "tts" && <TTSView />}
      </main>

      {/* Footer */}
      <footer className='w-full text-center py-3 px-4'>
        <p className='text-[10px] sm:text-xs text-[#A79880]'>
          Powered by Dayom Lab · Preserving Nilotic languages through AI
        </p>
      </footer>
    </div>
  );
}
