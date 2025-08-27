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
      const res = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`);
      const data = await res.json();

      const sleeperTeams = data.map((user: any, idx: number) => ({
        id: idx + 1,
        name: user.display_name || `Team ${idx + 1}`,
        logo: user.avatar
          ? `https://sleepercdn.com/avatars/${user.avatar}`
          : "https://via.placeholder.com/40",
      }));

      setTeams(sleeperTeams);
    } catch (err) {
      console.error(err);
      alert("Failed to load Sleeper league");
    }
  };

  // ESPN fetch (private league only)
  const handleLoadESPN = async () => {
    try {
      const res = await fetch(`/api/espn?key=${process.env.NEXT_PUBLIC_LEAGUE_KEY}`);
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      const espnTeams = data.teams.map((t: any) => ({
        id: t.id,
        name: `${t.location} ${t.nickname}`,
        logo: t.logo || "https://via.placeholder.com/40",
      }));

      setTeams(espnTeams);
    } catch (err) {
      console.error(err);
      alert("Failed to load ESPN league");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-10 bg-gradient-to-b from-gray-100 to-gray-200">
      <h1 className="text-5xl font-extrabold mb-8 text-gray-800 drop-shadow">
        Fantasy Power Rankings
      </h1>

      {/* Platform Selector */}
      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value as "sleeper" | "espn" | "json")}
        className="border rounded-lg p-2 mb-6"
      >
        <option value="sleeper">Sleeper</option>
        <option value="espn">ESPN (My League Only)</option>
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
            className="border rounded-lg p-3 w-full max-w-xl mb-4 shadow focus:ring-2 focus:ring-green-400"
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
        <button
          onClick={handleLoadESPN}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow transition mb-6"
        >
          Load My ESPN League
        </button>
      )}

      {/* JSON Mode */}
      {platform === "json" && (
        <>
          <textarea
            className="border rounded-lg p-3 w-full max-w-xl h-40 mb-2 shadow focus:ring-2 focus:ring-blue-400 text-black bg-white placeholder-gray-500"
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
              className={`px-4 py-2 rounded-lg font-semibold shadow 
                ${mode === "ranking" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              Ranking Mode
            </button>
            <button
              onClick={() => setMode("tier")}
              className={`px-4 py-2 rounded-lg font-semibold shadow 
                ${mode === "tier" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
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
