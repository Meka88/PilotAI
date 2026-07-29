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

### Why tests looked “green” but missed UI changes

A green GitHub **Meticulous** check often means **assets uploaded successfully**, not that meaningful screenshots were compared.

If simulations show a **white screen / 400**, replays never reach real UI → no useful diffs → check stays green.

Common causes we fixed in this repo:
1. Recorder script included in the CI production build (can 400 during simulation)
2. Broken SPA rewrite rules on Meticulous hosting → **404 Requested path could not be found**
3. Recording on `npm run dev` while CI replays a production `dist/` build

Use the official catch-all rewrite only:

```yaml
rewrites: |
  [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
```

`serve-handler` still serves real files in `/assets` first; custom negative-lookahead rules can break matching and cause 404s.

### 1. Recorder snippet

The snippet stays in `index.html` for local recording. Vite **strips it from production CI builds**.

```html
<script
  data-project-id="YOUR_PROJECT_ID"
  src="https://snippet.meticulous.ai/v1/meticulous.js"
></script>
```

### 2. GitHub App + secret

1. Install the [Meticulous GitHub App](https://github.com/apps/alwaysmeticulous/installations/new) on **this** repo (`Meka88/PilotAI`)
2. Add GitHub Actions secret: `METICULOUS_API_TOKEN`

### 3. Record against the same build CI uses (important)

```bash
npm install
VITE_METICULOUS_RECORD=true npm run build
VITE_METICULOUS_RECORD=true npm run preview
```

Open http://localhost:4173 and record **one workflow per browser tab**:

1. Explorer → Assets → Cohort Ledger → I need clearance → Submit
2. Admin → Clearance desk → Grant clearance → Apply decision
3. Explorer → Workstreams → launch exploration
4. Global Admin → Tenants → change seats

In Meticulous → Sessions → open each → **Add to selected sessions**.

### 4. Then open a PR with a real UI change

Watch **Test runs** in the Meticulous dashboard (not only the GitHub green check). You want screenshots of real pages, not white screens.

## Stack

- Vite + React 19 + TypeScript
- React Router 7
- Local persisted app store (no backend required)
- Role-based navigation + permission gates

## Notes for presenters

- This is a **client-side demo** — uses Meticulous static asset upload
- Record on **preview (production build)**, not only Vite dev
- Green CI ≠ reviewed diffs; always open the Meticulous test run UI
- Design is currently a light Ops Console (top nav)
