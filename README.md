# Tech-Moms Funder Finder

Finds and ranks grants and sponsorships likely to fund Tech-Moms, using only free public data, and tracks the funding pipeline. Built for Hack for Humanity (Nonprofit Support track).

- Product requirements: [`docs/PRD_HFH.pdf`](docs/PRD_HFH.pdf)
- Technical spec + **build status checklist**: [`docs/SPEC.md`](docs/SPEC.md) ← start here if you're picking up work
- Decisions for competition day: [`BACKLOG.md`](BACKLOG.md)

## Principles

Public data only · no personal data in the database, prompts or logs · AI finds, extracts and explains; a person decides · every fact links to its source.

## Local setup

Requires Node 20+ and Docker.

```bash
npm install
cp .env.example .env.local        # fill in keys
docker compose up -d              # local Postgres on :5432
npm run db:push                   # create tables
npm run db:seed                   # sample data so the UI is never empty
npm run dev                       # http://localhost:3000
```

Other scripts:

```bash
npm test                          # unit tests (scoring, parsing, ICS)
npm run ingest                    # heavy local ingest (990 XML, ProPublica) → Postgres
```

## Working on this repo

- Commit small, push often — the team picks up from `main` + the SPEC checklist.
- Conventional commits (`feat:`, `fix:`, `docs:` …).
- Anything needing a team decision → add to `BACKLOG.md`.
