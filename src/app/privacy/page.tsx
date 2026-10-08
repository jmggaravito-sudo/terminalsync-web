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
      lastUpdated="Last updated: October 7, 2026"
    >
      <h2>1. Who we are</h2>
      <p>
        Terminal Sync (also written TerminalSync or TS) is a desktop AI workspace
        application. Users organize documents and selected emails into separate
        workspaces, ask questions using that context, and sync their work across
        their own devices. Legal and privacy
        contact: <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a>.
      </p>

      <h2>2. Google user data accessed</h2>
      <p>
        Gmail is optional and connected separately from Drive. When you connect
        Gmail, Terminal Sync requests <code>https://www.googleapis.com/auth/gmail.readonly</code>
        to search and read messages, including subjects, senders, recipients,
        dates, message bodies, and selected file attachments. This permission
        does not allow sending, deleting, moving, marking, or modifying email.
        Viewing mail in Inbox does not add it to an AI workspace. You choose
        which messages to import using “Send to a workspace”.
      </p>
      <p>
        The optional Drive file integration uses <code>drive.file</code> for
        files you explicitly select or create with the app. This is separate
        from the hidden sync folder described below.
      </p>
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
          and refresh your Google Drive or Gmail session.
        </li>
        <li>
          <strong>App-specific Drive file metadata</strong>: file and folder IDs,
          names, MIME types, sizes, modified times, and parent folder
          relationships for TerminalSync-created files in the Google Drive
          appDataFolder.
        </li>
        <li>
          <strong>App-specific Drive file content</strong>: TerminalSync sync
          data such as terminal/session state, sync indexes, settings, project
          files you choose to sync (stored in your Drive in their original
          format), and encrypted payloads (secrets, credentials, memory and
          AI-assistant conversations are encrypted on-device before upload).
        </li>
        <li>
          <strong>Drive quota information</strong>: storage quota and usage values
          returned by the Google Drive API so the app can warn you about sync
          capacity problems.
        </li>
      </ul>

      <h2>3. How Google user data is used</h2>
      <p>
        Gmail data is used for user-requested email search, message viewing,
        attachment import, and workspace questions. Selected messages and
        supported attachments are saved on your computer as context sources.
        When you ask the AI a question, enabled context may be transmitted with
        your request to the AI service to generate an answer and source citations.
        You can exclude or pause a source to keep it out of subsequent requests,
        or remove its imported copy from context. This does not delete the original
        message in Gmail. Gmail OAuth credentials are not included in AI prompts.
      </p>
      <p>
        TerminalSync uses Google user data only to provide user-requested sync
        features between your own devices: authenticate Google Drive, create and
        find TerminalSync folders, upload sync data (sensitive payloads are
        encrypted on-device first), download sync data, update sync data, delete
        sync data when you delete it in the app, and show storage/quota status.
      </p>
      <p>
        TerminalSync does not use Google user data for advertising, profiling,
        sale, or unrelated analytics. Terminal Sync prohibits using Google user data to develop, improve, or
        train generalized or non-personalized AI or machine-learning models.
        This restriction applies to Terminal Sync and every provider processing
        that data on our behalf.
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
        user data with advertising networks or data brokers. Selected Google data
        can be sent to AI providers when you request an AI answer. Google user
        data is shared only as necessary to operate
        the feature you requested:
      </p>
      <ul>
        <li>
          <strong>Google</strong>: TerminalSync sends OAuth, Gmail, and Drive API
          requests to Google to read selected Gmail messages, operate on selected
          Drive files, and read/write the TerminalSync appDataFolder in your account.
        </li>
        <li>
          <strong>Your own devices</strong>: encrypted TerminalSync sync data may
          be downloaded by your other signed-in TerminalSync desktop apps when
          you connect the same Google account.
        </li>
      </ul>
      <p>
        <strong>AI processing:</strong> the included TerminalSync AI sends your
        request and enabled workspace context through Cloudflare to Z.ai
        (Zhipu AI). Selected Gmail bodies and attachment text may be part of that
        context. If you use a supported provider with your own credentials,
        requests go to that provider. The model provider receives the context
        needed to answer; this is not device-only processing.
      </p>
      <p>
        <strong>Provider requirements:</strong> providers may process Google
        user data only to deliver the user-requested feature. They are not
        permitted to use it to develop, improve, or train generalized or
        non-personalized AI or machine-learning models. A provider must support
        this restriction through applicable contractual terms and processing
        controls before it is eligible to receive Google user data. This policy
        does not claim that Google has approved the integration.
      </p>
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
        Imported Gmail messages and attachments remain in your workspace until
        you remove their saved copies. Disconnecting Gmail or revoking Google
        access stops future mailbox access but does not automatically erase
        messages already imported into workspaces, conversation history, or
        synced copies on your devices. Remove those separately. A copy that was
        already sent to an AI provider is subject to that provider&apos;s retention
        policy; disconnecting Gmail cannot recall it. The original mailbox
        messages remain in Gmail and are not deleted by Terminal Sync.
      </p>
      <p>
        Google Drive appDataFolder files remain in your Google account until you
        delete them in TerminalSync, disconnect Google Drive and remove the app's
        data from your Google account, or request deletion from us. OAuth tokens
        stored locally remain until you disconnect the relevant Google integration, sign out,
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
      <p>
        Conversations you have with the support assistant are stored for up
        to 90 days for quality control.
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
