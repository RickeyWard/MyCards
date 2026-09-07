import { css } from "lit";

/**
 * Tokens shared by every card in the suite. Override them per theme, per view
 * or per card (card-mod) without touching the card source.
 */
export const themeVariables = css`
  :host {
    --spacing: var(--mycards-spacing, 12px);
    --icon-size: var(--mycards-icon-size, 40px);
    --icon-border-radius: var(--mycards-icon-border-radius, 50%);
    --icon-symbol-size: var(--mycards-icon-symbol-size, 21px);
    --title-font-size: var(--mycards-title-font-size, 16px);
    --title-font-weight: var(--mycards-title-font-weight, 500);
    --subtitle-font-size: var(--mycards-subtitle-font-size, 13px);
    --subtitle-font-weight: var(--mycards-subtitle-font-weight, 400);
  }
`;

export const cardBaseStyles = css`
  :host {
    display: block;
  }
  ha-card {
    box-sizing: border-box;
    height: 100%;
    overflow: hidden;
  }
  ha-card.interactive {
    cursor: pointer;
  }
  ha-card.interactive:focus-visible {
    outline: 2px solid rgb(var(--rgb-primary, 33, 150, 243));
    outline-offset: 2px;
  }
  .unavailable {
    opacity: 0.5;
  }
`;
