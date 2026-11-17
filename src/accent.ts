const T = [225, 190, 170, 250, 270];
let cur = 0;
export const ACC: [string, string][] = [['Bleu', '#2F6BFF'], ['Cyan', '#22D3EE'], ['Turquoise', '#14D8B4'], ['Indigo', '#5B5CFF'], ['Violet', '#8A63FF']];
export function setAccent(i: number) { cur = i; }
export function getAccent() { return cur; }
export function H(hex: string): string {
  if (cur === 0) return hex;
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (d < 0.05) return hex;
  const s = d / (1 - Math.abs(2 * l - 1));
  if (s < 0.3 || l > 0.9) return hex;
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  if (h < 185 || h > 265) return hex;
  h = (h + T[cur] - 225 + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  let rr = 0, gg = 0, bb = 0;
  if (h < 60) { rr = c; gg = x; } else if (h < 120) { rr = x; gg = c; } else if (h < 180) { gg = c; bb = x; } else if (h < 240) { gg = x; bb = c; } else if (h < 300) { rr = x; bb = c; } else { rr = c; bb = x; }
  const f = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return '#' + f(rr) + f(gg) + f(bb);
}
