"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useState, useEffect } from "react";

type Team = {
  id: number;
  name: string;
  logo?: string;
};

type Tier = {
  id: string; // stable key
  label: string; // editable display name
  color: string;
};

type Props = {
  teams: Team[];
  setTeams: (teams: Team[]) => void;
};

// Default S–F tiers
const defaultTiers: Tier[] = [
  { id: "tier-1", label: "S", color: "bg-red-600" },
  { id: "tier-2", label: "A", color: "bg-orange-500" },
  { id: "tier-3", label: "B", color: "bg-yellow-400" },
  { id: "tier-4", label: "C", color: "bg-green-500" },
  { id: "tier-5", label: "D", color: "bg-blue-500" },
  { id: "tier-6", label: "F", color: "bg-gray-600" },
];

// Always-present Unassigned bucket
const unassignedTier: Tier = {
  id: "unassigned",
  label: "Unassigned",
  color: "bg-gray-500",
};

export default function TierList({ teams }: Props) {
  const [tiers, setTiers] = useState<Record<string, Team[]>>({});
  const [tierNames, setTierNames] = useState<Tier[]>([
    ...defaultTiers,
    unassignedTier,
  ]);

  // Load saved state
  useEffect(() => {
    const savedTiers = localStorage.getItem("tieredTeams");
    const savedNames = localStorage.getItem("tierNames");

    if (savedTiers)
      setTiers(JSON.parse(savedTiers));
    else
      setTiers(
        Object.fromEntries(
          [...defaultTiers, unassignedTier].map((tier) => [tier.id, []])
        )
      );

    if (savedNames) setTierNames(JSON.parse(savedNames));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("tieredTeams", JSON.stringify(tiers));
    localStorage.setItem("tierNames", JSON.stringify(tierNames));
  }, [tiers, tierNames]);

  // Drop new teams into Unassigned if not placed
  useEffect(() => {
    if (!teams.length) return;
    setTiers((prev) => {
      const copy = { ...prev };
      const allPlacedIds = Object.values(copy).flat().map((t) => t.id);

      if (!copy[unassignedTier.id]) {
        copy[unassignedTier.id] = [];
      }

      teams.forEach((team) => {
        if (!allPlacedIds.includes(team.id)) {
          copy[unassignedTier.id].push(team);
        }
      });
      return copy;
    });
  }, [teams]);

  // Handle drag/drop
  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Reorder inside tier
    if (source.droppableId === destination.droppableId) {
      const reordered = Array.from(tiers[source.droppableId] || []);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);

      setTiers({ ...tiers, [source.droppableId]: reordered });
    } else {
      // Move across tiers
      const sourceItems = Array.from(tiers[source.droppableId] || []);
      const destItems = Array.from(tiers[destination.droppableId] || []);

      const [moved] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, moved);

      setTiers({
        ...tiers,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems,
      });
    }
  };

  // Rename tier
  const handleRename = (id: string, newLabel: string) => {
    if (id === unassignedTier.id) return;
    setTierNames((prev) =>
      prev.map((tier) => (tier.id === id ? { ...tier, label: newLabel } : tier))
    );
  };

  // Add tier
  const addTier = () => {
    const newId = `tier-${tierNames.length + 1}`;
    const newTier = {
      id: newId,
      label: `Tier ${tierNames.length + 1}`,
      color: "bg-purple-500",
    };

    setTierNames((prev) => [
      ...prev.filter((t) => t.id !== unassignedTier.id),
      newTier,
      unassignedTier,
    ]);
    setTiers({ ...tiers, [newId]: [] });
  };

  // Delete tier → send its teams to Unassigned
  const deleteTier = (id: string) => {
    if (id === unassignedTier.id) return;

    setTierNames((prev) => prev.filter((tier) => tier.id !== id));
    setTiers((prev) => {
      const copy = { ...prev };
      const movedTeams = copy[id] || [];
      delete copy[id];
      if (!copy[unassignedTier.id]) copy[unassignedTier.id] = [];
      copy[unassignedTier.id] = [...copy[unassignedTier.id], ...movedTeams];
      return copy;
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-5xl">
      <DragDropContext onDragEnd={handleOnDragEnd}>
        {tierNames.map((tier) => (
          <Droppable
            droppableId={tier.id}
            key={tier.id}
            direction="horizontal"
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex items-center w-full rounded-lg overflow-hidden shadow-md ${
                  tier.id === unassignedTier.id ? "bg-transparent shadow-none" : ""
                }`}
              >
                {/* Normal tiers */}
                {tier.id !== unassignedTier.id ? (
                  <>
                    {/* Tier label */}
                    <div
                      className={`${tier.color} text-white font-bold text-lg flex items-center justify-center w-32 h-24`}
                    >
                      <input
                        type="text"
                        value={tier.label}
                        onChange={(e) => handleRename(tier.id, e.target.value)}
                        className="bg-transparent text-center font-bold w-full outline-none"
                      />
                    </div>

                    {/* Drop zone */}
                    <div className="flex flex-wrap gap-2 flex-1 bg-gray-800 border border-gray-700 min-h-[96px] p-3 relative">
                      {tiers[tier.id]?.map((team, index) => (
                        <Draggable
                          key={team.id}
                          draggableId={String(team.id)}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <img
                                src={team.logo || "https://via.placeholder.com/40"}
                                alt={team.name}
                                className="w-10 h-10 rounded-full border border-gray-600"
                              />
                              <span className="font-semibold text-gray-100">
                                {team.name}
                              </span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Delete tier button */}
                      <button
                        onClick={() => deleteTier(tier.id)}
                        className="absolute top-2 right-2 text-sm px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </>
                ) : (
                  // Unassigned bucket (floating, no label)
                  <div className="flex flex-wrap gap-2 w-full min-h-[96px] p-3 bg-transparent">
                    {tiers[tier.id]?.map((team, index) => (
                      <Draggable
                        key={team.id}
                        draggableId={String(team.id)}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <img
                              src={team.logo || "https://via.placeholder.com/40"}
                              alt={team.name}
                              className="w-10 h-10 rounded-full border border-gray-600"
                            />
                            <span className="font-semibold text-gray-100">
                              {team.name}
                            </span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>

      {/* Add tier button */}
      <button
        onClick={addTier}
        className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow transition"
      >
        + Add Tier
      </button>
    </div>
  );
}
