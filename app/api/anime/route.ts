import { NextRequest, NextResponse } from "next/server";
import { mapAnime } from "@/lib/kitsu";
import { mapTenraiAnime } from "@/lib/tenrai";

const TENRAI = "https://api.tenrai.org/v1";
const KITSU = "https://kitsu.io/api/edge";
const headers = { Accept: "application/json" };

async function fromTenrai(url: URL) {
  const response = await fetch(url, { next: { revalidate: 600 }, headers });
  if (!response.ok) throw new Error(`Tenrai returned ${response.status}`);
  const payload = await response.json();
  return (payload.data ?? []).map(mapTenraiAnime);
}
async function fromKitsu(query: string | null, shelf: string, page: number) {
  const url = new URL(`${KITSU}/anime`);
  url.searchParams.set("page[limit]", "18");
  url.searchParams.set("page[offset]", String((page - 1) * 18));
  if (query) url.searchParams.set("filter[text]", query);
  else if (shelf === "popular") url.searchParams.set("sort", "-userCount");
  else {
    url.searchParams.set("filter[status]", "current");
    url.searchParams.set("sort", "-userCount");
  }
  const response = await fetch(url, { next: { revalidate: 600 }, headers: { Accept: "application/vnd.api+json" } });
  if (!response.ok) throw new Error("Kitsu fallback unavailable");
  const payload = await response.json();
  return (payload.data ?? []).map(mapAnime);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("q")?.trim() || null;
  const shelf = params.get("shelf") ?? "airing";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  let url: URL;
  if (query) {
    url = new URL(`${TENRAI}/anime`);
    url.searchParams.set("q", query);
  } else if (shelf === "popular") {
    url = new URL(`${TENRAI}/top/anime`);
    url.searchParams.set("filter", "bypopularity");
  } else if (shelf === "upcoming") {
    url = new URL(`${TENRAI}/seasons/upcoming`);
  } else {
    url = new URL(`${TENRAI}/seasons/now`);
  }
  url.searchParams.set("sfw", "true");
  url.searchParams.set("limit", "18");
  url.searchParams.set("page", String(page));

  try {
    let data: Awaited<ReturnType<typeof fromTenrai>>;
    let source = "Tenrai";
    try {
      data = await fromTenrai(url);
    } catch {
      source = "Kitsu fallback";
      data = await fromKitsu(query, shelf, page);
    }
    return NextResponse.json(
      { data, meta: { source, checkedAt: new Date().toISOString() } },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800" } }
    );
  } catch {
    return NextResponse.json({ error: "Anime catalog is temporarily unavailable. Please try again shortly." }, { status: 502 });
  }
}
