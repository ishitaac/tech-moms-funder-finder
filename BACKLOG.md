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
12. **Federal grants are mostly poor fits** (2026-11-13, Claude) — after filtering, Grants.gov yields ~10–15 nonprofit-eligible workforce listings, almost all with $150K+ awards (far above the $5K–$30K sweet spot). They will mostly band as "Long shot", which matches Robbyn's experience (1 national win in 10–20). Consider demoing federal as "watch list" and leaning on Utah state + pass-through + foundations for the ranked list.
13. **Score calibration — please review** (2026-11-13, Claude). Checked against the 4 foundations whose 990-PFs show grants to Tech-Moms (Sorenson Legacy, Kahlert, Ashton Family, Larry H. Miller & Gail Miller). Changes made:
    - Mission & women now use the *share* of past grants that match (big national funders were winning on keyword volume).
    - Geography: Utah dollars dominate; Mountain West without Utah is partial credit (0.4).
    - "Boys & Girls Club" no longer counts as a women/girls signal.
    - A foundation that has granted to Tech-Moms is never gated out (Kahlert and LHM tick "preselected only" yet fund Tech-Moms) and is labelled "Past funder".
    - Bands recalibrated from PRD 75/55 to **Strong ≥ 50 / Worth a look ≥ 35** — without the AI mission read, the 99th percentile score is 45. Known funders rank 26–43 of ~2,000 (top 2%) and band "Worth a look". Revisit once AI is on (mission scores will rise).
    - **Decision needed:** should "preselected organizations only" exclude funders at all? Two real Tech-Moms funders tick it. Option: show them as "Invitation only — needs warm intro" instead of excluding.
