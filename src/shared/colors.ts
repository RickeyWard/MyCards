/** Colour tokens usable in card configs (e.g. `icon_color: blue`). */
export const COLORS = [
  "primary",
  "accent",
  "red",
  "pink",
  "purple",
  "deep-purple",
  "indigo",
  "blue",
  "light-blue",
  "cyan",
  "teal",
  "green",
  "light-green",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deep-orange",
  "brown",
  "grey",
  "blue-grey",
  "black",
  "white",
  "disabled",
] as const;

export type ThemeColor = (typeof COLORS)[number];

/** Fallbacks for cores/themes that do not define the rgb tokens. */
const FALLBACK: Record<string, string> = {
  primary: "33, 150, 243",
  accent: "255, 152, 0",
  red: "244, 67, 54",
  pink: "233, 30, 99",
  purple: "156, 39, 176",
  "deep-purple": "103, 58, 183",
  indigo: "63, 81, 181",
  blue: "33, 150, 243",
  "light-blue": "3, 169, 244",
  cyan: "0, 188, 212",
  teal: "0, 150, 136",
  green: "76, 175, 80",
  "light-green": "139, 195, 74",
  lime: "205, 220, 57",
  yellow: "255, 235, 59",
  amber: "255, 193, 7",
  orange: "255, 152, 0",
  "deep-orange": "255, 87, 34",
  brown: "121, 85, 72",
  grey: "158, 158, 158",
  "blue-grey": "96, 125, 139",
  black: "0, 0, 0",
  white: "255, 255, 255",
  disabled: "189, 189, 189",
};

export function isThemeColor(color: string): color is ThemeColor {
  return color in FALLBACK;
}

/**
 * Returns a CSS value usable inside `rgb(...)`. Theme tokens resolve against the
 * HA theme variable with a hard-coded fallback; anything else is passed through.
 */
export function computeRgbColor(color: string): string {
  if (isThemeColor(color)) {
    return `var(--rgb-${color}, ${FALLBACK[color]})`;
  }
  return color;
}
