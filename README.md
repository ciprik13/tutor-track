# TutorTrack

A modern personal CRM platform for independent tutors to manage students, lessons, payments, and generate detailed reports—all in one place, offline-first with real-time Google Calendar sync.

## What is TutorTrack?

TutorTrack is a lightweight, full-featured web application designed to help independent tutors organize their business. Whether you teach mathematics, languages, or any other subject, TutorTrack lets you:

- **Manage students** — track their status, subject, grade, contact info, and notes
- **Schedule & record lessons** — log completed lessons with duration, pricing, and payment status
- **Track payments** — see at a glance what's paid, unpaid, or partially paid by student and month
- **Import from Google Calendar** — automatically sync your calendar events to lessons (with smart duplicate detection and consecutive lesson merging)
- **Generate reports** — export lesson records and payment summaries for your records or client reports
- **View statistics** — monthly revenue, lesson counts, student activity, and lesson duration breakdowns
- **Dark/light themes** — comfortable UI for any time of day

All data is stored locally in your browser (IndexedDB) — no server, no accounts, fully private.

## Key Features

### 📅 Calendar Integration

- **Google Calendar sync** — import events like "Alice | 12" (student name + grade) directly into TutorTrack
- **Smart matching** — automatic student detection based on calendar event titles
- **Consecutive lesson merging** — two back-to-back 60-minute lessons → one 120-minute lesson
- **Duplicate detection** — prevents accidental re-imports of the same calendar event

### 💰 Payment Tracking

- **Per-student, per-month summaries** — see total income, unpaid amounts, and payment status at a glance
- **Payment status** — mark lessons as paid/unpaid; track partial payments
- **Revenue dashboard** — total collected, total outstanding, monthly breakdown

### 📊 Statistics & Insights

- **Monthly revenue charts** — line chart of total vs. paid income
- **Lesson count analytics** — bar chart of lessons per month
- **Student & duration breakdowns** — donut charts with center labels
- **Year-to-date KPIs** — total revenue, monthly average, best-performing month, lesson count

### 📄 Reports & Export

- **Lesson summaries** — formatted text reports ready to copy/paste or share via WhatsApp
- **CSV/JSON export** — download all your data for backup or external use
- **Dark mode support** — comfortable report previews in any theme

### 🌓 Dark & Light Modes

- Warm, modern color palette (teal accents, soft neutrals)
- Automatic theme toggle in settings

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **State Management:** Redux Toolkit
- **Data Fetching:** TanStack React Query
- **Storage:** Dexie.js (IndexedDB wrapper)
- **UI/Styling:** Tailwind CSS v4 + CSS custom properties
- **Routing:** React Router v6 (HashRouter for GitHub Pages compatibility)
- **Charts:** Recharts
- **Calendar Integration:** Google Calendar API with OAuth 2.0 (GIS token model)
- **Fonts:** Plus Jakarta Sans, Inter, JetBrains Mono

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ciprik13/tutor-track.git
cd tutor-track
```

2. Install dependencies:

```bash
npm install
```

3. Set up Google Calendar (optional):
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new OAuth 2.0 Web Application credential
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - `https://ciprik13.github.io` (production)
   - Copy the Client ID and update `.env.local`:
     ```
     VITE_GOOGLE_CLIENT_ID=your_client_id_here
     VITE_APP_BASE_URL=http://localhost:5173/tutor-track/
     ```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:5173/tutor-track](http://localhost:5173/tutor-track) in your browser

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── calendar/         # Google Calendar import modal
│   ├── lessons/          # Lesson modal (add/edit)
│   ├── payments/         # Payment modal
│   ├── students/         # Student modal
│   └── ui/               # Layout, date picker, month picker
├── pages/                # Page components (Dashboard, Lessons, Payments, etc.)
├── queries/              # React Query hooks (useStudents, useLessons, etc.)
├── store/                # Redux slices (profile, UI state)
├── lib/                  # Utilities (OAuth, calendar API, date helpers)
├── db/                   # Dexie schema (students, lessons, payments tables)
├── types/                # TypeScript interfaces
└── index.css             # Design tokens and utility classes
```

## Usage

### First Time Setup

1. Launch the app → you'll see onboarding
2. Enter your name, email, default lesson prices (60/90/120 min), and preferred currency
3. Start adding students or import from Google Calendar

### Adding Students

- **Lecții** → Click **"+ Lecție nouă"** or use the import calendar feature
- Fill in student, lesson date/time, duration, and price
- Mark as paid/unpaid when the lesson is complete

### Importing from Google Calendar

1. Go to **Setări** → **Integrări** → Click **"Conectează"** (sign in with Google)
2. Go to **Lecții** → Click the calendar icon button
3. Select the month and click **"Încarcă evenimente"**
4. Review events (duplicates are marked), then click **"Importă"**

### Viewing Payments

- **Plăți** — see all lessons grouped by student and month
- Use filters (month, status) to narrow down
- Click **"Achitat"** or **"Anulează"** to toggle payment status for entire months
- Amber banner shows total outstanding for the selected month + all-time total

### Exporting Data

- **Setări** → **Date** → **"Exportă JSON"** to download a backup
- Import the file later to restore all data

## Features in Detail

### Smart Calendar Matching

Events are matched to students based on the event title:

- **"Alice | 12"** → matches student "Alice Johnson" (first name match)
- **"Bob | 9"** → matches student "Bob Smith"
- Works with multiple calendars (primary + subject-specific calendars, etc.)

### Consecutive Lesson Merging

If your calendar has back-to-back sessions:

- **10:00–11:00 + 11:00–12:00** → merged into **10:00–12:00 (120 min)**
- Shown as **"2×60 min combinat"** in the import modal
- Prevents double-charging for extended sessions

### Duplicate Detection

- **Exact:** same calendar event ID already in DB → marked "Deja importat"
- **Probable:** same student + same hour on the same day → marked "Probabil duplicat"
- Both are unselectede by default to prevent accidental re-imports

## Deployment

The app is deployed to GitHub Pages at [https://ciprik13.github.io/tutor-track](https://ciprik13.github.io/tutor-track) using GitHub Actions CI/CD.

To deploy your own fork:

1. Enable GitHub Pages in your repository settings (source: gh-pages branch)
2. Update `vite.config.ts` to match your repo's path:
   ```typescript
   export default defineConfig({
     base: "/your-repo-name/",
     // ...
   });
   ```

## Local Data Privacy

All student, lesson, and payment data is stored **only in your browser's IndexedDB**. It is never sent to any server (except Google Calendar API calls when syncing). You own your data completely.

## Contributing

This is a personal project, but pull requests and issues are welcome! Feel free to:

- Report bugs or suggest features
- Improve the UI/UX
- Add new integrations (Notion, Calendly, etc.)

## License

MIT

## Author

[Ciprian Moisenco](https://github.com/ciprik13)

---

**TutorTrack** — Manage your tutoring business, your way. 🎓
