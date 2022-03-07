export const CONFIG = {
  // match:
};

// 1 Match == 3 (or N) Rounds; 1 Round == 10 (or M) Turns (per brood, done in loop)

export const BASE_MATCH = {
  round: 0, // max to N-1
  turn: 0, // max to M-1
  currentParticle: null,
  currentBrood: null,
};
