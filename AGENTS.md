<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

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

- `lib/auth.ts` — server config: MongoDB adapter (`mongodb` + `@better-auth/mongo-adapter`, database `rentalspace-db`), `emailAndPassword` with `minPasswordLength: 6`, the Google social provider, the `jwt()` plugin, and a `role` additional user field (default `"Customer"`, `input: false`). Reads secrets from `.env` only.
- `lib/auth-client.ts` — browser client created with `createAuthClient({ baseURL: process.env.BETTER_AUTH_URL })`. Non-`NEXT_PUBLIC_` env vars are not inlined into client bundles, so this is normally `undefined` and Better Auth falls back to the page origin. Keep API calls same-origin.
- `app/api/auth/[...all]/route.ts` — `toNextJsHandler(auth)` exports `GET`/`POST`.
- Login and signup are intentionally standalone: `app/login/page.tsx` and `app/signup/page.tsx` are self-contained client components with duplicated markup/state. Do not extract shared auth components or add `layout.tsx` files for these routes — the project owner deletes them.
- Signed-in users are kept out of `/login` and `/signup` client-side: each page calls `authClient.useSession()`, redirects with `router.replace("/")` once a session exists, and returns `null` only while a session exists. Do not also gate rendering on `isPending`: Better Auth reports `isPending` on every refetch while signed out, so unmounting the form then wipes the uncontrolled input values.
- Forms call Better Auth directly (`signIn.email`, `signUp.email`, `signIn.social` with `provider: "google"` and `callbackURL: "/"`). On success they show a success toast, then `router.push("/")` + `router.refresh()`. On failure they show an error toast with `error.message`.
- Signup validates the password before calling `signUp.email`: at least 6 characters with one uppercase and one lowercase letter (single regex in `handleSubmit`, error toast on failure). The field's `minLength` is 6 and the helper text states the rule.
- Signup has an optional profile image file input. `handleImageUpload` calls `uploadImage` from `lib/actions/image.ts`, which posts the file to imgbb using `NEXT_PUBLIC_IMGBB_API_KEY` and returns the hosted URL. The URL is previewed with `next/image` and passed to Better Auth as `image`; signup submission is disabled while an upload is in progress.
- Toasts use `components/ui/toast.tsx` (Base UI toast): `<Toaster />` is mounted once in `app/layout.tsx`, and any client component can call `toast.add({ title, description, type: "success" | "error" | ... })`.
- `components/layout/Navbar.tsx` is a client component using `authClient.useSession()`: skeleton while pending, Profile + Log out when signed in, Log in + Sign up otherwise, and `authClient.signOut()` for logout.
- Required `.env` keys: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MONGODB_URI`, `NEXT_PUBLIC_IMGBB_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- Google Cloud OAuth redirect URI must be `http://localhost:3000/api/auth/callback/google` (swap host/port for other environments).
- The navbar and sidebar both link to `/dashboard/profile`, which exists.

### Dashboard

- `app/dashboard/layout.tsx` is a server layout: reads the session with `auth.api.getSession({ headers: await headers() })`, redirects signed-out users to `/login`, and renders the sidebar plus page content. Role comes from `session.user.role` (`customer` | `owner` | `admin`); there are no per-role layouts.
- `components/layout/Sidebar.tsx` is a client component that takes `role`, looks up that role's items in one `navItems` map, highlights the active route, and ends with a user menu (My Profile, Log out). Under `md` it becomes a slide-in drawer with a top bar.
- `components/layout/Navbar.tsx` returns `null` on `/dashboard/*` so the dashboard shows only the sidebar chrome.
- Sidebar destinations such as `/dashboard/customer/rentals`, `/dashboard/owner/rentals`, and `/dashboard/admin/users` are placeholders; `/dashboard/{role}`, `/dashboard/owner/add-equipment`, `/dashboard/owner/equipment`, and `/dashboard/profile` exist today.
- `app/dashboard/owner/add-equipment/page.tsx` is the owner listing form (client). Images upload to imgbb with `uploadImage`; rental type is daily/weekly/monthly; submit gets a JWT with `authClient.token()`, calls `createListing` in `lib/actions/equipments.ts`, and redirects to the owner dashboard.
- `app/dashboard/owner/equipment/page.tsx` is the owner "My Equipment" page (client): gets a JWT with `authClient.token()`, calls `getOwnerEquipments(email, token)` from `lib/api/equipments.ts`, and shows name/brand, category, price, rental type, status, and view/edit/delete actions. View routes to `/dashboard/owner/equipment/[id]` (the detail page does not exist yet); edit opens a modal with every listing field and calls `updateEquipments`; delete opens a confirm modal and calls `deleteEquipments` (both in `lib/actions/equipments.ts`). The backend routes are `PATCH`/`DELETE /equipments/my-equipments/:id`; restart the backend after editing them.
- `app/dashboard/profile/page.tsx` is the shared "My Profile" page (client) for every role: gets a JWT with `authClient.token()`, calls `getProfile(token)` from `lib/api/profile.ts`, and shows name, email, role, phone, date of birth, and address. "Edit profile" opens a modal that patches name/phone/address/dateOfBirth with `updateProfile` from `lib/actions/profile.ts` (`PATCH /users/my-profile`).

### Public equipment

- `lib/api/equipments.ts` holds the public fetches: `getEquipments(filters)` builds `?category=&location=&rentalType=&condition=&brand=` from defined values, and `getEquipmentById(id)` reads `/equipments/:id`. Both use `cache: "no-store"`. `getOwnerEquipments(email, token)` is the authenticated owner fetch.
- `app/equipments/page.tsx` is a server component that wraps the client `components/Equipments/EquipmentsList.tsx` in `<Suspense>` (required because the client list calls `useSearchParams`).
- `components/Equipments/EquipmentsList.tsx` renders radio filter groups for category, rental type, and condition. Selecting a radio writes the query param with `router.replace` (deleting it for "All"), and the component refetches from the URL. The effect depends on the individual `searchParams.get(...)` string values, not the `searchParams` object — using the object causes an endless refetch loop because its identity changes.
- `app/equipments/[id]/page.tsx` is a server component: awaits `params`, calls `getEquipmentById`, and `notFound()`s on an invalid/missing id. It shows the image, price, specs, owner, description, and rental terms.
- The public `GET /equipments` backend route does not filter by `status`, so pending listings are currently visible too.

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

Do not add dashboard content, equipment CRUD, booking/rental flow, Stripe, admin/vendor features, or other backend APIs until explicitly requested; the dashboard shell (layout + sidebar) is in place.

Rules that matter later: vendor listings need admin approval before appearing publicly; vendors manage only their own equipment and orders; customers manage only their own favorites/bookings/profile; Stripe stays in test mode and secrets stay server-side.

After finishing a step, update the table below, summarize changed files, and wait for the next instruction.

## Step Tracking

| Step | Task | Status |
|---|---|---|
| 1 | Project understanding and homepage | In progress |
| 2 | Authentication pages and session flow | In progress |
| 3 | To be defined | Pending |
| 4 | To be defined | Pending |
