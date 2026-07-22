# UI_GUIDELINES.md — Business OS

> The visual and interaction language of Business OS. The bar is **Linear,
> Stripe, Raycast, Vercel, and Arc** — considered, quiet, fast, premium.
> Explicitly **not** a generic Bootstrap admin dashboard. Read this before
> writing any UI.

---

## Design principles

1. **Premium is the product.** Restraint over decoration. Whitespace, precise
   type, and calm color read as expensive. Avoid gradients-for-their-own-sake,
   heavy borders, and busy chrome.
2. **Content first, chrome last.** The interface should recede; the customer's
   business (their leads, their work, their brand) is the subject.
3. **One system, two surfaces, one language.** The Website and the Business Hub
   share tokens, primitives, spacing, and motion. They should feel like one
   product.
4. **Fast is a feeling.** Optimistic interactions, instant navigation, no
   layout shift. Perceived speed is part of "premium."
5. **Every client's brand, not ours.** Color and type are tokenized so a clone
   re-skins without touching components.

---

## Design tokens (source of truth)

All visual constants are **CSS variables** in `src/app/globals.css`, consumed
through Tailwind as `hsl(var(--token))`. Never hardcode a hex color, a
one-off radius, or a raw shadow in a component.

- **Color:** `--background`, `--foreground`, `--card`, `--popover`, `--primary`,
  `--secondary`, `--muted`, `--accent`, `--destructive`, `--success`,
  `--border`, `--input`, `--ring` — each with a light and `.dark` value.
- **Radius:** `--radius` (0.75rem) with `md`/`sm` derivations in Tailwind.
- **Runtime brand override:** `<BrandStyle>` (`src/features/theme`) overrides
  `--primary`/`--ring` per client/industry at runtime.

To re-brand: edit the tokens (or pick an industry preset). To change a
component: use the tokens. These two never mix.

---

## Color philosophy

- **Neutral-dominant.** The canvas is warm off-white paper / near-black ink.
  Most of any screen is neutral; color is spent deliberately.
- **One confident brand accent** (`--primary`) carries identity — CTAs, links,
  active states, focus rings. Don't dilute it across the UI.
- **Semantic colors are semantic only:** `--destructive` for danger,
  `--success` for positive state. Never decorative.
- **Dark mode is first-class,** not an inversion. Both themes are hand-tuned;
  verify every new surface in both.
- Accent should still pass contrast on its foreground pairing — see Accessibility.

---

## Typography

- Two font families via `next/font`: `--font-sans` (body/UI) and `--font-display`
  (headings), wired in `tailwind.config.ts` and `app/layout.tsx`. Swap per
  client in the layout only.
- **Hierarchy through weight and size, not color or decoration.** Display font
  for headings; sans for everything else.
- Body copy stays highly legible: generous line-height, constrained measure
  (~65–75ch) on long-form (blog, legal).
- Tabular/numeric data (Hub tables, stats) should read cleanly — align numbers,
  avoid cramped rows.
- Avoid ALL-CAPS except small eyebrow/label accents with tracked letter-spacing.

---

## Spacing & layout

- **Consistent rhythm.** Use the Tailwind spacing scale; don't invent one-off
  pixel values. Prefer multiples that already appear in the codebase.
- **Container:** centered, padded, max width `1280px` (2xl) via Tailwind's
  `container`. Marketing sections breathe with generous vertical spacing.
- **Density differs by surface:** the Website is airy and editorial; the
  Business Hub is denser and utilitarian — but both use the same scale.
- **Alignment is intentional.** Optical alignment, consistent gutters, no
  accidental ragged edges.

---

## Components

Build on the primitives in `src/components/ui/*` (Radix + CVA, typed,
forward-ref, theme-aware). Compose; don't reinvent. Add a variant to the
primitive rather than forking it.

### Buttons
- Variants via CVA (primary, secondary, ghost, destructive, etc.). Primary =
  `--primary`; use exactly one primary action per view.
- Clear hover/active/focus/disabled states. Visible focus ring (`--ring`).
- Include loading state (spinner + disabled) for any async action.

### Cards
- Subtle: `--card` surface, hairline `--border`, restrained shadow, `--radius`.
- Cards group related content; don't nest cards deeply or box everything.

### Tables (Business Hub)
- The Linear/Vercel standard: quiet header row, comfortable row height, hover
  highlight, aligned columns, numeric right-alignment where it helps.
- Row actions revealed on hover or in an overflow menu — never a wall of
  buttons. Detail opens in a drawer/sheet, not a route change where possible.
- Support search, filter, and (at volume) pagination — the `Pagination`
  primitive exists; use it before rendering unbounded rows.

### Forms
- React Hook Form + Zod. Label every field; inline, specific validation
  messages; describe errors with `aria-describedby`.
- Show pending state on submit; disable the button; toast the outcome.
- Public forms include a honeypot; never block a real user with a CAPTCHA wall.

### Modals & sheets
- Radix Dialog / Sheet. Focus-trapped, `Esc` to close, scroll-locked, labelled.
- Reserve modals for focused tasks and confirmations; prefer sheets/drawers for
  detail and editing so context stays visible.

### Command palette (⌘K)
- The Raycast/Linear pattern (`cmdk`) drives Hub navigation from `admin-nav.ts`.
  Keep it fast, keyboard-first, and the primary way power users navigate.

---

## Motion & animation

- **Framer Motion, tastefully.** Motion clarifies (enter, reveal, transition),
  it doesn't perform. Short durations, natural easing, no bounce-for-fun.
- **Scroll-reveal** on marketing sections is subtle and quick. Content must
  remain present in SSR HTML for SEO and no-JS (it renders, then animates).
- **Respect `prefers-reduced-motion`** everywhere — reduce or remove animation.
- Prefer transform/opacity (GPU-friendly); avoid animating layout properties.

---

## Loading states

- **Skeletons over spinners** for content areas (use the `Skeleton` primitive) —
  match the shape of the content to avoid layout shift.
- **Inline spinners** only for button-level actions.
- Provide `loading.tsx` per Hub segment as those land (see `TODO.md`); never a
  blank white flash.
- **No cumulative layout shift** — reserve space for images (`next/image` with
  dimensions) and async content.

---

## Empty states

- Every list/table/collection has a designed empty state: a short, human line of
  what this is, and one clear primary action to fill it ("Add your first
  service"). Never a bare empty table.
- Empty states are an onboarding surface — use them to teach the module.

---

## Error states

- Human, specific, actionable copy — never a raw stack trace or "Something went
  wrong" with no recourse.
- Provide a retry or a next step. Error boundaries per Hub segment as they land.
- Toasts for transient action failures; inline messaging for form/field errors.

---

## Responsive behavior

- **Mobile-first.** The Website must be excellent on a phone — that's where
  local customers are.
- Touch targets ≥ 44px; the mobile nav, sticky CTA, and floating call button
  are part of the conversion kit and must feel native on mobile.
- The Business Hub is usable on tablet/mobile; complex tables may scroll
  horizontally inside their own container rather than breaking the layout.
- Test at common breakpoints; never let the page body scroll horizontally.

---

## Accessibility (non-negotiable)

- **WCAG AA contrast** for text and meaningful UI. Verify brand accents in both
  themes.
- **Keyboard-complete:** every interactive element reachable and operable; logic
  focus order; visible focus ring (`--ring`) — never remove outlines without a
  replacement.
- **Semantic HTML + ARIA where needed** (Radix handles most). Label icon-only
  buttons. Provide alt text on images.
- **Skip link** to main content; landmark regions on every page.
- **Reduced motion** honored (see Motion).
- Forms: associated labels, described errors, sensible autocomplete.

---

## Reference products (calibrate against these)

- **Linear** — tables, keyboard-first flow, calm density, ⌘K.
- **Stripe** — typography, spacing, trustworthy restraint, docs-grade clarity.
- **Raycast** — the command palette and fast keyboard interactions.
- **Vercel** — neutral surfaces, crisp components, dark mode done right.
- **Arc** — playful-but-premium detail, considered motion.

If a screen looks like a default admin template, it's wrong. Re-reach for the
references above.
