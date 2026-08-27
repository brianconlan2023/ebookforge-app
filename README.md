# EbookForge

Standalone AI ebook creator. Separate from the earlier Turborepo/Express scaffold.

## Stack
- Next.js 14 App Router + Tailwind
- OpenAI 6-step pipeline (research → titles → outline → chapters → edit → front/back matter)
- JWT cookie auth
- DOCX via `docx`; PDF via print-ready HTML

## Run locally
```bash
git clone https://github.com/brianconlan2023/ebookforge-app
cd ebookforge-app
npm install
cp .env.example .env.local
# set OPENAI_API_KEY and AUTH_SECRET
npm run dev
```

## Env
- `OPENAI_API_KEY` — required for generation
- `AUTH_SECRET` — JWT signing key

## Notes
- Projects persist in the browser (`localStorage`) so the first deploy works without Postgres.
- Auth users live in memory on the server instance (swap Prisma/Postgres when you add Neon).
- Word counts in the pipeline are capped so a single Vercel function can finish. Raise them after you add a queue.
