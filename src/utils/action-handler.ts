import { noChange } from "lit";
import type { AttributePart, DirectiveParameters } from "lit/directive.js";
import { Directive, directive } from "lit/directive.js";
import { NAMESPACE } from "../const";
import type { ActionConfig } from "../ha";
import { fireEvent } from "../ha";

const ELEMENT = `${NAMESPACE}-action-handler`;
const HOLD_DELAY = 500;
const DOUBLE_CLICK_DELAY = 250;

export interface ActionHandlerOptions {
  hasHold?: boolean;
  hasDoubleClick?: boolean;
  disabled?: boolean;
}

export interface ActionHandlerDetail {
  action: "hold" | "tap" | "double_tap";
}

export type ActionHandlerEvent = CustomEvent<ActionHandlerDetail>;

/** Config shape shared by every card that supports interactions. */
export interface ActionsConfig {
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

interface ActionHandlerElement extends HTMLElement {
  actionHandler?: {
    options: ActionHandlerOptions;
    start?: (event: Event) => void;
    end?: (event: Event) => void;
    handleKeyDown?: (event: KeyboardEvent) => void;
  };
}

class ActionHandler extends HTMLElement {
  public holdTime = HOLD_DELAY;
  private timer?: number;
  private held = false;
  private dblClickTimeout?: number;

  public bind(element: ActionHandlerElement, options: ActionHandlerOptions = {}): void {
    if (element.actionHandler && sameOptions(options, element.actionHandler.options)) return;

    if (element.actionHandler) {
      element.removeEventListener("touchstart", element.actionHandler.start!);
      element.removeEventListener("touchend", element.actionHandler.end!);
      element.removeEventListener("touchcancel", element.actionHandler.end!);
      element.removeEventListener("mousedown", element.actionHandler.start!);
      element.removeEventListener("click", element.actionHandler.end!);
      element.removeEventListener("keydown", element.actionHandler.handleKeyDown!);
    } else {
      element.addEventListener("contextmenu", (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
      });
    }

    element.actionHandler = { options };
    if (options.disabled) return;

    element.actionHandler.start = () => {
      this.held = false;
      if (!options.hasHold) return;
      this.timer = window.setTimeout(() => {
        this.held = true;
      }, this.holdTime);
    };

    element.actionHandler.end = (event: Event) => {
      // Ignore the synthetic events that follow a touch sequence.
      if (["touchend", "touchcancel"].includes(event.type) && this.timer === undefined) return;

      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = undefined;
      }

      if (this.held) {
        fireEvent(element, "action", { action: "hold" });
      } else if (options.hasDoubleClick) {
        if ((event as MouseEvent).detail === 1 || event.type === "keydown") {
          this.dblClickTimeout = window.setTimeout(() => {
            fireEvent(element, "action", { action: "tap" });
          }, DOUBLE_CLICK_DELAY);
        } else {
          clearTimeout(this.dblClickTimeout);
          fireEvent(element, "action", { action: "double_tap" });
        }
      } else {
        fireEvent(element, "action", { action: "tap" });
      }
    };

    element.actionHandler.handleKeyDown = (event: KeyboardEvent) => {
      if (!["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      element.actionHandler!.end!(event);
    };

    element.addEventListener("touchstart", element.actionHandler.start, { passive: true });
    element.addEventListener("touchend", element.actionHandler.end);
    element.addEventListener("touchcancel", element.actionHandler.end);
    element.addEventListener("mousedown", element.actionHandler.start, { passive: true });
    element.addEventListener("click", element.actionHandler.end);
    element.addEventListener("keydown", element.actionHandler.handleKeyDown);
  }
}

function sameOptions(a: ActionHandlerOptions, b: ActionHandlerOptions): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function getActionHandler(): ActionHandler {
  const existing = document.body.querySelector(ELEMENT);
  if (existing) return existing as ActionHandler;

  if (!customElements.get(ELEMENT)) {
    customElements.define(ELEMENT, ActionHandler);
  }
  const handler = document.createElement(ELEMENT) as ActionHandler;
  document.body.appendChild(handler);
  return handler;
}

class ActionHandlerDirective extends Directive {
  override update(part: AttributePart, [options]: DirectiveParameters<this>) {
    getActionHandler().bind(part.element as ActionHandlerElement, options as ActionHandlerOptions);
    return noChange;
  }

  render(_options?: ActionHandlerOptions) {
    return noChange;
  }
}

/**
 * Usage:
 *   <div .actionHandler=${actionHandler({ hasHold: true })} @action=${this._handleAction}>
 */
export const actionHandler = directive(ActionHandlerDirective);
