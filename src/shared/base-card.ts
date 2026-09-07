import { LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCard, LovelaceCardConfig } from "../ha";
import { handleAction, hasAction } from "../ha";
import type { ActionHandlerEvent, ActionsConfig } from "../utils/action-handler";
import { cardBaseStyles, themeVariables } from "./styles";

/**
 * Common plumbing for every card in the suite: hass/config properties,
 * tap/hold/double-tap dispatch and the shared style tokens.
 *
 * Subclasses implement `render()` and extend `styles`:
 *   static override styles = [...BaseCard.styles, css`...`];
 */
export abstract class BaseCard<TConfig extends LovelaceCardConfig & ActionsConfig>
  extends LitElement
  implements LovelaceCard
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() protected _config?: TConfig;

  public setConfig(config: TConfig): void {
    this._config = config;
  }

  public getCardSize(): number {
    return 1;
  }

  protected get hasInteraction(): boolean {
    const config = this._config;
    if (!config) return false;
    return (
      hasAction(config.tap_action) ||
      hasAction(config.hold_action) ||
      hasAction(config.double_tap_action)
    );
  }

  protected _handleAction(ev: ActionHandlerEvent): void {
    if (!this.hass || !this._config) return;
    handleAction(this, this.hass, this._config, ev.detail.action);
  }

  static override styles = [themeVariables, cardBaseStyles];
}
