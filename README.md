# Tech-Moms Funder Finder

Finds and ranks grants and sponsorships likely to fund Tech-Moms, using only free public data, and tracks the funding pipeline. Built for Hack for Humanity (Nonprofit Support track).

- Product requirements: [`docs/PRD_HFH.pdf`](docs/PRD_HFH.pdf)
- Technical spec + **build status checklist**: [`docs/SPEC.md`](docs/SPEC.md) ← start here if you're picking up work
- Decisions for competition day: [`BACKLOG.md`](BACKLOG.md)

## Principles

Public data only · no personal data in the database, prompts or logs · AI finds, extracts and explains; a person decides · every fact links to its source.

## Local setup

Requires Node 20+. No Docker needed.

```bash
npm install
cp .env.example .env.local        # fill in ANTHROPIC_API_KEY etc.
npm run db:start                  # terminal 1: real Postgres on :5433 (embedded-postgres, data in data/pg)
npm run db:push                   # create tables
npm run db:seed                   # sample data so the UI is never empty
npm run dev                       # terminal 2: http://localhost:3000
```

Prefer Docker? `docker compose up -d` also serves Postgres on :5433 with the same credentials.

## Data pipeline (local, heavy)

```bash
npx tsx scripts/ingest/peer-orgs.ts     # starter peer-org list → data/peer-orgs.json (review it!)
npx tsx scripts/ingest/scan-990pf.ts    # scan ~130k recent 990-PFs (~35 min, resumable) → data/cache/pf-relevant.jsonl
npm run ingest -- load                  # load scan results into Postgres
```

Sources: IRS e-file index (apps.irs.gov) + GivingTuesday 990 data lake public S3 mirror for individual XML filings, ProPublica Nonprofit Explorer API, Grants.gov search2 API. All free, no keys.

## Tests

```bash
npm test                          # unit tests (scoring, gates, reason, 990-PF parser)
```

## Working on this repo

- Commit small, push often — the team picks up from `main` + the SPEC checklist.
- Conventional commits (`feat:`, `fix:`, `docs:` …).
- Anything needing a team decision → add to `BACKLOG.md`.
