export const startEditLineup = (lineup) => {
  const key = getLineupKey(lineup);
  const base = Array.isArray(lineup.starters) ? lineup.starters : [];
  setEditingId(key);
  setDraftStarters([...base]);
  setDraftCaptain(lineup.captain ?? base[0] ?? null);
  setSelectedOption("");
};

export const stopEdit = () => {
  setEditingId("");
  setDraftStarters([]);
  setDraftCaptain(null);
  setSelectedOption("");
};

export const removeFromDraft = (player) => {
  setDraftStarters((prev) => prev.filter((p) => p !== player));
  setDraftCaptain((prev) => (prev === player ? null : prev));
};

export const canUpdate = Boolean(
  editMode && editingId && isDirty && draftStarters.length === 11,
);

export const handleUpdate = () => {
  if (!originalLineup) return;

  if (draftStarters.length !== 11) {
    Notiflix.Notify.failure(
      "Tu formación debe tener 11 jugadores para actualizar.",
    );
    return;
  }

  const nextCaptain =
    draftCaptain && draftStarters.includes(draftCaptain)
      ? draftCaptain
      : (draftStarters[0] ?? null);

  if (!nextCaptain) {
    Notiflix.Notify.failure("No se pudo determinar capitán.");
    return;
  }

  const ok = window.confirm("¿Actualizar esta formación?");
  if (!ok) return;

  const updated = {
    ...originalLineup,
    captain: nextCaptain,
    starters: [...draftStarters],
  };

  const updatedList = ordered.map((l) => {
    const key = getLineupKey(l);
    if (key === editingId) return updated;
    return l;
  });

  dispatch({
    type: LINEUPS_UPSERT_BUCKET,
    payload: { club: activeClub, bucket: { formations: updatedList } },
  });

  Notiflix.Notify.success("Formación actualizada");
  stopEdit();
};

export const onToggleEditMode = () => {
  setEditMode((v) => {
    const next = !v;
    if (!next) stopEdit();
    return next;
  });
};
