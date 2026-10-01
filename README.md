# InfoHub

InfoHub is a responsive Thai information hub for news, knowledge, and data, using a kawaii cat visual identity.

## Stack

- Next.js 15 App Router + React 19
- TypeScript with strict checking
- ESLint 9 + Next.js rules
- Appwrite Auth + TablesDB
- GitHub Actions verification: `npm ci`, news/search smoke tests, lint, typecheck, production build

## Local development

Create `.env.local` from `.env.example` and provide the InfoHub Appwrite project configuration and server API key.

```bash
npm install
npm run dev
```

Verification:

```bash
npm run test:news
npm run lint
npm run typecheck
npm run build
```

## Current routes

- `/` — public homepage
- `/news` — news listing with category and tag filters
- `/news/[slug]` — typed news detail preview with related news and metadata
- `/search` — search preview across title, excerpt, category, and tags
- `/login` — password login
- `/register` — account registration
- `/forgot-password` — password recovery request
- `/reset-password` — authenticated recovery password update
- `/profile` — protected profile
- `/dashboard` — protected dashboard shell
- `/settings` — protected settings shell
- `/admin` — editorial CMS for drafts, publishing, archive, search, and filtering
- `/admin/new` — create an article
- `/admin/[id]` — edit an article
- `/admin/[id]/preview` — protected draft preview for editors/admins
- `/admin/queue` — editorial review queue for draft articles
- `/admin/activity` — editorial audit/activity log
- `/admin/sources` — configure RSS/Atom sources and trigger ingestion
- `/sitemap.xml` — generated sitemap for public content
- `/robots.txt` — crawler rules for public/protected areas

## Authentication architecture

- Browser/server authentication uses Appwrite sessions via `lib/appwrite/*`.
- Session and protected-route enforcement: `middleware.ts`.
- Protected routes: `/profile`, `/dashboard`, `/settings`, `/admin`.
- Login redirects safely back to an internal `next` path.
- Sign-out is handled by `components/sign-out-button.tsx`.
- Appwrite API keys remain server-side and are never committed.

## Verification status

Phase 1 is being hardened around a single Appwrite Auth architecture. The production site URL now falls back to the Vercel production hostname when `NEXT_PUBLIC_SITE_URL` is not explicitly configured, and email verification/password recovery use the Appwrite session flow.

Live end-to-end Auth verification requires the production Appwrite project and session configuration to be configured correctly.

News listing/detail/search read published articles from Appwrite TablesDB. Editorial writes are protected by editor/admin roles and server-side authorization. RSS/Atom ingestion stores imported items as `draft` so an editor must review before publishing. Configure source `feed_url` values from `/admin/sources` and run ingestion there.

## $0-first editorial flow

The basic editorial pipeline does **not** require an AI API or paid service:

1. Configure an RSS/Atom source in `/admin/sources`.
2. Run **นำเข้าข่าวตอนนี้**.
3. InfoHub deduplicates by canonical URL and creates draft articles.
4. A small deterministic ruleset assigns a category, basic tags, and reading time locally.
5. Review/edit the draft in `/admin/queue` and publish manually.
6. OpenAI enrichment is optional and only runs when an API key exists and the editor explicitly enables it.

The zero-cost rules are intentionally suggestions, not claims about article truth. The editor remains the final reviewer.

### Database migrations

Provision the Appwrite TablesDB schema from `scripts/provision-appwrite.mjs`. The ingestion foundation adds `sources.feed_url`, ingestion run history, and the CMS write path. No service-role key is required for the application runtime.

Do not treat a phase as complete until its CI verification and exact commit SHA are recorded in the project roadmap. CI remains the final gate for the current implementation.


## Automation / monitoring

- `/api/health` — lightweight database health check.
- `/api/cron/ingest` — secured daily RSS scheduler via Vercel Cron.
- Set `CRON_SECRET` and the server-side `APPWRITE_API_KEY` in the production environment for scheduled imports.
- `/admin/notifications` — in-app RSS failure notifications for editors/admins.
- `/admin/analytics` — lightweight article view analytics stored by the application backend.
- Public SEO routes: `/sitemap.xml` and `/robots.txt`.
- AI enrichment remains optional; the basic RSS import flow does not require `OPENAI_API_KEY`.


> Phase: RSS ingestion hardening, editorial dashboard, public pagination/SEO, and scheduler are implemented on the feature branch; production environment verification remains separate.


## Buyer-ready handover

See [BUYER_HANDOVER.md](./BUYER_HANDOVER.md) for included assets, buyer-owned configuration, known limitations, security boundaries, and the pre-sale verification checklist.

### Public URL configuration

Set `NEXT_PUBLIC_SITE_URL` to the buyer-owned HTTPS public URL in production. The application uses this value for metadata, canonical URLs, sitemap, robots, and article canonical URLs. On Vercel, if it is omitted in a production deployment, the application can fall back to Vercel's stable production project hostname; preview deployment URLs are not used as canonical URLs by design.

### Public recovery behavior

Public homepage, search, and news listing pages degrade to an explicit configuration notice when Appwrite is unavailable. They do not create fake articles or fake users. `/status` and `/api/health` expose configuration/health state without returning raw database error messages.

### Legal templates

`/privacy` and `/terms` are draft templates for handover. They are not legal advice and must be reviewed and adapted by the buyer before production use.

### Production checklist

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the buyer's HTTPS domain
- [ ] Configure buyer-owned Appwrite project, TablesDB, and Auth
- [ ] Provision Appwrite TablesDB schema and verify permissions/
- [ ] Configure server-only secrets in Vercel
- [ ] Configure permitted RSS/Atom sources
- [ ] Verify CMS create/edit/publish/archive flow
- [ ] Verify scheduled ingestion with `CRON_SECRET`
- [ ] Configure optional OpenAI integration only if needed
- [ ] Replace or clearly label demo content
- [ ] Review Privacy Policy and Terms
- [ ] Verify `/sitemap.xml` and `/robots.txt` on the production domain
- [ ] Run `npm run test:news`, `npm run lint`, `npm run typecheck`, and `npm run build`

## Licensing / IP

The repository currently does not include an open-source `LICENSE`. Licensing, copyright assignment, exclusivity, and IP transfer terms are business/legal terms to be agreed separately as part of a sale. Do not add an open-source license without the owner's explicit decision.
