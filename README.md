# BALCO Skills Intelligence Platform — POC

A proof-of-concept demo of the **Skills Intelligence Platform (SIP)** for BALCO (Vedanta Group).

## Demo

**Live:** https://niqitaaaa.github.io/balco-sip-mvp/

## Run locally

```bash
npm install
npm start
```

Open http://localhost:5173

## What it demos

Use the **Role** dropdown (top-right) to switch between views:

| Role | What to show |
|------|-------------|
| 👤 Employee | Skills profile with gap score + proficiency bars. Click **Mark Complete** on a training — watch proficiency update live. |
| 👔 Manager | Pending feedback requests with pre-filled skill ratings. Submit validation to update the employee's profile. |
| 📊 L&D Admin | Programme effectiveness table (L1/L2/L3 scores) and manager response rate KPIs. |

## Tech stack

- React 19 + Vite 8
- Tailwind CSS v4
- 100% mock data — no backend, no database
- GitHub Pages deploy via GitHub Actions

## Structure

```
src/
  data/mockData.js        # All mock employees, trainings, skills, feedback
  views/EmployeeView.jsx  # Module 1 + 2: Skills profile & training
  views/ManagerView.jsx   # Module 3: Manager skill validation
  views/AdminView.jsx     # Module 6 (lite): L&D dashboard
  components/             # Shared UI: ProficiencyBar, GapBadge
  App.jsx                 # Shell: top bar, sidebar, role switcher
```
