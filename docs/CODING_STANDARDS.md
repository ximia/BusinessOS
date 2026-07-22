# CODING_STANDARDS.md — Business OS

> Engineering conventions for a platform maintained for years. These reflect how
> the codebase is already built — follow them so it stays coherent. Read before
> writing code; read `ARCHITECTURE.md` for *where* things go.

---

## TypeScript

- **Strict mode, always.** `strict` + `noUncheckedIndexedAccess` are on. Do not
  loosen `tsconfig`. `npm run typecheck` must pass before every commit.
- **No `any`.** Use precise types, generics, or `unknown` + narrowing. No
  `@ts-ignore` without a one-line justification comment (`@ts-expect-error`
  preferred so it fails when the error goes away).
- **`type` for shapes and unions, `interface` for extensible object contracts** —
  follow the existing file's choice; don't mix within a domain.
- **Domain types live in `src/types/`** (`content.ts` for marketing/domain,
  `database.ts` for DB rows). Don't redefine shapes inline.
- **Prefer inference** for locals; **annotate** exported/public function
  signatures and boundaries.
- **`import type`** for type-only imports (helps bundling and clarity).

---

## Validation & trust boundaries

- **Zod at every boundary** where untrusted data enters: form input, server
  action arguments, external payloads. Schemas live in `src/lib/validations.ts`
  or the relevant feature slice.
- **Parse, don't assume.** Server actions validate their input with Zod before
  touching data — never trust the client.
- Keep the Zod schema and the TypeScript type in sync (infer from the schema
  where practical).

---

## React & Next.js

- **Server Components by default.** Add `"use client"` only for genuine
  interactivity (state, effects, browser APIs, event handlers). Keep client
  components small — push data fetching and composition to the server.
- **Mutations are Server Actions** (`src/server/actions/*` or a feature slice),
  not client fetches. Revalidate with `revalidatePath` / cache tags after a
  write.
- **No REST route handlers** unless an external system requires an HTTP endpoint
  (future Agency OS webhook receiver — see `API.md`).
- Use **`useActionState`** (React 19) for form-action state — not the deprecated
  `useFormState`.
- **Data is read only through the services layer** (`src/services/*`). Components
  and pages never call Supabase directly for reads.
- Fetch on the server; pass typed data down. Avoid client-side waterfalls.

---

## Reusable components & no duplicated logic

- **Compose the primitives** in `src/components/ui/*`. Need a variant? Add it to
  the primitive (CVA) rather than forking a new component.
- **DRY, deliberately.** If logic appears twice, extract it — to `lib/` for
  pure utilities, a `services/` function for data, a hook for stateful client
  logic, or a `features/` slice for a cohesive capability.
- **One source of truth per concern.** Content → `config`/settings; data →
  `services`; validation → Zod schema; icons → `lib/icons.ts` (string-keyed).
- Don't copy-paste a mapper or a fetch — share it.

---

## Naming conventions

- **Files:** `kebab-case.ts(x)` (e.g. `leads-table.tsx`, `settings.service.ts`).
  Feature files use a dotted suffix by role: `*.service.ts`, `*.actions.ts`,
  `*.schema.ts`, `*.config.ts`.
- **Components:** `PascalCase`. **Functions/variables:** `camelCase`.
  **Types/interfaces/enums:** `PascalCase`. **Constants:** `UPPER_SNAKE_CASE`
  for true constants (e.g. `SETTINGS_CACHE_TAG`).
- **Booleans** read as predicates: `isConfigured`, `hasAccess`, `canEdit`.
- **Server actions** are verbs: `updateBusinessSettings`, `applyTheme`,
  `submitContact`.
- Match the surrounding file's idiom over any personal preference.

---

## Folder organization

- New content → `src/config/` (compile-time) or Business Settings (runtime).
- New reusable UI → `src/components/ui/`; page-specific → the nearest domain
  folder (`sections/`, `admin/`, `shared/`).
- New data access → `src/services/`. New mutation → `src/server/actions/` or the
  feature slice.
- A cohesive capability with its own schema/service/actions/UI → a
  **`src/features/<name>/` slice** (like `settings/` and `theme/`).
- Pure helpers → `src/lib/`. Client stateful logic → `src/hooks/`.

---

## Error handling

- **Fail loudly server-side, gracefully client-side.** Validate, then handle the
  failure path explicitly — no silent catches that swallow errors.
- **Always provide a fallback for data reads** so **demo mode never breaks**
  (`isSupabaseConfigured()` guard → `mock-data.ts`). A missing DB is a supported
  state, not an error.
- Return typed, discriminated results from server actions (`{ ok, error? }`
  style) rather than throwing across the client boundary; surface the message in
  a toast or inline.
- Add `error.tsx` / `loading.tsx` boundaries per Hub segment as they land.
- User-facing error copy is human and actionable (see `UI_GUIDELINES.md`).

---

## Performance

- **Static where possible** (marketing), **server where necessary** (Hub). Keep
  the Business Settings read cookieless so marketing stays static/ISR.
- **`next/image`** for all images, with dimensions/`sizes`; register remote
  hosts in `next.config.mjs`.
- **Bound your reads** — add `.limit()` + pagination before real volume; don't
  fetch all rows.
- **Trim client JS:** prefer server components, keep client islands small, use
  `optimizePackageImports`, and prefer `LazyMotion`/`m` for Framer Motion as
  adoption lands.
- No layout shift; lazy-load heavy/below-the-fold embeds.

---

## Accessibility (engineering side)

- Semantic HTML first; ARIA only to fill gaps. Radix primitives already handle
  most roles/focus — don't fight them.
- Every interactive element is keyboard-operable with a visible focus ring.
- Label icon-only controls; provide `alt`; associate form labels and errors.
- Honor `prefers-reduced-motion`. See `UI_GUIDELINES.md` for the full bar.

---

## Security

- **Never expose the service-role key** to the client. Public keys are
  `NEXT_PUBLIC_*`; secrets are server-only.
- **RLS is the backstop**, not the UI. Public inserts are RLS-scoped; reads are
  staff-only except where explicitly public (approved reviews, published posts,
  gallery). See `DATABASE.md`.
- Validate and sanitize all external input (Zod). Keep the honeypot on public
  forms; add rate limiting before heavy public exposure.
- Don't log secrets or PII. Don't commit `.env*`.

---

## Testing philosophy

- **The build is the current gate:** `npm run build` + `npm run typecheck` must
  be green on every commit. Strict types catch a large class of regressions.
- **Growing toward:** Vitest for units (services, mappers, Zod schemas, `lib`
  utilities) and Playwright smoke tests for critical flows (site renders, lead
  submit, Hub loads in demo mode), gated in CI. Prioritize tests around the
  services layer and server actions — the highest-leverage seams.
- Write a test with any bug fix that could regress. Don't test framework
  internals; test *our* logic and boundaries.

---

## Documentation (part of every change)

- Update the relevant `docs/*` file **in the same commit** as the code change —
  see the responsibility matrix in `CLAUDE.md`.
- Comment the *why*, not the *what*. Keep the existing files' comment density and
  house style.
- Record significant, hard-to-reverse decisions in `DECISIONS.md`.

---

## Git & commits

- **Keep the build green on every commit.** Commit per coherent feature/change
  with a clear, descriptive message.
- Work on the designated branch; **do not open PRs unless explicitly asked.**
- **Never** put the model identifier in commit messages, PR text, code, or any
  pushed artifact.
- Don't reformat unrelated code in a feature commit (keep diffs reviewable).
