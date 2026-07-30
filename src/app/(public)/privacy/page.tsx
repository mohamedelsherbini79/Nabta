export const metadata = {
  title: "Privacy Policy — Nabta",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col gap-6 text-sm text-zinc-700 dark:text-zinc-300">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Privacy Policy</h1>
        <p className="mt-1 text-xs text-zinc-400">Last updated: {new Date().toISOString().slice(0, 10)}</p>
      </div>

      <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
        <p className="font-semibold text-amber-800 dark:text-amber-200">This app is a prototype / demo.</p>
        <p className="mt-1 text-amber-800 dark:text-amber-200">
          Nabta is under active development and testing. It is not built to HIPAA/GDPR-grade compliance, has not
          undergone independent security or legal review, and should not be used to store information about a real
          medical emergency or to make real treatment decisions. Do not enter data you are not comfortable being
          part of a testing environment.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">What we collect</h2>
        <p>When you create an account and use the app, we store the information you provide directly, including:</p>
        <ul className="list-disc space-y-1 ps-5">
          <li>Account details: name, email address, password (stored as a salted hash, never in plain text), preferred language.</li>
          <li>Health information you choose to enter: medications and dosing schedules, vitals readings, logged symptoms, self-assessments, vaccination records, menstrual cycle entries, blood type, allergies, and chronic conditions.</li>
          <li>Family/dependent profiles you create, and any family members you grant access to your data.</li>
          <li>Conversations with the AI chat assistant (patient and pharmacist chat), which are processed by Google&apos;s Gemini API to generate responses.</li>
          <li>Consultation bookings and, if you join a video consultation, participation in a Daily.co-hosted video call.</li>
          <li>Pharmacy orders and expense records you create.</li>
          <li>Basic usage/audit data (e.g. sign-in events, which actions were taken) used for security and debugging.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Third parties</h2>
        <p>Depending on which features are active, some data is shared with the service providers that power them:</p>
        <ul className="list-disc space-y-1 ps-5">
          <li><strong>Google Gemini</strong> — AI chat messages are sent to Google&apos;s Gemini API to generate responses.</li>
          <li><strong>Daily.co</strong> — if you join a video consultation, your name and connection are shared with Daily.co to host the call.</li>
          <li><strong>PayTabs</strong> — if you complete a pharmacy checkout, payment details are handled directly by PayTabs; we do not store your card details.</li>
          <li><strong>Twilio</strong> — if SMS/voice medication reminders are enabled, your phone number is used to send them.</li>
          <li><strong>Resend</strong> — if email notifications are enabled (e.g. family invites), your email address is used to send them.</li>
        </ul>
        <p>Any of these integrations that are not configured in a given deployment simply do not run — no data is sent to a provider that isn&apos;t active.</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">How data is stored and secured</h2>
        <p>
          Data is stored in a PostgreSQL database. Passwords are hashed with bcrypt and never stored or logged in
          plain text. Selected sensitive fields are encrypted at rest. Access to another person&apos;s health data
          requires that person to explicitly grant it (family sharing, or a time-limited QR/link share). These are
          reasonable technical practices, not a certification or legal guarantee of compliance with any specific
          health-data regulation.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Your choices</h2>
        <ul className="list-disc space-y-1 ps-5">
          <li>You can edit or delete most of the information you&apos;ve entered directly within the app.</li>
          <li>You can revoke a family member&apos;s access, or revoke an emergency/share QR link, at any time.</li>
          <li>To request deletion of your account and associated data, contact us using the details below.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Contact</h2>
        <p>
          Questions about this policy or your data can be sent to{" "}
          <a className="text-teal-700 underline dark:text-teal-400" href="mailto:mohamed.elsherbini79@gmail.com">
            mohamed.elsherbini79@gmail.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
