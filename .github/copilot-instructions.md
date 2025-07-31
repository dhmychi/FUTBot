# Copilot Instructions for FUTBot

## Overview
FUTBot is a multi-component project with a Chrome extension and a web application. The workspace is organized to separate browser extension code (`chrome-extension/`) from the main app (`src/`, `home/`). The project uses React (TypeScript), Vite, TailwindCSS, and Supabase for backend migrations.

## Architecture & Major Components
- **chrome-extension/**: Contains all files for the browser extension (background, content scripts, popup UI).
- **src/**: Main React app, including core components, context providers, and pages.
- **home/project/src/**: Additional React app structure, possibly for a subproject or legacy code.
- **supabase/migrations/**: SQL migration files for database schema changes.

## Developer Workflows
- **Build & Run**: Use Vite for building and serving the React app. Chrome extension is loaded via `chrome://extensions` with the folder as "unpacked extension".
- **Debugging Extension**: Use Chrome's extension debugger. For popup debugging, launch Chrome with:
  ```
  chrome.exe --disable-extensions-except=chrome-extension --load-extension=chrome-extension
  ```
- **Styling**: TailwindCSS is configured via `tailwind.config.js` and `postcss.config.js`.
- **TypeScript**: Configured via multiple `tsconfig*.json` files for app, node, and general settings.

## Project-Specific Patterns
- **AuthContext**: Shared authentication logic in `src/contexts/AuthContext.tsx` and `home/project/src/contexts/AuthContext.tsx`.
- **Pages**: Organized under `src/pages/` and `home/project/src/pages/`.
- **Components**: Reusable UI in `src/components/`.
- **Types**: Shared types in `src/types/`.
- **Supabase**: Database migrations managed in `supabase/migrations/`.

## Integration Points
- **Supabase**: Used for authentication and data storage. Migration files are SQL scripts.
- **Vercel**: Deployment configuration in `vercel.json`.
- **Vite**: Main build tool, config in `vite.config.ts`.

## Conventions
- **React Function Components**: All UI is built with function components and hooks.
- **Context Providers**: Auth and theme context are provided at the app root.
- **File Naming**: Use PascalCase for components and pages, camelCase for variables/functions.
- **Extension Scripts**: `background.js` for background tasks, `content.js` for DOM interaction, `popup.js` for popup UI logic.

## Examples
- To add a new page, create a file in `src/pages/` and update routing in `App.tsx`.
- To add a new migration, place a SQL file in `supabase/migrations/`.
- To share authentication logic, use the `AuthContext` from `src/contexts/AuthContext.tsx`.

---
For questions or unclear patterns, review the relevant directory or ask for clarification.
