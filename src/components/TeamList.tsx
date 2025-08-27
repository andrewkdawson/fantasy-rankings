"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

type Team = {
  id: number;
  name: string;
  logo?: string;
};

type Props = {
  teams: Team[];
  setTeams: (teams: Team[]) => void;
};

export default function TeamList({ teams, setTeams }: Props) {
  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;

    const reordered = Array.from(teams);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setTeams(reordered);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="teams">
        {(provided) => (
          <ul
            className="w-full max-w-xl bg-white rounded shadow p-4"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {teams.map((team, index) => (
              <Draggable key={team.id} draggableId={String(team.id)} index={index}>
                {(provided) => (
                  <li
                    className="flex items-center gap-4 p-3 mb-2 border-b rounded-lg hover:bg-gray-50 transition"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {/* Rank number */}
                    <span className="w-6 text-gray-700 font-bold">{index + 1}</span>

                    {/* Team logo */}
                    <img
                      src={team.logo || "https://via.placeholder.com/40"}
                      alt={team.name}
                      className="w-10 h-10 rounded-full border"
                    />

                    {/* Team name */}
                    <span className="font-semibold text-lg text-gray-900">
                      {team.name}
                    </span>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
