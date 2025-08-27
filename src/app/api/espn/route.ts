import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accessKey = searchParams.get("key");

  // Require secret key
  if (accessKey !== process.env.MY_LEAGUE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const seasonId = new Date().getFullYear().toString();
  const leagueId = process.env.ESPN_LEAGUE_ID;

  try {
    const res = await fetch(
      `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${seasonId}/segments/0/leagues/${leagueId}`,
      {
        headers: {
          Cookie: `espn_s2=${process.env.ESPN_S2}; SWID=${process.env.ESPN_SWID};`,
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch ESPN API");
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
