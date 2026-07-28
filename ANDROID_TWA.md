# Publishing to Google Play (Trusted Web Activity)

This app is a PWA, not a native Android app. The standard way to get a PWA onto
Google Play is a **Trusted Web Activity (TWA)** — a thin native Android wrapper
that opens your live PWA in a Chrome-powered full-screen view, using
[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) to generate it.

`twa-manifest.json` (project root) and `public/.well-known/assetlinks.json` are
already scaffolded here, pre-filled from `src/app/manifest.ts`. They contain
placeholder values (`REPLACE_WITH_...`) that can't be resolved yet because the
app isn't deployed anywhere public — everything below is blocked on that.

## Prerequisites (none of these exist yet)

1. **A public HTTPS domain** the app is actually deployed to (e.g. Vercel).
   Local `npx prisma dev` + `npm run dev` on `localhost` doesn't count — Google
   Play and Digital Asset Links verification both require a real, stable domain.
2. **A Google Play Developer account** — $25 one-time fee, identity
   verification, tied to your Google account. Sign up at
   [play.google.com/console](https://play.google.com/console).
3. **Java (JDK 17+) and the Android SDK** — not installed in this environment.
   Bubblewrap needs both to build the `.aab`. Simplest path: install
   [Android Studio](https://developer.android.com/studio), which bundles both.

## Steps, once the above exist

1. **Deploy the app** to your real domain. Update `NEXTAUTH_URL` and any
   callback URLs accordingly.
2. **Fill in `twa-manifest.json`**: replace every `REPLACE_WITH_YOUR_DOMAIN.com`
   with your real domain (`host`, `iconUrl`, `maskableIconUrl`, `webManifestUrl`,
   `fullScopeUrl`).
3. **Generate a signing key** and get its SHA-256 fingerprint:
   ```bash
   keytool -genkey -v -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000
   keytool -list -v -keystore android.keystore -alias android
   ```
   Copy the `SHA256:` fingerprint into `public/.well-known/assetlinks.json`
   (replacing `REPLACE_WITH_YOUR_SIGNING_KEY_SHA256_FINGERPRINT`) and into
   `twa-manifest.json`'s `fingerprints` array. Re-deploy so the updated
   `assetlinks.json` is live at `https://yourdomain.com/.well-known/assetlinks.json`
   — Google verifies this file matches your signing key before allowing the
   TWA to run chromeless (without a URL bar).
4. **Build the Android project**:
   ```bash
   npx @bubblewrap/cli init --manifest ./twa-manifest.json
   npx @bubblewrap/cli build
   ```
   This produces a signed `app-release-bundle.aab`.
5. **Upload to Play Console**: create an app listing (store description,
   screenshots, privacy policy URL, content rating questionnaire — this app
   handles health data, so review Play's
   [Health Apps policy](https://support.google.com/googleplay/android-developer/answer/9878809)
   before submitting), upload the `.aab` under Production (or Internal
   Testing first), and submit for review.

## Notes specific to this app

- `start_url` in the manifest is `/dashboard`, which requires a signed-in
  session — first-time TWA users will land on `/login`. That's expected.
- `enableNotifications` is `false` in `twa-manifest.json` since push
  notifications aren't implemented yet (see README's "Foundation vs. built
  features" — `src/lib/push.ts` is still a dev stub). Flip it once that's real.
- The health-data content in this app (medications, vitals, symptoms) will
  likely trigger Play's Health Connect / sensitive-permissions review flow —
  budget extra review time for the first submission.
