type KitsuAnime = {
  id: string;
  attributes: {
    canonicalTitle?: string | null;
    titles?: { en?: string | null; en_us?: string | null; ja_jp?: string | null };
    synopsis?: string | null;
    episodeCount?: number | null;
    averageRating?: string | number | null;
    startDate?: string | null;
    subtype?: string | null;
    status?: string | null;
    posterImage?: { large?: string | null; original?: string | null } | null;
    youtubeVideoId?: string | null;
  };
};
type KitsuEpisode = {
  id: string;
  attributes: {
    canonicalTitle?: string | null;
    titles?: { en_us?: string | null; ja_jp?: string | null };
    number?: number | null;
    synopsis?: string | null;
  };
};
export type Anime = {
  mal_id: number; title: string; title_english?: string | null; synopsis?: string | null;
  episodes?: number | null; score?: number | null; year?: number | null; type?: string | null;
  status?: string | null;
  images?: { jpg?: { large_image_url?: string } };
  trailer?: { url?: string | null };
};
export type AnimeEpisode = { mal_id: number; title: string; title_japanese?: string | null };
export function mapAnime(item: KitsuAnime): Anime {
  const a=item.attributes;
  const poster=a.posterImage?.large ?? a.posterImage?.original ?? undefined;
  const rating=a.averageRating == null ? null : Number(a.averageRating);
  return {
    mal_id:Number(item.id),
    title:a.canonicalTitle ?? a.titles?.en ?? "Untitled anime",
    title_english:a.titles?.en ?? a.canonicalTitle ?? null,
    synopsis:a.synopsis ?? null,
    episodes:a.episodeCount ?? null,
    score:Number.isFinite(rating as number) && rating !== null ? Math.round((rating as number)/10*10)/10 : null,
    year:a.startDate ? Number(a.startDate.slice(0,4)) : undefined,
    type:a.subtype ?? "Anime",
    status:a.status ?? undefined,
    images:poster ? {jpg:{large_image_url:poster}} : undefined,
    trailer:a.youtubeVideoId ? {url:`https://www.youtube.com/watch?v=${a.youtubeVideoId}`} : undefined,
  };
}
export function mapEpisode(item: KitsuEpisode): AnimeEpisode {
  return {
    mal_id:Number(item.attributes.number ?? item.id),
    title:item.attributes.canonicalTitle ?? item.attributes.titles?.en_us ?? `Episode ${item.attributes.number ?? ""}`,
    title_japanese:item.attributes.titles?.ja_jp ?? null,
  };
}