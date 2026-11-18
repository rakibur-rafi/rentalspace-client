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
- `next.config.ts` is empty. `next/image` with remote URLs requires adding `images.remotePatterns`; otherwise use files in `public/`.

## Conventions

- Universal chrome goes in `components/layout/` (Navbar, Footer); page-specific sections in `components/<Page>/` (e.g. `components/Home/Hero`); shadcn primitives in `components/ui/`.
- One component per file; compose sections in `app/<route>/page.tsx` rather than growing one large page file.
- Shared layout order: Navbar, `<main>` page content, Footer.
- Server Components by default; add `"use client"` only where state or browser APIs are needed.
- Use shadcn/ui + Tailwind + Lucide icons. Keep light/dark parity and mobile/tablet/desktop responsiveness; avoid decorative gradient/shadow clutter.
- `README.md` is untouched Next.js starter text; trust `package.json`, `components.json`, and the code over it.
- `CLAUDE.md` just imports this file (`@AGENTS.md`); put instructions here.

## Current scope

Step 1 is the public homepage only: responsive navbar (logo, dashboard, login/signup and profile/logout UI states, theme toggle), hero with equipment imagery and CTA, feature cards, UI-only newsletter form, and footer. Auth states are UI-only.

Do not add Better Auth/login/signup logic, dashboard pages, equipment CRUD, booking/rental flow, Stripe, admin/vendor pages, or backend APIs until explicitly requested.

Rules that matter later: vendor listings need admin approval before appearing publicly; vendors manage only their own equipment and orders; customers manage only their own favorites/bookings/profile; Stripe stays in test mode and secrets stay server-side.

After finishing a step, update the table below, summarize changed files, and wait for the next instruction.

## Step Tracking

| Step | Task | Status |
|---|---|---|
| 1 | Project understanding and homepage | In progress |
| 2 | To be defined | Pending |
| 3 | To be defined | Pending |
| 4 | To be defined | Pending |
