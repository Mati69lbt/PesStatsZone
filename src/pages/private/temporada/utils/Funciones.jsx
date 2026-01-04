const plantilla = () => ({ pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, df: 0 });

export const emptyTriple = () => ({
  General: plantilla(),
  Local: plantilla(),
  Visitante: plantilla(),
  Neutral: plantilla(),
});

export const metricas = ["PJ", "G", "E", "P", "G/P", "GF", "GC", "DF", "PTS/EFEC"];

export function getSeasonKey(fechaStr) {
  // Temporada: del 01/07 al 30/06 (p. ej., "2017-2018")
  const d = new Date(fechaStr);
  const m = d.getMonth() + 1;
  const y = d.getFullYear();
  return m >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

export function sumarFila(dst, gf, gc) {
  dst.pj += 1;
  if (gf > gc) dst.g += 1;
  else if (gf === gc) dst.e += 1;
  else dst.p += 1;
  dst.gf += gf;
  dst.gc += gc;
  dst.df = dst.gf - dst.gc;
}

// mismo criterio de color que en Temporadas.jsx
export function getColorSegunDiferenciaDeGol(dg) {
  if (dg > 0) return "bg-green-200";
  if (dg < 0) return "bg-red-200";
  return "bg-yellow-200";
}
export function getColorSegunResultado(stats = {}) {
  const { g = 0, e = 0, p = 0 } = stats;
  if (g >= e && g > p) return "bg-green-100";
  if (p > g && p >= e) return "bg-red-100";
  if (g === p && g > e) return "bg-yellow-100";
  if (g === e && g === p) return "bg-yellow-100";
  if (e >= g && e >= p) return "bg-yellow-100";
  return "bg-pink-100";
}

export const columnas = [
  "PJ",
  "G",
  "E",
  "P",
  "G/P",
  "GF",
  "GC",
  "DF", // General
  "PJ L",
  "G L",
  "E L",
  "P L",
  "G/P L",
  "GF L",
  "GC L",
  "DF L", // Local
  "PJ N",
  "G N",
  "E N",
  "P N",
  "G/P N",
  "GF N",
  "GC N",
  "DF N", // Neutral (nuevo)
  "PJ V",
  "G V",
  "E V",
  "P V",
  "G/P V",
  "GF V",
  "GC V",
  "DF V", // Visitante
];

// ✅ CAMBIO: círculo blanco con ring por signo (mismo estilo que DIF)
const ringBySign = (n) => {
  if (n > 0) return "ring-green-400";
  if (n < 0) return "ring-red-400";
  return "ring-yellow-400";
};

const renderCircle = (value, title) => (
  <span
    className={`inline-flex items-center justify-center rounded-full bg-white ring-2 ${ringBySign(
      value
    )} h-6 w-6 text-[10px] font-extrabold text-black`}
    title={title}
  >
    {value}
  </span>
);

const renderGpCircle = (gp) => renderCircle(gp, `G/P = ${gp}`);
const renderDfCircle = (df) => renderCircle(df, `DF = ${df}`);

export const renderBloques = (triple) => {
  const g = triple?.General ?? plantilla();
  const l = triple?.Local ?? plantilla();
  const n = triple?.Neutral ?? plantilla(); // nuevo
  const v = triple?.Visitante ?? plantilla();

  const bloques = [g, l, n, v];
  const celdas = [];

  for (const blk of bloques) {
    // ✅ CAMBIO: insertamos G/P = (g - p) entre P y GF
    const gp = (blk.g ?? 0) - (blk.p ?? 0);
    celdas.push(blk.pj, blk.g, blk.e, blk.p, gp, blk.gf, blk.gc, blk.df);
  }

  return celdas.map((val, i) => {
    // ✅ CAMBIO: tramo de 8 columnas por bloque
    const idx = i % 8;
    const bloqueIdx = Math.floor(i / 8);
    const ref = bloques[bloqueIdx];

    const bg = getColorSegunResultado(ref);

    return (
      <td key={i} className={`border px-2 py-1 text-center ${bg}`}>
        {idx === 4
          ? renderGpCircle(val)
          : idx === 7
          ? renderDfCircle(val)
          : val}
      </td>
    );
  });
};

export const renderBloquesDe = (triple, orden = []) => {
  const map = {
    General: triple?.General ?? plantilla(),
    Local: triple?.Local ?? plantilla(),
    Neutral: triple?.Neutral ?? plantilla(),
    Visitante: triple?.Visitante ?? plantilla(),
  };
  const celdas = [];

  for (const key of orden) {
    const blk = map[key] ?? plantilla();

    // ✅ CAMBIO: G/P = (g - p)
    const gp = (blk.g ?? 0) - (blk.p ?? 0);
    celdas.push(blk.pj, blk.g, blk.e, blk.p, gp, blk.gf, blk.gc, blk.df);
  }

  return celdas.map((val, i) => {
    // ✅ CAMBIO: 8 columnas por bloque
    const idx = i % 8;
    const bloqueIdx = Math.floor(i / 8);
    const refKey = orden[bloqueIdx];
    const refBlk = map[refKey] ?? plantilla();

    const bg = getColorSegunResultado(refBlk);

    return (
      <td
        key={`${refKey}-${i}`}
        className={`border px-2 py-1 text-center ${bg}`}
      >
        {idx === 4
          ? renderGpCircle(val)
          : idx === 7
          ? renderDfCircle(val)
          : val}
      </td>
    );
  });
};

export const BloqueHeader = ({ etiquetas, sufijos = ["", ""] }) => (
  <>
    {etiquetas.flatMap((lbl, idxLbl) =>
      metricas.map((m) => (
        <th key={`${lbl}-${m}`} className="border px-2 py-1 text-center">
          {m}
          {sufijos[idxLbl]}
        </th>
      ))
    )}
  </>
);

// Pinta los valores de 2 bloques (14 celdas): orden = ["General","Neutral"] o ["Local","Visitante"]
export const FilaDatos = ({ triple, orden }) => (
  <>{renderBloquesDe(triple, orden)}</>
);
