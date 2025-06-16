import { useEffect } from "react";

export interface KeyboardShortcut {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
}

/**
 * Hook for managing keyboard shortcuts
 * @param shortcuts Array of keyboard shortcut configurations
 * @param enabled Whether the shortcuts should be active (default: true)
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();

        // Handle modifier keys - if both metaKey and ctrlKey are specified,
        // it means either Cmd (Mac) or Ctrl (Windows/Linux) should work
        let modifierMatches = true;

        if (shortcut.metaKey !== undefined || shortcut.ctrlKey !== undefined) {
          const wantsModifier = shortcut.metaKey || shortcut.ctrlKey;
          const hasModifier = event.metaKey || event.ctrlKey;
          modifierMatches = modifierMatches && (wantsModifier === hasModifier);
        }

        if (shortcut.shiftKey !== undefined) {
          modifierMatches = modifierMatches && (shortcut.shiftKey === event.shiftKey);
        }

        if (shortcut.altKey !== undefined) {
          modifierMatches = modifierMatches && (shortcut.altKey === event.altKey);
        }

        if (keyMatches && modifierMatches) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.callback(event);
          break; // Only trigger the first matching shortcut
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Common keyboard shortcuts that can be reused across components
 */
export const commonShortcuts = {
  /**
   * Command/Ctrl + K for search
   */
  search: (callback: () => void): KeyboardShortcut => ({
    key: "k",
    metaKey: true, // This will match either Cmd or Ctrl
    callback: () => callback(),
  }),

  /**
   * Command/Ctrl + N for new item
   */
  newItem: (callback: () => void): KeyboardShortcut => ({
    key: "n",
    metaKey: true, // This will match either Cmd or Ctrl
    callback: () => callback(),
  }),

  /**
   * Command/Ctrl + B for sidebar toggle
   */
  toggleSidebar: (callback: () => void): KeyboardShortcut => ({
    key: "b",
    metaKey: true, // This will match either Cmd or Ctrl
    callback: () => callback(),
  }),

  /**
   * Escape key
   */
  escape: (callback: () => void): KeyboardShortcut => ({
    key: "Escape",
    callback: () => callback(),
  }),

  /**
   * Command/Ctrl + / for help
   */
  help: (callback: () => void): KeyboardShortcut => ({
    key: "/",
    metaKey: true, // This will match either Cmd or Ctrl
    callback: () => callback(),
  }),
};

/**
 * Helper function to format keyboard shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.metaKey || shortcut.ctrlKey) {
    // Show Cmd on Mac, Ctrl on other platforms
    const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  
  if (shortcut.shiftKey) {
    parts.push("⇧");
  }
  
  if (shortcut.altKey) {
    parts.push(typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0 ? "⌥" : "Alt");
  }
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(" + ");
}
