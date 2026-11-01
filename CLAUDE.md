# smart-invoice-pro (frontend)

React 19 app built with Create React App (`react-scripts`), MUI v7, React Query,
Firebase, i18next. Own git repo — commit here, not from the workspace root.

## Commands
- `npm start` — dev server
- `npm test` — Jest/RTL unit tests
- `npm run build` — production build
- `npm run qa` / `qa:run` / `qa:regression` / `qa:playwright` — QA engine (see `qa/`), separate from unit tests

## Docs
Feature/architecture docs live at this level (`FRONTEND_CODEBASE_AUDIT.md`,
`USER_ROLES_IMPLEMENTATION.md`, `API_CONFIGURATION.md`, `FIREBASE_SETUP.md`,
`GUIDED_TOUR_IMPLEMENTATION_PLAN.md`, etc.) — grep this directory rather than
assuming they're under the workspace-root `docs/`. QA process docs and
screenshots are in `qa/`, `qa-workflows/`, `qa-screenshots*/`.

## Do not read/quote
`node_modules/`, `build/`, `coverage/`, `.venv/` — generated.
