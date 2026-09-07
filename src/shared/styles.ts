import { css } from "lit";

/**
 * Tokens shared by every card in the suite. Override them per theme, per view
 * or per card (card-mod) without touching the card source.
 */
export const themeVariables = css`
  :host {
    --spacing: var(--mycards-spacing, 12px);
    --icon-gap: var(--mycards-icon-gap, var(--spacing));
    --icon-size: var(--mycards-icon-size, 40px);
    --icon-border-radius: var(--mycards-icon-border-radius, 50%);
    --icon-square-border-radius: var(--mycards-icon-square-border-radius, 12px);
    --icon-symbol-size: var(--mycards-icon-symbol-size, 21px);
    /* Shapeless icons have no background to sit inside, so the glyph itself
       takes the footprint the shape would have had. */
    --icon-bare-symbol-size: var(--mycards-icon-bare-symbol-size, var(--icon-size));
    --title-font-size: var(--mycards-title-font-size, 16px);
    --title-font-weight: var(--mycards-title-font-weight, 500);
    /* A ratio, not a size: resolved against the title where it is used, so it
       follows a per-card title size instead of stranding at a fixed px. */
    --subtitle-scale: var(--mycards-subtitle-scale, 0.8125);
    --subtitle-gap: var(--mycards-subtitle-gap, 0px);
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
