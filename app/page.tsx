"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Anime = {
  mal_id:number; title:string; title_english?:string|null; synopsis?:string|null;
  episodes?:number|null; score?:number|null; year?:number|null; type?:string|null;
  images?:{webp?:{large_image_url?:string;image_url?:string};jpg?:{large_image_url?:string}};
};
type Payload = {data?:Anime[];error?:string};
const poster=(a:Anime)=>a.images?.webp?.large_image_url??a.images?.jpg?.large_image_url??a.images?.webp?.image_url??"";

function Card({anime}:{anime:Anime}) {
  return <Link href={`/anime/${anime.mal_id}`} className="poster-card group block overflow-hidden rounded-2xl border border-white/[.07] bg-[#11111b]">
    <div className="relative aspect-[3/4.2] overflow-hidden bg-[#211c31]">
      {poster(anime)?<Image src={poster(anime)} alt={anime.title} fill sizes="(max-width:640px) 44vw,(max-width:1024px) 25vw,180px" className="poster-image object-cover"/>:<div className="grid h-full place-items-center text-4xl text-white/30">✦</div>}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 to-transparent"/>
      {anime.score&&<span className="absolute right-2 top-2 rounded-lg bg-black/70 px-2 py-1 text-xs font-semibold text-amber-200">★ {anime.score.toFixed(1)}</span>}
      <span className="absolute bottom-2 left-2 rounded-md border border-white/15 bg-black/55 px-2 py-1 text-[10px] uppercase tracking-wider text-white/85">{anime.type??"Anime"}</span>
    </div>
    <div className="p-3"><h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 group-hover:text-[#d9b8ff]">{anime.title_english||anime.title}</h3><p className="mt-1 text-xs text-[#9693a8]">{anime.year??"Year unknown"}{anime.episodes?` · ${anime.episodes} eps`:""}</p></div>
  </Link>;
}

function Shelf({title,kicker,items,loading,error,retry}:{title:string;kicker:string;items:Anime[];loading:boolean;error:string;retry:()=>void}) {
  return <section className="mt-14">
    <div className="mb-5 flex items-end justify-between gap-4"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-[.28em] text-[#bc8cff]">{kicker}</p><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2></div><button onClick={retry} className="rounded-full border border-white/10 px-4 py-2 text-xs text-[#b9b4c9] hover:border-[#bc8cff]/50 hover:text-white">Refresh ↻</button></div>
    {error?<div className="rounded-2xl border border-rose-300/15 bg-rose-300/5 p-6 text-sm text-rose-100">{error}<button onClick={retry} className="ml-3 underline">Try again</button></div>
    :<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">{loading?Array.from({length:6}).map((_,i)=><div key={i} className="overflow-hidden rounded-2xl border border-white/[.06] bg-[#11111b]"><div className="shimmer aspect-[3/4.2]"/><div className="space-y-2 p-3"><div className="shimmer h-4 rounded"/><div className="shimmer h-3 w-2/3 rounded"/></div></div>):items.map(a=><Card key={a.mal_id} anime={a}/>)}</div>}
  </section>;
}

export default function Home() {
  const [airing,setAiring]=useState<Anime[]>([]),[popular,setPopular]=useState<Anime[]>([]);
  const [airingLoading,setAiringLoading]=useState(true),[popularLoading,setPopularLoading]=useState(true);
  const [airingError,setAiringError]=useState(""),[popularError,setPopularError]=useState("");
  const [query,setQuery]=useState(""),[results,setResults]=useState<Anime[]>([]);
  const [searchLoading,setSearchLoading]=useState(false),[searchError,setSearchError]=useState("");
  const load=useCallback(async(shelf:"airing"|"popular")=>{
    const loading=shelf==="airing"?setAiringLoading:setPopularLoading;
    const setItems=shelf==="airing"?setAiring:setPopular;
    const setError=shelf==="airing"?setAiringError:setPopularError;
    loading(true);setError("");
    try{const response=await fetch(`/api/anime?shelf=${shelf}`);const data:Payload=await response.json();if(!response.ok)throw new Error(data.error||"Unable to load anime.");setItems(data.data??[]);}
    catch(e){setError(e instanceof Error?e.message:"Unable to load anime.");}finally{loading(false);}
  },[]);
  useEffect(()=>{const timer=setTimeout(()=>{void load("airing");void load("popular");},0);return()=>clearTimeout(timer);},[load]);
  useEffect(()=>{
    const q=query.trim();if(!q)return;
    const timer=setTimeout(async()=>{setSearchLoading(true);setSearchError("");try{const r=await fetch(`/api/anime?q=${encodeURIComponent(q)}`);const d:Payload=await r.json();if(!r.ok)throw new Error(d.error||"Search failed.");setResults(d.data??[]);}catch(e){setSearchError(e instanceof Error?e.message:"Search failed.");}finally{setSearchLoading(false);}},420);
    return()=>clearTimeout(timer);
  },[query]);
  const featured=useMemo(()=>airing.find(a=>poster(a))??popular.find(a=>poster(a)),[airing,popular]);

  return <main className="min-h-screen overflow-hidden pb-20">
    <header className="container-shell flex h-[76px] items-center justify-between border-b border-white/[.07]">
      <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#c69aff] to-[#ff8cc9] text-lg font-black text-[#21112d] shadow-[0_0_30px_rgba(188,140,255,.22)]">A</span><span className="text-xl font-black tracking-tight">Ani<span className="gradient-text">Yan</span></span></Link>
      <nav className="hidden items-center gap-8 text-sm text-[#aaa6ba] md:flex"><a href="#airing" className="hover:text-white">Airing now</a><a href="#popular" className="hover:text-white">Popular</a><a href="#about" className="hover:text-white">About</a></nav>
      <a href="#discover" className="rounded-full border border-[#bc8cff]/35 bg-[#bc8cff]/10 px-4 py-2 text-xs font-semibold text-[#e4cfff] hover:bg-[#bc8cff]/20">Discover anime ↗</a>
    </header>

    <section className="container-shell relative mt-6 min-h-[460px] overflow-hidden rounded-[28px] border border-white/[.08] bg-[#151321] sm:min-h-[520px]">
      {featured&&poster(featured)&&<Image src={poster(featured)} alt="" fill priority sizes="100vw" className="object-cover object-[center_30%] opacity-35 blur-[1px]"/>}
      <div className="hero-glow absolute inset-0"/><div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-transparent to-transparent"/>
      <div className="relative flex min-h-[460px] max-w-3xl flex-col justify-center px-7 py-12 sm:min-h-[520px] sm:px-14">
        <span className="mb-5 flex w-fit items-center gap-2 rounded-full border border-[#bc8cff]/30 bg-[#bc8cff]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-[#e1c9ff]"><span className="h-1.5 w-1.5 rounded-full bg-[#d8adff]"/> Your next anime starts here</span>
        <h1 className="max-w-2xl text-5xl font-black leading-[1.04] tracking-[-.055em] sm:text-7xl">Less noise.<br/><span className="gradient-text">More anime.</span></h1>
        <p className="mt-6 max-w-lg text-sm leading-7 text-[#c1bdce] sm:text-base">A calmer place to explore the anime you love. Find your next obsession, check episode guides, and discover where to watch—without pop-ups getting in your way.</p>
        <div id="discover" className="glass mt-8 flex max-w-xl items-center gap-3 rounded-2xl p-2"><span className="pl-3 text-xl text-[#bda0e4]">⌕</span><input value={query} onChange={e=>{const value=e.target.value;setQuery(value);setResults([]);setSearchError("");setSearchLoading(Boolean(value.trim()));}} placeholder="Search anime titles..." aria-label="Search anime titles" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#777387]"/>{query&&<button onClick={()=>setQuery("")} className="px-3 text-xs text-[#aaa6ba] hover:text-white">Clear</button>}</div>
        <p className="mt-3 text-[11px] text-[#89859a]">No account. No watch tracking. No ad scripts.</p>
      </div>
      <div className="absolute bottom-7 right-8 hidden text-right md:block"><p className="text-[10px] uppercase tracking-[.22em] text-white/45">A little more</p><p className="mt-1 text-sm font-semibold text-white/80">anime, a little less chaos.</p></div>
    </section>

    <div className="container-shell">
      {query.trim()?<section className="mt-12"><div className="mb-5"><p className="mb-1 text-[10px] font-bold uppercase tracking-[.28em] text-[#bc8cff]">Find your next watch</p><h2 className="text-2xl font-bold sm:text-3xl">Results for “{query.trim()}”</h2></div>
        {searchError?<p className="rounded-xl border border-rose-300/15 bg-rose-300/5 p-5 text-sm text-rose-100">{searchError}</p>:searchLoading?<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{Array.from({length:6}).map((_,i)=><div key={i} className="shimmer aspect-[3/5] rounded-2xl"/>)}</div>:results.length?<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">{results.map(a=><Card key={a.mal_id} anime={a}/>)}</div>:<p className="rounded-2xl border border-white/[.07] bg-[#11111b] p-8 text-sm text-[#9693a8]">No anime found. Try another title.</p>}</section>
      :<><div id="airing"><Shelf title="Airing this season" kicker="Fresh episodes" items={airing} loading={airingLoading} error={airingError} retry={()=>void load("airing")}/></div><div id="popular"><Shelf title="Popular right now" kicker="A good place to start" items={popular} loading={popularLoading} error={popularError} retry={()=>void load("popular")}/></div></>}
    </div>

    <footer id="about" className="container-shell mt-20 border-t border-white/[.07] pt-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-lg font-black">Ani<span className="gradient-text">Yan</span></p><p className="mt-2 max-w-md text-xs leading-6 text-[#89859a]">An independent anime discovery guide. Catalog information is provided by the public Kitsu API. AniYan is not affiliated with Kitsu or anime rights holders.</p></div><p className="text-[11px] text-[#777387]">Built for anime fans. No account. No ad scripts.</p></div></footer>
  </main>;
}
