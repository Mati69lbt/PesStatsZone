import React, { useEffect } from "react";

const useActiveClub = ({ activeClub, matchState, matchDispatch }) => {
  useEffect(() => {
    if (activeClub && matchState.activeClub !== activeClub) {
      matchDispatch({
        type: "ACTUALIZAR_CAMPO",
        campo: "activeClub",
        valor: activeClub,
      });
    }
  }, [activeClub, matchState.activeClub, matchDispatch]);
};

export default useActiveClub;
