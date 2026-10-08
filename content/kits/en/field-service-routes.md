---
name: Field Service Routes Kit
logo: /logos/ts-kit.svg
category: operations
status: available
tagline: "Turn the day's job list into a real route — measured drive times, a stop order that respects your windows, and a crew brief — instead of planning by feel."
description: "An operations bundle for the owner or dispatcher of a local service business that runs on visits — cleaning, repairs, deliveries, property showings — who plans the day from a spreadsheet of jobs: read the list, measure the real drive time between stops, propose an order that respects time windows, and hand the crew a brief they can actually drive."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: google-sheets
    reason: "Holds the day's job list — addresses, time windows, job notes — and is where the finished route (stop order, drive times, ETAs) gets written back, so the plan lives next to the jobs instead of dying in a chat message."
  - kind: connector
    slug: google-maps
    reason: "Turns addresses into real geography: geocodes every stop, computes travel times between them, and pulls directions — the difference between planning a route and guessing one."
  - kind: skill
    slug: internal-comms
    reason: "Turns the ordered route into a dispatch brief the crew can execute: first stop, drive times, time windows, what to bring, who to call on arrival."
---
## Who it is for

An owner or dispatcher of a local service business that runs on visits — cleaning, repairs and maintenance, deliveries, mobile services, property showings — who keeps the day's or week's jobs in a spreadsheet and has to answer "in what order do we do these, and can we actually fit them all?" every morning.

Use it if you plan routes for yourself or a small crew, and the planning today happens in your head: you look at a list of addresses and estimate.

## What it helps you do

This kit covers the list-to-route loop of a service day:

- Read **the day's jobs straight from your spreadsheet** — one row per job, with address, time window if any, and notes.
- **Measure the route instead of estimating it**: geocode every stop, get the real drive time between stops, and see which order makes sense.
- **Propose a stop order that respects time windows** ("the bakery is 8–10, the office is any time after 2") and the total time the day adds up to.
- **Write the route back into the sheet** — stop order and estimated arrival next to each job — so the plan lives where the jobs live.
- Turn it into a **crew brief**: stops in order, drive times, windows, what to bring — ready to send before the first stop.

The expected outcome is a day planned against measured travel times, with a written route and a brief the crew can follow — instead of a gut-feel order that falls apart by the third stop.

## What's included

### Connectors

- **Google Sheets** — reads the job list (addresses, time windows, notes) and writes the finished route back next to each job, so the plan is a column in your sheet, not a message that scrolls away.
- **Google Maps** — turns each address into coordinates, computes the travel times between stops (distance matrix), and pulls step-by-step directions for the driver. Travel time is the number this kit exists to get right.

### Skills

- **Internal Comms** — turns the ordered route into a structured dispatch brief: stops in order with drive times, time windows to respect, what to bring, and who to call on arrival — written for the people executing it, not for the owner's records.

## How to use it

1. Install the kit, connect Google Sheets through your Google Cloud project (one-time OAuth setup), and connect Google Maps with a Google Maps Platform API key.
2. Keep a sheet with one row per job: client, address, time window if there is one, and a note column. It can be as simple as "Jobs — October 5".
3. Ask: *"Read today's jobs from my Jobs sheet, get the drive time between the stops, and propose an order that respects the time windows. Tell me the total drive time and what time we'd finish."*
4. Review the order, then ask it to write the stop number and estimated arrival back into the sheet.
5. Ask Internal Comms to draft the crew brief: *"Turn this route into a short brief for the team — stops in order, drive times, windows, what to bring."*
6. When the day changes — a cancellation, an urgent job — ask for the same plan without the cancelled stop, or with the new one inserted where it fits.

## Why these pieces belong together

The kit is coherent because it follows the real loop of a service day, not a pile of maps-and-spreadsheet tools:

- Google Sheets holds **what to do** — the jobs, in the place the business already keeps them.
- Google Maps holds **where it is in space** — how far apart the stops really are, and how long the driving actually takes.
- Internal Comms turns both into **the handoff** — the brief the crew executes.

Installed separately, the owner reads the list, guesses the order from street names, and texts something informal. Installed together, the kit gives one path: **read the jobs → measure the route → order the stops → write it back → brief the crew**.

It shares Google Sheets with the Bookkeeping & Tax Handoff Kit and Internal Comms with several kits, but the purpose is different: this is the only kit grounded in *physical stops and travel time*. Bookkeeping reads sheets to build an accountant packet; Team Operations reads a task board for work status; Client Meetings runs the loop around a call. This kit plans where the van goes.

## Limits

- **It is not a routing solver.** The assistant orders stops sensibly using the measured travel times, but for large routes (roughly 25+ stops) with hard constraints, dedicated routing software does a better job — this kit is for the service day a human can still eyeball.
- **Travel times are estimates.** Traffic at drive time can change them; the route is a plan to start from, not a promise of arrival.
- Google Maps requires a Google Maps Platform API key with billing enabled — Google charges per call, so quota and cost are yours to watch. Google Sheets needs the one-time Google Cloud OAuth setup.
- It does not dispatch to drivers' phones, track vehicles in real time, or collect proof of delivery — the plan is written; execution is on the crew.
- It does not message customers ("we're on our way") — customer notifications stay in whatever channel you already use with them.
- Sheet write-back overwrites the cells you point it at — review what will be written before confirming.
