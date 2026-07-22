# PRODUCT.md — Business OS

> This document explains the **product**, not the code. For architecture see
> `ARCHITECTURE.md`; for the plan see `ROADMAP.md`.

---

## Mission

Give local service businesses the software they deserve — one premium system
that runs the whole business and grows it — so owners can spend their time on
the work, not on stitching together five disconnected tools.

## Vision

Every local service business — the detailer, the roofer, the electrician, the
salon — runs on a Business OS that is as considered and as capable as the
software the largest companies use. The website that wins the customer and the
system that serves them are one product, not two vendors.

Long term, each business runs its **own** Business OS instance, connected to an
**Agency OS** that provides oversight, support, and shared services across many
clients — without any client ever sharing another's data or infrastructure.

---

## The product in one sentence

**Business OS is business software for local service businesses, delivered as a
premium marketing website (the frontend) fused with an operational Business Hub
(the backend).**

- The **Website** wins customers: fast, beautiful, SEO-strong, conversion-built.
- The **Business Hub** runs the business: leads, quotes, reviews, content, team,
  and settings — everything in one place.

We are **not** selling websites. We are selling business software. The website
is simply the part of that software the customer sees.

---

## Target customers

**Primary:** owner-operated and small-team **local service businesses**, such as:

- Auto detailers, mechanics, mobile repair
- Roofers, electricians, plumbers, HVAC, general contractors
- Landscapers, cleaners, pest control
- Salons, barbershops, spas
- Dentists, clinics, and other appointment-based local services

**Shared traits:** they serve a local area, win work through reputation and
search, quote jobs, manage a pipeline of leads, and have little patience for
clunky software. They are underserved by both generic website builders (no
operations) and heavyweight CRMs (no marketing, too complex).

**Buyer:** typically the owner. **Delivered and supported by:** an agency
operating the Agency OS, who clones and configures a Business OS per client.

---

## Business philosophy

1. **One system, two surfaces.** Marketing frontend and operational backend are
   the same product. A lead captured on the website is a lead in the Hub —
   instantly, with no integration tax.
2. **Software, not a service deliverable.** The value compounds over time as the
   business uses the Hub, not just on launch day.
3. **Premium by default.** The design bar is Linear / Stripe / Vercel, not a
   Bootstrap admin panel. Quality is a feature.
4. **Independence for every client.** Each client runs their own instance, owns
   their own data, and can operate even if everything else disappears.
5. **Configurable, never bespoke.** Every capability is optional and driven by
   config or settings, so one template serves every trade.

---

## Core modules

| Module | Surface | What it does |
|---|---|---|
| **Marketing Website** | Public | Homepage, services, gallery, reviews, blog, careers, contact — SEO and conversion built in. |
| **Lead & CRM** | Business Hub | Captures and manages leads through a pipeline; notes, tags, assignment, CSV. |
| **Quotes** | Business Hub | Quote-request intake and status workflow. |
| **Reviews** | Both | Collects reviews; moderates and features them; publishes to the site. |
| **Content (Blog / Gallery)** | Both | Publishes articles and portfolio work that feed the marketing site. |
| **Team & Roles** | Business Hub | Employees, roles, and (future) access control. |
| **Business Settings** | Business Hub | Runtime company details, branding, feature flags — no code required. |
| **Theme / Industry Studio** | Business Hub | Re-skins the whole product per trade from a preset. |

Each module supports the philosophy: help the business **run** (operational
modules) and **grow** (marketing modules).

---

## Value proposition

- **For the business owner:** one premium system instead of a website vendor
  *plus* a CRM *plus* a review tool *plus* a scheduler. Faster to value, cheaper
  to run, nothing falls through the cracks.
- **For the agency:** a single, well-architected template cloned per client in
  minutes, re-branded from config, and supported centrally through the Agency
  OS — without rebuilding software for every customer.

---

## Long-term goals

1. Make the Website ⇄ Business Hub loop complete and automatic for every core
   module (capture → operate → publish).
2. Deepen the Business Hub into a genuine operations backend (CRM depth,
   scheduling, invoicing, client portal).
3. Establish the **Agency OS API/webhook contract** so each client instance can
   report to and be served by the Agency OS securely — without coupling.
4. Support multi-location and, eventually, multi-tenant operation on the same
   `org_id` foundation already in the schema.

See `ROADMAP.md` for the phased plan.

---

## Business model (context)

Business OS is delivered by an agency as **business software for a recurring
relationship**, not a one-off website build. The template is cloned per client;
each clone is an independently deployed, independently owned instance. Revenue
follows the software relationship (setup + ongoing), and the Agency OS layer
(separate product) provides the leverage to serve many clients at once.

> This repository does not implement billing or the Agency OS. It builds the
> product that a client runs.

---

## Success metrics

**Product quality**
- Time to clone + re-brand a new client (target: minutes, config-only).
- Lighthouse / Core Web Vitals on the marketing site (target: 95+).
- Build stays green; strict types; demo mode always works.

**Customer outcome (what the software should move for a client)**
- Leads captured and worked through the pipeline.
- Website → lead conversion rate.
- Reviews collected and published.
- Quotes issued and won.

**Platform health**
- Modules with a complete capture → operate → publish loop.
- Documentation freshness (docs updated in the same change as code).
