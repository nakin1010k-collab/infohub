# InfoHub

InfoHub is a responsive Thai information hub for news, knowledge, and data, using a kawaii cat visual identity.

## Stack

- Next.js 15 App Router + React 19
- TypeScript with strict checking
- ESLint 9 + Next.js rules
- Supabase Auth via `@supabase/ssr` and `@supabase/supabase-js`
- GitHub Actions verification: `npm ci`, lint, typecheck, production build

## Local development

Create `.env.local` from `.env.example` and provide the InfoHub Supabase project URL and publishable key.

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

## Current routes

- `/` — public homepage
- `/search` — search handoff placeholder; real database search is planned for Phase 3
- `/login` — password login
- `/register` — account registration
- `/forgot-password` — password recovery request
- `/reset-password` — authenticated recovery password update
- `/profile` — protected profile
- `/dashboard` — protected dashboard shell
- `/settings` — protected settings shell

## Authentication architecture

- Browser client: `lib/supabase/client.ts`
- Server client: `lib/supabase/server.ts`
- Session refresh / protected-route enforcement: `middleware.ts`
- Protected routes: `/profile`, `/dashboard`, `/settings`
- Login redirects safely back to an internal `next` path.
- Sign-out is handled by `components/sign-out-button.tsx`.
- No Supabase service-role secret is used or committed.

## Verification status

Phase 1 has a verified save point at commit `21a6c569b95d4f4e69876880f8a89aa8e3413f61`.

Phase 2 authentication has been implemented through session/error handling and is undergoing final verification. A dedicated InfoHub Supabase project is still required for live end-to-end Auth verification.

Do not treat a phase as complete until its CI verification and exact commit SHA are recorded in the project roadmap.
