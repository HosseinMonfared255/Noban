"use client";

import { useEffect, type RefObject } from "react";

/**
 * Traps keyboard focus inside a container element while `active` is true.
 * - On activation: moves focus to the first focusable element.
 * - Tab / Shift+Tab cycles within the container.
 * - On deactivation: focus is NOT restored (caller can handle that).
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null);
 *   useFocusTrap(ref, open);
 */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
];

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE.join(","))
  ).filter(
    (el) =>
      el.offsetParent !== null ||
      el.getClientRects().length > 0 ||
      el.getAttribute("tabindex") !== null
  );
}

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean
) {
  useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    // Focus first focusable element on open
    const focusables = getFocusable(container);
    if (focusables.length > 0) {
      focusables[0].focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = getFocusable(container);
      if (els.length === 0) return;

      const first = els[0];
      const last = els[els.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first, wrap to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if on last, wrap to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener("keydown", onKey);
    return () => container.removeEventListener("keydown", onKey);
  }, [active, ref]);
}
