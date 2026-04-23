# Findly Services

A modern full-stack service marketplace MVP built with Next.js App Router, Tailwind CSS, and Supabase Auth, Database, and Storage.

## Features

- Homepage search and fixed category grid
- Category listings with language/location filters and recommended/closest sorting
- Provider profiles with carousel-style photos, locked contact details, favorites UI, and request form
- Google and Apple OAuth through Supabase
- Client dashboard with favorites, requests, and suggestions
- Provider onboarding, Supabase Storage photo uploads, subscription pending flow, lead dashboard, and profile status
- Admin panel for provider moderation, listing visibility, categories, pricing, featured placements, analytics, and pending alerts
- Email notification helper for new requests, provider signups, subscriptions, and subscription expiry cron

## Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

Without Supabase credentials, the app runs with demo marketplace data so the UI can be reviewed immediately. Auth, persistence, uploads, moderation actions, and emails require Supabase environment variables.

## Supabase

1. Create a Supabase project.
2. Paste `supabase/schema.sql` into the Supabase SQL editor and run it.
3. Enable Google and Apple providers in Supabase Auth.
4. Add the callback URL: `http://localhost:3000/auth/callback`.
5. Copy project URL and anon key into `.env.local`.

The schema creates the `provider-media` public storage bucket, RLS policies, categories, provider lifecycle fields, favorites, requests, pricing, and notification events.

## Email

Email sending uses Resend if `RESEND_API_KEY` and `EMAIL_FROM` are configured. If they are omitted, notifications are logged and saved as database events where applicable.

Run subscription expiry emails from a scheduler with:

```bash
curl -X POST http://localhost:3000/api/cron/subscription-emails
```
