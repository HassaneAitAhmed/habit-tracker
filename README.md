# DISCIPLINE. — Habit Tracker

A full-stack habit tracking web application built with vanilla JavaScript and Supabase. Track daily habits, log your mood, write journal entries, and analyze your consistency over time — all in a clean, fast, no-framework app.

---

## Features

**Core Tracking**
- Daily habit check-ins with a 31-column monthly grid (desktop)
- Habit frequency: daily, weekdays only, weekends only, or custom days
- Weekly goal targets per habit
- Completion types: checkbox, count (e.g. pages), or duration (e.g. minutes)
- Category system with custom colors
- Per-habit monthly notes

**Analytics**
- Daily and weekly progress bar charts
- Monthly consistency percentage with donut chart
- 21-day streak grid
- Full-year heatmap (last 12 months)
- Best day of the week stat card
- Top 10 habits ranking
- Analysis panel with per-habit completion bars

**Additional Features**
- Mood and motivation logging (1–10 scale, per day)
- Daily journal with date navigation and recent entries list
- Habit templates (5 starter packs: Morning Warrior, Student Focus, Athlete, Mindfulness, Builder)
- Streak freeze — one shield per habit per month to protect a missed day
- Pomodoro timer — custom duration (5–60 min), auto-checks habit on completion
- Share Month Card — downloadable PNG summary card
- Accountability partner — read-only share link
- Achievement badges (13 unlockable)
- Drag-to-reorder habits
- Export data to CSV
- 3 themes: Light, Dark, Pink

**Mobile**
- Fully separate mobile UI (activates at ≤ 700px)
- Bottom navigation: Today, History, Stats, Journal, Settings
- Left slide drawer for all pages: Year View, About, Share Card, Templates, Accountability
- Native bottom-sheet forms for adding habits, categories, templates, pomodoro
- Today view: large tap targets, streak badge, 🍅 pomodoro button per habit
- Past days are locked — cannot be checked on mobile or desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript (ES6+), HTML5, CSS3 |
| Backend | Supabase (PostgreSQL + Auth) |
| Auth | Supabase Auth — email/password |
| Database | PostgreSQL via Supabase |
| Fonts | DM Serif Display, DM Mono, Syne (Google Fonts) |
| Hosting | Any static file server |

No build tool, no framework, no dependencies beyond the Supabase JS client.

---

## Project Structure

```
habit-tracker/
├── index.html              — Single HTML file, all pages inlined
├── css/
│   └── style.css           — All styles, themes, responsive, mobile
├── js/
│   ├── supabase.js         — Supabase client credentials
│   ├── state.js            — Global state, constants (QUOTES, EMOJIS, COLORS)
│   ├── app.js              — Auth state machine, app bootstrap
│   ├── db.js               — loadAll(), saveMoodDB(), deleteAllData()
│   ├── render.js           — Desktop renderAll(), table, charts, mood, sidebar
│   ├── mobile.js           — Entire mobile app (all pages, native forms)
│   ├── habits.js           — toggleCheck(), openModal(), saveHabit(), deleteHabit()
│   ├── categories.js       — Category CRUD
│   ├── journal.js          — Journal render and save
│   ├── settings.js         — Settings page render, drag-to-reorder
│   ├── utils.js            — Helpers: getDays, isApplicable, isChecked, themes, CSV
│   ├── auth.js             — signIn(), signUp(), signOut()
│   ├── templates.js        — 5 habit template packs
│   ├── pomodoro.js         — Desktop Pomodoro timer
│   ├── streakfreeze.js     — Streak freeze logic and rendering
│   ├── dragorder.js        — Drag-to-reorder habits in settings
│   ├── dialog.js           — Custom HTML confirm dialog (replaces window.confirm)
│   ├── animations.js       — Checkbox bounce, confetti burst
│   ├── achievements.js     — 13 badges, stats computation, toast notification
│   ├── heatmap.js          — Full-year Canvas heatmap renderer
│   ├── bestday.js          — Best day of the week stat card
│   ├── sharecard.js        — Month card Canvas renderer and PNG download
│   ├── onboarding.js       — 3-step first-time setup wizard
│   ├── accountability.js   — Read-only share link generation
│   ├── mood.js             — Mood dot render and cycle
│   ├── ui.js               — Loading overlay, toast, sync indicator
│   └── export.js           — CSV export
├── pages/                  — HTML fragments (reference only, not loaded at runtime)
├── schema.sql              — Full database schema (run this)
├── dummy_data.sql          — Sample data for testing
└── README.md
```

---

## Database Schema

### Tables Overview

| Table | Purpose |
|---|---|
| `profiles` | Auto-created on signup via trigger |
| `categories` | User-defined habit categories with colors |
| `habits` | Habit definitions with frequency, emoji, color, completion type |
| `habit_checks` | One row per habit per day when checked |
| `mood_logs` | Daily mood (1–10) and motivation (1–10) |
| `journal_notes` | Daily free-text journal entries |
| `habit_notes` | Per-habit monthly notes |
| `user_settings` | Theme, dark mode, reminder preferences |
| `habit_stacks` | Ordered chains of habits (defined, UI removed) |
| `streak_freezes` | One freeze token per habit per month |

All tables have Row Level Security (RLS) enabled. Users can only access their own data.

---

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and note your **Project URL** and **anon/public API key**.

### 2. Run the schema

In your Supabase dashboard, go to **SQL Editor** and run `schema.sql`. This creates all tables, policies, indexes, and the signup trigger in one shot. It is safe to re-run.

### 3. Configure credentials

Open `js/supabase.js` and replace the two values:

```js
const SUPABASE_URL      = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 4. Serve the app

No build step needed. Serve the folder with any static server:

```bash
# Option 1 — Node
npx serve .

# Option 2 — Python
python3 -m http.server 8080

# Option 3 — VS Code
# Use the Live Server extension and open index.html
```

Then open `http://localhost:3000` (or whichever port) in your browser.

### 5. Sign up

Create an account using any email and password. The app will walk you through a 3-step onboarding flow to pick your first habits.

---

## Loading Sample Data

To populate the app with 3 months of realistic data for testing:

1. Go to your Supabase dashboard → **Authentication → Users** and copy your user UUID
2. Open `dummy_data.sql` and replace every occurrence of `<<YOUR_USER_ID>>` with your UUID
3. Run the file in the SQL Editor

---

## Themes

The app ships with three themes switchable via the header button or Settings page:

| Theme | Description |
|---|---|
| ☀️ Light | Warm sand tones — the default |
| 🌙 Dark | Deep brown-black with gold accents |
| 🌸 Pink | Rose and magenta |

Theme is persisted to `user_settings.theme` in the database and to `localStorage` to prevent flash on reload.

---

## Key Design Decisions

**No framework** — The entire frontend is plain JS modules loaded via `<script>` tags. No webpack, no Vite, no React. This keeps the project instantly understandable, zero-config to deploy, and fast to load.

**Two separate UIs** — Rather than trying to make the desktop table responsive, mobile devices (≤ 700px) get a completely separate layout in `mobile.js` with native bottom-sheet forms, large tap targets, and a drawer navigation. Desktop layout is untouched.

**Past days are locked** — Users can only check habits for today. Past days are displayed as read-only (dimmed, no click handler). This enforces honest tracking.

**Supabase data window** — `loadAll()` fetches checks from the previous month through the next month (~3 months). The heatmap and best-day card work off this window. For a full year of heatmap data, consider widening the date range in `db.js`.

**Custom dialog** — All `window.confirm()` calls are replaced with a custom HTML modal (`dialog.js`) that respects the app's theme and doesn't break on mobile browsers.

---

## Achievement Badges

| Badge | Condition |
|---|---|
| ✅ First Step | Check your first habit |
| ⭐ Perfect Day | 100% completion in one day |
| 🔥 Week Warrior | 7-day streak on any habit |
| 💎 Diamond Month | 30-day streak on any habit |
| 👑 Two Week King | All habits done 14 days in a row |
| 🚿 Ice Warrior | Cold Shower habit checked 20+ times |
| 💪 Iron Consistent | Gym habit checked 10+ times |
| 📚 Knowledge Seeker | Reading habit done 15+ times |
| ⏰ Early Bird | Wake-up habit 10+ days |
| 🥗 Clean Fuel | No sugar 7+ days |
| 📝 Master Planner | Planning habit 20+ times |
| 🎯 Halfway Hero | 50%+ monthly completion rate |
| 🏆 Monthly Champion | 80%+ monthly completion rate |

---

## Built By

**Hassane Ait Ahmed Lamara** — Computer Science Student · Full-Stack Developer · AI & ML Enthusiast

- GitHub: [github.com](https://github.com)
- LinkedIn: [linkedin.com](https://linkedin.com)
