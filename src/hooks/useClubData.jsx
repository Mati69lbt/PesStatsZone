import { useLineups } from "../context/LineUpProvider";

export function useClubData() {
  const { state: lineupState } = useLineups();

  const hasLineupsLoaded =
    lineupState?.lineups && Object.keys(lineupState.lineups).length > 0;

  const clubs = Object.keys(lineupState?.lineups || {});
  const activeClub = lineupState?.activeClub || "";

  return { lineupState, hasLineupsLoaded, clubs, activeClub };
}
