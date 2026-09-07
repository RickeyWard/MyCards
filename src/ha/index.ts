/**
 * Thin facade over the Home Assistant frontend surface.
 *
 * Everything the cards need from HA is re-exported here, so swapping
 * `custom-card-helpers` for vendored types later touches one file.
 */
export type {
  ActionConfig,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
  LovelaceConfig,
} from "custom-card-helpers";

export {
  applyThemesOnElement,
  computeDomain,
  computeStateDomain,
  domainIcon,
  fireEvent,
  forwardHaptic,
  getLovelace,
  handleAction,
  hasAction,
  hasConfigOrEntityChanged,
  navigate,
  stateIcon,
} from "custom-card-helpers";

export type { HassEntity } from "home-assistant-js-websocket";

export * from "./form";
