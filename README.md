# The Developer Index

A directory of UK property developers, housing associations and development corporations working in urban regeneration and placemaking.

## Stack

- **Frontend**: React 18 + Vite
- **Backend**: Vercel serverless functions (`/api`)
- **Data**: Google Sheets (published CSV, fetched server-side)
- **Maps**: Leaflet.js
- **News**: Google News RSS proxy

---

## Deployment guide

### 1. Push to GitHub

1. Create a new repo on GitHub (e.g. `developer-index`)
2. In your terminal:
```bash
cd path/to/this/folder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/developer-index.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework preset: **Vite** (Vercel auto-detects this)
4. Leave build settings as default — Vercel will run `vite build` automatically
5. Click **Deploy** — your first deploy will fail because env vars aren't set yet

### 3. Set environment variables in Vercel

Go to your project in Vercel → **Settings** → **Environment Variables** and add:

| Name | Value |
|------|-------|
| `SHEET_DEVELOPERS` | Your developers sheet CSV URL |
| `SHEET_PROJECTS` | Your projects sheet CSV URL |

To get the CSV URLs from Google Sheets:
1. Open the sheet
2. File → Share → Publish to web
3. Select the **Developers** tab → CSV format → copy the URL
4. Repeat for the **Projects** tab

These variables are **server-side only** — they are never sent to the browser.

### 4. Redeploy

After setting env vars, go to **Deployments** → click the three dots on the latest deploy → **Redeploy**.

Your site is now live. Every future `git push` to `main` triggers an automatic redeploy.

---

## Local development

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in your sheet URLs:
```bash
cp .env.example .env.local
# Edit .env.local with your real sheet URLs
```

Install the Vercel CLI to run API functions locally:
```bash
npm install -g vercel
vercel dev
```

This starts both Vite (frontend) and the serverless functions at `http://localhost:3000`.

---

## Updating content

All content is managed in Google Sheets. Just edit the sheet — changes appear on the site within 5 minutes (the CDN cache duration). No code changes or redeploys needed.

### Developer sheet columns
`name, type, region, website, linkedin, description, focus, tags, collaborators, image_url, key_people`

- `focus` and `tags`: semicolon-separated values (e.g. `Mixed-use; Waterfront`)
- `key_people`: format `Name|Role|LinkedIn URL` per person, semicolons between people

### Projects sheet columns
`name, developer, category, status, location, lat, lng, homes, hectares, description, notes, year_start, year_complete, website, image_url`

- `category`: one of `new_town`, `estate_regen`, `city_centre`, `waterfront`, `innovation`, `heritage`
- `status`: one of `planning`, `approved`, `under_construction`, `complete`

---

## Security

- The Google Sheet URLs are stored as **server-side environment variables** in Vercel — they never appear in browser network requests
- Edit access to the sheet is controlled entirely within Google Drive — only share editor access with named individuals
- Every change to the sheet is logged in Google Sheets' version history (File → Version history)
- The published CSV URL gives **read-only** access — it cannot be used to modify the sheet
