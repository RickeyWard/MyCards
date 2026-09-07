import { LitElement, css, html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import { editorType } from "../../const";
import type { HaFormSchema, HomeAssistant, LovelaceCardEditor } from "../../ha";
import { fireEvent } from "../../ha";
import { COLORS } from "../../shared/colors";
import { ALIGNMENTS, ICON_ALIGNMENTS, ICON_POSITIONS, ICON_SHAPES } from "../../shared/config";
import { setupCustomLocalize } from "../../utils/localize";
import { loadHaComponents } from "../../utils/loader";
import { ROOM_TITLE_CARD_NAME, roomTitleCardConfigStruct } from "./config";
import type { RoomTitleCardConfig } from "./config";

const SCHEMA: readonly HaFormSchema[] = [
  { name: "name", selector: { text: {} } },
  { name: "entity", selector: { entity: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
      {
        name: "icon_color",
        selector: {
          select: {
            mode: "dropdown",
            options: COLORS.map((color) => ({ value: color, label: color })),
          },
        },
      },
    ],
  },
  { name: "subtitle", selector: { text: {} } },
  {
    name: "title_size",
    selector: {
      number: { min: 8, max: 64, step: 1, unit_of_measurement: "px", mode: "slider" },
    },
  },
  {
    name: "subtitle_scale",
    selector: {
      number: { min: 40, max: 200, step: 5, unit_of_measurement: "%", mode: "slider" },
    },
  },
  {
    name: "subtitle_gap",
    selector: {
      number: { min: 0, max: 24, step: 1, unit_of_measurement: "px", mode: "slider" },
    },
  },
  {
    name: "icon_size",
    selector: {
      number: { min: 12, max: 96, step: 1, unit_of_measurement: "px", mode: "slider" },
    },
  },
  {
    name: "icon_gap",
    selector: {
      number: { min: 0, max: 48, step: 1, unit_of_measurement: "px", mode: "slider" },
    },
  },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "alignment",
        selector: {
          select: {
            mode: "dropdown",
            options: ALIGNMENTS.map((value) => ({ value, label: value })),
          },
        },
      },
      {
        name: "icon_position",
        selector: {
          select: {
            mode: "dropdown",
            options: ICON_POSITIONS.map((value) => ({ value, label: value })),
          },
        },
      },
      {
        name: "icon_align",
        selector: {
          select: {
            mode: "dropdown",
            options: ICON_ALIGNMENTS.map((value) => ({ value, label: value })),
          },
        },
      },
      {
        name: "icon_shape",
        selector: {
          select: {
            mode: "dropdown",
            options: ICON_SHAPES.map((value) => ({ value, label: value })),
          },
        },
      },
      { name: "hide_icon", selector: { boolean: {} } },
      { name: "transparent", selector: { boolean: {} } },
    ],
  },
  {
    type: "expandable",
    name: "",
    title: "Interactions",
    icon: "mdi:gesture-tap",
    schema: [
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ],
  },
];

@customElement(editorType(ROOM_TITLE_CARD_NAME))
export class RoomTitleCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: RoomTitleCardConfig;

  public override connectedCallback(): void {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: RoomTitleCardConfig): void {
    assert(config, roomTitleCardConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema): string | undefined => {
    const localize = setupCustomLocalize(this.hass);
    const specific = localize(
      `editor.card.${ROOM_TITLE_CARD_NAME.replace("-", "_")}.${schema.name}`,
    );
    if (!specific.startsWith("editor.")) return specific;
    const common = localize(`editor.common.${schema.name}`);
    return common.startsWith("editor.") ? undefined : common;
  };

  private _valueChanged(ev: CustomEvent): void {
    fireEvent(this, "config-changed", { config: ev.detail.value });
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  static override styles = css`
    ha-form {
      display: block;
    }
  `;
}
