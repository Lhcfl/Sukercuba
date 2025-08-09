import type { Notification } from "misskey-js/entities.js";

export const NoteEventNotificationTypes = [
  "renote",
  "reaction",
  "pollEnded",
  "reaction:grouped",
  "renote:grouped",
] as const;

export type ExtractNotifications<T extends readonly Notification["type"][]> =
  Extract<Notification, { type: T[number] }>;
