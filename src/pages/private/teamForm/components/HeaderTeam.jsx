import React from "react";
import { pretty } from "../../match/utils/pretty";

const HeaderTeam = ({ teamName }) => {
  return (
    <div>
      {" "}
      <h1 className="text-2xl font-bold mb-2">
        <span className="text-blue-700 underline">Equipo del DT:</span>{" "}
        <span className="block text-center text-3xl font-extrabold tracking-wide text-emerald-600 drop-shadow-sm -mt-8">
          <br />
          {pretty(teamName)}
        </span>
      </h1>
    </div>
  );
};

export default HeaderTeam;
