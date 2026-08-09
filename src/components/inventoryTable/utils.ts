/**
 * Converts a 6-digit or 3-digit HEX color to a subtle background tint
 * by appending ~12% opacity (alpha).
 */
export function getSubtleBgColor(hex?: string): string {
  if (!hex || typeof hex !== 'string') {
    return '#F9FAFC'; // Fallback background if hex is missing
  }

  const cleanHex = hex.replace('#', '');

  if (cleanHex.length === 3) {
    const expanded = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
    return `#${expanded}1F`;
  }

  if (cleanHex.length === 6) {
    return `#${cleanHex}1F`;
  }

  return '#F9FAFC';
}
