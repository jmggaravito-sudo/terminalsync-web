import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type IncomingMessage = {
  from: string;
  text?: string;
  type?: string;
  id?: string;
};

type CustomerLanguage = "es" | "en";

type SquareService = {
  id: string;
  name: string;
  durationMinutes?: number;
  price?: string;
};

const KAPSO_BASE_URL =
  process.env.KAPSO_BASE_URL ?? "https://api.kapso.ai/meta/whatsapp/v24.0";

const escalationKeywords = [
  "queja",
  "reclamo",
  "molesto",
  "molesta",
  "demanda",
  "urgente",
  "emergencia",
  "humano",
  "asesor",
  "persona",
  "complaint",
  "upset",
  "angry",
  "urgent",
  "emergency",
  "human",
  "agent",
  "person",
  "manager",
];

const spanishSignals = [
  "hola",
  "buenas",
  "precio",
  "costo",
  "valor",
  "servicio",
  "servicios",
  "cita",
  "agenda",
  "agendar",
  "quiero",
  "necesito",
  "gracias",
  "humano",
  "asesor",
  "persona",
];

const englishSignals = [
  "hello",
  "hi",
  "hey",
  "price",
  "cost",
  "service",
  "services",
  "appointment",
  "booking",
  "book",
  "schedule",
  "available",
  "availability",
  "want",
  "need",
  "thanks",
  "human",
  "agent",
  "person",
];

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "kelaya-kapso-webhook",
    endpoint: "/api/kelaya/kapso",
    kapsoConfigured: Boolean(process.env.KAPSO_API_KEY && process.env.KAPSO_PHONE_NUMBER_ID),
    webhookSecretConfigured: Boolean(process.env.KAPSO_WEBHOOK_SECRET),
    squareConfigured: Boolean(process.env.SQUARE_ACCESS_TOKEN),
  });
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, req)) {
    return NextResponse.json(
      { ok: false, error: "Invalid webhook signature" },
      { status: 401 },
    );
  }

  let payload: unknown;
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json(
      { ok: false, error: "Body must be valid JSON" },
      { status: 400 },
    );
  }

  const messages = extractIncomingMessages(payload);
  const results = [];

  for (const message of messages) {
    if (!message.text) {
      results.push({ from: message.from, skipped: true, reason: "non-text message" });
      continue;
    }

    const escalated = shouldEscalate(message.text);
    const reply = await generateReply(message.text);
    const sendResult = await sendTextMessage(message.from, reply);

    let escalationResult;
    if (escalated && process.env.HUMAN_ESCALATION_PHONE) {
      escalationResult = await sendTextMessage(
        process.env.HUMAN_ESCALATION_PHONE,
        [
          "Caso para revisión humana en Kelaya.",
          `Cliente: ${message.from}`,
          `Mensaje: ${message.text}`,
          `Respuesta automática enviada: ${reply}`,
        ].join("\n"),
      );
    }

    results.push({
      from: message.from,
      messageId: message.id,
      reply,
      escalated,
      sendResult,
      escalationResult,
    });
  }

  return NextResponse.json({ ok: true, processed: messages.length, results });
}

function verifyWebhookSignature(rawBody: string, req: Request): boolean {
  const secret = process.env.KAPSO_WEBHOOK_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const incoming =
    req.headers.get("x-webhook-signature") ??
    req.headers.get("x-kapso-signature") ??
    req.headers.get("x-hub-signature-256") ??
    req.headers.get("x-signature") ??
    "";

  if (!incoming) return false;

  const expectedHex = createHmac("sha256", secret).update(rawBody).digest("hex");
  const normalizedIncoming = incoming.trim().replace(/^sha256=/i, "");

  return safeEqual(expectedHex, normalizedIncoming);
}

function safeEqual(expected: string, incoming: string): boolean {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const incomingBuffer = Buffer.from(incoming, "utf8");
  if (expectedBuffer.length !== incomingBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, incomingBuffer);
}

async function sendTextMessage(to: string, body: string): Promise<unknown> {
  if (process.env.KELAYA_DRY_RUN_REPLIES === "true") {
    console.log("[kelaya:kapso:dry-run]", { to, body });
    return { messages: [{ id: "dry-run" }] };
  }

  const apiKey = process.env.KAPSO_API_KEY;
  const phoneNumberId = process.env.KAPSO_PHONE_NUMBER_ID;

  if (!apiKey || !phoneNumberId) {
    throw new Error("KAPSO_API_KEY and KAPSO_PHONE_NUMBER_ID are required");
  }

  const response = await fetch(`${KAPSO_BASE_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Kapso send failed: ${response.status} ${text}`);
  }

  return response.json();
}

async function generateReply(customerMessage: string): Promise<string> {
  const language = detectCustomerLanguage(customerMessage);

  if (shouldEscalate(customerMessage)) {
    return language === "en"
      ? "Thanks for reaching out. I’ll pass your case to someone on the Kelaya team so they can review it in more detail."
      : "Gracias por escribirnos. Voy a pasar tu caso a una persona del equipo de Kelaya para que pueda revisarlo con más detalle.";
  }

  const normalized = customerMessage.toLowerCase();

  if (normalized.includes("hola") || normalized.includes("buenas") || /\b(hello|hi|hey)\b/.test(normalized)) {
    return language === "en"
      ? "Hi! Thanks for contacting Kelaya. How can we help you today?"
      : "¡Hola! Gracias por escribir a Kelaya. ¿Me cuentas en qué podemos ayudarte hoy?";
  }

  if (mentionsServices(normalized)) {
    if (process.env.SQUARE_ACCESS_TOKEN) {
      const services = await listServices().catch((error) => {
        console.error("[kelaya:kapso] Square services failed", error);
        return [];
      });
      const visibleServices = services.slice(0, 5).map((service) => {
        const duration = service.durationMinutes ? ` — ${service.durationMinutes} min` : "";
        const price = service.price ? ` — ${service.price}` : "";
        return `• ${service.name}${duration}${price}`;
      });

      if (visibleServices.length > 0) {
        return language === "en"
          ? `These are some available services at Kelaya:\n\n${visibleServices.join("\n")}\n\nWhich one are you interested in?`
          : `Estos son algunos servicios disponibles en Kelaya:\n\n${visibleServices.join("\n")}\n\n¿Cuál te interesa?`;
      }
    }

    return language === "en"
      ? "We’ll be happy to help with service information. Which Kelaya service would you like to ask about?"
      : "Con gusto te ayudamos con la información de servicios. ¿Sobre qué servicio de Kelaya quieres consultar?";
  }

  if (mentionsAppointments(normalized)) {
    return language === "en"
      ? "Of course. Tell me which service you want and what day you prefer so we can check available times."
      : "Claro. Dime qué servicio quieres y qué día prefieres para revisar horarios disponibles.";
  }

  return language === "en"
    ? "Thanks for contacting Kelaya. To help you better, can you tell me a little more about what you need?"
    : "Gracias por escribir a Kelaya. Para ayudarte mejor, ¿puedes contarme un poco más sobre lo que necesitas?";
}

function detectCustomerLanguage(message: string): CustomerLanguage {
  const normalized = message.toLowerCase();
  if (/[áéíóúñ¿¡]/i.test(message)) return "es";

  const spanishScore = spanishSignals.reduce(
    (score, signal) => (normalized.includes(signal) ? score + 1 : score),
    0,
  );
  const englishScore = englishSignals.reduce(
    (score, signal) => (normalized.includes(signal) ? score + 1 : score),
    0,
  );

  return englishScore > spanishScore ? "en" : "es";
}

function shouldEscalate(message: string): boolean {
  const normalized = message.toLowerCase();
  return escalationKeywords.some((keyword) => normalized.includes(keyword));
}

function mentionsServices(normalized: string): boolean {
  return ["precio", "costo", "valor", "servicio", "price", "cost", "service"].some((word) =>
    normalized.includes(word),
  );
}

function mentionsAppointments(normalized: string): boolean {
  return ["cita", "agenda", "agendar", "appointment", "booking", "book", "schedule"].some((word) =>
    normalized.includes(word),
  );
}

async function listServices(): Promise<SquareService[]> {
  const data = await squareRequest<{
    objects?: Array<Record<string, unknown>>;
    related_objects?: Array<Record<string, unknown>>;
  }>("/v2/catalog/search", {
    object_types: ["ITEM", "ITEM_VARIATION"],
    include_related_objects: true,
    include_deleted_objects: false,
  });

  const objects = [...(data.objects ?? []), ...(data.related_objects ?? [])];
  const itemNamesById = new Map<string, string>();

  for (const object of objects) {
    if (object.type !== "ITEM") continue;
    const itemData = asRecord(object.item_data);
    if (typeof object.id === "string" && typeof itemData?.name === "string") {
      itemNamesById.set(object.id, itemData.name);
    }
  }

  const services: SquareService[] = [];

  for (const object of objects) {
    if (object.type !== "ITEM_VARIATION") continue;

    const itemVariationData = asRecord(object.item_variation_data);
    if (!itemVariationData) continue;
    if (itemVariationData.available_for_booking !== true) continue;

    const variationName = typeof itemVariationData.name === "string" ? itemVariationData.name : undefined;
    const parentItemId = typeof itemVariationData.item_id === "string" ? itemVariationData.item_id : undefined;
    const parentName = parentItemId ? itemNamesById.get(parentItemId) : undefined;
    const genericVariationName = variationName ? ["normal", "regular"].includes(variationName.toLowerCase()) : false;
    const duplicateVariationName = parentName && variationName ? parentName.toLowerCase() === variationName.toLowerCase() : false;
    const name = parentName && variationName && !genericVariationName && !duplicateVariationName
      ? `${parentName} — ${variationName}`
      : parentName ?? variationName;

    if (!name || typeof object.id !== "string") continue;

    services.push({
      id: object.id,
      name,
      durationMinutes: durationToMinutes(itemVariationData.service_duration),
      price: formatMoney(itemVariationData.price_money),
    });
  }

  return services;
}

async function squareRequest<T>(path: string, body: unknown): Promise<T> {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  if (!accessToken) throw new Error("SQUARE_ACCESS_TOKEN is required");

  const baseUrl = process.env.SQUARE_ENVIRONMENT === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  if (process.env.SQUARE_VERSION) {
    headers["Square-Version"] = process.env.SQUARE_VERSION;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Square request failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<T>;
}

function formatMoney(money: unknown): string | undefined {
  const value = asRecord(money);
  if (typeof value?.amount !== "number" || typeof value.currency !== "string") return undefined;
  return `${(value.amount / 100).toFixed(2)} ${value.currency}`;
}

function durationToMinutes(duration: unknown): number | undefined {
  if (typeof duration !== "number") return undefined;
  return Math.round(duration / 60000);
}

function extractIncomingMessages(payload: unknown): IncomingMessage[] {
  const root = asRecord(payload);
  if (!root) return [];

  const candidates: unknown[] = [];

  if (Array.isArray(root.messages)) candidates.push(...root.messages);

  const data = asRecord(root.data);
  if (Array.isArray(data?.messages)) candidates.push(...data.messages);
  if (data?.message) candidates.push(data.message);

  if (root.message) candidates.push(root.message);

  if (Array.isArray(root.entry)) {
    for (const entry of root.entry) {
      const entryRecord = asRecord(entry);
      if (!Array.isArray(entryRecord?.changes)) continue;

      for (const change of entryRecord.changes) {
        const value = asRecord(asRecord(change)?.value);
        if (Array.isArray(value?.messages)) candidates.push(...value.messages);
      }
    }
  }

  return candidates
    .map(normalizeMessage)
    .filter((message): message is IncomingMessage => Boolean(message));
}

function normalizeMessage(message: unknown): IncomingMessage | undefined {
  const record = asRecord(message);
  if (!record) return undefined;

  const from = typeof record.from === "string"
    ? record.from
    : typeof record.to === "string"
      ? record.to
      : undefined;

  if (!from) return undefined;

  return {
    from,
    text: readText(record),
    type: typeof record.type === "string" ? record.type : undefined,
    id: typeof record.id === "string" ? record.id : undefined,
  };
}

function readText(message: Record<string, unknown>): string | undefined {
  const text = asRecord(message.text);
  if (typeof text?.body === "string") return text.body;
  if (typeof message.body === "string") return message.body;
  if (typeof message.text === "string") return message.text;
  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}
