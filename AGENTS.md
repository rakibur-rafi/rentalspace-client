<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# RentalSpace

Equipment-rental marketplace: vendors list gear, customers rent it, admins approve listings and monitor revenue. This repo is the Next.js App Router frontend; Step 1 (public homepage) is in progress.

## Commands

Package manager is npm (`package-lock.json`; no workspace setup).

- `npm install`
- `npm run dev`
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — plain `eslint`; Next 16 removed `next lint`
- `npm run build`
- `npm run format` — Prettier for `**/*.{ts,tsx}` only

There is no test runner, CI, or pre-commit config. Verify changes with typecheck, lint, and build.

Prettier: no semicolons, double quotes, 2 spaces, 80 columns, LF, Tailwind class sorting (`cn`/`cva`). `app/globals.css` is not covered by `npm run format`.

## Architecture

- No `src/`. `@/*` maps to the repo root; `app/` is the App Router, with `components/` and `lib/` beside it.
- `app/layout.tsx` is the only root layout. It already mounts `ThemeProvider` (next-themes, class strategy), loads Inter as `--font-sans` and Geist Mono as `--font-mono`, and sets `suppressHydrationWarning`. Keep this for theme support.
- The `d` key toggles light/dark unless focus is in an input, textarea, select, or contentEditable.
- Tailwind is v4 CSS-first: there is no `tailwind.config.*`. Theme tokens, radius, and light/dark colors live in `app/globals.css` (`@theme inline`, `:root`, `.dark`). Add tokens there.
- shadcn is configured as style `base-vega`, RSC, Lucide, with aliases in `components.json`. Its primitives use `@base-ui/react`, not Radix — props and APIs differ from Radix-based shadcn examples. Add components with `npx shadcn@latest add <name>` and import from `@/components/ui/<name>`.
- `cn` comes from the `cn` package and is re-exported from `@/lib/utils`; there is no `clsx`/`tailwind-merge`.
- `next.config.ts` configures `images.remotePatterns` with wildcard `**` hostnames for both `http` and `https`, so `next/image` accepts any remote URL (e.g. imgbb). This is development-friendly but should be narrowed to known hosts before production. Prefer files in `public/` when possible.

### Authentication

Better Auth is wired end to end; do not replace it with another auth stack.

- `lib/auth.ts` — server config: MongoDB adapter (`mongodb` + `@better-auth/mongo-adapter`, database `rentalspacedb`), `emailAndPassword`, and the Google social provider. Reads secrets from `.env` only.
- `lib/auth-client.ts` — browser client created with `createAuthClient({ baseURL: process.env.BETTER_AUTH_URL })`. Non-`NEXT_PUBLIC_` env vars are not inlined into client bundles, so this is normally `undefined` and Better Auth falls back to the page origin. Keep API calls same-origin.
- `app/api/auth/[...all]/route.ts` — `toNextJsHandler(auth)` exports `GET`/`POST`.
- Login and signup are intentionally standalone: `app/login/page.tsx` and `app/signup/page.tsx` are self-contained client components with duplicated markup/state. Do not extract shared auth components — the project owner wants login and signup code kept separate.
- Each auth route has its own `layout.tsx` that exports metadata and guards the route on the server: `auth.api.getSession({ headers: await headers() })` redirects signed-in users to `/`.
- Forms call Better Auth directly (`signIn.email`, `signUp.email`, `signIn.social` with `provider: "google"` and `callbackURL: "/"`). On success they show a success toast, then `router.push("/")` + `router.refresh()`. On failure they show an error toast with `error.message`.
- Signup includes an optional `imageUrl` field; it is sent to Better Auth as `image` (the user schema field). Uploads may replace this with imgbb later.
- Toasts use `components/ui/toast.tsx` (Base UI toast): `<Toaster />` is mounted once in `app/layout.tsx`, and any client component can call `toast.add({ title, description, type: "success" | "error" | ... })`.
- `components/layout/Navbar.tsx` is a client component using `authClient.useSession()`: skeleton while pending, Profile + Log out when signed in, Log in + Sign up otherwise, and `authClient.signOut()` for logout.
- Required `.env` keys: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MONGODB_URI`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- Google Cloud OAuth redirect URI must be `http://localhost:3000/api/auth/callback/google` (swap host/port for other environments).
- `/profile` is linked from the navbar but the route does not exist yet.

## Conventions

- Universal chrome goes in `components/layout/` (Navbar, Footer); page-specific sections in `components/<Page>/` (e.g. `components/Home/Hero`); shadcn primitives in `components/ui/`.
- One component per file; compose sections in `app/<route>/page.tsx` rather than growing one large page file.
- Shared layout order: Navbar, `<main>` page content, Footer.
- Server Components by default; add `"use client"` only where state or browser APIs are needed.
- Use shadcn/ui + Tailwind + Lucide icons. Keep light/dark parity and mobile/tablet/desktop responsiveness; avoid decorative gradient/shadow clutter.
- `README.md` is untouched Next.js starter text; trust `package.json`, `components.json`, and the code over it.
- `CLAUDE.md` just imports this file (`@AGENTS.md`); put instructions here.

## Current scope

Step 1 is the public homepage: responsive navbar (logo, dashboard, session-aware login/signup and profile/logout states, theme toggle), hero with equipment imagery and CTA, feature cards, UI-only newsletter form, and footer.

Step 2 adds working authentication: standalone login/signup pages wired to email/password and Google, session-guarded auth routes, success/error toasts, redirect to `/` after auth, and an optional profile image URL on signup.

Do not add dashboard pages, equipment CRUD, booking/rental flow, Stripe, admin/vendor pages, or other backend APIs until explicitly requested.

Rules that matter later: vendor listings need admin approval before appearing publicly; vendors manage only their own equipment and orders; customers manage only their own favorites/bookings/profile; Stripe stays in test mode and secrets stay server-side.

After finishing a step, update the table below, summarize changed files, and wait for the next instruction.

## Step Tracking

| Step | Task | Status |
|---|---|---|
| 1 | Project understanding and homepage | In progress |
| 2 | Authentication pages and session flow | In progress |
| 3 | To be defined | Pending |
| 4 | To be defined | Pending |
