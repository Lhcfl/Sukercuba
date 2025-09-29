import { isAPIError } from "misskey-js/api.js";

export function errorToString(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error == null) {
    return "unknown error";
  }
  if (typeof error === "object") {
    if (Array.isArray(error)) {
      return error.map(errorToString).join(", ");
    }
    // oxlint-disable-next-line no-explicit-any
    const bypasstypescript: any = error;
    if (isAPIError(bypasstypescript)) {
      return `${bypasstypescript.message} (${bypasstypescript.id})`;
    }
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }
  return String(error);
}
