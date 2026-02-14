# Repository Guidelines

## Project Structure & Module Organization
- `src/`: main extension code (React + TypeScript). Key areas include `components/`, `store/` (Zustand), `hooks/`, `utils/`, and `locales/`.
- `public/`: static assets copied into builds (icons, images).
- `scripts/`: build and maintenance scripts (`build.js`, `zip-dist.js`, translation/icon helpers).
- `dist/`: generated build output (do not edit manually).
- `zip/`: packaged release artifacts.
- `ios/`: iOS wrapper project and related build scripts.
- `docs/` and `archive/`: documentation and historical/reference material.

## Build, Test, and Development Commands
- `npm run dev`: start local Vite dev server.
- `npm run build` or `npm run build:chrome`: production Chrome build.
- `npm run build:firefox`: Firefox build (Firefox manifest generated in `dist/manifest.json`).
- `npm run build:zip` / `npm run build:firefox:zip`: build and package zip artifacts.
- `npm run lint`: run ESLint and strict TypeScript checks.
- `npm run lint:eslint:fix`: auto-fix lint issues where possible.
- `npm run check-translations`: validate i18n key consistency.

## Coding Style & Naming Conventions
- Use TypeScript with React function components and hooks.
- Follow ESLint rules in `eslint.config.js`; run lint before opening PRs.
- Use 2-space indentation and keep files ASCII unless existing content requires otherwise.
- Naming: `PascalCase` for components, `camelCase` for variables/functions, `useXxx` for hooks, `*.store.ts` or `useXxxStore.ts` for stores.
- Keep translation keys mirrored across `src/locales/en.json`, `de.json`, `ru.json`, and `es.json`.

## Testing Guidelines
- No dedicated unit test suite is currently enforced.
- Minimum validation for changes: `npm run lint` and a relevant build command.
- Always run a Chrome build after code changes: `npm run build:chrome` (or `npm run build`).
- For UI changes, manually verify affected modals/views in the extension and include notes in PR.

## Commit & Pull Request Guidelines
- Follow Conventional Commit style seen in history: `feat:`, `fix:`, `refactor:`, `chore:`.
- Keep commits focused by behavior (avoid bundling unrelated changes).
- PRs should include:
  - concise description of behavior change,
  - linked issue (if available),
  - screenshots/GIFs for UI updates,
  - commands run for verification.

## Security & Configuration Tips
- Never commit secrets. Use `.env` (ignored) and keep `.env.example` as template.
- GA4 settings are read from `VITE_GA4_MEASUREMENT_ID` and `VITE_GA4_API_SECRET`.
