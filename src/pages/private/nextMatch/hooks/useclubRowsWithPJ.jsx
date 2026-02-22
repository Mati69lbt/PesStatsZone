import React, { useMemo } from 'react'
import { normalizeName } from '../../../../utils/normalizeName';

const useclubRowsWithPJ = (clubRows = [], pjByPlayer) => {
  return useMemo(() => {
    return (clubRows ?? []).map((r) => {
      const key = normalizeName(r?.name);
      const pjReal = pjByPlayer.get(key) ?? 0;
      return { ...r, pj: pjReal };
    });
  }, [clubRows, pjByPlayer]);
};

export default useclubRowsWithPJ