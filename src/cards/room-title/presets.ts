import type { RoomTitleCardConfig } from "./config";

/**
 * What the card *is*, as opposed to how it looks. A preset never touches these,
 * so clicking one on a Kitchen card leaves it a Kitchen card.
 *
 * Move a key out of this list to let presets control it.
 */
export const IDENTITY_KEYS = [
  "type",
  "area",
  "name",
  "entity",
  "icon",
  "subtitle",
  "tap_action",
  "hold_action",
  "double_tap_action",
  "view_layout",
  "layout_options",
  "grid_options",
  "visibility",
  "card_mod",
] as const;

export interface CardPreset {
  key: string;
  /** Fallback label; the translation at editor.card.room_title.presets.<key> wins. */
  label: string;
  appearance: Partial<RoomTitleCardConfig>;
}

export const PRESETS: readonly CardPreset[] = [
  {
    key: "default",
    label: "Default",
    appearance: {},
  },
  {
    key: "simple_right",
    label: "Simple Right",
    appearance: {
      alignment: "end",
      icon_position: "end",
      icon_shape: "none",
      icon_color: "disabled",
      icon_size: 51,
      icon_gap: 5,
      title_size: 30,
      subtitle_scale: 50,
      transparent: true,
    },
  },
  {
    key: "compact",
    label: "Compact",
    appearance: {
      icon_shape: "none",
      icon_size: 20,
      icon_gap: 6,
      title_size: 14,
      subtitle_scale: 85,
      transparent: true,
    },
  },
  {
    key: "hero",
    label: "Hero",
    appearance: {
      icon_size: 64,
      icon_gap: 16,
      title_size: 28,
      subtitle_scale: 65,
      subtitle_gap: 4,
    },
  },
];

const isIdentityKey = (key: string): boolean => (IDENTITY_KEYS as readonly string[]).includes(key);

/** The subset of a config a preset is responsible for. */
function appearanceOf(config: RoomTitleCardConfig): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    if (!isIdentityKey(key) && value !== undefined) result[key] = value;
  }
  return result;
}

const stable = (value: Record<string, unknown>): string =>
  JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))));

/**
 * Applies a preset by replacing the whole appearance, not merging into it.
 * Merging would leave a previous preset's icon size or gap behind, so the same
 * two clicks could land on two different cards.
 */
export function applyPreset(config: RoomTitleCardConfig, preset: CardPreset): RoomTitleCardConfig {
  const kept: Record<string, unknown> = {};
  for (const key of IDENTITY_KEYS) {
    if (config[key] !== undefined) kept[key] = config[key];
  }
  return { ...kept, ...preset.appearance } as RoomTitleCardConfig;
}

export function matchesPreset(config: RoomTitleCardConfig, preset: CardPreset): boolean {
  return stable(appearanceOf(config)) === stable(preset.appearance as Record<string, unknown>);
}
