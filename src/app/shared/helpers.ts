export function getRandom(range, keepFloats = false): number {
  if (keepFloats) {
    return Math.random() * range;
  } else {
    return Math.floor(Math.random() * range);
  }
}
