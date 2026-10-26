---
name: 13-Week Cash Flow
logo: /skills/flujo-de-caja.svg
category: finance
vendors: ["claude"]
author: "TerminalSync"
status: available
tagline: "Your cash, week by week for 13 weeks: see where it breaks before it breaks"
description: "From your current balance, your receivables and your bills, it builds a week-by-week 13-week cash projection, flags the first week that goes negative, and closes with a Verdict (0–100 score, traffic light, and a single highest-impact action). It only uses numbers you provided — missing figures are requested or labeled as assumptions — and it is not financial advice: if the shortfall is severe, the financing decision is referred to your bank or advisor."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude"]
---
## When to use

- You catch yourself thinking "can I make payroll on Friday?", "I have several invoices going out and I don't know if I reach the end of the month", or "I want to know which week my cash runs out".
- You have your current bank balance and a rough — even on paper — idea of what comes in and goes out over the next three months.
- You are about to make a money decision this week (hire, buy inventory, take a bridge loan) and want to see it against your cash calendar instead of a gut feeling.

Do not use it for formal accounting, taxes, or to "predict" sales nobody confirmed: it projects only with the numbers you hand it.

## What it does

- Builds a week-by-week table (13 weeks): starting balance + inflows − outflows = projected balance, using the numbers you provided.
- Flags the first week cash goes negative (the break) and how many weeks of cushion you have today.
- Separates facts (an issued invoice, agreed payroll) from assumptions, and labels every assumption as such.
- Closes with a **Verdict**: a 0–100 score of how solid your cash position is given the data you provided, a traffic light (🟢 80+ you can act; 🟡 50–79 act, but close these gaps first; 🔴 <50 missing data or an imminent break), a single highest-impact action, and the reminder that the score reflects what the model could see — your bank's real numbers rule.

It never invents sales, collections, or expenses; when a figure is missing it asks for it or marks it as an assumption with its visible impact. It is not financial advice: it does not recommend loans or investments, and if the break is severe it says clearly that the financing decision belongs to your bank or a financial advisor.

## How to use

1. Give it three inputs: current cash balance, expected inflows by week (client, amount, week), and known fixed outflows (payroll, rent, suppliers).
2. Get the 13-week table with the break flagged (if any) and the Verdict.
3. Iterate: change a collection or an expense and ask it to "recalculate" — the table updates with the same structure.
4. Take the Verdict's single action this week; recalculate when you have new numbers.

## Best for

Small-business owners who run cash "in their head" and discover shortfalls when they are already emergencies. It does not replace an accountant or a bank: its job is to turn the numbers you already have into a decision-ready calendar, and to tell you clearly when the situation needs a professional.
