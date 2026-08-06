"use client";

import { usePathname } from "next/navigation";

/**
 * Floating public-contact WhatsApp bubble for the marketing site.
 *
 * Deliberately NOT the TSync Bridge number (the one wired to
 * `TSync Bridge · Inbound`, which hardcodes every inbound message to JM's
 * own session-control pipeline). That number is for controlling your own
 * running AI agents from WhatsApp — mixing public visitor messages into it
 * would route strangers into your personal command channel. This button
 * points at a separate, dedicated Kapso number via env var so the two
 * never collide.
 *
 * Renders nothing until NEXT_PUBLIC_CONTACT_WHATSAPP_NUMBER is set (no
 * number provisioned yet) and hides itself under /admin (internal tool,
 * not a place for a public contact bubble).
 */

const RAW_NUMBER = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP_NUMBER ?? "";

const GREETING: Record<string, string> = {
  es: "Hola, quiero saber más sobre TerminalSync",
  en: "Hi, I'd like to know more about TerminalSync",
};

export function WhatsAppFloatingButton({ lang }: { lang: string }) {
  const pathname = usePathname() || "";
  const digits = RAW_NUMBER.replace(/[^0-9]/g, "");

  if (!digits) return null;
  if (pathname.includes("/admin")) return null;

  const text = encodeURIComponent(GREETING[lang] ?? GREETING.es);
  const href = `https://wa.me/${digits}?text=${text}`;
  const label = lang === "es" ? "Escribinos por WhatsApp" : "Message us on WhatsApp";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      style={{
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: 40,
        width: "56px",
        height: "56px",
        borderRadius: "9999px",
        background: "#25d366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
      }}
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="#fff" aria-hidden="true">
        <path d="M16.01 3C9.38 3 4 8.38 4 15.01c0 2.32.66 4.49 1.8 6.34L4 29l7.85-1.75a12.9 12.9 0 0 0 4.16.69h.01c6.63 0 12.01-5.38 12.01-12.01C28.03 8.38 22.65 3 16.01 3zm0 21.8c-1.36 0-2.7-.35-3.86-1.01l-.28-.16-4.66 1.04 1.06-4.55-.18-.29a9.72 9.72 0 0 1-1.5-5.2c0-5.4 4.4-9.8 9.82-9.8 2.62 0 5.08 1.02 6.93 2.87a9.73 9.73 0 0 1 2.87 6.93c0 5.4-4.4 9.17-9.2 9.17zm5.36-6.87c-.29-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.66.15-.2.29-.76.96-.93 1.16-.17.2-.34.22-.63.07-.29-.15-1.24-.46-2.37-1.47-.87-.78-1.46-1.74-1.63-2.03-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.6-.91-2.19-.24-.58-.48-.5-.66-.51h-.56c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.03c.15.2 2.06 3.15 5 4.41.7.3 1.24.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.74-.71 1.98-1.4.24-.68.24-1.27.17-1.4-.07-.12-.27-.2-.56-.34z" />
      </svg>
    </a>
  );
}
