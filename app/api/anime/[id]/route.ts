import { NextResponse } from "next/server";
import { mapAnime, mapEpisode } from "@/lib/kitsu";

const API="https://kitsu.io/api/edge";

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  if(!/^\d+$/.test(id)) return NextResponse.json({error:"Invalid anime ID."},{status:400});
  const episodeUrl=`${API}/episodes?filter%5BmediaType%5D=Anime&filter%5BmediaId%5D=${id}&page%5Blimit%5D=20&sort=number`;
  try {
    const [animeResponse,episodesResponse]=await Promise.all([
      fetch(`${API}/anime/${id}`,{next:{revalidate:900},headers:{Accept:"application/vnd.api+json"}}),
      fetch(episodeUrl,{next:{revalidate:900},headers:{Accept:"application/vnd.api+json"}}),
    ]);
    if(!animeResponse.ok) return NextResponse.json({error:"Anime details could not be loaded."},{status:animeResponse.status===404?404:502});
    const animePayload=await animeResponse.json();
    const episodesPayload=episodesResponse.ok?await episodesResponse.json():{data:[]};
    return NextResponse.json(
      {data:mapAnime(animePayload.data),episodes:(episodesPayload.data??[]).map(mapEpisode)},
      {headers:{"Cache-Control":"public, s-maxage=600, stale-while-revalidate=1800"}}
    );
  } catch {
    return NextResponse.json({error:"Could not reach the anime catalog."},{status:502});
  }
}