export function normalizeName(raw = "") {
  const s = (raw ?? "").toString();
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
