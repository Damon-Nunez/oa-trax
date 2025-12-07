# Next.js App Router: Layout, Page, and File Navigation Rules

## 1. Core File Types

### **`page.tsx`**
- Defines the main UI for a route.
- Automatically rendered when visiting the folder's route.
- Does **not** need to be manually passed into layout.
- Example:  
  `/app/chat/page.tsx` → rendered at `/chat`

---

### **`layout.tsx`**
- Wraps **all pages and nested routes** inside its folder.
- Must include `{ children }` — this is where Next.js injects the `page.tsx` content.
- Automatically applies to:
  - `page.tsx`
  - Nested folders
  - Dynamic routes

Example structure:
```
app/
  layout.tsx  
  page.tsx
  dashboard/
    layout.tsx
    page.tsx
```

Render order:
```
app/layout.tsx → wraps everything
  app/page.tsx
  app/dashboard/layout.tsx → wraps dashboard
    app/dashboard/page.tsx
```

---

## 2. Automatic Routing Rules

### **Next.js decides what to render based on filenames:**
| Filename | Purpose | Required? | Auto-wrapped? |
|---------|---------|-----------|----------------|
| `page.tsx` | Route entry point | Yes | Wrapped by nearest layout |
| `layout.tsx` | UI wrapper for children | Optional | Wraps all pages in same folder |
| `loading.tsx` | Loading UI | Optional | Shown during suspense/loading |
| `error.tsx` | Error boundary UI | Optional | Catches errors below it |
| `route.ts` | API route handler | Optional | Runs on server |

---

## 3. Children Rendering Behavior

Inside any `layout.tsx`:

```tsx
export default function Layout({ children }) {
  return <div>{children}</div>;
}
```

The `children` value automatically becomes:

- The `page.tsx` in that folder
- Nested routes when user navigates deeper

You **never** manually pass `<Page />` into the layout.

---

## 4. Example Folder Breakdown

```
app/
  layout.tsx        → global layout
  page.tsx          → homepage
  chat/
    layout.tsx      → chat sidebar layout
    page.tsx        → chat welcome page
    [sessionId]/
      page.tsx      → session-specific chat page
  login/
    page.tsx        → login route
```

### Render Flow:
- `/` → `app/layout.tsx` wraps `app/page.tsx`
- `/login` → `app/layout.tsx` wraps `app/login/page.tsx`
- `/chat` →  
  `app/layout.tsx` → wraps → `app/chat/layout.tsx` → wraps → `app/chat/page.tsx`
- `/chat/123` →  
  `app/layout.tsx` → wraps → `app/chat/layout.tsx` → wraps → `app/chat/[sessionId]/page.tsx`

---

## 5. When to Extract Layout UI into a Component (e.g., ChatLayout.tsx)

Do this when:
- Your `layout.tsx` contains large UI (e.g., sidebar)
- You want cleaner separation of routing vs UI
- You want to reuse layout logic elsewhere

Example:

`/app/chat/layout.tsx` becomes:

```tsx
import ChatLayout from "./ChatLayout";

export default function Layout({ children }) {
  return <ChatLayout>{children}</ChatLayout>;
}
```

This keeps routing clean and UI modular.

---

## 6. Best Practices

- Keep routing files thin (`layout.tsx`, `page.tsx`)
- Keep UI-heavy components in separate files
- Only place global components in `/components`
- Use route folders to group related UI + pages + layouts

---

## 7. TL;DR (Print This!)

- `page.tsx` = What to show  
- `layout.tsx` = How to wrap it  
- Layout always wraps pages automatically  
- File names *must* remain `layout.tsx` and `page.tsx` for routing to work  
- Nested folders inherit parent layouts  
- Extract complex layouts into separate components like `ChatLayout.tsx`

---

This document explains all core rules of Next.js App Router layout, navigation, and rendering behavior.