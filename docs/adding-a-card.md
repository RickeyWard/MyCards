# Adding a card

Every card is a folder under `src/cards/<name>/` with three files: the config struct, the
card, and the editor. `room-title` is the reference implementation — copying it is the
fastest path.

## 1. Config — `src/cards/<name>/config.ts`

Declare the runtime struct and derive the TypeScript type from it, so a bad YAML config
fails loudly in `setConfig` instead of rendering something broken.

```ts
export const MY_CARD_NAME = "my";

export const myCardConfigStruct = assign(
  baseCardConfigStruct,
  object({
    entity: optional(string()),
    tap_action: optional(actionConfigStruct),
  }),
);

export type MyCardConfig = LovelaceCardConfig & ActionsConfig & Infer<typeof myCardConfigStruct>;
```

`baseCardConfigStruct` already allows the keys Lovelace itself attaches (`view_layout`,
`grid_options`, `visibility`, `card_mod`). Anything you do not declare is rejected.

## 2. Card — `src/cards/<name>/my-card.ts`

Extend `BaseCard`, which supplies `hass`, `_config`, action dispatch and the shared tokens.

```ts
const CARD_TYPE = cardType(MY_CARD_NAME);
const EDITOR_TYPE = editorType(MY_CARD_NAME);

registerCard({ type: CARD_TYPE, name: "My Card", description: "..." });

@customElement(CARD_TYPE)
export class MyCard extends BaseCard<MyCardConfig> {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./my-card-editor");
    return document.createElement(EDITOR_TYPE) as LovelaceCardEditor;
  }

  public static getStubConfig(hass: HomeAssistant): MyCardConfig { ... }

  public override setConfig(config: MyCardConfig): void {
    assert(config, myCardConfigStruct);
    super.setConfig(config);
  }

  protected override render() { ... }

  static override styles = [...BaseCard.styles, css`...`];
}
```

Rules of thumb:

- **Colours** come from `computeRgbColor()` or HA theme variables (`--primary-text-color`,
  `--secondary-text-color`, `--ha-card-background`). Never hard-code hex.
- **Sizing** comes from the tokens in `src/shared/styles.ts`, so users can retheme without
  card-mod. Add a new token there rather than a literal in one card.
- **Interactions** use the `actionHandler` directive plus `@action=${this._handleAction}`;
  that is what gives tap/hold/double-tap parity with built-in cards.
- **Availability**: guard on `isAvailable(stateObj)` and apply the `unavailable` class.

## 3. Editor — `src/cards/<name>/my-card-editor.ts`

Editors are `ha-form` schemas, not hand-built inputs — you get HA's pickers, translations
and layout for free. `loadHaComponents()` in `connectedCallback` makes sure `ha-form` and
`ha-entity-picker` are defined before the first render.

Useful selectors: `{ entity: {} }`, `{ icon: {} }`, `{ text: {} }`, `{ boolean: {} }`,
`{ select: { mode: "dropdown", options } }`, `{ ui_action: {} }`, and the `grid` /
`expandable` layout wrappers.

## 4. Register it

```ts
// src/cards/<name>/index.ts
export * from "./config";
export * from "./my-card";
```

```ts
// src/cards/index.ts
import "./my";
export const CARD_TYPES: string[] = [cardType(ROOM_TITLE_CARD_NAME), cardType(MY_CARD_NAME)];
```

The editor is loaded through a dynamic `import()`, so it stays out of the path taken when a
dashboard only renders the card.

## 5. Verify

```bash
npm run build
```

Then reload the dashboard and check the card appears in the "Add card" picker, its UI editor
opens, and a YAML-only config with an unknown key is rejected with a readable error.

## Adding translations

Add strings under `src/translations/en.json`, then look them up with
`setupCustomLocalize(this.hass)`. Editor labels resolve `editor.card.<card_name>.<field>`
first and fall back to `editor.common.<field>`. For a new language, drop a JSON file next to
`en.json` and add it to the `LANGUAGES` map in `src/utils/localize.ts`.
