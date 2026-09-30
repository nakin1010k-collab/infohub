# InfoHub

InfoHub is a responsive Thai information hub for news, knowledge, and data.

## Phase 0D baseline

- Next.js + TypeScript
- App Router
- Responsive public homepage shell
- ESLint, TypeScript, and production build scripts
- Ready for later Supabase/Auth integration

## Local development

```bash
npm install
npm run dev
```

Verification:

```bash
npm run lint
npm run typecheck
npm run build
```

## Baseline verification

- Phase 0D baseline verified by GitHub Actions.
- Lint: passed
- Typecheck: passed
- Production build: passed
- Verification run: 36699694188
- Verified commit: 398022d6940b3b792689da0406440c87be689c23

## Phase 1A verification

- App shell extracted into reusable SiteHeader and SiteFooter components.
- Navigation uses Next.js Link for internal routes/anchors.
- GitHub Actions run `36700017834` passed lint, typecheck, and production build.
- Phase 1A candidate save point: `87f0f73b197645557452bdf729dca3b0cc7c29cb`.
