"use client";

import { Fragment } from "react";
import { HelpTip } from "@/components/ui/HelpTip";
import {
  buildGlossaryRegex,
  lookupTerm,
} from "@/lib/marketplace/glossary";

/**
 * Render a string while auto-attaching a small "?" tooltip to the
 * FIRST occurrence of each business-vocabulary term in the glossary.
 *
 * Decision: "first occurrence only" per text block — repeating the
 * tooltip after every CRM/lead/deal would look like spam. The reader
 * sees the definition once and is expected to follow context for the
 * rest.
 *
 * For multi-line text (e.g. description_md) the caller should split
 * on newlines and render one `<GlossaryText>` per line; otherwise
 * the regex is anchored at the FULL string and the "once per block"
 * rule applies to the whole paragraph (which is usually what we want).
 *
 * This component intentionally does NOT process markdown. If the
 * source has `**bold**` or `[links](url)` we render them as literal
 * characters. The bundle pages already render description_md via a
 * separate markdown pipeline, so this is for plain-string fields
 * (tagline, sample prompts, why_it_helps) only.
 */
export function GlossaryText({ text }: { text: string }) {
  if (!text) return null;

  const re = buildGlossaryRegex();
  const seen = new Set<string>();
  const out: Array<string | { match: string; key: string }> = [];

  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) out.push(text.slice(lastIndex, m.index));
    const matched = m[0];
    const key = matched.toLowerCase().replace(/s$/, "");
    if (seen.has(key)) {
      // Already glossed this term — render plain.
      out.push(matched);
    } else {
      seen.add(key);
      out.push({ match: matched, key });
    }
    lastIndex = m.index + matched.length;
  }
  if (lastIndex < text.length) out.push(text.slice(lastIndex));

  return (
    <>
      {out.map((chunk, i) => {
        if (typeof chunk === "string") return <Fragment key={i}>{chunk}</Fragment>;
        const entry = lookupTerm(chunk.match);
        if (!entry) return <Fragment key={i}>{chunk.match}</Fragment>;
        return (
          <Fragment key={i}>
            {chunk.match}
            <HelpTip text={entry.definition} ariaLabel={`Qué es ${chunk.match}`} />
          </Fragment>
        );
      })}
    </>
  );
}
