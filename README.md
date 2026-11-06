# Reconnect — studio win-back SaaS demo

A small working demo of a multi-tenant SaaS platform that helps fitness studios
reconnect with former members through SMS campaigns and an AI conversation agent.

## What it shows

- **Two studios, one app.** The studio switcher changes every lead, campaign,
  conversation and booking. No data crosses between studios.
- **Eligibility rules as code.** Each lead passes four checks: SMS consent, last
  visit 90+ days ago, no contact in 30 days and no visit already booked. Blocked
  leads show the exact reason.
- **Campaign flow.** Live audience count, editable SMS template with merge tags,
  phone preview, daily cap, quiet hours and a simulated send queue.
- **Conversation handoff.** The campaign message, member reply and AI agent turns
  appear in one thread. The agent asks two questions and books a visit.
- **Results.** Dashboard counters, reply rate, funnel and booking list for the
  selected studio.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

The build writes `dist/`. Cloudflare Pages needs build command `npm run build`
and output directory `dist`. There are no environment variables, API keys,
server code or login.

## Demo notes

- The demo date is fixed at **Nov 6, 2026**, so eligibility results stay
  repeatable.
- State is saved to `localStorage`. Use the reset button in the header to return
  to the seeded data.
- SMS delivery, AI replies, auth and billing are simulated. The eligibility
  engine, tenant scoping and campaign state transitions are real client code.
- Checked at 375 px and 1280 px wide, with no console errors or external
  requests.
