# Contributing to Dayom Lab

Thanks for your interest in contributing! Dayom Lab exists to make Nuer and Dinka more accessible through translation and speech tools, and community contributions — whether code, language expertise, or bug reports — are what will make it better.

## Getting Started

1. **Fork** the repository and clone your fork:
   ```bash
   git clone https://github.com/<your-username>/Dayom_new_features.git
   cd Dayom_new_features
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the dev server:**
   ```bash
   npm run dev
   ```
4. Create a branch for your change:
   ```bash
   git checkout -b fix/short-description
   ```

## Project Structure

See the [README](README.md#project-structure) for a full breakdown. In short:

- `src/components/` — the three main views (`TranslatorView`, `VoiceView`, `TTSView`) plus the `Dock` navigation
- `src/services/` — API/service wrappers (`translate.js` for Google Translate, `tts.js` for the Meta MMS speech models)
- `public/` — static assets (logo, banner)

## Ways to Contribute

- **Bug fixes** — check [open issues](https://github.com/bielng/Dayom_new_features/issues) or file a new one.
- **Dinka TTS** — `services/tts.js` currently points the Dinka voice model at the Nuer model as a placeholder. Hooking up a real, dedicated Dinka TTS model is one of the most impactful contributions right now.
- **Translation quality** — the app relies on Google's unofficial translation endpoint, which can be inconsistent for Nuer/Dinka. Suggestions for better translation sources, or a way to flag/correct bad translations, are welcome.
- **Speech recognition for Nuer/Dinka input** — Voice mode currently only recognizes spoken English. Support for recognizing spoken Nuer/Dinka would be a significant feature.
- **UI/UX improvements** — accessibility, mobile responsiveness, loading/error states.
- **Documentation** — improving the README, adding code comments, or writing usage guides.
- **Sample phrases** — expanding or correcting the example phrases in `TranslatorView.jsx` and `TTSView.jsx`. Native speaker review here is especially valuable.

## Code Style

- The project uses React functional components with hooks — keep new components consistent with that pattern.
- Styling is done with Tailwind utility classes directly in JSX; avoid introducing separate CSS files unless necessary.
- Keep components focused: view components (`*View.jsx`) handle UI and state, `services/` files handle external API calls.
- Prefer clear, descriptive variable and function names over abbreviations.

## Submitting Changes

1. Make sure the app still runs cleanly with `npm run dev` and builds with `npm run build`.
2. Keep commits focused and write clear commit messages.
3. Push your branch and open a pull request against `main`.
4. In your PR description, explain:
   - What the change does and why
   - How you tested it
   - Any screenshots/recordings for UI changes
5. Be responsive to review feedback — small back-and-forth is normal.

## Reporting Bugs

When filing an issue, please include:

- Steps to reproduce
- Expected vs. actual behavior
- Browser/OS (especially relevant for Voice mode, which depends on browser speech APIs)
- Console errors, if any

## Language & Cultural Sensitivity

Nuer and Dinka are living languages with rich oral traditions. If you're contributing translations, sample phrases, or language-related logic, please:

- Prefer input from fluent or native speakers where possible.
- Note any regional/dialect variation you're aware of.
- Flag anything you're unsure about rather than guessing, especially for culturally significant phrases.

## Questions

If anything here is unclear, feel free to open an issue to ask before starting work — it can save time on both sides.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
