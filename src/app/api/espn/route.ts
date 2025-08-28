import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const leagueId = searchParams.get("leagueId");
  const seasonId =
    searchParams.get("seasonId") || new Date().getFullYear().toString();

  if (!leagueId) {
    return NextResponse.json({ error: "Missing leagueId" }, { status: 400 });
  }

  try {
    const url = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${seasonId}/segments/0/leagues/${leagueId}`;
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch league data" }, { status: res.status });
    }

    const data = await res.json();

    const teams = (data.teams || []).map((t: any) => ({
      id: t.id,
      name: `${t.location ?? ""} ${t.nickname ?? ""}`.trim(),
      logo: t.logo || "https://via.placeholder.com/40",
    }));

    if (!teams.length) {
      return NextResponse.json({ error: "No teams found (maybe private league?)" });
    }

    return NextResponse.json({ teams });
  } catch (err: any) {
    console.error("ESPN API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
