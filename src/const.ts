/**
 * Suite-wide identifiers.
 *
 * NAMESPACE prefixes every custom element and every card type, e.g.
 *   type: custom:mycards-room-title-card
 * Rename it here (and in vite.config.ts / hacs.json) to rebrand the whole suite.
 */
export const NAMESPACE = "mycards";
export const SUITE_NAME = "MyCards";
export const REPOSITORY = "https://github.com/YOUR-USER/lovelace-mycards";
export const VERSION = __VERSION__;

/** Element + config name of a card, e.g. cardType("room-title") -> "mycards-room-title-card" */
export const cardType = (name: string) => `${NAMESPACE}-${name}-card`;
export const editorType = (name: string) => `${NAMESPACE}-${name}-card-editor`;
export const elementType = (name: string) => `${NAMESPACE}-${name}`;
