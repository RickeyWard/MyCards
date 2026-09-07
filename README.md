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

| Option              | Type    | Default      | Description                                              |
| ------------------- | ------- | ------------ | -------------------------------------------------------- |
| `name`              | string  | entity name  | Title text.                                              |
| `icon`              | string  | entity icon  | Any `mdi:` icon.                                         |
| `icon_color`        | string  | `primary`    | Theme colour token (`blue`, `red`, …) or any CSS colour. |
| `entity`            | string  | —            | Optional entity; drives the default icon and subtitle.   |
| `subtitle`          | string  | entity state | Static subtitle; overrides the entity state.             |
| `alignment`         | string  | `start`      | `start`, `center` or `end`.                              |
| `hide_icon`         | boolean | `false`      | Render title only.                                       |
| `tap_action`        | action  | `none`       | Standard HA action config.                               |
| `hold_action`       | action  | `none`       | Standard HA action config.                               |
| `double_tap_action` | action  | `none`       | Standard HA action config.                               |

The card is fully configurable from the UI editor.

## Development

```bash
npm install
npm run watch      # rebuilds dist/mycards.js on every change
```

Point Home Assistant at the local build once:

```bash
# from the HA config directory
ln -s /path/to/this/repo/dist/mycards.js www/mycards.js
```

then register `/local/mycards.js?v=dev` as a JavaScript module resource. Append a changing
`?v=` (or hard-reload) to bust the browser cache after a rebuild.

Other scripts:

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
