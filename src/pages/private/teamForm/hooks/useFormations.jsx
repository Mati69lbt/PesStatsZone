// useFormations.jsx
// Helpers puros (SIN hooks) para que funcionen bien con Formations.jsx

export const getLineupKey = (lineup) =>
  String(
    lineup?.id ??
      lineup?.key ??
      lineup?.codigo ??
      lineup?._id ??
      lineup?.createdAt ??
      "",
  );

export const originalLineup = (editingId, ordered = []) => {
  if (!editingId) return null;
  return ordered.find((l) => getLineupKey(l) === editingId) || null;
};

export const isDirty = (orig, draftStarters = [], draftCaptain) => {
  if (!orig) return false;

  const origStarters = Array.isArray(orig.starters) ? orig.starters : [];

  if (origStarters.length !== draftStarters.length) return true;

  const a = [...origStarters].sort().join("|");
  const b = [...draftStarters].sort().join("|");

  const captainChanged = (orig.captain ?? "") !== (draftCaptain ?? "");

  return a !== b || captainChanged;
};
