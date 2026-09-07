import { assign, boolean, enums, object, optional, string } from "superstruct";
import type { Infer } from "superstruct";
import type { LovelaceCardConfig } from "../../ha";
import { ALIGNMENTS, actionConfigStruct, baseCardConfigStruct } from "../../shared/config";
import type { Alignment } from "../../shared/config";
import type { ActionsConfig } from "../../utils/action-handler";

export const ROOM_TITLE_CARD_NAME = "room-title";

export const roomTitleCardConfigStruct = assign(
  baseCardConfigStruct,
  object({
    name: optional(string()),
    icon: optional(string()),
    icon_color: optional(string()),
    entity: optional(string()),
    subtitle: optional(string()),
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
  };
