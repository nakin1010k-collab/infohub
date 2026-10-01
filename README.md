# InfoHub

InfoHub is a responsive Thai information hub for news, knowledge, and data, using a kawaii cat visual identity.

## Stack

- Next.js 15 App Router + React 19
- TypeScript with strict checking
- ESLint 9 + Next.js rules
- Supabase Auth via `@supabase/ssr` and `@supabase/supabase-js`
- GitHub Actions verification: `npm ci`, news/search smoke tests, lint, typecheck, production build

## Local development

Create `.env.local` from `.env.example` and provide the InfoHub Supabase project URL and publishable key.

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

- Browser client: `lib/supabase/client.ts`
- Server client: `lib/supabase/server.ts`
- Session refresh / protected-route enforcement: `middleware.ts`
- Protected routes: `/profile`, `/dashboard`, `/settings`, `/admin`
- Middleware verifies sessions with Supabase `getClaims()` and refreshes auth cookies.
- Login redirects safely back to an internal `next` path.
- Sign-out is handled by `components/sign-out-button.tsx`.
- No Supabase service-role secret is used or committed.

## Verification status

Phase 1 is being hardened around a single Supabase Auth architecture. The production site URL now falls back to the Vercel production hostname when `NEXT_PUBLIC_SITE_URL` is not explicitly configured, and email verification/password recovery use the `/auth/callback` exchange flow.

Live end-to-end Auth verification still requires the production Supabase project settings and redirect URLs to be configured correctly.

News listing/detail/search read published articles from Supabase. Editorial writes are protected by editor/admin roles and RLS. RSS/Atom ingestion stores imported items as `draft` so an editor must review before publishing. Configure source `feed_url` values from `/admin/sources` and run ingestion there.

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

Apply Supabase migrations in timestamp order. The ingestion foundation adds `sources.feed_url`, ingestion run history, and the CMS write path. No service-role key is required for the application runtime.

Do not treat a phase as complete until its CI verification and exact commit SHA are recorded in the project roadmap. CI remains the final gate for the current implementation.
