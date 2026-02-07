/**
 * Generate deterministic waveform bar heights per song
 * Each song gets a unique visual waveform (SoundCloud-style)
 * Bar heights derived independently per bar for distinct patterns per track
 */

const BAR_COUNT = 12;
const MIN_HEIGHT = 3;
const MAX_HEIGHT = 12;

const hash = (str: string): number => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    h = ((h << 5) - h) + char;
    h = h & h;
  }
  return Math.abs(h);
};

export const getWaveformBars = (
  songId: number | string,
  title?: string,
  artist?: string
): number[] => {
  const bars: number[] = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    // Each bar gets a unique seed from song identity + bar index
    const seedStr = `${songId}-${title ?? ""}-${artist ?? ""}-${i}-viola-waveform`;
    const h = hash(seedStr);
    const height = MIN_HEIGHT + (h % (MAX_HEIGHT - MIN_HEIGHT + 1));
    bars.push(height);
  }
  return bars;
};
