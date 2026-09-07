import { assign, boolean, enums, number, object, optional, string } from "superstruct";
import type { Infer } from "superstruct";
import type { LovelaceCardConfig } from "../../ha";
import {
  ALIGNMENTS,
  ICON_ALIGNMENTS,
  ICON_POSITIONS,
  ICON_SHAPES,
  actionConfigStruct,
  baseCardConfigStruct,
} from "../../shared/config";
import type { Alignment, IconAlignment, IconPosition, IconShape } from "../../shared/config";
import type { ActionsConfig } from "../../utils/action-handler";

export const ROOM_TITLE_CARD_NAME = "room-title";

export const roomTitleCardConfigStruct = assign(
  baseCardConfigStruct,
  object({
    name: optional(string()),
    icon: optional(string()),
    icon_color: optional(string()),
    icon_position: optional(enums(ICON_POSITIONS)),
    icon_shape: optional(enums(ICON_SHAPES)),
    entity: optional(string()),
    subtitle: optional(string()),
    title_size: optional(number()),
    subtitle_scale: optional(number()),
    subtitle_gap: optional(number()),
    icon_gap: optional(number()),
    icon_size: optional(number()),
    icon_align: optional(enums(ICON_ALIGNMENTS)),
    alignment: optional(enums(ALIGNMENTS)),
    hide_icon: optional(boolean()),
    tap_action: optional(actionConfigStruct),
    hold_action: optional(actionConfigStruct),
    double_tap_action: optional(actionConfigStruct),
  }),
);

export type RoomTitleCardConfig = LovelaceCardConfig &
  ActionsConfig &
  Infer<typeof roomTitleCardConfigStruct> & {
    alignment?: Alignment;
    icon_position?: IconPosition;
    icon_shape?: IconShape;
    icon_align?: IconAlignment;
  };
