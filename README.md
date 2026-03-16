# Habit Tracker

A full-stack habit tracking web application built with vanilla JavaScript and Supabase. Designed for users who take consistency seriously — supports daily check-ins, mood logging, journaling, progress analytics, and team accountability.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Supabase Setup](#supabase-setup)
  - [Local Development](#local-development)
- [Database Schema](#database-schema)
- [Configuration](#configuration)
- [Feature Reference](#feature-reference)
- [Theming](#theming)
- [Security](#security)
- [Known Limitations](#known-limitations)
- [Author](#author)

---

## Overview

Habit Tracker is a single-page application that stores all data in a Supabase (PostgreSQL) backend with full user authentication. It requires no build tool, no framework, and no package manager — open `index.html` through any static file server and it runs.

The application is structured as a modular JavaScript codebase split across focused files, with a single CSS file and HTML page templates kept separate from logic.

---

## Features

### Core Tracking
- **Daily habit check-ins** — toggle habits per day on a full monthly grid
- **Habit frequency modes** — Daily, Weekdays only, Weekends only, or Custom days
- **Weekly goal targets** — set a per-habit weekly target (e.g. 5 of 7 days) and track how many weeks you hit it
- **Habit categories** — color-coded groupings with filter support on the dashboard
- **Per-habit notes** — attach a monthly note to any habit for context or reflection

### Analytics & Insights
- **Daily and weekly progress bar charts** — rendered inline on the dashboard
- **Streak tracker** — current streak with a 21-day visual heatmap
- **Best day of the week** — bar chart showing your average completion rate per weekday
- **Full-year heatmap** — GitHub-style contribution grid covering the past 365 days with four intensity levels
- **Analysis panel** — all habits ranked by completion percentage with inline progress bars
- **Top 10 habits** — sorted leaderboard by consistency rate

### Mood & Journal
- **Daily mood and motivation logging** — 1–10 scale, logged per day
- **Daily journal** — free-text entries per day with a recent entries list
- **Month navigation** — browse any past month in both the tracker and journal

### Achievements
- **13 unlockable badges** — including Perfect Day, Week Warrior, Ice Warrior, Iron Consistent, Monthly Champion, and more
- **Achievement toast notifications** — pop-up when a new badge is unlocked
- **Per-month tracking** — unlocked state is stored locally per calendar month

### Sharing & Collaboration
- **Share Month Card** — renders a Canvas-based PNG card of your monthly stats, downloadable and shareable
- **Accountability Partner** — generates a read-only share URL that disables all interactive elements for the viewer

### UX & Accessibility
- **Onboarding flow** — 3-step wizard for first-time users: pick starter habits, set wake time
- **Empty state art** — illustrated empty state instead of a blank table
- **Micro-animations** — checkbox bounce, confetti burst on check, animated progress bars, streak number count-up
- **Browser reminders** — configurable daily notification via the Notifications API
- **CSV export** — full monthly habit data as a downloadable spreadsheet
- **Three themes** — Light, Dark, and Pink, persisted to both Supabase and localStorage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript (ES2020), HTML5, CSS3 |
| Backend / Database | [Supabase](https://supabase.com) (PostgreSQL + Auth) |
| Authentication | Supabase Auth — email/password |
| Fonts | DM Serif Display, DM Mono, Syne (Google Fonts) |
| Canvas rendering | HTML5 Canvas API (share card) |
| No build step | Served as static files |

---

## Project Structure

```
habit-tracker/
│
├── index.html                  # Entry point — all pages inlined, scripts loaded at bottom
│
├── css/
│   └── style.css               # All styles: base, themes (light/dark/pink), components, features
│
├── pages/                      # HTML fragments (source of truth — inlined into index.html)
│   ├── auth.html               # Login and signup forms
│   ├── chrome.html             # Quote banner, header, navigation tabs
│   ├── dashboard.html          # Stats, charts, habits table, mood tracker, sidebar
│   ├── journal.html            # Day picker, editor, recent entries
│   ├── settings.html           # Appearance, reminders, categories, account
│   ├── modals.html             # Habit modal, note modal
│   └── about.html              # Creator profile and tech stack
│
├── js/
│   ├── supabase.js             # Supabase client initialisation — put credentials here
│   ├── state.js                # Global state, constants (MONTHS, QUOTES, EMOJIS, COLORS)
│   ├── utils.js                # Shared utilities: getDays, isChecked, showToast, theme system
│   ├── db.js                   # loadAll(), saveSettingsDB(), saveMoodDB(), deleteAllData()
│   ├── render.js               # renderAll(), renderTable(), renderStats(), renderCharts(), renderMood(), renderSidebar()
│   ├── habits.js               # toggleCheck(), openModal(), saveHabit(), deleteHabit(), note modal
│   ├── categories.js           # addCategory(), updateCatColor(), updateCatName(), deleteCategory()
│   ├── journal.js              # renderJournal(), saveJournalNote(), jPrev(), jNext()
│   ├── settings.js             # renderSettings(), toggleReminder(), scheduleReminder()
│   ├── auth.js                 # signIn(), signUp(), signOut(), forceSignOut()
│   ├── animations.js           # popCheckbox(), burstConfetti(), animateBar(), slideInCard()
│   ├── achievements.js         # ACHIEVEMENTS config, computeAchievementStats(), renderAchievements()
│   ├── heatmap.js              # renderHeatmap() — full-year grid
│   ├── bestday.js              # renderBestDay() — per-weekday average chart
│   ├── sharecard.js            # openShareCard(), renderShareCardPreview(), downloadShareCard()
│   ├── onboarding.js           # STARTER_HABITS, showOnboarding(), finishOnboarding()
│   ├── accountability.js       # openAccountability(), copyShareLink(), checkViewMode()
│   └── app.js                  # Bootstrap: auth listener, nav wiring, early theme apply
│
├── schema.sql                  # Full Supabase PostgreSQL schema — run once in SQL Editor
└── add_theme_column.sql        # Migration for existing databases — adds theme column
```

---

## Getting Started

### Prerequisites

- A free [Supabase](https://supabase.com) account
- A static file server (any of the following):
  ```bash
  npx serve .
  # or
  python3 -m http.server 8080
  # or
  npx http-server .
  ```

> **Why a server?** The app loads JS modules from relative paths. Browsers block these when opening `file://` URLs directly due to CORS restrictions. Any local HTTP server resolves this.

---

### Supabase Setup

**Step 1 — Create a project**

Go to [supabase.com](https://supabase.com), create a new project, and wait for it to initialise (~2 minutes).

**Step 2 — Run the schema**

1. In your Supabase dashboard, navigate to **SQL Editor**
2. Click **New query**
3. Paste the contents of `schema.sql`
4. Click **Run**

You should see: `Success. No rows returned.`

**Step 3 — Enable Email Auth**

1. Go to **Authentication → Providers**
2. Confirm that **Email** is enabled (it is by default)
3. Optional: go to **Authentication → Settings** and disable "Enable email confirmations" for easier local testing

**Step 4 — Get your API credentials**

1. Go to **Settings → API**
2. Copy your **Project URL** (e.g. `https://xxxx.supabase.co`)
3. Copy your **anon public** key (the long JWT string — not the service role key)

---
---

## Database Schema

| Table | Purpose |
|---|---|
| `profiles` | Auto-created on signup via trigger. Stores user email. |
| `categories` | User-defined habit categories with name and hex color. |
| `habits` | Habit definitions: name, emoji, color, frequency, weekly goal. |
| `habit_checks` | One row per completed habit per day. Unique on `(habit_id, checked_on)`. |
| `mood_logs` | Daily mood (1–10) and motivation (1–10) scores. Unique per `(user_id, log_date)`. |
| `journal_notes` | Free-text daily journal entries. Unique per `(user_id, note_date)`. |
| `habit_notes` | Per-habit monthly notes. Unique per `(habit_id, year, month)`. |
| `user_settings` | Dark mode flag, theme name, reminder toggle, reminder time. One row per user. |

All tables have **Row Level Security (RLS)** enabled. Every policy ensures users can only read, insert, update, or delete their own rows.

---

## Configuration

All user-facing settings are managed through the **Settings** tab in the app. No manual file editing is required beyond the initial credential setup.

| Setting | Location | Description |
|---|---|---|
| Supabase credentials | `js/supabase.js` | Project URL and anon key |
| Theme | Settings → Appearance | Light / Dark / Pink |
| Daily reminder | Settings → Reminders | Browser notification at a set time |
| Categories | Settings → Categories | Add, rename, recolor, delete |
| Habit management | Settings → Manage Habits | Edit or delete existing habits |

---

## Feature Reference

### Theme System

Three themes are available, cycled via the header button or selected directly in Settings:

| Theme | Body class | Description |
|---|---|---|
| Light | *(none)* | Warm sand tones, the default |
| Dark | `body.dark` | Deep brown-black backgrounds |
| Pink | `body.pink` | Rose and magenta palette |

Theme preference is saved to Supabase `user_settings.theme` and also to `localStorage` under the key `ht_theme` to prevent a flash of the wrong theme on page load before the database responds.

### Achievement Badges

Achievements are computed client-side from the current month's data each time `renderAchievements()` is called. Unlocked state is stored in `localStorage` under `ach_shown_{year}_{month}` to avoid re-triggering the toast on every render.

| Badge | Condition |
|---|---|
| First Step | 1 habit checked |
| Perfect Day | 100% completion on any single day |
| Week Warrior | 7-day streak on any habit |
| Diamond Month | 30-day streak on any habit |
| Two Week King | All habits complete 14 days in a row |
| Ice Warrior | Cold Shower habit checked 20+ times |
| Iron Consistent | GYM habit checked 10+ times this month |
| Knowledge Seeker | Read habit done 15+ times |
| Early Bird | Wake-up habit 10+ days this month |
| Clean Fuel | No sugar habit 7+ days |
| Master Planner | Planning habit 20+ times |
| Halfway Hero | 50%+ monthly completion rate |
| Monthly Champion | 80%+ monthly completion rate |

### Share Month Card

Rendered using the HTML5 Canvas API. The card reflects the active theme's color palette at the moment of generation. It includes:
- Monthly consistency percentage
- Total habits done, best streak, habit count
- Mini heatmap of the current month
- Top 5 habits by completion rate with color-coded bars

### Accountability Partner

Generates a URL appending `?view=<token>` where the token is a base64-encoded version of the user ID. When a visitor opens this URL, a read-only banner is displayed and all interactive elements (`check-box`, `add-btn`, `delete-btn`, `note-btn`, `mood-dot`) have pointer events disabled.

> **Note:** Full read-only enforcement requires a Supabase RLS policy that allows public SELECT on `habit_checks` filtered by user ID. The current implementation relies on client-side UI disabling only.

---

## Security

- All database access goes through Supabase's PostgREST API with the `anon` key
- Row Level Security (RLS) is enabled on every table — a user's data is never accessible to another user's session
- The `anon` key is safe to expose in client-side code; it cannot bypass RLS
- The `service_role` key is **never** used in this codebase and should never be added to client files
- Passwords are managed entirely by Supabase Auth — they are never stored or transmitted through application code

---

## Known Limitations

- **Habit checks are loaded for ±1 month only** — the `loadAll()` function fetches checks between the previous month and the next month relative to today. The heatmap queries the full past year directly from the `checks` cache, so data older than one month may not appear in the heatmap unless the user navigates to those months first.
- **Accountability partner view** — the share link disables UI client-side only. A determined viewer could still interact with the DOM. Server-side read-only enforcement is outside the current scope.
- **Browser notifications** — the daily reminder uses the Web Notifications API, which requires the page to be open in a browser tab. It does not function as a true push notification when the browser is closed.
- **No offline support** — the app requires an active internet connection to load data and sync changes. There is no service worker or offline cache.
- **Canvas fonts** — the Share Month Card uses fonts loaded via Google Fonts. If fonts have not fully loaded at the time of canvas render, fallback system fonts will be used instead.

---

## Author

**Hassane Ait Ahmed Lamara**  
Computer Science Student · Full-Stack Developer · AI & ML Enthusiast