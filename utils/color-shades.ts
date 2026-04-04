function darkenColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);

  const R = Math.max((num >> 16) - amt, 0);
  const G = Math.max(((num >> 8) & 0x00ff) - amt, 0);
  const B = Math.max((num & 0x0000ff) - amt, 0);

  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, "0")}`;
}

function lightenColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);

  const R = Math.min((num >> 16) + amt, 255);
  const G = Math.min(((num >> 8) & 0x00ff) + amt, 255);
  const B = Math.min((num & 0x0000ff) + amt, 255);

  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, "0")}`;
}
