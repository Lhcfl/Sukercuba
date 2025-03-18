export const availableTimelines = [
  "home",
  "local",
  "hybrid",
  "global",
  "bubble",
] as const;

export type Timeline = `${(typeof availableTimelines)[number]}Timeline`;
