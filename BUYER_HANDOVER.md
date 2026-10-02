# InfoHub Buyer Handover

## Product position

**InfoHub — Full-stack News & Knowledge Platform Foundation / MVP**

InfoHub is a Next.js + Appwrite editorial platform foundation. It is not sold as a media business with guaranteed users, revenue, traffic, publisher agreements, or licensed news content.

## Included

- Next.js / React / TypeScript source code
- Public Thai news and knowledge UI
- Search, categories, tags, article pages
- Appwrite Auth + TablesDB integration
- Protected profile/dashboard/settings/admin routes
- Appwrite schema provisioning script
- Editorial CMS and publishing workflow
- Editorial audit trail
- RSS/Atom ingestion
- Draft-first import workflow
- RSS retry/failure tracking and ingestion history
- Article view analytics
- Vercel deployment configuration and scheduled RSS job (Appwrite-backed)
- Optional OpenAI editorial-assistance integration
- Demo/preview seed content
- CI verification workflow
- `.env.example`
- SEO routes including sitemap and robots

## Not included

- Domain ownership
- Vercel/Appwrite subscriptions or paid usage
- API keys, Appwrite secrets, or other credentials
- OpenAI credits
- Existing production user accounts
- Revenue, traffic, or traction
- News publisher agreements
- RSS redistribution rights
- Third-party image licenses
- Legal advice or jurisdiction-specific legal documents
- Commercial license/IP assignment terms unless separately agreed

## Current backend architecture

The current source uses **Appwrite** as the application backend.

Core production environment variables:

- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_ARTICLES_TABLE_ID`
- `APPWRITE_API_KEY` (server-side secret)

The repository includes `scripts/provision-appwrite.mjs` for provisioning the required TablesDB schema.

Never commit real secret values.

## Buyer setup

1. Create or receive a buyer-owned Appwrite project.
2. Configure Appwrite Auth and the required TablesDB database/tables.
3. Run `npm run setup:appwrite` with buyer-owned configuration when provisioning is needed.
4. Create buyer-owned environment variables from `.env.example`.
5. Set `NEXT_PUBLIC_SITE_URL` to the buyer's HTTPS public domain.
6. Deploy to the buyer-owned Vercel team.
7. Configure server-only Appwrite credentials and `CRON_SECRET`.
8. Run `npm run bootstrap:appwrite-user -- <userId> editor` or `admin` to bootstrap the buyer's editorial role. Keep the API key server-side.
9. Add permitted RSS/Atom sources.
10. Replace or clearly label demo content before public launch.
11. Review the Privacy Policy and Terms templates.
12. Add publisher/content/image licenses required by the buyer's business model.

## Authentication

Browser/server authentication uses Appwrite sessions with server-side session handling. Protected routes include profile, dashboard, settings, and editorial admin areas.

The project does not use fake authentication when Appwrite is unavailable.

Live end-to-end Auth verification depends on the buyer-owned Appwrite project, domains, and email configuration.

## Editorial workflow

RSS/Atom import is draft-first:

**Source → Import → Draft → Editorial review → Publish**

The optional AI integration is an editorial suggestion tool, not an autonomous publisher.

## RSS security

The feed fetcher validates HTTPS and blocks common private/local/metadata network targets. This is application-level SSRF protection, not a replacement for infrastructure-level egress controls.

## Analytics

Article views are stored as application analytics events with lightweight validation and short-window duplicate suppression. This is not a full anti-fraud analytics system.

## Storage

There is no dedicated media library. Article images currently use external HTTPS image URLs.

## Demo data

Seed/demo articles and the `InfoHub Demo` source are development/preview content. They are not proof of licensed publisher relationships or real production news.

## Known limitations

- Public production deployment must be verified before describing the demo as production-live.
- Live Auth, CMS, RSS, and cron end-to-end operation require the target Appwrite/Vercel configuration and a buyer-owned test account/source.
- The repository does not include a commercial license agreement or IP assignment document.
- Legal pages are templates/drafts, not legal advice.
- Dependency patching should be verified by CI before final commercial handover.
- Appwrite API keys and other secrets are not transferred through the repository.
- RSS security is application-level protection and should be reviewed against the buyer's infrastructure.
- A previously exposed development credential should be rotated/revoked if it was ever shared outside the intended secret store.

## Pre-sale verification checklist

- [x] Appwrite schema/provisioning implementation present
- [x] Appwrite Auth/session architecture present
- [x] Editorial CMS implementation present
- [x] RSS/Atom draft-first ingestion implementation present
- [x] Search/categories/tags/article pages present
- [x] Sitemap and robots routes present
- [x] Local lint/typecheck/build/news smoke verification passed during development
- [ ] Confirm latest Vercel production deployment performs a real Next.js build
- [ ] Open production URL and verify public homepage
- [ ] Verify Appwrite-backed news read path on production
- [ ] Verify login/register/recovery with a buyer-owned test account
- [ ] Verify editor/admin CMS flow
- [ ] Verify RSS source and scheduled cron
- [ ] Verify production sitemap/robots
- [ ] Replace or clearly label demo content
- [ ] Review Privacy/Terms
- [ ] Agree license/IP sale terms separately

## Handover principle

Transfer the source code and documented system architecture. Buyer-owned credentials, domains, subscriptions, publisher permissions, and legal/commercial rights should be configured or transferred separately.
