import type { HomeAssistant as BaseHomeAssistant } from "custom-card-helpers";

export interface AreaRegistryEntry {
  area_id: string;
  name: string;
  icon?: string | null;
  picture?: string | null;
  floor_id?: string | null;
  /** Sensors pinned in the area's settings, when the core supports it. */
  temperature_entity_id?: string | null;
  humidity_entity_id?: string | null;
}

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  device_id?: string;
  area_id?: string;
  hidden?: boolean;
  entity_category?: "config" | "diagnostic";
}

export interface DeviceRegistryEntry {
  id: string;
  name?: string | null;
  area_id?: string | null;
}

/**
 * custom-card-helpers predates the registry collections the frontend now hands
 * to cards, so they are declared here. Everything in the suite uses this type
 * rather than the upstream one.
 */
export interface HomeAssistant extends BaseHomeAssistant {
  areas: Record<string, AreaRegistryEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  entities: Record<string, EntityRegistryDisplayEntry>;
}
