# The Great Lock-in of Sept–Dec

A daily habit-tracker calendar for a "lock-in" period: September through December 2025. Tap any day to mark it as done (yes) or missed (no), track your streak, and watch four months of consistency fill in — all in the browser, no account needed.

> Live demo: https://girishlade111.github.io/the-great-lock-in-of-sept-dec-2/

## Features

- **4-month calendar grid** — September, October, November, December 2025 in one view
- **Tap-to-mark days** — mark each day as done ✅ or missed ❌
- **LocalStorage persistence** — your marks survive reloads and restarts, fully offline
- **Today highlighted** — the current day is visually emphasized
- **Future dates locked** — can't mark days that haven't happened yet
- **Clean dark UI** — shadcn/ui components with a minimal, focused design
- **100% client-side** — no backend, no database, no login

## Tech Stack

- **Framework:** Next.js 14 (App Router, static export)
- **Language:** TypeScript
- **UI:** React, Tailwind CSS, shadcn/ui (Radix primitives)
- **Storage:** browser localStorage (`calendar-marked-dates`)
- **Analytics:** @vercel/analytics (no-op on static export)

## Quick Start

```bash
# install dependencies
pnpm install

# run the dev server
pnpm dev
# open http://localhost:3000

# build the static site
pnpm build
# output goes to ./out
```

Requires Node.js 18+.

## Project Structure

```
.
├── app/
│   ├── layout.tsx        # Root layout (fonts, theme provider)
│   ├── page.tsx          # The lock-in calendar (client component, all logic here)
│   └── globals.css       # Global Tailwind styles
├── components/
│   ├── ui/               # shadcn/ui primitives (button, etc.)
│   └── theme-provider.tsx
├── lib/
│   └── utils.ts          # cn() class merge helper
├── public/               # Static assets
├── styles/
│   └── globals.css       # Additional global styles
└── next.config.mjs       # next config (output: 'export', basePath for gh-pages)
```

## How It Works

Each day cell is keyed by `Month-day` and stored in localStorage as `"yes"` or `"no"`. Clicking a day cycles its state. The calendar layouts are hardcoded for Sept–Dec 2025 with the correct weekday offsets, so there is no date library and no runtime date math beyond "today".

## Environment Variables

None required — the app is fully client-side.

## Deployment

This project builds to a static export (`output: 'export'`) and is deployed to **GitHub Pages** at https://girishlade111.github.io/the-great-lock-in-of-sept-dec-2/.

```bash
pnpm build   # -> ./out
```

Note: `next.config.mjs` sets `basePath: '/the-great-lock-in-of-sept-dec-2'` so asset URLs resolve under the GitHub Pages subpath. If you deploy to a root domain or Vercel instead, remove the `basePath` line.

## License

MIT — free to use and remix.

---

Built by Girish Lade — https://ladestack.in
