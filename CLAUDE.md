# CLAUDE.md — Operating Manual for Claude Code

> This is the permanent operating manual for anyone (human or AI) working in
> this repository. Read it first, every session. Keep it concise. When it drifts
> from reality, fix it.

---

## What this repository is

This repository is the **Business OS** — the master template that every client
website is cloned from. It is **not** an agency dashboard, **not** a website
builder, and **not** a generic starter template.

**Business OS helps local service businesses run and grow their business.**

It is one premium software product with two surfaces:

- **The Website** — the marketing frontend. How a business wins customers.
- **The Business Hub** — the operational backend (currently served at `/admin`).
  How a business runs: leads, quotes, reviews, content, team, settings.

Together they are a single premium software experience. We are not selling
websites. We are selling **business software**.

---

## The lifecycle (know where this code lives)

```
Business OS Template Repository   ← YOU ARE HERE
        │
        │  clone
        ▼
Individual Client Repository      ← one per client, operates independently
        │
        │  secure APIs + webhooks (future)
        ▼
Agency OS                         ← a completely separate system, NOT in this repo
```

- This repo is the **template**. Everything here must stay clean, generic, and
  re-brandable — no client-specific hardcoding leaks into the foundation.
- Each client is an **independent clone** with its own deployment, database, and
  domain. Clients never share infrastructure at the template level.
- The **Agency OS is a separate product in a separate repository.** Do **not**
  build or document Agency OS internals here. Only document *future
  compatibility* (the API/webhook seams) where appropriate.

---

## Development philosophy

1. **Documentation is part of the product.** It is a first-class deliverable,
   not an afterthought. Stale docs are a bug.
2. **Extend, don't rewrite.** This is a production-grade codebase. Preserve
   working features; grow the system carefully.
3. **Every new feature is optional and configurable.** Nothing should break a
   clone that hasn't opted in. Defaults must always be safe.
4. **Config over code.** Client-specific content lives in `src/config/*` and
   Business Settings — not in JSX. A re-brand should rarely touch components.
5. **Static where possible, server where necessary.** Marketing pages stay
   statically generated; the Business Hub is server-rendered on demand.
6. **Type-safe and validated end to end.** Strict TypeScript, Zod at every
   trust boundary.
7. **Think like a CTO, not a code generator.** Optimize for a platform
   maintained for years, not for the next commit.

---

## Files to read before working

| Read this | When |
|---|---|
| `CLAUDE.md` (this file) | Always, first. |
| `docs/PRODUCT.md` | To understand *why* — mission, customers, value. |
| `docs/ARCHITECTURE.md` | Before any structural or cross-cutting change. |
| `docs/DATABASE.md` | Before touching the schema, RLS, or the services layer. |
| `docs/API.md` | Before adding server actions, routes, or integration seams. |
| `docs/CODING_STANDARDS.md` | Before writing any code. |
| `docs/UI_GUIDELINES.md` | Before writing any UI. |
| `docs/DECISIONS.md` | Before reversing or questioning a prior decision. |
| `docs/ROADMAP.md` / `docs/TODO.md` | To choose what to work on next. |

`README.md` is the public-facing quick start. `docs/HANDOFF.md` is a historical
session brief — useful context, but this manual and the `docs/` system are the
authority.

---

## Architectural principles

- **App Router, Server Components by default.** Reach for `"use client"` only
  for genuine interactivity.
- **Config is the content source of truth.** `src/config/*` (compile-time) is
  deep-merged with runtime **Business Settings** (`src/features/settings`).
- **The services layer is the only place that reads data.** `src/services/*`
  returns Supabase rows when configured, otherwise demo data. This is the seam
  for multi-tenancy and, later, Agency OS sync.
- **Mutations go through Server Actions** (`src/server/actions/*`) — no REST
  route handlers unless an external system genuinely requires one.
- **Every business table carries a nullable `org_id`** reserved for future
  multi-tenancy. Don't remove it.
- **Design tokens are CSS variables** (`src/app/globals.css`). Re-brand by
  editing tokens, never by hardcoding colors in components.

---

## Rules for modifying the project

1. **Keep the build green.** `npm run build` and `npm run typecheck` must pass
   before you commit. Strict TypeScript stays strict.
2. **Never break demo mode.** With no environment configured, the app must run
   on `src/services/mock-data.ts`. Every data path needs a safe fallback.
3. **Preserve the config-driven contract.** New content belongs in config or
   settings, resolved through the services layer — not inlined into components.
4. **No client-specific data in the template.** Demo content models a premium
   auto-detailing studio; keep it generic and swappable.
5. **Update the docs in the same change.** See the responsibility matrix below.
6. **Commit per feature** with a clear message. Do **not** open pull requests
   unless explicitly asked. Do **not** put the model identifier in commits,
   PRs, or code.

### Bash gotchas (this environment)

- Never pipe `npm run build` into `head`/`grep` — SIGPIPE can kill the build
  mid-run. Redirect to a log file and read that.
- Avoid `pkill`; it can disrupt the shell. Start dev/test servers on a fresh
  `PORT=` via a background run.
- External Unsplash images render grey in the sandbox — expected, not a bug.

---

## Documentation responsibilities

Documentation must never go stale. When you change the code, change the docs in
the **same** commit:

| When you change… | Update… |
|---|---|
| Structure, routing, cross-cutting patterns | `docs/ARCHITECTURE.md` |
| Server actions, routes, integration/webhook seams | `docs/API.md` |
| Schema, RLS, migrations | `docs/DATABASE.md` |
| Anything user-visible that ships | `docs/CHANGELOG.md` |
| Priorities or scope | `docs/ROADMAP.md` |
| A significant, hard-to-reverse decision | `docs/DECISIONS.md` |
| Backlog, debt, ideas | `docs/TODO.md` |
| UI patterns, tokens, components | `docs/UI_GUIDELINES.md` |
| Engineering conventions | `docs/CODING_STANDARDS.md` |

Treat this documentation set as the permanent foundation of a commercial SaaS
platform that will be maintained for many years.
