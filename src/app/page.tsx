"use client";

import { useState, useEffect } from "react";
import TeamList from "../components/TeamList";
import TierList from "../components/TierList";

type Team = {
  id: number;
  name: string;
  logo?: string;
};

export default function Home() {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [mode, setMode] = useState<"ranking" | "tier">("ranking");
  const [platform, setPlatform] = useState<"sleeper" | "espn" | "json">("sleeper");
  const [leagueId, setLeagueId] = useState<string>("");

  // Load saved rankings for Ranking Mode
  useEffect(() => {
    const saved = localStorage.getItem("fantasyRankings");
    if (saved) {
      setTeams(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (teams.length > 0) {
      localStorage.setItem("fantasyRankings", JSON.stringify(teams));
    }
  }, [teams]);

  // Manual JSON load
  const handleLoadTeams = () => {
    try {
      const parsed: Team[] = JSON.parse(jsonInput);
      setTeams(parsed);
    } catch {
      alert("Invalid JSON format");
    }
  };

  // Sleeper fetch
  const handleLoadSleeper = async () => {
    if (!leagueId) {
      alert("Please enter a Sleeper League ID");
      return;
    }

    try {
      const [usersRes, rostersRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`),
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`),
      ]);

      const users = await usersRes.json();
      const rosters = await rostersRes.json();

      const sleeperTeams = rosters.map((roster: any, idx: number) => {
        const owner = users.find((u: any) => u.user_id === roster.owner_id);

        return {
          id: roster.roster_id,
          name: roster.metadata?.team_name || owner?.display_name || `Team ${idx + 1}`,
          logo: roster.metadata?.team_logo
            ? roster.metadata.team_logo
            : owner?.avatar
            ? `https://sleepercdn.com/avatars/${owner.avatar}`
            : "https://via.placeholder.com/40",
        };
      });

      setTeams(sleeperTeams);
    } catch (err) {
      console.error(err);
      alert("Failed to load Sleeper league");
    }
  };

  // ESPN fetch (from Members page)
  const handleLoadESPN = async () => {
    if (!leagueId) {
      alert("Please enter an ESPN League ID");
      return;
    }

    try {
      const res = await fetch(`/api/espn?leagueId=${leagueId}`);
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      const espnTeams = data.teams.map((t: any) => ({
        id: t.id,
        name: t.name,
        logo: t.logo,
      }));

      setTeams(espnTeams);
    } catch (err) {
      console.error(err);
      alert("Failed to load ESPN league");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-10 bg-gray-900 text-gray-100">
      <h1 className="text-5xl font-extrabold mb-8 text-white drop-shadow">
        Fantasy Power Rankings
      </h1>

      {/* Platform Selector */}
      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value as "sleeper" | "espn" | "json")}
        className="border border-gray-700 bg-gray-800 text-white rounded-lg p-2 mb-6 shadow focus:ring-2 focus:ring-blue-500"
      >
        <option value="sleeper">Sleeper</option>
        <option value="espn">ESPN (Not currently supported)</option>
        <option value="json">Manual JSON</option>
      </select>

      {/* Sleeper Mode */}
      {platform === "sleeper" && (
        <>
          <input
            type="text"
            placeholder="Enter Sleeper League ID"
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            className="border border-gray-700 bg-gray-800 text-white rounded-lg p-3 w-full max-w-xl mb-4 focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleLoadSleeper}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow transition mb-6"
          >
            Load Sleeper League
          </button>
        </>
      )}

      {/* ESPN Mode */}
      {platform === "espn" && (
        <>
          <input
            type="text"
            placeholder="Enter ESPN League ID"
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            className="border border-gray-700 bg-gray-800 text-white rounded-lg p-3 w-full max-w-xl mb-4 focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={handleLoadESPN}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow transition mb-6"
          >
            Load ESPN League
          </button>
        </>
      )}

      {/* JSON Mode */}
      {platform === "json" && (
        <>
          <textarea
            className="border border-gray-700 bg-gray-800 text-white rounded-lg p-3 w-full max-w-xl h-40 mb-2 shadow focus:ring-2 focus:ring-blue-500"
            placeholder='Paste league JSON (format: [{"id":1,"name":"Team A","logo":"url"}])'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <button
            onClick={handleLoadTeams}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition mb-6"
          >
            Load Teams (from JSON)
          </button>
        </>
      )}

      {/* Mode toggle + conditional render */}
      {teams.length > 0 && (
        <div className="mt-8 w-full flex flex-col items-center">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setMode("ranking")}
              className={`px-4 py-2 rounded-lg font-semibold shadow transition 
                ${mode === "ranking" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
            >
              Ranking Mode
            </button>
            <button
              onClick={() => setMode("tier")}
              className={`px-4 py-2 rounded-lg font-semibold shadow transition 
                ${mode === "tier" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
            >
              Tier List Mode
            </button>
          </div>

          {mode === "ranking" ? (
            <TeamList teams={teams} setTeams={setTeams} />
          ) : (
            <TierList teams={teams} setTeams={setTeams} />
          )}
        </div>
      )}
    </div>
  );
}
