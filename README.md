# Civora Mobile

**Product:** Civora — Intelligent Construction. Clearer Control.  
**Stack:** React Native (`0.88.0`), Expo SDK 58, Expo Router, TypeScript (`strict`), NativeWind v4 (`^4.1.23`) + Tailwind CSS v3 (`^3.4.17`), TanStack Query v5, React Hook Form + Zod.

---

## 1. Architecture & Security Boundaries

Civora Mobile provides a single shared Expo codebase serving two permission-isolated workspaces:

1. **Engineer Workspace (`app/(engineer)`)** — Field evidence capture (camera, photo library, documents), local unsent draft preservation, idempotent upload submission, conflict detection, and AI field quality suggestion review.
2. **Stakeholder Workspace (`app/(stakeholder)`)** — Verified project milestones and strictly scoped access to officially **released** engineering reports (`visibilityStatus === "released"`) for assigned projects only.

### Non-Negotiable Security Rules
- **Backend Authority:** Client-side workspace routing (`resolveWorkspaceFromPermissions`) is derived from authenticated backend permissions (`workspace:engineer` vs `workspace:stakeholder`), never from an unverified local toggle. The Civora backend must enforce authorization on every endpoint.
- **Zero Secrets in Bundle:** Only public configuration (`EXPO_PUBLIC_APP_ENV`, `EXPO_PUBLIC_API_BASE_URL`) is read in the client. Never connect directly to PostgreSQL, bundle Prisma, or place private keys in `EXPO_PUBLIC_*`.
- **Truthful Offline & Upload States:** Field submissions saved offline or prior to server confirmation are labeled **`Saved on this device (Not submitted)`**. A submission only transitions to **`Submitted to Civora (Server Confirmed)`** after the backend returns a schema-validated `FieldSubmissionRecord`.

---

## 2. Project Structure

```text
.
├── app.json
├── app.config.ts               # Dynamic environment config (development, preview, production)
├── eas.json                    # EAS Build profiles
├── babel.config.js             # Expo + NativeWind v4 Babel preset
├── metro.config.js             # Expo Metro wrapped with withNativeWind
├── tailwind.config.js          # Civora brand color tokens & heading font config
├── global.css                  # Tailwind directives (@tailwind base/components/utilities)
├── tsconfig.json               # Strict TypeScript config with @/* and @/assets/* aliases
├── app/                        # Expo Router entry points (thin route composition)
│   ├── _layout.tsx             # Root providers + PermissionAwareNavigator
│   ├── index.tsx               # Permission-based entry redirect
│   ├── (auth)/                 # Sign-in flow
│   ├── (engineer)/             # Engineer Workspace routes
│   └── (stakeholder)/          # Stakeholder Workspace routes
├── src/
│   ├── components/
│   │   ├── feedback/           # NetworkAndContractBanner, SyncStateBadge
│   │   └── layout/             # WorkspaceShell
│   ├── constants/              # Environment loader (env.ts) & TanStack Query keys
│   ├── features/               # Feature screens (auth, submissions, reports, etc.)
│   ├── hooks/                  # useConnectivity, useLocalDrafts
│   ├── lib/
│   │   ├── errors/             # Normalized CivoraApiError & HTTP status mapper
│   │   ├── offline/            # LocalDraftStore & network reachability monitor
│   │   ├── secure-storage/     # expo-secure-store session wrapper + expiry check
│   │   └── validation/         # Zod runtime schemas for auth, forms, and API payloads
│   ├── providers/              # AuthProvider, CivoraQueryProvider
│   ├── services/               # api-client.ts, auth-service.ts, upload-service.ts
│   ├── theme/                  # Civora brand color tokens & typography scale
│   └── types/                  # Domain & API contract TypeScript definitions
├── docs/
│   └── BACKEND_CONTRACTS.md    # Required Civora API endpoints & asset checklist
└── tests/
    └── unit/                   # Jest unit tests for routing, validation, uploads & conflicts
```

---

## 3. Setup & Installation

### Prerequisites
- Node.js (LTS / v20+ or v24+)
- `npm` (uses committed `package-lock.json`)
- iOS Simulator (Xcode) or Android Emulator (Android Studio) for native device testing

### Environment Configuration
Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

`.env.example`:
```bash
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_BASE_URL=https://api.example.invalid
```

> When `EXPO_PUBLIC_API_BASE_URL` is set to the placeholder (`https://api.example.invalid`), the app displays a truthful **API Contract Mode** banner and allows local inspection of both the Engineer and Stakeholder workspaces in development mode without faking server confirmations.

### Install Dependencies
```bash
npm install
```

> When adding new Expo native packages, always use `npx expo install <package>` so versions match the pinned Expo SDK.

---

## 4. Available Scripts

| Command | Description |
| :--- | :--- |
| `npm start` | Start the Expo development server (`npx expo start`) |
| `npm run ios` | Start Expo and open in iOS Simulator |
| `npm run android` | Start Expo and open in Android Emulator |
| `npm run web` | Start Expo for web preview |
| `npm run typecheck` | Run strict TypeScript verification (`tsc --noEmit`) |
| `npm test` | Run Jest unit test suites (`jest --watchAll=false`) |
| `npm run lint` | Run Expo ESLint checks (`expo lint`) |

---

## 5. Native Builds with EAS

EAS Build profiles are configured in `eas.json` for `development`, `preview`, and `production`:

```bash
# Build development client for iOS or Android
npx eas-cli@latest build --profile development --platform ios
npx eas-cli@latest build --profile development --platform android

# Build internal preview distribution
npx eas-cli@latest build --profile preview --platform all

# Build production store binaries
npx eas-cli@latest build --profile production --platform all
```
