# AI Consultation Platform

Started as a bilingual (Arabic/English) AI medical-chat prototype. It's now the architectural
foundation for a much larger **Comprehensive Healthcare Management Platform**: medication
management, drug interaction checking, self-assessment, family accounts, vitals/symptom/vaccination
tracking, monthly PDF reports, an emergency QR card, video consultations, e-prescriptions, a
patient community, and more — rolling out UAE → Qatar → Oman → Saudi Arabia → Egypt, in 6 languages
(Arabic, English, Chinese, Hindi, Spanish, French).

**Current state:** the AI chat feature is fully working end-to-end. Everything else described above
exists as **schema + route skeleton + integration stubs** — see
[Foundation vs. built features](#foundation-vs-built-features) below. Building out each module is
future, phase-by-phase work.

**This is a prototype/demo.** It does not store real patient records and is not built to
HIPAA/GDPR-grade compliance — see [Security notes](#security-notes).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4, RTL via logical properties (`ms-*`, `me-*`, `text-start`, ...) |
| Database | PostgreSQL via Prisma ORM (new `prisma-client` generator + `@prisma/adapter-pg`) |
| Auth | Auth.js v5 (`next-auth@beta`), Credentials provider, JWT sessions, `bcryptjs` password hashing, role-based access (`PATIENT`/`DOCTOR`/`PHARMACIST`/`ADMIN`) |
| AI | `@google/genai`, streaming responses from Gemini |
| i18n | Lightweight custom context + JSON dictionaries (`src/i18n`), cookie-based locale, 6 languages |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in real values:

```bash
cp .env.example .env.local
```

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. See options below. |
| `GEMINI_API_KEY` | Yes | Free key from [Google AI Studio](https://aistudio.google.com/apikey) — no credit card required. Without it, `/api/chat` fails fast with a clear error. |
| `GEMINI_MODEL` | No | Defaults to `gemini-flash-latest` (Google's rolling alias for the current flash-tier model — avoids hardcoding a model ID that later gets deprecated for new API keys). |
| `AUTH_SECRET` | Yes | Random secret for session signing. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. |
| `ENCRYPTION_KEY` | Yes | 32-byte base64 key for at-rest encryption of sensitive columns (e.g. future wearable OAuth tokens, see `src/lib/crypto.ts`). Same generation command as above. |

**Database options:**

- **Quick local dev (no install needed):** run `npx prisma dev` in a separate terminal — it starts a
  local Postgres-compatible server and prints a `DATABASE_URL` to use. This is what was used to
  build and verify this project. Note: it's ephemeral dev tooling, not meant for anything beyond
  local experimentation, and data may not survive a machine restart.
- **Real local Postgres:** install Postgres (or run it via Docker) and point `DATABASE_URL` at it.
- **Hosted free tier:** [Neon](https://neon.tech), [Supabase](https://supabase.com), or
  [Railway](https://railway.app) all offer free Postgres instances.

### 3. Apply the database schema

```bash
npx prisma db push
```

(`db push` is used instead of `migrate dev` because migrations require shadow-database privileges
that some lightweight/hosted Postgres instances don't grant — fine for a prototype with no
migration history to preserve. Switch to `prisma migrate dev` once you have a stable, persistent
database.)

### 4. Seed the demo drug catalog

```bash
npx prisma db seed
```

Seeds ~35 common medications and a curated set of known drug interactions (see `prisma/seed.ts`).
Idempotent — safe to re-run; it skips if `DrugCatalog` already has rows.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login` — sign up for
an account, then start chatting.

**Note:** if you change `prisma/schema.prisma` and run `npx prisma generate` while `npm run dev` is
already running, restart the dev server. The `PrismaClient` singleton in `src/lib/prisma.ts` is
cached on `globalThis` to survive Next.js Fast Refresh, but that means it does **not** pick up a
regenerated client's new models until the process restarts.

## Foundation vs. built features

**Fully built and working:** signup/login, the AI chat itself (streaming, personalized safety
system prompt, persistence, emergency escalation), 6-language UI with RTL for Arabic, role field on
`User`, automatic `FamilyGroup`/`PatientProfile` creation on signup, medications (CRUD, dosage
schedules, stock tracking, barcode add flow, drug interaction checking), self-assessment + BMI +
Health Score on the dashboard, vitals tracking (blood pressure, glucose, temperature, weight, SpO2,
heart rate — with normal-range badges and a trend sparkline per reading type).

**Schema + route skeleton only** (placeholder pages under `src/app/(app)/*` and `src/app/admin/*`,
real Prisma models, no business logic yet): reminders (beyond the per-medication dose checklist),
symptoms, cycle tracking, vaccinations, reports, emergency card, profile sharing, expenses,
consultations, pharmacist chat, pharmacy orders, community, loyalty points, admin dashboards.

**Integration stubs** (a real interface + a dev/mock implementation, ready to swap for a real
provider without touching call sites) — see `src/lib/{otp,email,push,payments,video,storage,
weather}.ts` and `src/lib/wearables/*`: SMS OTP, email delivery, push notifications, payments,
video consultations, file storage, weather data, and Fitbit/Apple Health/Google Fit/Samsung Health.
None of these are real integrations — they log to the console or return synthetic data.

## Architecture

```
src/
  app/
    (auth)/login, signup, verify-otp    # public auth pages
    (app)/layout.tsx                    # requires a session, renders Header + Sidebar
    (app)/chat, chat/[id]               # chat UI — fully built
    (app)/dashboard, medications, vitals, symptoms, cycle, vaccinations,
          reports, emergency-card, share, expenses, consultations,
          pharmacist-chat, pharmacy, community, loyalty, settings,
          profile/{assessment,family}   # placeholder pages (schema exists, UI doesn't yet)
    admin/layout.tsx                    # requireRole(["ADMIN","DOCTOR"]) gate
    admin/{users,drugs,reports,chatbot-logs,consultations,notifications,analytics}
    api/auth/[...nextauth], auth/signup, chat, conversations   # built
  auth.ts                               # Auth.js v5 config (Credentials + JWT + role)
  lib/
    prisma.ts, gemini.ts, password.ts, validation.ts, session.ts   # built
    audit.ts, interactions.ts, healthScore.ts, qrShare.ts, family.ts,
    locations.ts, crypto.ts, format.ts                             # foundation utilities
    otp.ts, email.ts, push.ts, payments.ts, video.ts, storage.ts,
    weather.ts, wearables/*                                        # integration stubs
  i18n/                                  # dictionaries (6 languages), provider, hook
  components/                            # chat, auth, layout, ui
prisma/
  schema.prisma                         # User/FamilyGroup/PatientProfile + ~30 domain models
  seed.ts                               # demo drug catalog + interactions
```

Route protection happens in `(app)/layout.tsx` and `admin/layout.tsx` via a server-side `auth()`/
`requireRole()` check (not global `middleware.ts`) because the Credentials provider and Prisma both
require the Node.js runtime, which Edge middleware doesn't provide.

**Data model:** every clinical record (medications, vitals, reminders, ...) hangs off a
`PatientProfile`, not `User` directly, so Family Mode works from day one — a dependent (child,
elderly parent) is a `PatientProfile{userId: null}` inside a `FamilyGroup`, while a "medical
delegate" is a second real `User` granted access via `FamilyDelegate`. See `src/lib/family.ts` for
the single access-check helper (`canAccessProfile`) that every family-scoped route should use.

The Gemini system prompt (`src/lib/gemini.ts`) enforces: general-information-only framing (no
definitive diagnoses), no medication/dosage prescriptions, a mandatory disclaimer on every
substantive reply, and emergency symptoms are escalated to "seek care immediately" before anything
else. A persistent `EmergencyNotice` and `DisclaimerBanner` are shown in the UI independent of the
model's output, as a second layer of safety.

## Security notes

Role-based access control, an `AuditLog` model + `lib/audit.ts` helper, and at-rest encryption for
sensitive columns (`lib/crypto.ts`) are in place as reasonable technical practice — this is **not**
a claim of HIPAA/GDPR compliance, which requires legal/process work (BAAs, data residency, audits)
independent of the code.

## Out of scope (not yet started)

Full UI/business logic for each placeholder module (medication CRUD, interaction checking UI,
report generation, video calling, payments, etc. — see
[Foundation vs. built features](#foundation-vs-built-features)), any real third-party integration
(SMS, payments, video, wearables OAuth, pharmacy partners, a licensed drug registry), real
HIPAA/GDPR compliance, automated test suite.

## Known limitations

- The conversation sidebar (and new module nav) is hidden on narrow (mobile) viewports; chat itself
  remains usable full-width.
- No automated tests were added yet.
