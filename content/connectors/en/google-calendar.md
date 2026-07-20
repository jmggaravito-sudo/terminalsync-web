---
name: Google Calendar
logo: /connectors/google-calendar.svg
category: productivity
status: available
simpleTitle: "Your calendar, run by conversation"
simpleSubtitle: "\"What do I have tomorrow?\" \"Book María for Thursday at 3\" — your AI reads and manages your calendar."
devTitle: "Google Calendar MCP Connector"
devSubtitle: "OAuth over the Calendar API — list calendars, upcoming events, create/update/delete events, event detail."
ctaUrl: "https://calendar.google.com"
tokenHelpUrl: "https://console.cloud.google.com/apis/credentials"
manifest:
  mcpServers:
    google-calendar:
      command: npx
      args: ["-y", "google-calendar-mcp"]
      env:
        GOOGLE_CLIENT_ID: "${SECRET:GOOGLE_CLIENT_ID}"
        GOOGLE_CLIENT_SECRET: "${SECRET:GOOGLE_CLIENT_SECRET}"
        GOOGLE_REDIRECT_URI: "http://localhost:3000/auth/callback"
affiliate: false
tagline: "Appointments and agenda, hands-free"
originalAuthor: "Yevhen Romanov"
originalAuthorUrl: "https://www.npmjs.com/package/google-calendar-mcp"
license: "MIT"
---
If your day is a string of appointments — clients, deliveries, calls, visits — your Google Calendar is the real map of your week. This connector lets your AI read it and manage it for you, so you stop juggling the app while you're on the phone with someone.

Ask *"what do I have tomorrow?"* and it reads back your day. Say *"book María for Thursday at 3pm, one hour"* and it creates the event. Ask *"am I free Friday morning?"* and it checks before you commit. It's the assistant who keeps your agenda — except you just talk to it.

### What you can ask

- *"What are my appointments for the rest of the week?"*
- *"Create an event: 'Delivery to warehouse', Thursday 10am, one hour."*
- *"Do I have anything Friday between 9 and 12? If I'm free, book a call with the accountant."*

### What you need

Google Calendar signs in with Google (OAuth), so instead of a simple key you connect it once through a **Google Cloud project**. It's a one-time setup, then it works on every device:

1. Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) and create a project (or reuse one).
2. Enable the **Google Calendar API** for that project.
3. Create an **OAuth client ID** and add `http://localhost:3000/auth/callback` as an authorized redirect URL.
4. Copy the **Client ID** and **Client Secret** and paste them when the Lab asks for `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
5. First use opens a browser window to approve access to your calendar. After that it's silent.

The credentials are stored encrypted in your Keychain and synced across your machines — configure once, ready everywhere.

> Heads up: the Google Cloud setup is the one genuinely fiddly part. If you get stuck, the in-app support chat can walk you through it step by step. Creating and deleting events changes your real calendar, so the AI confirms before it books or cancels.

--- dev ---

`google-calendar-mcp` (Yevhen Romanov) speaks the Calendar API over OAuth. Capabilities verified against the official README:

- Retrieve calendar lists and events.
- Get upcoming events across all calendars.
- Create, update, and delete calendar events; fetch a specific event's detail.
- Check availability for a time window before booking.

Auth is OAuth 2.0 (`AUTH_METHOD=google_cloud`). Config env: `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` from a Google Cloud OAuth client, plus `GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback` (a fixed literal, not a secret). First run opens the browser consent; tokens persist after.

Terminal Sync keeps the client id/secret + refresh token in your Keychain, synced encrypted across machines with AES-256-GCM. Because create/update/delete mutate a real calendar, the desktop gates those behind a confirmation step.

License: MIT. Source: npmjs.com/package/google-calendar-mcp.
