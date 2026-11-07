import { NextResponse } from "next/server";
import { mapAnime, mapEpisode } from "@/lib/kitsu";
import { mapTenraiAnime, mapTenraiEpisode } from "@/lib/tenrai";

const TENRAI = "https://api.tenrai.org/v1";
const KITSU = "https://kitsu.io/api/edge";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid anime ID." }, { status: 400 });
  try {
    try {
      const [animeResponse, episodesResponse] = await Promise.all([
        fetch(`${TENRAI}/anime/${id}/full?sfw=true`, { next: { revalidate: 900 } }),
        fetch(`${TENRAI}/anime/${id}/episodes`, { next: { revalidate: 900 } }),
      ]);
      if (!animeResponse.ok) throw new Error("Tenrai detail unavailable");
      const animePayload = await animeResponse.json();
      const episodesPayload = episodesResponse.ok ? await episodesResponse.json() : { data: [] };
      const anime = animePayload.data ?? animePayload;
      const episodes = episodesPayload.data ?? [];
      return NextResponse.json(
        { data: mapTenraiAnime(anime), episodes: episodes.map(mapTenraiEpisode), meta: { source: "Tenrai" } },
        { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" } }
      );
    } catch {
      const episodeUrl = `${KITSU}/episodes?filter%5BmediaType%5D=Anime&filter%5BmediaId%5D=${id}&page%5Blimit%5D=20&sort=number`;
      const [animeResponse, episodesResponse] = await Promise.all([
        fetch(`${KITSU}/anime/${id}`, { next: { revalidate: 900 }, headers: { Accept: "application/vnd.api+json" } }),
        fetch(episodeUrl, { next: { revalidate: 900 }, headers: { Accept: "application/vnd.api+json" } }),
      ]);
      if (!animeResponse.ok) return NextResponse.json({ error: "Anime details could not be loaded." }, { status: animeResponse.status === 404 ? 404 : 502 });
      const animePayload = await animeResponse.json();
      const episodesPayload = episodesResponse.ok ? await episodesResponse.json() : { data: [] };
      return NextResponse.json(
        { data: mapAnime(animePayload.data), episodes: (episodesPayload.data ?? []).map(mapEpisode), meta: { source: "Kitsu fallback" } },
        { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" } }
      );
    }
  } catch {
    return NextResponse.json({ error: "Could not reach the anime catalog." }, { status: 502 });
  }
}
