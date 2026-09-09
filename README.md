# Tesra Cosmetics

A production-ready, luxury beauty e-commerce storefront built with Next.js 14 (App
Router, TypeScript), Tailwind CSS, Framer Motion, and Supabase (Postgres + Auth + RLS).
Deploys free on Vercel + Supabase's free tier.

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. Open the SQL editor and run `supabase/schema.sql` — it creates the `profiles`,
   `products`, and `site_settings` tables, Row Level Security policies, an
   auto-profile-on-signup trigger, and seeds the full starting catalog (lashes,
   4 concealer shades, 2 lip liner shades, 2 eye liner shades, blender, lash glue).
3. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
4. Promote your own account to admin after signing up once, by running in the SQL editor:
   ```sql
   update public.profiles set role = 'admin' where id = 'YOUR-USER-UUID';
   ```

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 3. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## 4. Deploy to Vercel

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables in the Vercel project
   settings.
4. Deploy — everything (auth, catalog, cart, admin) runs on the free tier.

## What's included

| File | Purpose |
|---|---|
| `tailwind.config.js` | Custom pink/peach/berry/gold palette, fonts, glass/pill utilities |
| `lib/delivery.ts` | Danfe Express step-rounding delivery fee calculator |
| `lib/supabase.ts` | Supabase client + admin/session helpers |
| `components/Navbar.tsx` | Responsive header: nav, search, cart badge, auth status |
| `components/ProfileCompletionModal.tsx` | Mandatory onboarding modal for first-time users |
| `app/shop/page.tsx` | Dynamic grid with category filter, price slider, sort, realtime sync |
| `app/product/[id]/page.tsx` | Multi-image gallery, shade picker, quantity, add-to-cart |
| `app/admin/page.tsx` | Analytics, product CMS (CRUD), live site customizer |
| `supabase/schema.sql` | Tables, RLS policies, triggers, and seed catalog |

## Notes for production

- Replace the Unsplash placeholder image URLs in `supabase/schema.sql` and the admin
  panel with real product photography hosted in Supabase Storage or a CDN.
- `lib/delivery.ts`'s `DEFAULT_ZONE_RATES` are illustrative — wire them to your real
  Danfe Express rate card or a distance/weight lookup before launch.
- Checkout/payment integration (e.g. eSewa, Khalti, or COD confirmation) is not wired
  up in this scaffold — the cart drawer's "Checkout" button is a hook point for that
  flow.
