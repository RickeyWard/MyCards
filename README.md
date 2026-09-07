# MyCards — a Lovelace card suite for Home Assistant

A TypeScript + [Lit](https://lit.dev) monorepo-in-one-bundle for building custom Lovelace
cards, structured after [Mushroom](https://github.com/piitaya/lovelace-mushroom): every card
lives in its own folder, shares a common base class and theme tokens, and ships in a single
`mycards.js` resource.

## Cards

| Card       | Type                             | Description                                            |
| ---------- | -------------------------------- | ------------------------------------------------------ |
| Room Title | `custom:mycards-room-title-card` | Section heading with an optional icon and status line. |

## Install

### HACS (recommended)

1. HACS → ⋮ → **Custom repositories** → add this repo URL, category **Dashboard**.
2. Install **MyCards**, then reload the browser.

### Manual

1. Download `mycards.js` from the [latest release](../../releases/latest).
2. Copy it to `<config>/www/mycards.js`.
3. Settings → Dashboards → ⋮ → **Resources** → add `/local/mycards.js` as a **JavaScript module**.

## Room Title card

```yaml
type: custom:mycards-room-title-card
name: Living Room
icon: mdi:sofa
icon_color: blue
entity: light.living_room
tap_action:
  action: navigate
  navigation_path: /lovelace/living-room
```

| Option              | Type    | Default      | Description                                                                   |
| ------------------- | ------- | ------------ | ----------------------------------------------------------------------------- |
| `name`              | string  | entity name  | Title text.                                                                   |
| `icon`              | string  | entity icon  | Any `mdi:` icon.                                                              |
| `icon_color`        | string  | `primary`    | Theme colour token (`blue`, `red`, …) or any CSS colour.                      |
| `icon_position`     | string  | `start`      | `start` or `end` — which side of the text the icon sits on.                   |
| `icon_shape`        | string  | `circle`     | `circle`, `square`, or `none` — a bare glyph, drawn at the shape's full size. |
| `entity`            | string  | —            | Optional entity; drives the default icon and subtitle.                        |
| `subtitle`          | string  | entity state | Static subtitle; overrides the entity state.                                  |
| `alignment`         | string  | `start`      | `start`, `center` or `end`; the title and subtitle follow it.                 |
| `hide_icon`         | boolean | `false`      | Render title only.                                                            |
| `tap_action`        | action  | `none`       | Standard HA action config.                                                    |
| `hold_action`       | action  | `none`       | Standard HA action config.                                                    |
| `double_tap_action` | action  | `none`       | Standard HA action config.                                                    |

The card is fully configurable from the UI editor.

## Development

### Run a throwaway Home Assistant

The repo ships a disposable HA instance under [dev/](dev/): a container with `dist/` mounted
at `/local/mycards/`, the resource pre-registered, deterministic test entities, and onboarding
completed for you. Requires Docker.

```bash
npm run dev        # build, start HA on :8123, onboard it, then watch for changes
```

Open <http://localhost:8123>. No wizard, no login screen — [dev/scripts/onboard.mjs](dev/scripts/onboard.mjs)
drives HA's onboarding API to create a `dev` / `dev` owner account, and the `trusted_networks`
auth provider in [dev/config/configuration.yaml](dev/config/configuration.yaml) signs you in
automatically. You land on the dashboard defined in
[dev/config/ui-lovelace.yaml](dev/config/ui-lovelace.yaml) — HA labels it **Overview** in the
sidebar (that name is fixed for the default dashboard, even in YAML mode); the view inside it
is titled _Cards_, at <http://localhost:8123/lovelace/cards>.

> This instance has effectively no authentication. It is for local card development on a
> throwaway config — never expose it, and never reuse this config for a real install.

The loop from there:

- **Card source change** → `npm run watch` rebuilds `dist/mycards.js` → hard-reload the
  browser (`Ctrl+Shift+R`). Keep DevTools open with _Disable cache_ ticked; HA caches
  dashboard resources aggressively.
- **Dashboard change** → edit `dev/config/ui-lovelace.yaml` → reload. No HA restart needed.
- **HA config change** (new test entities) → restart the container, or Developer tools →
  YAML → _Reload template entities_.

Add a case to `ui-lovelace.yaml` for every state a card can be in — unavailable entity, no
entity, long text, no icon. It is the closest thing the suite has to a test suite.

To exercise the **visual editor** and the "Add card" picker, create a second dashboard in the
UI (Settings → Dashboards → Add dashboard). Those are storage mode and still see the
resource declared in YAML.

For a richer entity set, add the **Demo** integration from Settings → Devices & Services.

| Script              | Purpose                                                  |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | `dev:up`, then watch.                                    |
| `npm run dev:up`    | Build and start the HA container.                        |
| `npm run dev:down`  | Stop it (config and account survive).                    |
| `npm run dev:logs`  | Tail the HA log — where card-side YAML errors surface.   |
| `npm run dev:reset` | Stop and wipe the instance state for a clean onboarding. |

### Against your real Home Assistant

```bash
npm run watch
# from the HA config directory
ln -s /path/to/this/repo/dist/mycards.js www/mycards.js
```

Then register `/local/mycards.js?v=dev` as a JavaScript module resource, bumping `?v=` to
bust the cache.

### Other scripts

| Script              | Purpose                        |
| ------------------- | ------------------------------ |
| `npm run build`     | Typecheck + production bundle. |
| `npm run typecheck` | `tsc --noEmit`.                |
| `npm run lint`      | ESLint over `src/`.            |
| `npm run format`    | Prettier write.                |

## Repo layout

```
src/
  main.ts                 entry point — imports every card, prints the console banner
  const.ts                NAMESPACE, version, element-name helpers
  ha/                     the Home Assistant surface the cards depend on
  shared/                 base card class, theme tokens, colours, config structs
  utils/                  action handler, entity helpers, localize, card registration
  translations/           editor strings
  cards/
    index.ts              card registry
    room-title/           one folder per card: config + card + editor
dev/                      disposable Home Assistant instance for manual testing
docs/
```

## Adding a card

See [docs/adding-a-card.md](docs/adding-a-card.md).

## Releasing

Tag and publish a GitHub release (`v0.2.0`); CI stamps the version, builds, and attaches
`mycards.js` to the release, which is what HACS downloads.

## Before you publish

- Rename the suite: `NAMESPACE`/`SUITE_NAME`/`REPOSITORY` in [src/const.ts](src/const.ts),
  `fileName` in [vite.config.ts](vite.config.ts), `name`/`filename` in [hacs.json](hacs.json),
  the `--mycards-*` tokens in [src/shared/styles.ts](src/shared/styles.ts), and `name` in
  [package.json](package.json).
- Fill in the copyright holder in [LICENSE](LICENSE).

## License

MIT
