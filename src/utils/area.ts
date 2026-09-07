import type { HassEntity } from "home-assistant-js-websocket";
import type { AreaRegistryEntry, HomeAssistant } from "../ha";

export function getArea(hass: HomeAssistant, areaId?: string): AreaRegistryEntry | undefined {
  if (!areaId) return undefined;
  return hass.areas?.[areaId];
}

/**
 * Entity ids assigned to an area, either directly or through their device.
 * Config and diagnostic entities are left out: they are not what a room
 * heading is about.
 */
export function areaEntityIds(hass: HomeAssistant, areaId: string): string[] {
  const entities = hass.entities ?? {};
  const devices = hass.devices ?? {};
  return Object.values(entities)
    .filter((entry) => {
      if (entry.hidden || entry.entity_category) return false;
      if (entry.area_id) return entry.area_id === areaId;
      return entry.device_id ? devices[entry.device_id]?.area_id === areaId : false;
    })
    .map((entry) => entry.entity_id)
    .sort();
}

/**
 * An area's sensor for a device class: the one pinned in the area settings if
 * the core supports pinning, otherwise the first match in the area. Sorted by
 * entity id so a room with several thermometers picks the same one every time.
 */
export function areaSensor(
  hass: HomeAssistant,
  area: AreaRegistryEntry,
  deviceClass: "temperature" | "humidity",
): HassEntity | undefined {
  const pinned =
    deviceClass === "temperature" ? area.temperature_entity_id : area.humidity_entity_id;
  if (pinned && hass.states[pinned]) return hass.states[pinned];

  for (const entityId of areaEntityIds(hass, area.area_id)) {
    const stateObj = hass.states[entityId];
    if (stateObj?.attributes.device_class === deviceClass) return stateObj;
  }
  return undefined;
}
