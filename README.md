# AI Consultation Platform

Started as a bilingual (Arabic/English) AI medical-chat prototype. It's now the architectural
foundation for a much larger **Comprehensive Healthcare Management Platform**: medication
management, drug interaction checking, self-assessment, family accounts, vitals/symptom/vaccination
tracking, monthly PDF reports, an emergency QR card, video consultations, e-prescriptions, a
patient community, and more — rolling out UAE → Qatar → Oman → Saudi Arabia → Egypt, in 6 languages
(Arabic, English, Chinese, Hindi, Spanish, French).

**Current state:** every module listed above is fully built and working end-to-end — AI patient
chat, a separate AI pharmacist chat, medications, self-assessment, family mode, vitals/symptoms/
cycle/vaccinations tracking, reminders (with real SMS/voice/email delivery), health reports,
emergency QR card, expenses, video consultations with a dedicated doctor area, profile sharing,
loyalty points, community, pharmacy with real checkout, a full admin/ops dashboard, and a
mobile-first installable PWA experience. Payments, video, and messaging run against real third-party
providers (PayTabs, Daily.co, Twilio, Resend) — see [Foundation vs. built features](#foundation-vs-built-features)
below for what's real vs. still a dev stub.

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
| Payments | PayTabs hosted-page checkout (pharmacy orders) |
| Video | Daily.co (doctor consultations) |
| Messaging | Twilio (SMS/voice reminders), Resend (transactional email) |
| PWA | Native `manifest.ts`, a hand-rolled service worker (`public/sw.js`), installable + offline-capable |

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
| `PAYTABS_PROFILE_ID`, `PAYTABS_SERVER_KEY` | No | PayTabs hosted-page credentials for pharmacy checkout. Without them, checkout degrades gracefully with a "payment gateway not configured" message instead of erroring. |
| `DAILY_API_KEY`, `DAILY_DOMAIN` | No | Daily.co credentials for video consultations. Without them, room creation fails gracefully with a clear error shown in the UI. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | No | For SMS/voice reminder delivery. Without them, reminders configured for SMS/voice simply don't send. |
| `RESEND_API_KEY` | No | For transactional email (reminders, delegate invites). Without it, email sends are skipped. |
| `CRON_SECRET` | No | Bearer token required by `/api/cron/reminders` to authorize the reminder-dispatch cron job. |

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
system prompt, persistence, emergency escalation), a second AI persona for pharmacist chat,
6-language UI with RTL for Arabic, role-based access (`PATIENT`/`DOCTOR`/`PHARMACIST`/`ADMIN`),
automatic `FamilyGroup`/`PatientProfile` creation on signup and full Family Mode (dependents +
delegates + profile switching), medications (CRUD, dosage schedules, stock tracking, barcode add
flow, drug interaction checking), self-assessment + BMI + Health Score, vitals tracking (with
normal-range badges and trend sparklines), symptom tracking, cycle tracking, vaccinations, health
reports with a print view, an emergency QR card with a public view, expense tracking, profile
sharing via QR/link, loyalty points, a patient community (groups/posts/comments), reminders with
real delivery (SMS/voice via Twilio, email via Resend, dispatched by a cron route), video
consultations (booking, a dedicated `/doctor` area, real Daily.co calls), pharmacy ordering with a
real PayTabs checkout flow, a full admin/ops dashboard (users, drugs, interactions, reports,
chatbot logs, consultations, notifications, analytics — gated to `ADMIN` only), and a mobile-first
PWA (installable manifest, offline-capable service worker, responsive hamburger nav with RTL
support).

**Integration stubs** (a real interface + a dev/mock implementation, ready to swap for a real
provider without touching call sites) — see `src/lib/{otp,push,storage,weather}.ts` and
`src/lib/wearables/*`: SMS OTP (login still uses password auth, not OTP), push notifications
(no `DeviceToken` model yet), file storage (writes to a local `.local-storage` folder instead of
S3/R2), weather data, and Fitbit/Apple Health/Google Fit/Samsung Health. These log to the console
or return synthetic data — not real integrations yet. Payments, video, and reminder delivery
(email/SMS/voice) are **no longer stubs** — they're wired to real providers, see the Tech stack
notes above.

## Architecture

```
src/
  app/
    (auth)/login, signup                # public auth pages
    (app)/layout.tsx                    # requires a session, renders Header + mobile-aware Sidebar
    (app)/chat, chat/[id]                                        # patient AI chat
    (app)/pharmacist-chat, pharmacist-chat/[id]                  # pharmacist AI chat
    (app)/dashboard, medications, vitals, symptoms, cycle, vaccinations,
          reports, emergency-card, share, expenses, consultations,
          pharmacy, community, loyalty, reminders, settings,
          profile/{assessment,family}   # all fully built
    doctor/layout.tsx, doctor/consultations, doctor/consultations/[id]/call
                                         # requireRole(["DOCTOR"]) doctor area, real video calls
    admin/layout.tsx                    # requireRole(["ADMIN"]) gate
    admin/{users,drugs,reports,chatbot-logs,consultations,notifications,analytics}
    api/**                              # one route module per domain — all built
    manifest.ts                         # PWA manifest (auto-served at /manifest.webmanifest)
    offline/page.tsx                    # precached offline fallback
  auth.ts                               # Auth.js v5 config (Credentials + JWT + role)
  lib/
    prisma.ts, gemini.ts, password.ts, validation.ts, session.ts   # built
    audit.ts, interactions.ts, healthScore.ts, qrShare.ts, family.ts,
    locations.ts, crypto.ts, format.ts                             # foundation utilities
    payments.ts, video.ts, email.ts, twilio.ts,
    reminderDispatch.ts                 # real integrations (PayTabs, Daily.co, Resend, Twilio)
    otp.ts, push.ts, storage.ts,
    weather.ts, wearables/*             # remaining dev/mock stubs
  i18n/                                  # dictionaries (6 languages), provider, hook
  components/                            # chat, auth, layout, ui, and one folder per module
public/
  sw.js                                 # hand-rolled service worker (cache-first assets,
                                         # network-first pages, offline fallback)
  icons/                                # PWA app icons (192/512/maskable)
prisma/
  schema.prisma                         # User/FamilyGroup/PatientProfile + ~30 domain models
  seed.ts                               # demo drug catalog + interactions + demo doctors
```

Route protection happens in `(app)/layout.tsx`, `doctor/layout.tsx`, and `admin/layout.tsx` via a
server-side `auth()`/`requireRole()` check (not global `middleware.ts`) because the Credentials
provider and Prisma both require the Node.js runtime, which Edge middleware doesn't provide.

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

Real OTP-based login, push notifications, real wearables OAuth (Fitbit/Apple Health/Google Fit/
Samsung Health), a real weather provider, object storage (S3/R2) in place of the local dev stub,
a licensed drug registry, real HIPAA/GDPR compliance, an automated test suite.

## Known limitations

- No automated tests were added yet.
- Push notifications, OTP login, and wearable sync are still dev stubs (see
  [Foundation vs. built features](#foundation-vs-built-features)) — they log to the console instead
  of doing anything real.
