import { css, html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { assert } from "superstruct";
import { cardType, editorType } from "../../const";
import type { HomeAssistant, LovelaceCardEditor } from "../../ha";
import { BaseCard } from "../../shared/base-card";
import { computeRgbColor } from "../../shared/colors";
import { actionHandler } from "../../utils/action-handler";
import { formatEntityState, isAvailable } from "../../utils/entity";
import { registerCard } from "../../utils/register-card";
import { ROOM_TITLE_CARD_NAME, roomTitleCardConfigStruct } from "./config";
import type { RoomTitleCardConfig } from "./config";

const CARD_TYPE = cardType(ROOM_TITLE_CARD_NAME);
const EDITOR_TYPE = editorType(ROOM_TITLE_CARD_NAME);

registerCard({
  type: CARD_TYPE,
  name: "Room Title",
  description: "A heading for a room section, with an optional icon and status line.",
});

@customElement(CARD_TYPE)
export class RoomTitleCard extends BaseCard<RoomTitleCardConfig> {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./room-title-card-editor");
    return document.createElement(EDITOR_TYPE) as LovelaceCardEditor;
  }

  public static getStubConfig(hass: HomeAssistant): RoomTitleCardConfig {
    const entity = Object.keys(hass.states).find((id) => id.startsWith("light."));
    return {
      type: `custom:${CARD_TYPE}`,
      name: "Living Room",
      icon: "mdi:sofa",
      icon_color: "blue",
      ...(entity ? { entity } : {}),
    };
  }

  public override setConfig(config: RoomTitleCardConfig): void {
    assert(config, roomTitleCardConfigStruct);
    super.setConfig(config);
  }

  private get _subtitle(): string | undefined {
    const config = this._config;
    if (!config) return undefined;
    if (config.subtitle) return config.subtitle;
    if (!config.entity || !this.hass) return undefined;
    const stateObj = this.hass.states[config.entity];
    return stateObj ? formatEntityState(this.hass, stateObj) : undefined;
  }

  protected override render(): TemplateResult | typeof nothing {
    const config = this._config;
    if (!config || !this.hass) return nothing;

    const stateObj = config.entity ? this.hass.states[config.entity] : undefined;
    const unavailable = !!config.entity && !isAvailable(stateObj);
    const name = config.name ?? stateObj?.attributes.friendly_name ?? "";
    const subtitle = this._subtitle;
    const interactive = this.hasInteraction;
    const iconAtEnd = (config.icon_position ?? "start") === "end";
    const iconShape = config.icon_shape ?? "circle";
    const alignment = config.alignment ?? "start";
    const iconStyle = {
      "--icon-color": `rgb(${computeRgbColor(config.icon_color ?? "primary")})`,
      "--icon-background": `rgba(${computeRgbColor(config.icon_color ?? "primary")}, 0.2)`,
    };

    return html`
      <ha-card
        class=${classMap({ interactive, unavailable })}
        role=${interactive ? "button" : "heading"}
        tabindex=${interactive ? "0" : "-1"}
        .actionHandler=${actionHandler({
          hasHold: !!config.hold_action,
          hasDoubleClick: !!config.double_tap_action,
          disabled: !interactive,
        })}
        @action=${this._handleAction}
      >
        <div
          class=${classMap({
            container: true,
            "icon-end": iconAtEnd,
            [`align-${alignment}`]: true,
          })}
        >
          ${
            config.hide_icon
              ? nothing
              : html`
                  <div
                    class=${classMap({ icon: true, [`shape-${iconShape}`]: true })}
                    style=${styleMap(iconStyle)}
                  >
                    ${
                      stateObj
                        ? html`<ha-state-icon
                            .hass=${this.hass}
                            .stateObj=${stateObj}
                            .icon=${config.icon}
                          ></ha-state-icon>`
                        : html`<ha-icon .icon=${config.icon ?? "mdi:home-outline"}></ha-icon>`
                    }
                  </div>
                `
          }
          <div class="text">
            <span class="title">${name}</span>
            ${subtitle ? html`<span class="subtitle">${subtitle}</span>` : nothing}
          </div>
        </div>
      </ha-card>
    `;
  }

  static override styles = [
    ...BaseCard.styles,
    css`
      ha-card {
        background: var(--mycards-room-title-background, var(--ha-card-background, none));
        border: var(--mycards-room-title-border, none);
        box-shadow: var(--mycards-room-title-box-shadow, none);
      }
      .container {
        display: flex;
        align-items: center;
        gap: var(--spacing);
        padding: var(--spacing);
      }
      /*
       * The text block follows the card alignment: with everything pushed to
       * one edge, title and subtitle of different widths must agree on which
       * edge they hang from, or the shorter one looks stranded.
       * Uses the logical end keyword, so it stays correct under RTL.
       */
      .container.align-start {
        justify-content: flex-start;
      }
      .container.align-center {
        justify-content: center;
      }
      .container.align-center .text {
        text-align: center;
      }
      .container.align-end {
        justify-content: flex-end;
      }
      .container.align-end .text {
        text-align: end;
      }
      .icon {
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--icon-size);
        height: var(--icon-size);
        border-radius: var(--icon-border-radius);
        color: var(--icon-color);
        background-color: var(--icon-background);
      }
      /* Logical order, so the swap follows the document direction. */
      .container.icon-end .icon {
        order: 1;
      }
      .icon.shape-square {
        border-radius: var(--icon-square-border-radius);
      }
      /* Bare glyph: keep the colour, drop the shape and its padding. The row
         keeps its height so swapping shapes does not resize the card. */
      .icon.shape-none {
        width: auto;
        height: var(--icon-size);
        border-radius: 0;
        background-color: transparent;
      }
      .icon.shape-none ha-icon,
      .icon.shape-none ha-state-icon {
        --mdc-icon-size: var(--icon-bare-symbol-size);
      }
      .icon ha-icon,
      .icon ha-state-icon {
        --mdc-icon-size: var(--icon-symbol-size);
      }
      .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .title {
        font-size: var(--title-font-size);
        font-weight: var(--title-font-weight);
        line-height: 1.3;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .subtitle {
        font-size: var(--subtitle-font-size);
        font-weight: var(--subtitle-font-weight);
        line-height: 1.3;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "mycards-room-title-card": RoomTitleCard;
  }
}
