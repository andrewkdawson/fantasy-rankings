# 📊 Fantasy Power Rankings

A web app for creating **custom fantasy team power rankings**.  
Supports **Sleeper leagues** (via League ID) and **manual JSON input**.  
Built with **Next.js + Tailwind** and deployed on **Vercel**.

---

## 🚀 Features

- **Sleeper League Import**  
  Enter a Sleeper League ID and automatically pull team names and logos.  
  View rankings in:
  - **Ranking Mode** → drag-and-drop sortable list with numbered positions.  
  - **Tier List Mode** → drag-and-drop teams into customizable S/A/B/etc. tiers.

- **Manual JSON Import**  
  Paste or upload a JSON file with teams.  
  Useful for commissioner-exported data (e.g. from ESPN or other platforms).

- **Tier List Mode**  
  - Default S/A/B/C/D/F tiers.  
  - Add or remove tiers dynamically.  
  - Drag-and-drop across tiers.  
  - LocalStorage persistence.

- **Ranking Mode**  
  - Straight sortable list of all teams.  
  - Teams automatically numbered by rank.  
  - LocalStorage persistence.

---

## ⚠️ ESPN Integration

- ESPN requires **authentication cookies** (`espn_s2` and `SWID`) or private partner API access.  
- Because of this, **direct ESPN sync is not working yet**.  
- Planned workarounds:
  - **Commissioner Export**: Commish runs a script once, saves league data as `espn_league.json`, then uploads it via JSON Mode.  
  - Future cookie-based sync for private league use.  

👉 For now, use **Sleeper** or **Manual JSON Mode**.

---

## 🛠️ Tech Stack

- [Next.js 15 (App Router)](https://nextjs.org/)  
- [Tailwind CSS](https://tailwindcss.com/)  
- [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) (drag and drop)  
- [Vercel](https://vercel.com/) for hosting  