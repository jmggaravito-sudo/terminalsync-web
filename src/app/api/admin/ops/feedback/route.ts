import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const revalidate = 0;

type RawRow = Record<string, unknown>;

const FEEDBACK_TABLE_CANDIDATES = [
  "product_feedback",
  "feedback",
  "user_feedback",
  "app_feedback",
  "suggestions",
  "user_suggestions",
  "feature_requests",
  "contact_messages",
] as const;

function firstString(row: RawRow, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function firstDate(row: RawRow): string | null {
  return firstString(row, ["created_at", "submitted_at", "inserted_at", "updated_at", "timestamp", "date"]);
}

function mapFeedbackRow(row: RawRow, table: string) {
  const id = firstString(row, ["id", "uuid", "feedback_id"]) ?? `${table}-${Math.random().toString(36).slice(2)}`;
  const title = firstString(row, ["title", "subject", "category", "type"]) ?? "Feedback sin título";
  const body = firstString(row, ["message", "feedback", "comment", "content", "description", "text", "body"]) ?? null;
  const email = firstString(row, ["email", "user_email", "contact_email", "customer_email"]);
  const name = firstString(row, ["name", "user_name", "customer_name"]);
  const status = firstString(row, ["status", "state", "review_status"]) ?? "nuevo";
  const priority = firstString(row, ["priority", "severity", "impact"]);
  const source = firstString(row, ["source", "page", "path", "url"]);
  return {
    id,
    table,
    title,
    body,
    email,
    name,
    status,
    priority,
    source,
    createdAt: firstDate(row),
  };
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      items: [],
      table: null,
      checkedTables: FEEDBACK_TABLE_CANDIDATES,
      setupNeeded: true,
      message: "Supabase admin env is not configured for feedback inbox.",
    });
  }

  const checked: string[] = [];
  const errors: Record<string, string> = {};

  for (const table of FEEDBACK_TABLE_CANDIDATES) {
    checked.push(table);
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .limit(50);

    if (error) {
      errors[table] = error.message;
      continue;
    }

    const items = (data ?? [])
      .map((row) => mapFeedbackRow(row as RawRow, table))
      .sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));

    return NextResponse.json({
      table,
      checkedTables: checked,
      setupNeeded: false,
      items,
    });
  }

  return NextResponse.json({
    items: [],
    table: null,
    checkedTables: checked,
    setupNeeded: true,
    message:
      "No feedback table was found with the expected names. Connect the n8n feedback flow to one of: feedback, user_feedback, product_feedback, app_feedback, suggestions, user_suggestions, feature_requests, contact_messages.",
    errors,
  });
}
