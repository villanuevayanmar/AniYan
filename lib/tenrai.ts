import type { Anime, AnimeEpisode } from "@/lib/kitsu";

type TenraiAnime = {
  mal_id: number;
  title?: string;
  title_english?: string | null;
  synopsis?: string | null;
  episodes?: number | null;
  score?: number | null;
  year?: number | null;
  type?: string | null;
  status?: string | null;
  images?: Anime["images"];
  trailer?: { url?: string | null; youtube_id?: string | null };
};
type TenraiEpisode = { mal_id: number; title?: string | null; title_japanese?: string | null };

export function mapTenraiAnime(item: TenraiAnime): Anime {
  return {
    mal_id: item.mal_id,
    title: item.title || item.title_english || "Untitled anime",
    title_english: item.title_english ?? null,
    synopsis: item.synopsis ?? null,
    episodes: item.episodes ?? null,
    score: typeof item.score === "number" ? item.score : null,
    year: item.year ?? undefined,
    type: item.type ?? "Anime",
    status: item.status ?? undefined,
    images: item.images,
    trailer: item.trailer?.url
      ? { url: item.trailer.url }
      : item.trailer?.youtube_id
        ? { url: `https://www.youtube.com/watch?v=${item.trailer.youtube_id}` }
        : undefined,
  };
}
export function mapTenraiEpisode(item: TenraiEpisode): AnimeEpisode {
  return {
    mal_id: item.mal_id,
    title: item.title || `Episode ${item.mal_id}`,
    title_japanese: item.title_japanese ?? null,
  };
}
