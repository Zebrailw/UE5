# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── mobile/             # Expo React Native app — UE5 Blueprints Academy
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## UE5 Blueprints Academy (Mobile App)

### Features
- 8 learning modules covering beginner to expert Blueprint topics
- 15+ lessons with full theory content, real-world examples, and practice tasks
- Interactive quiz system with explanations and scoring
- XP/level progression system with 10 levels
- Achievement system with 8 badges
- Streak tracking and daily goals
- Module locking by XP requirement
- 6 real-world example blueprints with step-by-step breakdowns
- Favorites and "Review Later" bookmarking
- Search and filter by difficulty
- Dark theme styled after Unreal Engine 5
- Local persistence via AsyncStorage
- **120+ Blueprint mechanics** across 11 categories (new)
- **Visual node connection practice** — interactive Blueprint editor (new)
- **Donation system** — Boosty integration with tiered modal (new)
- **Google Play ready** — adaptive icon, versionCode, permissions (new)

### App Screens
- **Home** — XP bar, stats, continue learning card, module overview
- **Learn** — Full curriculum with search, filter, lesson list
- **Mechanics** — 120+ mechanics with search, category filter, detail view
- **Practice** — Visual Blueprint node connection editor with 12+ challenges
- **Node Editor (Редактор)** — Free-form node graph editor: Input/Math/Output nodes, drag-to-connect pins, JSON export via system Share sheet, Unreal Engine integration guide modal (NEW)
- **Progress** — Module progress bars, achievements, stats grid
- **Profile** — User rank, favorites, review later, donation modal, settings
- **Lesson** — Theory content, practice tab, complete & quiz actions
- **Quiz** — Multiple choice with instant feedback and result review

### Curriculum Modules
1. What is Blueprint? (Beginner, 0 XP)
2. Nodes & Execution (Beginner, 100 XP)
3. Variables & Data Types (Beginner, 200 XP)
4. Functions & Macros (Basic, 400 XP)
5. Actor Communication (Intermediate, 700 XP)
6. Gameplay Mechanics (Intermediate, 1100 XP)
7. UI & Widget Blueprint (Intermediate, 1500 XP)
8. AI Blueprint Basics (Advanced, 2000 XP)
9. Optimization & Best Practices (Expert, 3000 XP)

### Key Files
- `artifacts/mobile/data/curriculum.ts` — All lesson content, quizzes, examples, achievements
- `artifacts/mobile/data/mechanics.ts` — 120+ Blueprint mechanics across 11 categories
- `artifacts/mobile/data/blueprintChallenges.ts` — 12+ visual node connection challenges
- `artifacts/mobile/context/ProgressContext.tsx` — XP, progress, and state management
- `artifacts/mobile/app/(tabs)/` — Main tab screens
- `artifacts/mobile/app/(tabs)/mechanics.tsx` — Mechanics browser with search/filter
- `artifacts/mobile/app/(tabs)/practice.tsx` — Visual Blueprint practice screen
- `artifacts/mobile/app/lesson/[id].tsx` — Lesson viewer
- `artifacts/mobile/app/quiz/[id].tsx` — Quiz engine
- `artifacts/mobile/components/BlueprintBuilder.tsx` — Interactive node graph editor
- `artifacts/mobile/constants/colors.ts` — Dark UE5 color theme

### Monetization Notes
- Donation system: Boosty via Linking.openURL, tiered modal (☕/$1, 🍕/$5, ⚡/$15)
- For Google Ads (AdMob): requires EAS custom build + AdMob account
  1. `pnpm add react-native-google-mobile-ads`
  2. Add AdMob App ID to `app.json` under `plugins`
  3. Use test ad IDs during development
  4. Build with `eas build --platform android`

## API Server

Express 5 API server. Routes in `src/routes/` use `@workspace/api-zod` for validation.

- Entry: `src/index.ts`
- App: `src/app.ts`
- Routes: `src/routes/index.ts`, `src/routes/health.ts`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` with `composite: true`. Root `tsconfig.json` lists all lib packages as project references.

- Always typecheck from root: `pnpm run typecheck`
- `emitDeclarationOnly` — only `.d.ts` files during typecheck
- Project references required for cross-package imports

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build`
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`

## Packages

### `artifacts/api-server` (`@workspace/api-server`)
Express 5 API server. Depends on: `@workspace/db`, `@workspace/api-zod`

### `artifacts/mobile` (`@workspace/mobile`)
Expo React Native app. UE5 Blueprints learning platform.

### `lib/db` (`@workspace/db`)
Database layer — Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)
OpenAPI 3.1 spec + Orval config. Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)
Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)
Generated React Query hooks and fetch client.

### `scripts` (`@workspace/scripts`)
Utility scripts package.
