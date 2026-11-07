# AniYan

**Anime, without the noise.**

AniYan is a mobile-friendly anime discovery website built with Next.js App Router, React, TypeScript, and Tailwind CSS.

## Features

- Currently airing, upcoming, and popular anime shelves
- Debounced anime title search
- Anime details, synopsis, ratings, trailers, and episode guides
- Streaming-service discovery links for the Philippines via JustWatch
- Responsive dark interface with no ad scripts, pop-up providers, or tracking accounts
- Server-side catalog routes with caching and automatic provider fallback

## Anime data

AniYan uses the free, public [Tenrai API](https://docs.tenrai.org/) as its primary catalog. It is compatible with the Jikan v4 response format and requires no API key. Kitsu's public JSON:API is used as a fallback if Tenrai is unavailable. The providers control when their catalog data is refreshed, so newly announced or newly added titles may not appear immediately.

The app caches catalog responses to reduce upstream requests. No paid API plan, API key, database, or Supabase project is required.

## Tech stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Tenrai API (primary), Kitsu API (fallback)
- Vercel hosting

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## No database or account system

AniYan intentionally has no user accounts, watch history, favorites, database, or Supabase integration. It does not store personal viewing activity.

## Playback and content

Catalog APIs provide metadata, not licensed full-episode video streams. AniYan does not scrape, proxy, or host unauthorized streams. The anime detail page links to a provider search page and available official trailers. Streaming availability, ads, and subscriptions are controlled by each provider.

## Data attribution

Anime catalog data is provided through [Tenrai](https://docs.tenrai.org/) and, when needed, [Kitsu](https://kitsu.docs.apiary.io/). AniYan is an independent fan project and is not affiliated with these services or anime rights holders.

## Deploy

Push the repository to GitHub and import it into Vercel using the default Next.js settings. No environment variables are required.
