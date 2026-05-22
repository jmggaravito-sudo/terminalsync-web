import type { Metadata } from "next";
import { LegalShell } from "@/components/landing/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — TerminalSync",
  description:
    "How TerminalSync accesses, uses, stores, shares, retains, and deletes Google user data and other personal information.",
  alternates: {
    canonical: "https://terminalsync.ai/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalShell
      lang="en"
      title="Privacy Policy"
      subtitle="This policy explains what TerminalSync collects, including Google user data, why we collect it, how we protect it, and how you can request deletion."
      lastUpdated="Last updated: May 21, 2026"
    >
      <h2>1. Who we are</h2>
      <p>
        TerminalSync is a desktop application that syncs terminal state,
        developer-tool configuration, encrypted AI assistant context, and related
        workspace metadata across a user's own devices. Legal and privacy
        contact: <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a>.
      </p>

      <h2>2. Google user data accessed</h2>
      <p>
        If you choose Google Drive as your sync provider, TerminalSync uses
        Google OAuth and the limited Google Drive <code>drive.appdata</code>
        scope. This scope lets TerminalSync create, read, update, list, and
        delete only files inside TerminalSync's hidden app-specific Google Drive
        application data folder. TerminalSync cannot browse or read your general
        Google Drive files with this scope.
      </p>
      <p>TerminalSync may access the following Google user data:</p>
      <ul>
        <li>
          <strong>OAuth grant data</strong>: authorization code, access token,
          refresh token, token expiry, and OAuth state values needed to connect
          and refresh your Google Drive session.
        </li>
        <li>
          <strong>App-specific Drive file metadata</strong>: file and folder IDs,
          names, MIME types, sizes, modified times, and parent folder
          relationships for TerminalSync-created files in the Google Drive
          appDataFolder.
        </li>
        <li>
          <strong>App-specific Drive file content</strong>: encrypted TerminalSync
          sync blobs such as terminal/session state, sync indexes, settings,
          and encrypted developer-tool or AI-assistant configuration files that
          you choose to sync.
        </li>
        <li>
          <strong>Drive quota information</strong>: storage quota and usage values
          returned by the Google Drive API so the app can warn you about sync
          capacity problems.
        </li>
      </ul>

      <h2>3. How Google user data is used</h2>
      <p>
        TerminalSync uses Google user data only to provide user-requested sync
        features between your own devices: authenticate Google Drive, create and
        find TerminalSync folders, upload encrypted sync data, download encrypted
        sync data, update sync data, delete sync data when you delete it in the
        app, and show storage/quota status.
      </p>
      <p>
        TerminalSync does not use Google user data for advertising, profiling,
        sale, or unrelated analytics. TerminalSync does not use Google user data
        to train generalized AI or machine-learning models.
      </p>

      <h2>4. Local encryption and protection</h2>
      <p>
        Before TerminalSync uploads sync content to Google Drive, sensitive sync
        payloads are encrypted locally on your device using AES-256-GCM. The
        encryption material is stored locally on your device using OS-protected
        storage or app-private files, depending on platform/build. Google Drive
        stores the encrypted blobs; TerminalSync's servers do not receive a copy
        of those synced file contents.
      </p>
      <p>
        Google OAuth refresh tokens are stored on your device in TerminalSync's
        application support/configuration area with restricted local file
        permissions or OS-protected storage, depending on platform/build. Access
        tokens are used to call Google APIs and are refreshed when needed.
      </p>

      <h2>5. Data sharing</h2>
      <p>
        TerminalSync does not sell Google user data and does not share Google
        user data with advertising networks, data brokers, or third-party AI
        model providers. Google user data is shared only as necessary to operate
        the feature you requested:
      </p>
      <ul>
        <li>
          <strong>Google</strong>: TerminalSync sends OAuth and Drive API
          requests to Google so it can read/write the TerminalSync appDataFolder
          in your Google account.
        </li>
        <li>
          <strong>Your own devices</strong>: encrypted TerminalSync sync data may
          be downloaded by your other signed-in TerminalSync desktop apps when
          you connect the same Google account.
        </li>
      </ul>
      <p>
        TerminalSync account, billing, website, and transactional-email data may
        be processed by service providers such as Supabase, Stripe, Vercel,
        Resend, and Rewardful. These providers are used to operate accounts,
        payments, hosting, email, and affiliate attribution. They are not given
        access to your Google Drive appDataFolder contents by TerminalSync.
      </p>

      <h2>6. Other personal data we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong>: email address, name and avatar if you
          provide them, authentication status, and basic account settings.
        </li>
        <li>
          <strong>Subscription data</strong>: plan, billing status, invoices, and
          limited payment metadata processed by Stripe.
        </li>
        <li>
          <strong>Operational logs</strong>: timestamps, app/version events,
          non-fatal errors, and security/audit events needed to operate and
          protect the service.
        </li>
        <li>
          <strong>Cookies</strong>: authentication, language/preference cookies,
          and affiliate attribution cookies when applicable. We do not use
          cross-site advertising cookies.
        </li>
      </ul>

      <h2>7. Retention and deletion</h2>
      <p>
        Google Drive appDataFolder files remain in your Google account until you
        delete them in TerminalSync, disconnect Google Drive and remove the app's
        data from your Google account, or request deletion from us. OAuth tokens
        stored locally remain until you disconnect Google Drive, sign out,
        uninstall/reset the app, revoke TerminalSync access in your Google
        Account, or request deletion assistance.
      </p>
      <p>
        TerminalSync account data is retained while your account is active. If
        you request account deletion, we delete or anonymize personal account
        data within 30 days unless we must retain limited records for legal,
        tax, security, fraud-prevention, or dispute-resolution reasons. Billing
        records may be retained for up to 7 years where required by law.
      </p>
      <p>
        To request deletion of your account or data, email
        <a href="mailto:privacy@terminalsync.ai"> privacy@terminalsync.ai</a>
        from the email address associated with your account. You may also revoke
        Google access at any time from your Google Account permissions page.
      </p>

      <h2>8. Security</h2>
      <p>
        We use least-privilege OAuth scopes, HTTPS/TLS for API calls,
        device-local encryption for sensitive sync payloads, restricted local
        permissions for secrets, access controls for production systems, and
        operational monitoring to protect the service.
      </p>

      <h2>9. Changes</h2>
      <p>
        If we materially change this policy, we will update this page and, when
        appropriate, notify users by email or in-app notice before the change
        takes effect.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions or privacy requests: <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a>.
      </p>
    </LegalShell>
  );
}
