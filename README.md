# Dayom Lab — Nuer & Dinka Language Studio

Dayom Lab is a web app for translating and speaking two Nilotic languages, **Nuer (Thok Naath)** and **Dinka (Thuɔŋjäŋ)**, alongside English. It's built to help preserve and make these languages more accessible through AI-powered translation and speech tools.

## Features

| Mode | What it does |
|---|---|
| **Translate** | Text translation between English, Nuer, and Dinka, with swappable source/target languages, example phrases, copy-to-clipboard, and spoken playback of the result. |
| **Voice** | Live, mic-based mode: speak in English, see a real-time transcript, then translate it into Nuer or Dinka and play it back. |
| **TTS (Text-to-Speech)** | Type text directly in Nuer or Dinka and generate downloadable spoken audio. |

## Tech Stack

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) — UI and build tooling
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [lucide-react](https://lucide.dev/) — icons
- Unofficial Google Translate endpoint — used for English ↔ Nuer/Dinka text translation
- Fine-tuned Meta MMS text-to-speech model — used for Nuer/Dinka speech synthesis
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
│   │   └── tts.js             # Meta MMS TTS model client + browser fallback
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## Architecture

```
                              Dayom Lab App
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │  Translate   │     │    Voice     │     │     TTS      │
   │   Engine     │     │  Transcribe  │     │  Synthesis   │
   └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
          │                    │                    │
          │             ┌──────┴───────┐            │
          │             │  Web Speech  │            │
          │             │  API (STT)   │            │
          │             └──────┬───────┘            │
          │                    │                    │
          ▼                    ▼                    ▼
   ┌─────────────────────────────────┐     ┌──────────────────────┐
   │      translate.js               │     │       tts.js         │
   │  Google Translate (unofficial)  │     │  Meta MMS TTS model,  │
   │  en ⇄ nus ⇄ din                 │     │  or browser           │
   │                                  │     │  speechSynthesis     │
   └─────────────────────────────────┘     │  fallback            │
                                             └──────────────────────┘
```

- **Translate** and **Voice** both go through `translate.js`; Voice additionally uses the browser's Speech Recognition API to turn spoken English into text before translating it.
- **TTS** (and the "Speak" buttons in Translate/Voice) go through `tts.js`, which calls a fine-tuned Meta MMS text-to-speech model, falling back to the browser's native `speechSynthesis` if that call fails.

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

## Known Limitations

- **Dinka TTS is a placeholder.** `services/tts.js` currently points the Dinka voice model at the Nuer model; a dedicated Dinka model hasn't been wired up yet, so Dinka audio falls back to the browser's generic speech synthesis, which doesn't pronounce Dinka well.
- **Voice mode only recognizes spoken English.** The browser Speech Recognition API doesn't support Nuer or Dinka, so you can't currently speak those languages and have them transcribed — only English input is converted, then translated outward.
- **Translation relies on an unofficial Google endpoint**, which isn't a documented public API and can be rate-limited or change without notice.
- **Browser support varies.** Voice mode needs `SpeechRecognition`, which works best in Chromium-based browsers (Chrome, Edge); Firefox and some others aren't supported.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, contribution ideas, and guidelines.

## License

Licensed under the [MIT License](LICENSE).
