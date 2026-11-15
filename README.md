# SafeZone

**Night-commute street safety map and 24/7 safe haven finder for Indonesia.**

SafeZone helps night riders and pedestrians spot dangerous road segments, broken streetlights, and quiet streets before riding through them. When an emergency happens, it calculates the fastest road route to the nearest 24-hour safe haven (police stations, gas stations, clinics, or convenience stores) and generates a ready-to-send WhatsApp SOS alert with live GPS coordinates.

---

## What It Does

- **Nationwide Deep-Area Radar**: Covers 13 major Indonesian metropolitan areas and reaches down to local villages, subdistricts, and residential streets using OpenStreetMap Overpass and Nominatim reverse geocoding.
- **Tactical Night Map**: High-contrast dark map with custom visual pins:
  - **Red Radar Pulse**: High-risk crime or gang activity (`Begal` / `Geng Motor`).
  - **Amber Flicker**: Unlit roads, broken streetlights (`PJU Mati`), or isolated paths.
  - **Green Shield**: Active 24/7 safe havens (`Polsek`, `SPBU`, `Puskesmas`, `Minimarket`).
  - **Blue Sonar**: Draggable user position and live GPS tracker.
- **Real Street Routing**: Draws turn-by-turn road polylines to any safe haven via the OSRM Routing API (with automatic Haversine distance fallback) and estimates motorcycle and walking travel times.
- **One-Click WhatsApp SOS**: Captures your current GPS coordinates, attaches the nearest safe haven name and distance, and opens WhatsApp with a pre-filled Google Maps emergency link.
- **Live Road Weather Advisory**: Pulls real-time temperature, rain, and visibility conditions from Open-Meteo to warn riders about wet asphalt and reduced headlight reflection at night.
- **Community Validation & Resolution**: Riders can upvote active hazards or mark fixed roads as safe (`Sudah Aman`), with client-side deduplication to prevent spam.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Nuxt 3](https://nuxt.com/) (Vue 3 Composition API, TypeScript, Nitro Server) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Map & Routing** | [Leaflet](https://leafletjs.com/), OpenStreetMap, OSRM, Overpass, Nominatim |
| **Weather Data** | [Open-Meteo API](https://open-meteo.com/) |
| **Database & ORM** | [Neon Serverless PostgreSQL](https://neon.tech/) & [Drizzle ORM](https://orm.drizzle.team/) |

---

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and add your Neon PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

> If `DATABASE_URL` is omitted, SafeZone automatically falls back to built-in local memory data so you can test the app right away.

### 3. Seed the database & start the dev server

```bash
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000` in your browser.

---

## Project Structure

```text
safezone/
├── components/
│   ├── Navbar.vue                      # Command bar, region switcher, and SOS trigger
│   ├── SafetyMap.client.vue            # Interactive Leaflet map, address search, and OSRM routing
│   ├── IncidentAnalyticsCard.vue       # Area hazard metrics and validation sparkline
│   ├── SafeHavenHubCard.vue            # Nearest 24/7 safe havens and emergency 110 dialer
│   ├── LatestReportAndTrendsCard.vue   # Scrollable local reports and category filters
│   ├── ReportModal.vue                 # New hazard submission modal with GPS/map picker
│   └── InfoPopover.vue                 # Viewport-aware contextual help popover
├── pages/
│   └── index.vue                       # Main dashboard and radar state orchestration
├── server/
│   ├── api/                            # Nitro REST endpoints (/api/reports, /api/havens)
│   └── db/                             # Drizzle schema, Neon connection, and seed script
└── utils/
    ├── geo.ts                          # Overpass radar, Nominatim geocoder, OSRM & Haversine math
    └── time.ts                         # Relative timestamp formatter
```

---

## Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start the local development server on port `3000` |
| `pnpm build` | Build the application for production / Vercel deployment |
| `pnpm db:seed` | Create tables and seed nationwide Indonesian hazard & haven data |
