# Dayom Lab — Nuer & Dinka Language Studio

Dayom Lab is a web app for translating and speaking two Nilotic languages, **Nuer (Thok Naath)** and **Dinka (Thuɔŋjäŋ)**, alongside English. It's built to help preserve and make these languages more accessible through AI-powered translation and speech tools.

## Features

- **Translate** — Text translation between English, Nuer, and Dinka.
- **Voice** — Live, mic-based conversation mode using the browser's speech recognition to capture spoken input and translate it on the fly.
- **TTS (Text-to-Speech)** — Converts written text into spoken audio in Nuer or Dinka.

## Tech Stack

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) — UI and build tooling
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [lucide-react](https://lucide.dev/) — icons
- [@gradio/client](https://www.npmjs.com/package/@gradio/client) — connects to Hugging Face Spaces for Nuer/Dinka text-to-speech models
- Unofficial Google Translate endpoint — used for English ↔ Nuer/Dinka text translation
- Browser Speech Recognition & Speech Synthesis APIs — used for voice capture and as a TTS fallback

## Project Structure

```
├── public/
│   ├── banner.png
│   └── logo.png
├── src/
│   ├── components/
│   │   ├── Dock.jsx           # Bottom navigation between Translate / Voice / TTS modes
│   │   ├── TranslatorView.jsx # Text translation UI
│   │   ├── VoiceView.jsx      # Live mic-based voice translation
│   │   └── TTSView.jsx        # Text-to-speech UI
│   ├── services/
│   │   ├── translate.js       # Google Translate wrapper (en/nus/din)
│   │   └── tts.js             # Gradio-hosted TTS model client + browser fallback
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

┌─────────────────────────────────────────────────────────────┐
│                        Dayom Lab App                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Translate  │  │    Voice    │  │        TTS          │  │
│  │   Engine    │  │ Transcribe  │  │   Synthesis         │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                    │             │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────────▼──────────┐  │
│  │  translate  │  │  translate  │  │  synthesizeSpeech   │  │
│  │   .js       │  │   .js       │  │  (tts.js)           │  │
│  │  (Google)   │  │  (Google)   │  │  (HF Space /        │  │
│  │             │  │             │  │   Browser fallback) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         ▲                ▲                                       │
│         │                │                                       │
│  ┌──────┴──────┐  ┌──────┴──────┐                              │
│  │ Web Speech  │  │  Web Speech │                              │
│  │    API      │  │    API      │                              │
│  │ (SpeechRec) │  │ (SpeechRec) │                              │
│  └─────────────┘  └─────────────┘                              │
└─────────────────────────────────────────────────────────────┘

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm

### Installation

```bash
git clone https://github.com/bielng/Dayom_new_features.git
cd Dayom_new_features
npm install
```

### Development

Start the local dev server:

```bash
npm run dev
```

### Build

Create a production build:

```bash
npm run build
```

### Preview

Preview the production build locally:

```bash
npm run preview
```

## Notes

- Voice mode relies on the browser's built-in `SpeechRecognition` API, which is currently best supported in Chromium-based browsers.
- Nuer text-to-speech is served from a Hugging Face Space (`dayomtechnologies/Text_To_Speech_Thok_Naath`); Dinka TTS currently falls back to browser speech synthesis until a dedicated model is available.
- Text translation uses Google's public translation endpoint and requires no API key.

## License

Licensed under the [MIT License](LICENSE).
