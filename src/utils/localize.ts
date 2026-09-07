import type { HomeAssistant } from "../ha";
import en from "../translations/en.json";

const LANGUAGES: Record<string, unknown> = { en };
const DEFAULT_LANG = "en";

function lookup(source: unknown, path: string[]): string | undefined {
  let node: any = source;
  for (const key of path) {
    node = node?.[key];
    if (node === undefined) return undefined;
  }
  return typeof node === "string" ? node : undefined;
}

/**
 * Suite-local translations, e.g. localize("editor.card.room_title.name").
 * Falls back to English, then to the raw key.
 */
export function setupCustomLocalize(hass?: HomeAssistant) {
  return (key: string): string => {
    const lang = (hass?.locale?.language ?? DEFAULT_LANG).split("-")[0];
    const path = key.split(".");
    return lookup(LANGUAGES[lang], path) ?? lookup(LANGUAGES[DEFAULT_LANG], path) ?? key;
  };
}
