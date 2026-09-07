import { any, optional, object, string } from "superstruct";

/**
 * Action configs evolve with the HA frontend (navigate, perform-action,
 * assist, ...), so they are accepted as-is and validated by the core.
 */
export const actionConfigStruct = any();

/** Keys the Lovelace engine may attach to any card config. */
export const baseCardConfigStruct = object({
  type: string(),
  view_layout: optional(any()),
  layout_options: optional(any()),
  grid_options: optional(any()),
  visibility: optional(any()),
  card_mod: optional(any()),
});

export const ALIGNMENTS = ["start", "center", "end"] as const;
export type Alignment = (typeof ALIGNMENTS)[number];

/** Which side of the text the icon sits on. Logical, so it flips under RTL. */
export const ICON_POSITIONS = ["start", "end"] as const;
export type IconPosition = (typeof ICON_POSITIONS)[number];

/** Vertical placement of the icon against the text block. */
export const ICON_ALIGNMENTS = ["center", "top"] as const;
export type IconAlignment = (typeof ICON_ALIGNMENTS)[number];

/** `none` renders a bare coloured glyph with no background shape. */
export const ICON_SHAPES = ["circle", "square", "none"] as const;
export type IconShape = (typeof ICON_SHAPES)[number];
