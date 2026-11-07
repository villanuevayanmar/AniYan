import { NextRequest, NextResponse } from "next/server";
import { mapAnime } from "@/lib/kitsu";

const API = "https://kitsu.io/api/edge";

export async function GET(request: NextRequest) {
  const params=request.nextUrl.searchParams;
  const query=params.get("q")?.trim();
  const shelf=params.get("shelf")??"airing";
  const page=Math.max(0,(Number(params.get("page")??"1")||1)-1);
  const url=new URL(`${API}/anime`);
  url.searchParams.set("page[limit]","18");
  url.searchParams.set("page[offset]",String(page*18));
  if(query) url.searchParams.set("filter[text]",query);
  else if(shelf==="popular") url.searchParams.set("sort","-userCount");
  else {
    url.searchParams.set("filter[status]","current");
    url.searchParams.set("sort","-userCount");
  }

  try {
    const response=await fetch(url.toString(),{next:{revalidate:query?120:300},headers:{Accept:"application/vnd.api+json"}});
    if(!response.ok) return NextResponse.json({error:"Anime catalog is temporarily unavailable."},{status:response.status===429?429:502});
    const payload=await response.json();
    return NextResponse.json(
      {data:(payload.data??[]).map(mapAnime),meta:payload.meta??{}},
      {headers:{"Cache-Control":"public, s-maxage=180, stale-while-revalidate=600"}}
    );
  } catch {
    return NextResponse.json({error:"Could not reach the anime catalog."},{status:502});
  }
}