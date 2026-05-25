# Peppies

A dark-mode, mobile-first PWA for peptide injection tracking, dose calculation, and daily health logging. Built to be private, offline-friendly, and pleasant to use on a phone.

**Live app:** published on `.replit.app`
**Status:** active personal project

---

## What it does

Peppies is a single-page app that tracks your peptide protocol alongside the day-to-day metrics that matter when you're on one. Everything lives on your device — there is no backend, no account, no telemetry, no cloud sync.

### Peptide tools
- **Injection log** — record every shot with peptide name, dose, site, and time. Quick-repeat your last injection in one tap.
- **Dose calculator** — convert between mg, mcg, mL, and IU using your vial concentration and syringe size. Saves your last calculation per peptide.
- **Cycle tracker** — start, pause, and end protocols. Optional browser notification when a cycle wraps up.
- **History view** — chronological list of past injections and cycles, plus CSV export.
- **Body-map site picker** — rotate injection sites visually.

### Daily metrics
- **Weight log** with trend
- **Sleep log** (hours + quality)
- **Hydration tracker** (cups / liters)
- **Step tracker** with daily goal
- **Calorie & macro log** — barcode scanner via Open Food Facts, manual entry, macro ring

### Affiliate / referral system
- **Save your peptide vendor's referral** (name + code + link). A prominent **Shop Peptides** button appears on the home screen and opens the vendor in your browser.
- **Share with friends** — the share button generates a special Peppies link (`?ref=...&url=...&name=...`) that pre-fills your referral during their onboarding. Counts how many friends you've shared with.
- **Personal link slot** — a separate, private second link (for example, one a friend shared with you after you signed up). Never included when you share Peppies.

### Other
- **14-step How-to guide** built into the app
- **Backup / restore** as a JSON file (all localStorage in one export)
- **Disclaimer onboarding** the first time you open it
- **Installable as a PWA** on iOS and Android home screens

---

## Stack

- **React 18** + **TypeScript**
- **Vite** (build + dev server, with PWA / service worker plugin)
- **Tailwind CSS** + **shadcn/ui** primitives
- **wouter** for routing
- **framer-motion** for animations
- **lucide-react** for icons
- **react-query** for in-memory state caching where useful
- **localStorage** for every piece of user data — no database, no API, no auth

Monorepo managed with **pnpm workspaces**.

---

## Repository layout

```
.
├── artifacts/
│   ├── peppies/              ← the actual app
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   ├── index.css
│   │   │   ├── pages/        ← Home, Log, Calculator, History, Nutrition, Steps, Settings
│   │   │   ├── components/   ← cards, sheets, dialogs, shadcn ui/
│   │   │   ├── hooks/        ← useInjections, useAffiliate, useWeight, useSleep, ...
│   │   │   ├── utils/        ← backup, affiliateShare, exportCsv, openFoodFacts, ...
│   │   │   ├── data/         ← peptide reference data
│   │   │   └── lib/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── api-server/           ← unused scaffold (kept for monorepo wiring)
│   └── mockup-sandbox/       ← unused scaffold (kept for monorepo wiring)
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

> The `api-server` and `mockup-sandbox` folders are inert scaffolds from the monorepo template. Peppies itself uses neither — all the app code is under `artifacts/peppies/`.

---

## Running locally

Requires Node 20+ and pnpm.

```bash
pnpm install
pnpm --filter @workspace/peppies run dev
```

The app boots on the port assigned by the `PORT` environment variable (Vite reads it). Visit the URL printed in the terminal.

To produce a production build:

```bash
pnpm --filter @workspace/peppies run build
```

To typecheck:

```bash
cd artifacts/peppies && pnpm exec tsc --noEmit
```

---

## Data & privacy

- **No backend.** Nothing leaves your browser unless you tap Share.
- **No analytics.** No tracking pixels, no third-party scripts, no server logs of your activity.
- **All data lives in localStorage** keyed by the `peppies_*` prefix.
- **Backup** in Settings exports a single JSON file containing every `peppies_*` key. Restoring overwrites the same keys.
- **Share** uses the native Web Share API where available (iMessage / WhatsApp / Mail / AirDrop), with a clipboard fallback.

---

## Disclaimer

Peppies is a personal logging tool, not medical advice. It is intended for adults who have already decided, in consultation with a qualified healthcare provider, to use peptides. The app does not prescribe, diagnose, or treat anything. Use at your own discretion.

---

## License

Personal project — no public license is granted. If you'd like to use any of this, please get in touch first.
