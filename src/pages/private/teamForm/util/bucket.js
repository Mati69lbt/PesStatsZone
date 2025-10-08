import React from "react";

const bucket = (lineups = {}, activeClub = "") => {
  const clubBucket = lineups?.[activeClub] || {};
  const formations = Array.isArray(clubBucket.formations)
    ? clubBucket.formations
    : [];
  const ordered = [...formations].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  return ordered;
};

export default bucket;
