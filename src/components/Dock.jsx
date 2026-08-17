import React from 'react';
import { Languages, Mic, Volume2 } from 'lucide-react';

export default function Dock({ mode, onSelectMode }) {
  const tools = [
    { id: 'translate', label: 'Translate', icon: Languages },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'tts', label: 'TTS', icon: Volume2 },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center mt-4 mb-2 gap-2 px-2 sm:px-4">
      <div className="bg-[#F2E6CE]/80 backdrop-blur-md border border-[#E3D2B0] p-1 sm:p-1.5 rounded-full shadow-lg flex items-center gap-1 sm:gap-2 max-w-full overflow-x-auto">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const active = mode === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectMode(tool.id)}
              className={`relative px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none whitespace-nowrap ${
                active ? 'text-white' : 'text-[#4A4038] hover:bg-[#EDE0C4]/60'
              }`}
            >
              {active && (
                <div className="absolute inset-0 bg-[#BD5A26] rounded-full transition-all" />
              )}
              <span className="relative z-10 flex items-center gap-1 sm:gap-1.5">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
