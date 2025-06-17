# 🎹 Keyboard Shortcuts Guide

## ⌨️ **Standard Ctrl Combinations**

The keyboard shortcuts now use familiar, standard Ctrl combinations that work consistently across the application.

---

## 🔄 **What Changed**

### **Before (Custom combinations):**
- ❌ `Ctrl+J` - Create New Idea (non-standard)
- ❌ `Ctrl+E` - Quick Search (non-standard)
- ❌ `Ctrl+G` - Focus Search (non-standard)
- ❌ `Ctrl+D` - Save (non-standard)
- ❌ `Ctrl+H` - Help (non-standard)

### **After (Standard & Familiar):**
- ✅ `Ctrl+N` - Create New Idea (standard New)
- ✅ `Ctrl+K` - Quick Search (standard command palette)
- ✅ `Ctrl+F` - Focus Search (standard Find)
- ✅ `Ctrl+S` - Save Current Item (standard Save)
- ✅ `Ctrl+B` - Toggle Sidebar (standard sidebar)
- ✅ `Ctrl+/` - Show Keyboard Shortcuts (standard help)

---

## 📋 **Current Keyboard Shortcuts**

### **Actions** 🎯
| Icon | Shortcut | Description | Standard Usage |
|------|----------|-------------|----------------|
| ➕ | `Ctrl+N` | Create new idea | Standard "New" shortcut |
| 💾 | `Ctrl+S` | Save current item | Standard "Save" shortcut |
| 🗑️ | `Delete` | Delete selected items | Standard delete |

### **Navigation** 🧭
| Icon | Shortcut | Description | Standard Usage |
|------|----------|-------------|----------------|
| 🔍 | `Ctrl+K` | Quick search (Command Palette) | Standard command palette |
| 🎯 | `Ctrl+F` | Focus search | Standard "Find" shortcut |
| 📋 | `Ctrl+B` | Toggle sidebar | Standard sidebar toggle |
| 🏠 | `Ctrl+1` | Go to home | Number navigation |
| 📊 | `Ctrl+2` | Go to dashboard | Number navigation |
| ⎋ | `Escape` | Close dialogs/clear selection | Standard escape |
| ↵ | `Enter` | Open selected item | Standard enter |
| ⇥ | `Tab` | Navigate between elements | Standard tab |

### **Help** ❓
| Icon | Shortcut | Description | Standard Usage |
|------|----------|-------------|----------------|
| ❓ | `Ctrl+/` | Show keyboard shortcuts | Standard help shortcut |
| ❓ | `?` | Show keyboard shortcuts (alternative) | Question mark |

### **Selection** ✨
| Icon | Shortcut | Description | Standard Usage |
|------|----------|-------------|----------------|
| 📝 | `Ctrl+A` | Select all text | Standard select all |

---

## 🎯 **Why These Changes?**

### **1. Familiarity & Standards** 🧠
- **Industry standard shortcuts** - same as other applications
- **Muscle memory transfer** - works like VS Code, Notion, GitHub, etc.
- **No learning curve** - users already know these combinations
- **Professional consistency** - follows established conventions

### **2. User Experience** ✨
- **Predictable behavior** - shortcuts work exactly as expected
- **No confusion** - same shortcuts across different apps
- **Instant recognition** - familiar patterns reduce cognitive load
- **Efficient workflow** - standard shortcuts are faster to execute

### **3. Accessibility** ♿
- **Universal compatibility** - works across all platforms and browsers
- **Clear visual indicators** - icons match standard conventions
- **Consistent patterns** - follows accessibility guidelines
- **Reduced errors** - familiar shortcuts prevent mistakes

---

## 🚀 **How to Use**

1. **Press `Ctrl+/`** to see all available shortcuts (standard help)
2. **Use `Ctrl+K`** for quick search (standard command palette)
3. **Use `Ctrl+N`** to create new ideas (standard new)
4. **Use `Ctrl+S`** to save your work (standard save)
5. **Use `Ctrl+F`** to focus search (standard find)
6. **Use `Ctrl+B`** to toggle sidebar (standard sidebar)
7. **Press `Escape`** to close any dialog

### **💡 Standard Shortcuts**
- **Ctrl+N** = New (universal standard)
- **Ctrl+S** = Save (universal standard)
- **Ctrl+F** = Find (universal standard)
- **Ctrl+K** = Command palette (VS Code, GitHub, etc.)
- **Ctrl+B** = Sidebar toggle (many editors)
- **Ctrl+/** = Help/shortcuts (common standard)

---

## 🔧 **For Developers**

The shortcuts are managed in:
- `src/hooks/use-keyboard-shortcuts.ts` - Core logic
- `src/components/ui/keyboard-shortcuts.tsx` - UI display
- Individual components use `useKeyboardShortcuts` hook

### **Adding New Shortcuts**
```typescript
import { useKeyboardShortcuts, commonShortcuts } from "@/hooks/use-keyboard-shortcuts";

// Use common shortcuts
useKeyboardShortcuts([
  commonShortcuts.search(() => openSearch()),
  commonShortcuts.newItem(() => createItem()),
]);

// Or create custom shortcuts
useKeyboardShortcuts([
  {
    key: "j",
    metaKey: true,
    shiftKey: true,
    callback: () => customAction(),
  }
]);
```

---

## 📱 **Mobile Support**

Keyboard shortcuts are automatically disabled on mobile devices to prevent conflicts with touch gestures.

---

*Last updated: Now with non-conflicting shortcuts! 🎉*
