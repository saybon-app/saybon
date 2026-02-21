export const countWords = (text) => {
  if (!text) return 0;

  const cleaned = String(text)
    .replace(/\u00A0/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();

  if (!cleaned) return 0;

  const matches = cleaned.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g);
  return matches ? matches.length : 0;
};
