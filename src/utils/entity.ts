import type { HassEntity } from "home-assistant-js-websocket";
import type { HomeAssistant } from "../ha";
import { computeStateDomain } from "../ha";

export const UNAVAILABLE = "unavailable";
export const UNKNOWN = "unknown";
export const OFF_STATES = ["off", "closed", "locked", "not_home", "idle", "standby"];

export function isAvailable(stateObj?: HassEntity): boolean {
  return !!stateObj && stateObj.state !== UNAVAILABLE && stateObj.state !== UNKNOWN;
}

export function isActive(stateObj?: HassEntity): boolean {
  if (!isAvailable(stateObj)) return false;
  return !OFF_STATES.includes(stateObj!.state);
}

/** Localised state text, using the modern HA formatter when the core supports it. */
export function formatEntityState(hass: HomeAssistant, stateObj: HassEntity): string {
  const anyHass = hass as any;
  if (typeof anyHass.formatEntityState === "function") {
    return anyHass.formatEntityState(stateObj);
  }
  const domain = computeStateDomain(stateObj);
  return hass.localize(`component.${domain}.state._.${stateObj.state}`) || stateObj.state;
}

export function entityName(hass: HomeAssistant, entityId: string): string | undefined {
  const stateObj = hass.states[entityId];
  return stateObj?.attributes?.friendly_name ?? entityId;
}
