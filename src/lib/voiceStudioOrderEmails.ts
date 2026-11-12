import { formatDuration, USD } from "@/components/voice-studio/cartPricing";
import { parseQuoteItems } from "@/lib/voiceStudioQuoteIntake";

export function voiceStudioTestOrderEmails(order: {
  id: string; email: string; total: number; items: unknown; opsUrl: string;
}) {
  const choices = parseQuoteItems(order.items);
  if (!choices || !Array.isArray(order.items)) throw new Error("Invalid order items");
  const summary = choices.map((item, index) => {
    const { title, seconds } = (order.items as Array<{ title?: string; seconds: number }>)[index];
    const safeTitle = (typeof title === "string" ? title : "YouTube video").replace(/[\r\n\t]+/g, " ").slice(0, 200);
    const service = item.service === "LIP" ? "LIP — Spanish dubbing with lip-sync" : "DUB — Spanish dubbing";
    const extras = item.shorts.map((short) => `  • Spanish Short / Reel: ${short} seconds`).join("\n");
    const url = `https://www.youtube.com/watch?v=${item.id.slice(8)}`;
    return `• ${safeTitle} (${formatDuration(seconds)}) — ${service}\n  ${url}${extras ? `\n${extras}` : ""}`;
  }).join("\n\n");
  const amount = `USD ${USD.format(order.total / 100)}`;
  return {
    client: {
      to: order.email,
      subject: "[TEST] Voice Studio — Order confirmation",
      text: `Thanks for your Voice Studio order!\n\nOrder: ${order.id}\nPayment verified: ${amount}\n\n${summary}\n\nThis is a sandbox order. You were not charged, and no video will be produced.\n`,
    },
    team: {
      subject: "[TEST] Voice Studio — New paid test order",
      text: `Sandbox only — do not start production.\n\nOrder: ${order.id}\nCustomer: ${order.email}\nTest payment verified: ${amount}\n\n${summary}\n\nReview quote: ${order.opsUrl}\n`,
    },
  };
}
