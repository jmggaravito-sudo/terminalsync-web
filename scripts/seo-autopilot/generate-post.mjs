/**
 * SEO Blog Autopilot — generates one bilingual blog post per run.
 *
 * Usage:
 *   node scripts/seo-autopilot/generate-post.mjs
 *   DRY_RUN=1 node scripts/seo-autopilot/generate-post.mjs
 *   TOPIC_SLUG=rag-vs-project-memory node scripts/seo-autopilot/generate-post.mjs
 *
 * Env vars:
 *   ANTHROPIC_API_KEY  — required (unless DRY_RUN=1)
 *   DRY_RUN            — skip API call, write fixture content
 *   TOPIC_SLUG         — force a specific topic (else picks next unwritten)
 *
 * Output: writes two .md files to content/blog/en/ and content/blog/es/
 *         with ISO date prefix: YYYY-MM-DD-<slug>.md
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../.");

// ── helpers ──────────────────────────────────────────────────────────────────

function today() {
  return process.env.POST_DATE ?? new Date().toISOString().slice(0, 10);
}

function loadTopics() {
  const raw = fs.readFileSync(path.join(__dirname, "topics.json"), "utf8");
  return JSON.parse(raw);
}

function existingSlugs(lang) {
  const dir = path.join(ROOT, "content", "blog", lang);
  if (!fs.existsSync(dir)) return new Set();
  return new Set(
    fs.readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, ""))
  );
}

function pickTopic(topics) {
  const forcedSlug = process.env.TOPIC_SLUG;
  if (forcedSlug) {
    const t = topics.find((t) => t.slug === forcedSlug);
    if (!t) throw new Error(`Topic not found: ${forcedSlug}`);
    return t;
  }
  const written = existingSlugs("en");
  const remaining = topics.filter((t) => !written.has(t.slug));
  if (remaining.length === 0) {
    console.log("All topics written — cycling back to the first.");
    return topics[0];
  }
  return remaining[0];
}

// ── Claude API ────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert content writer for TerminalSync, an AI workspace product.

PRODUCT POSITIONING (always stay true to this):
- TerminalSync is not a chat. It is a digital office where your work lives.
- Each workspace connects to a real folder with actual files.
- The AI always works on the latest version of your documents — no uploading.
- Each project has its own memory, files, and context.
- Switch between Claude, GPT, and Gemini without losing context.
- The AI can keep working even when you close the computer.
- Automate full workflows, not just conversations.
- Target user: non-technical business owners, directors, managers, consultants.

TONE:
- Clear, direct, no jargon
- Practical and specific (use concrete examples and numbers when helpful)
- Honest — acknowledge what the product doesn't do if relevant
- End every post with a CTA to download TerminalSync

KEYWORDS to weave in naturally: AI workspace, project memory, context, multi-AI,
AI operating system, persistent memory, folder, automation, agents.

STRUCTURE for every post:
- H1: compelling title (already provided)
- Intro paragraph: hook that names the pain
- 3-5 H2 sections with practical content
- Closing CTA block (single paragraph + bold "TerminalSync" link)

FORMAT: Return valid Markdown with YAML frontmatter.
Frontmatter fields: title, description (max 160 chars), date, keywords (array), category, author.`;

async function callClaude(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
      system: SYSTEM_PROMPT,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

function buildPrompt(topic, lang) {
  const t = lang === "es" ? topic.es : topic.en;
  const date = today();
  return `Write a blog post for TerminalSync.

Language: ${lang === "es" ? "Spanish (Latin America, voseo)" : "English"}
Title: ${t.title}
Angle: ${t.angle}
Category: ${topic.category}
Date: ${date}
Pain point addressed: ${topic.painPoint}

Requirements:
- 600-900 words
- Practical, specific, zero fluff
- 3-5 concrete examples or scenarios
- End with a CTA paragraph mentioning TerminalSync
- YAML frontmatter must include: title, description, date (${date}), keywords, category, author

Return ONLY the markdown content (frontmatter + body). No explanations, no wrapping.`;
}

// ── dry run fixture ───────────────────────────────────────────────────────────

function dryRunContent(topic, lang, date) {
  const t = lang === "es" ? topic.es : topic.en;
  return `---
title: "${t.title}"
description: "Dry run placeholder — ${t.angle}"
date: "${date}"
keywords: ["AI workspace", "project memory"]
category: "${topic.category}"
author: "TerminalSync"
---

**DRY RUN** — this post was generated without calling the Claude API.

Topic slug: \`${topic.slug}\`
Angle: ${t.angle}
`;
}

// ── write file ────────────────────────────────────────────────────────────────

function writePost(lang, slug, date, content) {
  const dir = path.join(ROOT, "content", "blog", lang);
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${date}-${slug}.md`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, content, "utf8");
  return filepath;
}

// ── main ──────────────────────────────────────────────────────────────────────

export async function generatePost() {
  const topics = loadTopics();
  const topic = pickTopic(topics);
  const date = today();
  const isDry = process.env.DRY_RUN === "1";

  console.log(`Topic: ${topic.slug}`);
  console.log(`Date:  ${date}`);
  console.log(`Dry:   ${isDry}`);

  let enContent, esContent;

  if (isDry) {
    enContent = dryRunContent(topic, "en", date);
    esContent = dryRunContent(topic, "es", date);
  } else {
    console.log("Generating EN post...");
    enContent = await callClaude(buildPrompt(topic, "en"));
    console.log("Generating ES post...");
    esContent = await callClaude(buildPrompt(topic, "es"));
  }

  const enPath = writePost("en", topic.slug, date, enContent);
  const esPath = writePost("es", topic.slug, date, esContent);

  console.log(`Written: ${enPath}`);
  console.log(`Written: ${esPath}`);

  return { slug: topic.slug, date, enPath, esPath };
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generatePost().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
