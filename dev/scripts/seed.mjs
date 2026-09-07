#!/usr/bin/env node
/**
 * Seeds registry data that configuration.yaml cannot express.
 *
 * Areas and entity/area assignments live in the entity and area registries
 * (config/.storage), not in YAML, so they cannot be checked in as config. This
 * script recreates them from the declaration below, and is idempotent, so a
 * wiped instance gets the same areas back on the next `npm run dev:up`.
 */

import { connect, getAccessToken } from "./lib/ha.mjs";

/** area name -> entities that belong to it */
const AREAS = {
  Kitchen: ["sensor.kitchen_temperature"],
  "Living Room": [
    "sensor.living_room_temperature",
    "sensor.living_room_humidity",
    "light.living_room",
  ],
};

async function main() {
  const token = await getAccessToken();
  const ha = await connect(token);

  try {
    const areas = await ha.call({ type: "config/area_registry/list" });
    const entities = await ha.call({ type: "config/entity_registry/list" });
    const byId = new Map(entities.map((e) => [e.entity_id, e]));

    for (const [name, entityIds] of Object.entries(AREAS)) {
      let area = areas.find((a) => a.name === name);
      if (!area) {
        area = await ha.call({ type: "config/area_registry/create", name });
        console.log(`Created area: ${name}`);
      }

      for (const entityId of entityIds) {
        const entry = byId.get(entityId);
        if (!entry) {
          console.warn(`Skipped ${entityId}: no registry entry (needs a unique_id in YAML)`);
          continue;
        }
        if (entry.area_id === area.area_id) {
          console.log(`${entityId} already in ${name}`);
          continue;
        }
        await ha.call({
          type: "config/entity_registry/update",
          entity_id: entityId,
          area_id: area.area_id,
        });
        console.log(`Assigned ${entityId} to ${name}`);
      }
    }
  } finally {
    ha.close();
  }
}

main().catch((err) => {
  console.error(`Seeding failed: ${err.message}`);
  process.exit(1);
});
