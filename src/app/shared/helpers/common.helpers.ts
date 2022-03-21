export function getRandom(range: number, keepFloats = false): number {
  return keepFloats ? Math.random() * range : Math.floor(Math.random() * range);
}
