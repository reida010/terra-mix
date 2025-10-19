export function withAlpha(hexColor: string, alpha: number): string {
  const normalized = hexColor.trim();
  if (!/^#([\da-f]{3}|[\da-f]{6})$/i.test(normalized)) {
    return hexColor;
  }

  const hex = normalized.slice(1);
  const size = hex.length === 3 ? 1 : 2;

  const expand = (segment: string) =>
    size === 1 ? `${segment}${segment}` : segment;

  const r = parseInt(expand(hex.substring(0, size)), 16);
  const g = parseInt(expand(hex.substring(size, size * 2)), 16);
  const b = parseInt(expand(hex.substring(size * 2, size * 3)), 16);

  const clampedAlpha = Math.min(1, Math.max(0, alpha));

  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

