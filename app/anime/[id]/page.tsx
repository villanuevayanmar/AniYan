import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mapAnime, mapEpisode, type Anime } from "@/lib/kitsu";
import { mapTenraiAnime, mapTenraiEpisode } from "@/lib/tenrai";

const TENRAI = "https://api.tenrai.org/v1";
const KITSU = "https://kitsu.io/api/edge";

export default async function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  let anime: Anime | undefined;
  let episodes: ReturnType<typeof mapTenraiEpisode>[] = [];
  try {
    const [a, e] = await Promise.all([
      fetch(`${TENRAI}/anime/${id}/full?sfw=true`, { next: { revalidate: 900 } }).then(async r => r.ok ? r.json() : null),
      fetch(`${TENRAI}/anime/${id}/episodes`, { next: { revalidate: 900 } }).then(async r => r.ok ? r.json() : null),
    ]);
    const detail = a?.data ?? a;
    if (detail?.mal_id) {
      anime = mapTenraiAnime(detail);
      episodes = (e?.data ?? []).map(mapTenraiEpisode);
    }
  } catch { /* use the Kitsu fallback below */ }
  if (!anime) {
    const episodeUrl = `${KITSU}/episodes?filter%5BmediaType%5D=Anime&filter%5BmediaId%5D=${id}&page%5Blimit%5D=20&sort=number`;
    const [a, e] = await Promise.all([
      fetch(`${KITSU}/anime/${id}`, { next: { revalidate: 900 }, headers: { Accept: "application/vnd.api+json" } }).then(async r => r.ok ? r.json() : null).catch(() => null),
      fetch(episodeUrl, { next: { revalidate: 900 }, headers: { Accept: "application/vnd.api+json" } }).then(async r => r.ok ? r.json() : null).catch(() => null),
    ]);
    anime = a?.data ? mapAnime(a.data) : undefined;
    episodes = (e?.data ?? []).map(mapEpisode);
  }
  if (!anime) notFound();
  const image = anime.images?.webp?.large_image_url ?? anime.images?.jpg?.large_image_url;
  const watchUrl = `https://www.justwatch.com/ph/search?q=${encodeURIComponent(anime.title_english || anime.title)}`;

  return <main className="min-h-screen bg-[#09090f] text-white">
    <header className="mx-auto flex h-20 w-[min(1100px,calc(100%-40px))] items-center justify-between border-b border-white/[.07]">
      <Link href="/" className="text-xl font-black">Ani<span className="gradient-text">Yan</span></Link>
      <Link href="/" className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/75 hover:border-[#bc8cff]/50 hover:text-white">← Back to discover</Link>
    </header>
    <div className="mx-auto w-[min(1100px,calc(100%-40px))] py-10">
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <div className="relative mx-auto aspect-[3/4.2] w-full max-w-[260px] overflow-hidden rounded-2xl border border-white/10 bg-[#171322] shadow-2xl">
          {image && <Image src={image} alt={anime.title} fill priority sizes="260px" className="object-cover" />}
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#c69aff]">{anime.type ?? "Anime"}{anime.year ? ` · ${anime.year}` : ""}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{anime.title_english || anime.title}</h1>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/70">
            {[anime.status === "Currently Airing" || anime.status === "current" ? "Currently airing" : anime.status, anime.episodes ? `${anime.episodes} episodes` : "Episode count unavailable", anime.score ? `★ ${anime.score.toFixed(1)}` : null].filter(Boolean).map(tag => <span key={tag} className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5">{tag}</span>)}
          </div>
          <p className="mt-7 max-w-3xl whitespace-pre-line text-sm leading-7 text-[#bcb8ca]">{anime.synopsis || "No synopsis is available yet."}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gradient-to-r from-[#bd8aff] to-[#ec8fc8] px-5 py-3 text-sm font-bold text-[#1c1028] shadow-[0_8px_30px_rgba(188,140,255,.16)] hover:brightness-110">Find where to watch ↗</a>
            {anime.trailer?.url && <a href={anime.trailer.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/[.06]">Watch trailer ↗</a>}
          </div>
          <p className="mt-3 text-[11px] leading-5 text-white/35">Availability and advertisements are controlled by each streaming provider. AniYan does not host or redistribute episodes.</p>
        </div>
      </div>
      <section className="mt-14">
        <div className="mb-5"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#c69aff]">Episode guide</p><h2 className="mt-1 text-2xl font-bold">Episodes</h2></div>
        {episodes.length ? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{episodes.map(ep => <div key={ep.mal_id} className="flex items-center justify-between gap-4 rounded-xl border border-white/[.07] bg-[#11111b] px-4 py-3"><div className="min-w-0"><p className="text-xs font-semibold">Episode {ep.mal_id}</p><p className="mt-1 truncate text-xs text-white/50">{ep.title || ep.title_japanese || "Episode title unavailable"}</p></div></div>)}</div> : <p className="rounded-xl border border-white/[.07] bg-[#11111b] p-5 text-sm text-white/50">Episode information is not available from the catalog yet.</p>}
      </section>
      <p className="mt-12 border-t border-white/[.07] pt-6 text-xs text-white/35">Anime metadata from Tenrai, with Kitsu as a backup catalog. AniYan is an independent discovery guide.</p>
    </div>
  </main>;
}
