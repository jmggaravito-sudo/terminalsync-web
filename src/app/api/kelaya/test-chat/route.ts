import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type CustomerLanguage = "es" | "en";

type SquareService = {
  id: string;
  name: string;
  durationMinutes?: number;
  price?: string;
};

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
    service: "kelaya-test-chat",
    endpoint: "/api/kelaya/test-chat",
    squareConfigured: Boolean(process.env.SQUARE_ACCESS_TOKEN),
    dryRun: true,
  });
}

export async function POST(req: Request) {
  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Body must be valid JSON" },
      { status: 400 },
    );
  }

  const body = asRecord(payload);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message) {
    return NextResponse.json(
      { ok: false, error: "message is required" },
      { status: 400 },
    );
  }

  const escalated = shouldEscalate(message);
  const reply = await generateReply(message);

  return NextResponse.json({
    ok: true,
    reply,
    escalated,
    dryRun: true,
  });
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
        console.error("[kelaya:test-chat] Square services failed", error);
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

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}
