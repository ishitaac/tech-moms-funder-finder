# Backlog — decide on competition day

Items that came up during the pre-build and need a team decision. Add new ones at the bottom with a date and who raised it.
Format: **Item** — context · options · recommendation (if any).

## Open

1. **Which stretch flags to turn on for the demo** — all four are being pre-built (board members, AI draft, full dashboard, weight tuning). Turning them all on may crowd a ~5 min demo. Decide once the official prompt is known. *Rec:* weight tuning + board members (both reinforce "Robbyn stays in control").
2. **AI provider** — defaulting to Claude (Haiku-class for extraction, Sonnet-class for explanations) via the Vercel AI SDK. Switch if sponsor credits or the prompt favour another provider (`AI_PROVIDER` env).
3. **Resend sender domain** — without a verified domain, emails only reach the Resend account owner. Fine for the demo; decide whose account/domain to use long-term.
4. **Hosting/DB ownership after the hackathon** — PRD open question. Whose Vercel / Neon accounts, and does Tech-Moms take them over?
5. **Auth** — none for the demo. If the deployed URL is public, add a shared-password gate (env var) before sharing.
6. **Peer-org list review** — `data/peer-orgs.json` is generated; someone should prune it before the final ingest (it drives the candidate universe).
7. **"Large change in giving" threshold** for un-hiding rejected funders — set at 50% change in total giving. Confirm.
9. **Reverse-lookup breadth** (2026-11-13, Claude) — "any grant to a Utah recipient" keeps ~7% of all 990-PFs (thousands of foundations, many giving to churches/universities). The cheap shortlist filter (mission keywords on grant purposes, sweet-spot grant sizes, Utah $) narrows this to 100–150 before AI. Decide whether to tighten the scan criteria.
10. **Docker Desktop hung on the build laptop** (2026-11-13) — the engine never started (`docker desktop status: stopped`, won't stop cleanly). Local dev switched to `npm run db:start` (embedded-postgres, port 5433). A Windows Postgres service already occupies 5432 on that machine. Nothing to decide unless someone prefers Docker.
11. **Production DB** — pick Neon or Supabase (free tier) for the Vercel deploy and run `db:push` + `ingest load` against it.
8. **Repo lives inside OneDrive** — `node_modules` and `.next` under OneDrive sync can be slow or lock files on Windows. Consider excluding the folder from sync or cloning outside OneDrive.
