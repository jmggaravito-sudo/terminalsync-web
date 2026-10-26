---
name: Business Memory
logo: /skills/memoria-negocio.svg
category: productivity
vendors: ["claude"]
author: "TerminalSync"
status: available
tagline: "Your assistant remembers your business — prices, suppliers, decisions — no more repeating yourself every week"
description: "Keeps a memoria-negocio.md file in your workspace with the essentials of your business — clients, suppliers, prices, decisions, and open items —, records only what you confirm, and shows you what it wrote down. It checks that memory before answering, never re-asks for what it already knows, and never stores credentials or sensitive personal data. It is operating memory, not bookkeeping."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude"]
---
## When to use

- You keep repeating the same context to your assistant every week: who your main client is, what you charge them, who supplies you.
- Before asking anything about your business, so the answer uses YOUR information (prices, suppliers, past decisions) instead of generic advice.
- After a conversation that produced new facts (a supplier raised costs, a client changed address) and you want them written down for good.

Do not use it to store sensitive data (passwords, card numbers, ID documents) or as an accounting system: it is operating memory, not your books.

## What it does

- Maintains a `memoria-negocio.md` file in your workspace with fixed sections: The essentials (what you sell and to whom), Clients, Suppliers, Prices and costs, Decisions (dated), and Open items.
- Records only what you actually said: every fact is shown to you as it is written and can be corrected or deleted; anything you did not confirm stays marked "unconfirmed".
- Checks memory before answering: if it already knows Ana's price, it does not ask again — it uses it, and says where it came from ("according to what I have recorded").
- Reads the file before writing: if the fact already exists (for example, a supplier price), it updates that entry in its section — it never creates duplicates or treats a recorded fact as missing.
- When data is missing for an answer, it says what it knows (from memory) and what is missing, instead of assuming.

It never stores credentials, card numbers, or sensitive personal data; it does not infer facts you never gave it; and it is not an accounting or legal system — it remembers what your business agreed and charged, it does not certify anything.

## How to use

1. First time: tell it the essentials of your business (what you sell, to whom, main prices, key suppliers). It writes them into `memoria-negocio.md`.
2. Day to day, correct out loud: "supplier X raised prices 10%" — it updates the file and shows you what changed.
3. Ask freely: "what did we charge Ana last month?" — it answers from memory and points out anything it does not have.
4. Review the file whenever you want: it is plain text, yours, editable; deleting a line deletes the memory.

## Best for

Owners who already work with the assistant weekly and are tired of explaining their business from scratch. It is the difference between an assistant that answers generically and one that answers with your prices, your suppliers, and your history — while keeping everything in a file you can read, correct, or delete.
