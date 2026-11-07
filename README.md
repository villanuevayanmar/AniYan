# AniYan

**Anime, without the noise.**

AniYan is a mobile-friendly anime discovery website built with Next.js App Router, React, TypeScript, and Tailwind CSS. It uses the public Kitsu JSON:API for anime catalog information and metadata.

## Features

- Currently airing and popular anime shelves
- Debounced anime title search
- Anime details, synopsis, ratings, trailers, and episode guides
- Streaming-service discovery links for the Philippines via JustWatch
- Responsive dark interface with no ad scripts, pop-up providers, or tracking accounts
- Server-side API routes with short-lived caching

## Tech stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Kitsu public JSON:API
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

Kitsu provides anime catalog metadata, not licensed full-episode video streams. AniYan does not scrape, proxy, or host unauthorized streams. The anime detail page links to a provider search page and available official trailers. Streaming availability, ads, and subscriptions are controlled by each provider.

## Data attribution

Anime catalog data is provided through the [Kitsu API](https://kitsu.docs.apiary.io/). AniYan is an independent fan project and is not affiliated with Kitsu or the anime rights holders.

## Deploy

Push the repository to GitHub and import it into Vercel using the default Next.js settings. No environment variables are required.
