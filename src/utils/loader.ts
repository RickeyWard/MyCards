/**
 * Home Assistant lazy-loads its form/picker elements with the built-in card
 * editors. Borrowing a built-in editor forces them to register before our own
 * editor renders `ha-form`.
 */
export async function loadHaComponents(): Promise<void> {
  if (!customElements.get("ha-form")) {
    const button = customElements.get("hui-button-card") as any;
    await button?.getConfigElement?.();
  }
  if (!customElements.get("ha-entity-picker")) {
    const entities = customElements.get("hui-entities-card") as any;
    await entities?.getConfigElement?.();
  }
}

/** Waits for a custom element to be defined (with a bail-out timeout). */
export async function whenDefined(name: string, timeout = 5000): Promise<void> {
  await Promise.race([
    customElements.whenDefined(name),
    new Promise((resolve) => setTimeout(resolve, timeout)),
  ]);
}
