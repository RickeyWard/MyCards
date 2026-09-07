import { REPOSITORY } from "../const";

/**
 * Adds a card to the "Add card" picker in the Lovelace UI editor.
 * Call once per card, at module scope, next to its customElements.define().
 */
export function registerCard(card: {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
}): void {
  window.customCards = window.customCards ?? [];
  if (window.customCards.some((c) => c.type === card.type)) return;
  window.customCards.push({
    preview: true,
    documentationURL: REPOSITORY,
    ...card,
  });
}
