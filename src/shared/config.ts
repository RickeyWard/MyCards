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
