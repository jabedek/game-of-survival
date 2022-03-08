export function getRandom(range, keepFloats = false): number {
  return keepFloats ? Math.random() * range : Math.floor(Math.random() * range);
}
