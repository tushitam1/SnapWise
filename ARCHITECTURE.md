# SnapWise – Architecture & Split Logic

## Overview

SnapWise is a React + Vite bill-splitting app. Users log in (no auth), upload a bill image, assign items to people, and see each person's total share.

---

## Architecture Flow

```
┌─────────────┐     Login      ┌─────────────┐     Split      ┌─────────────┐
│   Login     │ ──────────────►│    Split    │ ──────────────►│   People    │
│     /       │   (no auth)    │   /split    │   (state)      │   /people   │
└─────────────┘                └─────────────┘                └─────────────┘
                                     │                              │
                                     │ Logout                       │ Back
                                     ▼                              ▼
                              ┌─────────────┐                ┌─────────────┐
                              │   Login     │                │    Split    │
                              └─────────────┘                └─────────────┘
```

### User Flow

1. **Login** (`/`) → User submits form → Navigate to Split (no authentication).
2. **Split** (`/split`) → User uploads bill image → Clicks Split → Navigate to People with `items` in `state`.
3. **People** (`/people`) → User adds people, assigns items, sees totals → Back to Split.
4. **Logout** (Split header) → Navigate back to Login (`/`).

---

## Split Logic

### Data Structure

Items passed from Split to People:

```js
{
  foodItems: [
    { name: "Burger", quantity: 1, price: 12.99 },
    { name: "Pizza", quantity: 1, price: 15.0 }
  ],
  drinkItems: [
    { name: "Cola", quantity: 2, price: 3.0 }
  ]
}
```

Each item: `{ name, quantity?, price? }`

### Assignment Model

- **assignments** is an object: `{ [itemIndex]: [person1, person2, ...] }`
- Example: `assignments = { 0: ["Alice", "Bob"], 1: ["Alice"], 2: ["Bob"] }`
- A person is assigned to an item when their checkbox is checked.

### Total Calculation

For each person:

1. Initialize: `totals[person] = 0`
2. For each item at `index`:
   - `assigned = assignments[index] || []`
   - If `assigned.length === 0` → skip
   - `pricePerPerson = (item.price || 0) / assigned.length`
   - Add `pricePerPerson` to `totals[person]` for each person in `assigned`

**Example:**
- Burger $12.99 assigned to Alice, Bob → each pays $6.50
- Pizza $15.00 assigned to Alice → Alice pays $15.00
- Cola $3.00 assigned to Bob → Bob pays $3.00  
Result: Alice = $21.50, Bob = $9.50

---

## File Structure & Main Functions

### `src/main.tsx`

- **Purpose:** App entry point
- **Main logic:** Creates React root, wraps `App` in `BrowserRouter` for routing

---

### `src/App.jsx`

- **Purpose:** Route configuration
- **Main logic:** Defines routes: `/` → Login, `/split` → Split, `/people` → People

---

### `src/components/Homepage.jsx` (Login)

- **Purpose:** Login screen (no real auth)
- **Main logic:** `handleLogin(e)` → `e.preventDefault()` → `navigate("/split")`
- **Renders:** Email/password form, Login button

---

### `src/components/Split.jsx`

- **Purpose:** Bill upload and split initiation
- **Main logic:**
  - `handleFileChange(e)` → stores selected file in `file` state
  - `handleSplit()` → validates file, builds sample `items`, navigates to People with `state: { items }`
  - Currently uses sample data; can be extended with OCR/API for real extraction
  - Logout button → `navigate("/")`

---

### `src/components/People.jsx`

- **Purpose:** Assign people to items and show total split
- **Main logic:**
  - Reads `state.items` from `useLocation()` (passed from Split)
  - `allItems = [...foodItems, ...drinkItems]`
  - `handleToggleAssign(index, person)` → adds/removes person from `assignments[index]`
  - `handleAddPerson()` → adds new person name to `people` list
  - `getPersonTotals()` → computes each person's share (see Split Logic above)
- **Renders:** Add person input, people chips, item cards with checkboxes, Total Split section
- **Navigation:** Back → `/split`; "Go to upload" (when no data) → `/split`

---

### `src/index.css`

- **Purpose:** Global styles
- **Main logic:** Imports Tailwind CSS v4

---

### `vite.config.ts`, `postcss.config.js`

- **Purpose:** Build configuration
- **Main logic:** Vite + React + PostCSS/Tailwind setup

---

## State Flow Summary

| Page  | Key State        | Source               | Destination      |
|-------|------------------|----------------------|------------------|
| Login | —                | —                    | Split            |
| Split | `file`           | File input           | —                |
| Split | `items`          | Built in handleSplit | People via state |
| People| `people`, `assignments` | Local state  | —                |
| People| `personTotals`   | Derived from assignments | UI           |
