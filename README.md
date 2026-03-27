# Media Tracker

A personal media tracking dashboard built to track movies, TV shows, and books — across watching, completed, and planned statuses. UI is in Simplified Chinese.

## Tech Stack

| Layer        | Technology                                                                    |
| ------------ | ----------------------------------------------------------------------------- |
| Framework    | [TanStack Start](https://tanstack.com/start) (React, file-based routing, SSR) |
| Backend / DB | [Convex](https://convex.dev) (real-time database, serverless functions)       |
| Auth         | [Clerk](https://clerk.com) (sign-in/out, JWT-authenticated Convex queries)    |
| Runtime      | [Bun](https://bun.sh)                                                         |
| Linting      | [Biome](https://biomejs.dev)                                                  |
| Language     | TypeScript                                                                    |
| Styling      | Vanilla CSS (dark glassmorphic design, no Tailwind)                           |

## Features

- **Dashboard** — Stats cards, completion ring charts, "currently watching" row, recently added grid
- **Board** — Kanban board with three columns (Watching / Completed / Planned), drag-and-drop to change status, filter by type + search
- **Settings** — Export all data as JSON, import from JSON backup, clear all data
- Manual media entry (title, type, status, cover URL, 1–10 star rating, progress, notes)
- All data is user-scoped — only the signed-in user can read/write their records

## Project Structure

```
media-tracker/
├── convex/
│   ├── schema.ts        # media table with indexes
│   ├── media.ts         # queries & mutations (auth-gated)
│   └── auth.config.ts   # Clerk JWT config
├── src/
│   ├── styles/          # global.css, components.css, pages.css
│   ├── components/      # Navbar, MediaCard, MediaModal, StatsCard, FilterBar, Toast
│   └── routes/          # __root.tsx, index.tsx, board.tsx, settings.tsx
└── .env.local           # secret keys (not committed)
```

## Getting Started

### 1. Set up Clerk

1. Create an app at [clerk.com](https://clerk.com)
2. Go to **Configure → JWT Templates** → create a template named `convex`
3. Copy your keys into `.env.local`:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

### 2. Set up Convex

1. Run `bunx convex dev` and follow the prompts to create a project (this auto-fills `VITE_CONVEX_URL` and `CONVEX_DEPLOYMENT` in `.env.local`)
2. In the Convex dashboard → **Settings → Environment Variables**, add:
   ```
   CLERK_ISSUER_URL = https://your-app-name.clerk.accounts.dev
   ```
   _(Found in Clerk dashboard → Configure → API Keys → Frontend API URL)_

### 3. Install & Run

```bash
bun install

# Terminal 1 — Convex backend
bunx convex dev

# Terminal 2 — Frontend dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in, and start tracking.

## Scripts

```bash
bun run dev       # Start dev server (port 3000)
bun run build     # Production build
bun run lint      # Biome lint
bun run format    # Biome format
bun run check     # Biome lint + format check
```

## Planned (Future PRs)

- TMDB / Open Library API integration for auto-filling metadata and cover images
- Light mode toggle
- Deploy to Vercel / Cloudflare Pages
