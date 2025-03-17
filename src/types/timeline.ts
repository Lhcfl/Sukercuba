export const availableTimelines = [
  "homeTimeline",
  "localTimeline",
  "hybridTimeline",
  "globalTimeline",
] as const;

export type Timeline = (typeof availableTimelines)[number];
