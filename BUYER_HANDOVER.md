# InfoHub Buyer Handover

## Product position

**InfoHub — Full-stack News & Knowledge Platform Foundation**

InfoHub is a Next.js + Supabase editorial platform foundation. It is not sold as a media business with guaranteed users, revenue, traffic, publisher agreements, or licensed news content.

## Included

- Next.js / React / TypeScript source code
- Public news and knowledge UI
- Search, categories, tags, article pages
- Supabase Auth integration
- Protected profile/dashboard/admin routes
- PostgreSQL migrations and RLS policies
- Editorial CMS and publishing workflow
- Editorial audit trail
- RSS/Atom ingestion
- Draft-first import workflow
- RSS retry/failure tracking
- Article view analytics
- Vercel deployment configuration and scheduled RSS job
- Optional OpenAI editorial-assistance integration
- Demo/preview seed content
- CI verification workflow
- `.env.example`

## Not included

- Domain ownership
- Vercel/Supabase subscriptions
- API keys or service-role credentials
- OpenAI credits
- Existing production user accounts
- Revenue, traffic, or traction
- News publisher agreements
- RSS redistribution rights
- Third-party image licenses
- Legal advice or jurisdiction-specific legal documents

## Buyer setup

1. Create or receive a buyer-owned Supabase project.
2. Apply migrations in `supabase/migrations` in timestamp order.
3. Configure Supabase Auth email/redirect URLs.
4. Create buyer-owned environment variables from `.env.example`.
5. Set `NEXT_PUBLIC_SITE_URL` to the buyer's HTTPS public domain.
6. Deploy to the buyer-owned Vercel team.
7. Configure `CRON_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` for scheduled ingestion.
8. Configure editor/admin roles using the existing role/RLS model.
9. Add permitted RSS/Atom sources.
10. Replace or clearly label demo content before public launch.
11. Review the Privacy Policy and Terms templates.
12. Add publisher/content/image licenses required by the buyer's business model.

## Environment variables

Public/client: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Server-only secrets: `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `OPENAI_API_KEY`

Optional: `OPENAI_MODEL`

Never commit real secret values.

## Authentication

The application uses Supabase Auth with cookie-based SSR and protected routes. Authentication must be configured in the buyer's Supabase project. The project does not use fake authentication when Supabase is unavailable.

## Editorial workflow

RSS/Atom import is draft-first:

**Source → Import → Draft → Editorial review → Publish**

The optional AI integration is an editorial suggestion tool, not an autonomous publisher.

## RSS security

The existing feed fetcher validates HTTPS and blocks common private/local/metadata network targets. This is application-level SSRF protection, not a replacement for infrastructure-level egress controls.

## Analytics

Article views are stored as `article_view` events. The public endpoint performs basic validation and short-window duplicate suppression. It is intentionally lightweight and is not a full anti-fraud analytics system.

## Storage

There is no dedicated media library or Supabase Storage implementation. Article images currently use external HTTPS image URLs.

## Demo data

Seed/demo articles and the `InfoHub Demo` source are development/preview content. They are not proof of licensed publisher relationships or real production news.

## Known limitations

- Live Supabase production configuration is not verified in this handover environment.
- Live Auth, CMS, RSS, and cron end-to-end operation require buyer-owned configuration.
- The repository does not include a commercial license agreement or IP assignment document.
- Legal pages are templates/drafts, not legal advice.
- Dependency patching should be verified by CI before final commercial handover.
- Vercel production deployment access is not available from this environment, so deployment verification must be performed by the owner/buyer.

## Pre-sale verification checklist

- [ ] Supabase project identified and verified
- [ ] Migrations applied successfully
- [ ] RLS reviewed
- [ ] Auth email/redirect URLs configured
- [ ] Editor/admin role tested
- [ ] CMS create/edit/publish/archive tested
- [ ] RSS source tested
- [ ] Cron tested
- [ ] Production domain configured
- [ ] Sitemap verified
- [ ] Robots verified
- [ ] Privacy/Terms reviewed by buyer
- [ ] Demo content replaced or explicitly labeled
- [ ] CI green
- [ ] Production deployment green
- [ ] License/IP sale terms signed separately
