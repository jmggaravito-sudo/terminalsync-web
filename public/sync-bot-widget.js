/**
 * Terminal Sync — web chat widget for terminalsync.ai
 * --------------------------------------------------------------------
 * Drop-in floating chat button for the marketing site. Same backend as
 * the in-app HelpBubble (n8n webhook j1CWMGmncSyICQ6U). Distinguishes
 * itself from app traffic via `channel: "web"` so analytics in the
 * workflow can split web visitor questions from in-app help-bubble
 * questions.
 *
 * INSTALLATION (in the website repo, NOT this one):
 *
 *   <script src="/sync-bot-widget.js" defer></script>
 *
 * That's it. The widget appends itself to <body> on DOMContentLoaded.
 *
 * Defaults can be overridden by setting window.SyncBotConfig BEFORE
 * the script tag:
 *
 *   <script>
 *     window.SyncBotConfig = {
 *       webhookUrl: "https://n8n.nexflowai.net/webhook/sync-ai-inbound",
 *       greeting:   "¿Cómo puedo ayudarte?",
 *       buttonText: "Ayuda",
 *       position:   "bottom-right",  // or "bottom-left"
 *       primaryColor: "#7c3aed",
 *     };
 *   </script>
 *   <script src="/sync-bot-widget.js" defer></script>
 *
 * SECURITY
 *   The webhook URL is intentionally embedded in the page. It's a
 *   public-by-URL endpoint (n8n webhook auth is by-URL, not by-key),
 *   the same one the desktop app uses. No API key, no credentials,
 *   no secrets ship in this file.
 *
 * PRIVACY
 *   - No tracking. No analytics SDK. No cookies set by the widget.
 *   - The conversation lives in memory only; refreshing the page
 *     clears it. Session ID is regenerated on every load (no
 *     persistent identifier).
 *   - The user's text is sent to the webhook. Standard support-chat
 *     expectation; mention it in the site's privacy policy if needed.
 */
(function () {
  "use strict";

  // Idempotent: if the page accidentally embeds this twice, the second
  // load is a no-op.
  if (window.__syncBotLoaded) return;
  window.__syncBotLoaded = true;

  const userConfig =
    typeof window.SyncBotConfig === "object" && window.SyncBotConfig !== null
      ? window.SyncBotConfig
      : {};

  const CONFIG = {
    webhookUrl:
      userConfig.webhookUrl ||
      "https://n8n.nexflowai.net/webhook/sync-ai-inbound",
    greeting:
      userConfig.greeting ||
      "¡Hola! Soy Sync, el asistente de Terminal Sync. ¿En qué te ayudo?",
    placeholder:
      userConfig.placeholder || "Escribí tu pregunta…",
    buttonText: userConfig.buttonText || "Ayuda",
    headerTitle: userConfig.headerTitle || "Sync — Asistente",
    position: userConfig.position || "bottom-right",
    primaryColor: userConfig.primaryColor || "#7c3aed",
    maxMessageChars: userConfig.maxMessageChars || 2000,
    requestTimeoutMs: userConfig.requestTimeoutMs || 60000,
  };

  // ── session id (per-load, not persisted) ────────────────────────
  function newSessionId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return "web-" + crypto.randomUUID();
    }
    return (
      "web-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10)
    );
  }
  const SESSION_ID = newSessionId();

  // ── escape HTML for safe rendering ──────────────────────────────
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Minimal markdown: bold, code spans, line breaks. NO links, no html
  // passthrough. The bot's responses are short text + occasional
  // backticks; keep parsing tight.
  function renderBotText(text) {
    const safe = escapeHtml(text);
    return safe
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  // ── styles (inlined so no extra CSS file to host) ────────────────
  const styles = `
    .sync-bot-launcher,
    .sync-bot-panel,
    .sync-bot-panel * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .sync-bot-launcher {
      position: fixed;
      ${CONFIG.position === "bottom-left" ? "left: 20px;" : "right: 20px;"}
      bottom: 20px;
      z-index: 2147483600;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 18px;
      border: none;
      border-radius: 999px;
      background: ${CONFIG.primaryColor};
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .sync-bot-launcher:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
    }
    .sync-bot-launcher[aria-expanded="true"] { display: none; }
    .sync-bot-launcher svg { width: 18px; height: 18px; }
    .sync-bot-panel {
      position: fixed;
      ${CONFIG.position === "bottom-left" ? "left: 20px;" : "right: 20px;"}
      bottom: 20px;
      z-index: 2147483600;
      width: min(380px, calc(100vw - 40px));
      height: min(560px, calc(100vh - 40px));
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.24);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    .sync-bot-panel[data-open="true"] { display: flex; }
    .sync-bot-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      background: ${CONFIG.primaryColor};
      color: #fff;
    }
    .sync-bot-header-title { font-size: 14px; font-weight: 600; }
    .sync-bot-close {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      padding: 0 4px;
      opacity: 0.85;
    }
    .sync-bot-close:hover { opacity: 1; }
    .sync-bot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f7f7f9;
    }
    .sync-bot-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      margin-bottom: 10px;
      font-size: 13.5px;
      line-height: 1.45;
      word-wrap: break-word;
    }
    .sync-bot-msg-bot {
      background: #fff;
      color: #1a1a1a;
      border: 1px solid #e7e7ec;
      margin-right: auto;
    }
    .sync-bot-msg-user {
      background: ${CONFIG.primaryColor};
      color: #fff;
      margin-left: auto;
    }
    .sync-bot-msg code {
      background: rgba(0, 0, 0, 0.06);
      padding: 1px 6px;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12.5px;
    }
    .sync-bot-msg-user code {
      background: rgba(255, 255, 255, 0.2);
    }
    .sync-bot-typing {
      font-size: 12px;
      color: #888;
      margin: 6px 14px;
      font-style: italic;
    }
    .sync-bot-input-row {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid #e7e7ec;
      background: #fff;
    }
    .sync-bot-input {
      flex: 1;
      border: 1px solid #e0e0e6;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 13.5px;
      resize: none;
      outline: none;
      min-height: 40px;
      max-height: 120px;
      font-family: inherit;
    }
    .sync-bot-input:focus { border-color: ${CONFIG.primaryColor}; }
    .sync-bot-send {
      background: ${CONFIG.primaryColor};
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 0 16px;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s ease;
    }
    .sync-bot-send:disabled { opacity: 0.5; cursor: not-allowed; }
    .sync-bot-footer {
      padding: 8px 16px 12px;
      font-size: 11px;
      color: #999;
      text-align: center;
      background: #fff;
    }
    .sync-bot-footer a { color: ${CONFIG.primaryColor}; text-decoration: none; }
    @media (max-width: 480px) {
      .sync-bot-panel {
        width: calc(100vw - 16px);
        height: calc(100vh - 16px);
        bottom: 8px;
        ${CONFIG.position === "bottom-left" ? "left: 8px;" : "right: 8px;"}
        border-radius: 12px;
      }
    }
  `;

  // ── DOM construction ───────────────────────────────────────────
  function build() {
    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    const launcher = document.createElement("button");
    launcher.className = "sync-bot-launcher";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "sync-bot-panel");
    launcher.setAttribute("aria-label", "Abrir chat de ayuda");
    launcher.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      <span>${escapeHtml(CONFIG.buttonText)}</span>
    `;

    const panel = document.createElement("div");
    panel.className = "sync-bot-panel";
    panel.id = "sync-bot-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", CONFIG.headerTitle);
    panel.innerHTML = `
      <div class="sync-bot-header">
        <div class="sync-bot-header-title">${escapeHtml(CONFIG.headerTitle)}</div>
        <button class="sync-bot-close" aria-label="Cerrar chat">×</button>
      </div>
      <div class="sync-bot-messages" aria-live="polite"></div>
      <div class="sync-bot-input-row">
        <textarea class="sync-bot-input" rows="1" placeholder="${escapeHtml(CONFIG.placeholder)}" maxlength="${CONFIG.maxMessageChars}"></textarea>
        <button class="sync-bot-send" type="button">Enviar</button>
      </div>
      <div class="sync-bot-footer">
        Powered by <a href="https://terminalsync.ai" target="_blank" rel="noopener">Terminal Sync</a>
      </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    return {
      launcher,
      panel,
      messages: panel.querySelector(".sync-bot-messages"),
      input: panel.querySelector(".sync-bot-input"),
      send: panel.querySelector(".sync-bot-send"),
      close: panel.querySelector(".sync-bot-close"),
    };
  }

  // ── messaging ──────────────────────────────────────────────────
  function appendMessage(messagesEl, role, text) {
    const div = document.createElement("div");
    div.className =
      "sync-bot-msg " + (role === "user" ? "sync-bot-msg-user" : "sync-bot-msg-bot");
    div.innerHTML = role === "user" ? escapeHtml(text) : renderBotText(text);
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function appendTyping(messagesEl) {
    const div = document.createElement("div");
    div.className = "sync-bot-typing";
    div.textContent = "Sync está escribiendo…";
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  async function callBot(message) {
    // Request shape matches `InboundMessage` in
    // src-tauri/src/sync_ai/mod.rs of the desktop app — same workflow,
    // same field names, same expected response shape (AgentReply).
    // `channel: "web"` distinguishes web traffic from app traffic in
    // n8n analytics. The "context" fields are public-by-nature (no
    // user PII unless the visitor typed it into `message`).
    const body = {
      channel: "web",
      session_id: SESSION_ID,
      user_id: null,
      message,
      user_locale: (navigator.language || "es-AR").slice(0, 5),
      context: {
        page: "marketing-site",
        user_plan: null,
        os: detectOS(),
        app_version: "web",
        product_knowledge: "",
      },
    };

    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), CONFIG.requestTimeoutMs);

    try {
      const res = await fetch(CONFIG.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: ctl.signal,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data || typeof data.response !== "string") {
        throw new Error("unexpected response shape");
      }
      return { text: data.response, escalated: !!data.escalated };
    } finally {
      clearTimeout(timer);
    }
  }

  function detectOS() {
    const ua = navigator.userAgent || "";
    if (/Mac/i.test(ua)) return "macos";
    if (/Win/i.test(ua)) return "windows";
    if (/Linux/i.test(ua)) return "linux";
    if (/Android/i.test(ua)) return "android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
    return "other";
  }

  // ── wire up ────────────────────────────────────────────────────
  function init() {
    const ui = build();

    let isOpen = false;
    let isSending = false;

    function openPanel() {
      ui.panel.setAttribute("data-open", "true");
      ui.launcher.setAttribute("aria-expanded", "true");
      isOpen = true;
      if (!ui.messages.children.length) {
        appendMessage(ui.messages, "bot", CONFIG.greeting);
      }
      // small delay because of the display:none → display:flex transition
      setTimeout(() => ui.input.focus(), 50);
    }

    function closePanel() {
      ui.panel.removeAttribute("data-open");
      ui.launcher.setAttribute("aria-expanded", "false");
      isOpen = false;
    }

    async function handleSend() {
      const text = ui.input.value.trim();
      if (!text || isSending) return;
      isSending = true;
      ui.send.disabled = true;
      appendMessage(ui.messages, "user", text);
      ui.input.value = "";
      ui.input.style.height = "auto";
      const typingEl = appendTyping(ui.messages);

      try {
        const reply = await callBot(text);
        typingEl.remove();
        appendMessage(ui.messages, "bot", reply.text);
      } catch (err) {
        typingEl.remove();
        appendMessage(
          ui.messages,
          "bot",
          "Disculpá, hubo un problema conectando. Probá de nuevo en unos segundos o escribinos a soporte@nexflowai.net.",
        );
        // Log to console so site maintainers can see widget errors.
        // eslint-disable-next-line no-console
        console.error("[sync-bot-widget]", err);
      } finally {
        isSending = false;
        ui.send.disabled = false;
        ui.input.focus();
      }
    }

    ui.launcher.addEventListener("click", openPanel);
    ui.close.addEventListener("click", closePanel);
    ui.send.addEventListener("click", handleSend);
    ui.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
    // textarea auto-grow
    ui.input.addEventListener("input", () => {
      ui.input.style.height = "auto";
      ui.input.style.height = Math.min(ui.input.scrollHeight, 120) + "px";
    });
    // Esc closes the panel
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) {
        closePanel();
        ui.launcher.focus();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
