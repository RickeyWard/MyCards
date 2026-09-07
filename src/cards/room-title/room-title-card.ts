import { css, html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { assert } from "superstruct";
import { cardType, editorType } from "../../const";
import type { HassEntity, HomeAssistant, LovelaceCardEditor } from "../../ha";
import { BaseCard } from "../../shared/base-card";
import { computeRgbColor } from "../../shared/colors";
import { actionHandler } from "../../utils/action-handler";
import { areaSensor, getArea } from "../../utils/area";
import { formatEntityState, isAvailable } from "../../utils/entity";
import { registerCard } from "../../utils/register-card";
import { ROOM_TITLE_CARD_NAME, roomTitleCardConfigStruct } from "./config";
import type { RoomTitleCardConfig } from "./config";

/**
 * Glyph size as a fraction of the shape it sits in, matching the 21/40 default
 * token pair, so the icon keeps its padding inside the circle at any size.
 */
const SYMBOL_RATIO = 0.525;

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
    // An area drives name, icon and status line on its own, so it makes the
    // better first impression when the card is dropped on a dashboard.
    const areaId = Object.keys(hass.areas ?? {})[0];
    if (areaId) {
      return { type: `custom:${CARD_TYPE}`, area: areaId, icon_color: "blue" };
    }

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

  /**
   * Explicit text wins, then an explicitly chosen entity, then the climate
   * readings of the area. Each step is a deliberate override of the one below.
   */
  private get _subtitle(): string | undefined {
    const config = this._config;
    const hass = this.hass;
    if (!config || !hass) return undefined;

    if (config.subtitle) return config.subtitle;

    if (config.entity) {
      const stateObj = hass.states[config.entity];
      return stateObj ? formatEntityState(hass, stateObj) : undefined;
    }

    const area = getArea(hass, config.area);
    if (!area) return undefined;

    const readings = (["temperature", "humidity"] as const)
      .map((deviceClass) => areaSensor(hass, area, deviceClass))
      .filter((stateObj): stateObj is HassEntity => stateObj !== undefined)
      .map((stateObj) => formatEntityState(hass, stateObj));

    return readings.length ? readings.join(" · ") : undefined;
  }

  protected override render(): TemplateResult | typeof nothing {
    const config = this._config;
    if (!config || !this.hass) return nothing;

    const stateObj = config.entity ? this.hass.states[config.entity] : undefined;
    const unavailable = !!config.entity && !isAvailable(stateObj);
    const area = getArea(this.hass, config.area);
    const name = config.name ?? area?.name ?? stateObj?.attributes.friendly_name ?? "";
    const icon = config.icon ?? area?.icon ?? undefined;
    const subtitle = this._subtitle;
    const interactive = this.hasInteraction;
    const iconAtEnd = (config.icon_position ?? "start") === "end";
    const iconShape = config.icon_shape ?? "circle";
    const alignment = config.alignment ?? "start";
    const iconStyle = {
      "--icon-color": `rgb(${computeRgbColor(config.icon_color ?? "primary")})`,
      "--icon-background": `rgba(${computeRgbColor(config.icon_color ?? "primary")}, 0.2)`,
    };
    const titleSize = config.title_size;
    const iconSize = config.icon_size;
    const iconAtTop = (config.icon_align ?? "center") === "top";
    const containerStyle = {
      ...(titleSize ? { "--title-font-size": `${titleSize}px` } : {}),
      ...(config.subtitle_scale !== undefined
        ? { "--subtitle-scale": `${config.subtitle_scale / 100}` }
        : {}),
      ...(config.subtitle_gap !== undefined
        ? { "--subtitle-gap": `${config.subtitle_gap}px` }
        : {}),
      ...(config.icon_gap !== undefined ? { "--icon-gap": `${config.icon_gap}px` } : {}),
      ...(iconSize
        ? {
            "--icon-size": `${iconSize}px`,
            "--icon-symbol-size": `${Math.round(iconSize * SYMBOL_RATIO * 10) / 10}px`,
            // Declared here too: the :host default resolved --icon-size before
            // this override existed, and custom properties do not re-resolve.
            "--icon-bare-symbol-size": `${iconSize}px`,
          }
        : {}),
    };

    return html`
      <ha-card
        class=${classMap({ interactive, unavailable, transparent: !!config.transparent })}
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
            "icon-top": iconAtTop,
            [`align-${alignment}`]: true,
          })}
          style=${styleMap(containerStyle)}
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
                            .icon=${icon}
                          ></ha-state-icon>`
                        : html`<ha-icon .icon=${icon ?? "mdi:home-outline"}></ha-icon>`
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
      /* Sits directly on the view background, for use as a section heading
         above other cards rather than as a card in its own right. */
      ha-card.transparent {
        background: transparent;
        border: none;
        box-shadow: none;
      }
      .container {
        display: flex;
        align-items: center;
        gap: var(--icon-gap);
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
      /*
       * align-self on the icon alone, not align-items on the row: when the icon
       * is the taller element, the text should stay put rather than follow it up.
       */
      .container.icon-top .icon {
        align-self: flex-start;
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
        gap: var(--subtitle-gap);
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
        font-size: calc(var(--title-font-size) * var(--subtitle-scale));
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
