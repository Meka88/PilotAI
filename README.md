# PilotAI Mission Control

A polished multi-role demo application for showcasing **Meticulous** visual regression / session replay testing with your team.

PilotAI is a fictional AI operations platform (“Mission Control”) with real workflows — not a toy todo app.

## Why this demo works well

- **3 roles with different nav + capabilities**
  - **Global Admin** — cross-org control plane (orgs, seats, all audit)
  - **Admin** — org operator (approve access, manage users/projects)
  - **Explorer** — field analyst (browse, request access, run explorations)
- **10+ pages** including detail views and an access-approval workflow
- **Stateful workflows** persisted in `localStorage` (reset anytime)
- **Meticulous recorder snippet** + **GitHub Actions** upload-assets workflow ready to wire

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and pick a persona on the login screen.

```bash
npm run build    # production build → dist/
npm run preview  # serve the build locally
```

## Demo personas

| Persona | Role | Best for |
|---|---|---|
| Ava Meridian | Global Admin | Orgs, seat pools, system audit |
| Jordan Hale | Admin (Northwind) | Approving access, inviting users |
| Sam Okonkwo | Explorer (Northwind) | Requesting restricted data, launching runs |

## Suggested team walkthrough (8–10 min)

1. **Sign in as Explorer (Sam)**  
   Open **Datasets → Cohort Ledger** (restricted) → **Request access**.
2. **Sign out → Admin (Jordan)**  
   Open **Access Requests** → approve Sam’s request with a note → check **Audit Log**.
3. **Back to Explorer**  
   Cohort Ledger now shows **granted** → open **Projects → Orbit Retention Map** → **Start run**.
4. **Global Admin (Ava)**  
   Open **Organizations**, bump Harbor seats, then show **Users & Roles** across tenants.
5. **Optional UI change for Meticulous**  
   Tweak a label/color on a PR and show the visual diff Meticulous reports.

Use **Reset demo** in the top bar anytime to restore seed data.

## Pages

| Route | Purpose | Roles |
|---|---|---|
| `/login` | Persona picker | public |
| `/` | Mission Control dashboard | all |
| `/projects` | Program list + create | all (create: admin+) |
| `/projects/:id` | Status, datasets, exploration runs | scoped |
| `/datasets` | Catalog + sensitivity | all |
| `/datasets/:id` | Schema + access request | scoped |
| `/analytics` | Insight / funnel metrics | all |
| `/access` | Access request queue | all (review: admin+) |
| `/users` | Invite + role changes | admin+ |
| `/organizations` | Tenant + seat pools | global admin |
| `/audit` | Immutable action trail | admin+ |
| `/settings` | Session + demo tips | all |

## Meticulous setup

### 1. Recorder snippet

Already installed in `index.html` (must stay the first script):

```html
<script
  data-project-id="YOUR_PROJECT_ID"
  src="https://snippet.meticulous.ai/v1/meticulous.js"
></script>
```

Replace `YOUR_PROJECT_ID` with the ID from your [Meticulous dashboard](https://app.meticulous.ai).

### 2. GitHub App + secret

1. Install the [Meticulous GitHub App](https://github.com/apps/alwaysmeticulous/installations/new) on this repo
2. Copy your API token from Meticulous → Project Settings
3. Add GitHub Actions secret: `METICULOUS_API_TOKEN`

### 3. CI workflow

`.github/workflows/meticulous.yml` builds the Vite app and uploads `dist/` via:

`alwaysmeticulous/report-diffs-action/upload-assets@v1`

SPA rewrite is configured so client routes resolve during replay.

### 4. Record base coverage

1. Run `npm run dev` with the real project ID in `index.html`
2. Walk the persona flows above while the recorder is active
3. Open a PR with a small UI change — Meticulous replays and comments diffs

## Stack

- Vite + React 19 + TypeScript
- React Router 7
- Local persisted app store (no backend required)
- Role-based navigation + permission gates

## Notes for presenters

- This is a **client-side demo** — perfect for Meticulous static asset upload
- All mutations write audit events so role switches produce visible state changes
- Design direction: night flight-deck (ink / teal / amber), not the usual purple SaaS look
