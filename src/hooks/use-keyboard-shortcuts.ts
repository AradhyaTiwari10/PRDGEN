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

        // Handle modifier keys with better cross-platform support
        let modifierMatches = true;

        // Handle Ctrl key specifically - only match ctrlKey, not metaKey
        if (shortcut.ctrlKey !== undefined) {
          modifierMatches = modifierMatches && (shortcut.ctrlKey === event.ctrlKey);
        }

        // Handle metaKey separately if specified
        if (shortcut.metaKey !== undefined) {
          modifierMatches = modifierMatches && (shortcut.metaKey === event.metaKey);
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
 * Updated to avoid conflicts with browser shortcuts
 */
export const commonShortcuts = {
  /**
   * Ctrl + K for search (standard command palette shortcut)
   */
  search: (callback: () => void): KeyboardShortcut => ({
    key: "k",
    ctrlKey: true,
    callback: () => callback(),
  }),

  /**
   * Ctrl + N for new item (standard new shortcut)
   */
  newItem: (callback: () => void): KeyboardShortcut => ({
    key: "n",
    ctrlKey: true,
    callback: () => callback(),
  }),

  /**
   * Ctrl + B for sidebar toggle (standard sidebar shortcut)
   */
  toggleSidebar: (callback: () => void): KeyboardShortcut => ({
    key: "b",
    ctrlKey: true,
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
   * Ctrl + / for help (standard help shortcut)
   */
  help: (callback: () => void): KeyboardShortcut => ({
    key: "/",
    ctrlKey: true,
    callback: () => callback(),
  }),

  /**
   * Ctrl + S for save (standard save shortcut)
   */
  save: (callback: () => void): KeyboardShortcut => ({
    key: "s",
    ctrlKey: true,
    callback: () => callback(),
  }),

  /**
   * Ctrl + F for focus search (standard find shortcut)
   */
  focusSearch: (callback: () => void): KeyboardShortcut => ({
    key: "f",
    ctrlKey: true,
    callback: () => callback(),
  }),

  /**
   * Ctrl + 1 for go to home
   */
  goHome: (callback: () => void): KeyboardShortcut => ({
    key: "1",
    ctrlKey: true,
    callback: () => callback(),
  }),

  /**
   * Ctrl + 2 for go to dashboard
   */
  goDashboard: (callback: () => void): KeyboardShortcut => ({
    key: "2",
    ctrlKey: true,
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
