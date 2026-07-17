# Terra Estates

A luxury real-estate web application built with React + Vite, backed by Supabase,
with a full admin panel, an in-browser concierge chatbot, and SEO built in.

**Live:** https://terra-realestate.vercel.app

## Tech Stack

- **React 19** + **React Router DOM** (lazy-loaded routes)
- **Vite** (build tool)
- **Tailwind CSS** (custom theme: ivory, charcoal, gold)
- **Supabase** — authentication + Postgres database (properties, agents, messages, subscribers, favorites, settings)
- **react-helmet-async** — per-page SEO
- **Lucide React** (icons), **AOS** (scroll animations), **Swiper.js** (testimonial slider)
- **EmailJS** (contact / inquiry emails)

## Features

### Public site
- Browse & filter properties by search, type, city, and country
- Property detail pages with photo gallery + lightbox
- Save favourite properties (heart)
- Meet-the-agents, about, and contact pages
- Newsletter sign-up
- **Concierge chatbot** — a client-side assistant (no external LLM) that handles
  natural-language property search, answers questions (buying, selling,
  financing, fees, viewings…), and runs a guided **"book a viewing"** flow
- **SEO** — per-page titles, meta descriptions, Open Graph/Twitter tags,
  structured data (JSON-LD), `robots.txt`, and `sitemap.xml`
- **Performance** — optimized (auto-sized/WebP) and lazy-loaded images

### Admin panel (`/admin`)
- Dashboard overview
- Properties CRUD, Agents CRUD
- Messages & newsletter subscriber management (with unread badges)
- Settings — theme/accent, and **Maintenance Mode** (password-protected global toggle)
- Access is restricted to Supabase users whose `profiles.is_admin` is `true`

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home — hero, featured properties, services, agents, testimonials |
| `/properties` | Browse & filter properties |
| `/properties/:id` | Property detail + enquiry form |
| `/agents` | Meet the team |
| `/about` | Company story & stats |
| `/contact` | Contact form |
| `/chatbot-info` | About the concierge assistant |
| `/login`, `/signup` | User auth |
| `/admin/*` | Admin panel (dashboard, properties, agents, messages, newsletter, settings) |

## Getting Started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # oxlint
```

### Environment variables

Create a `.env.local` (git-ignored) with your Supabase credentials:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### Database setup

Run the SQL in **`supabase/migration.sql`** in the Supabase SQL editor to create
the tables, policies, and seed data. It also includes the `app_settings` table
used by Maintenance Mode (see **`MAINTENANCE_SETUP.sql`** for that piece on its own).

## Deployment

Hosted on **Vercel** — pushing to the `main` branch auto-builds and deploys.
`vercel.json` provides the SPA rewrite so client-side routes resolve.

## SEO & local search

Structured data and sitemap are live. To get the full local-SEO benefit
(Google Business Profile, Search Console, real business details), follow
**`SEO_LOCAL_SETUP.md`**.

## Project structure

```
src/
  components/    # Navbar, Footer, Chatbot, Seo, Maintenance, Toast, …
  context/       # AuthContext, AdminContext (Supabase auth)
  pages/         # public pages + pages/admin/* panel
  utils/         # supabaseClient, storage (data access), concierge (chatbot engine)
  hooks/         # useFavorites
public/          # robots.txt, sitemap.xml, icons
supabase/        # migration.sql
```
