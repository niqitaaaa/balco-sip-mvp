# BALCO Skills Intelligence Platform — POC

A proof-of-concept demo of the **Skills Intelligence Platform (SIP)** for BALCO (Vedanta Group), built to the [SIP PRD v1.0](./BALCO_SIP_PRD_v1.docx).

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

| Role | Tabs | What to show |
|------|------|-------------|
| 👤 Employee | **Skills Profile** | Skills proficiency bars vs. role requirements, gap score, recommended training with BCS rating. Click **Mark Complete** — watch proficiency update live. |
| 👤 Employee | **Career Readiness** | Promotion readiness score (current grade → next grade), IJP readiness for all open postings, certifications with expiry alerts, L4 impact stories with submission form. |
| 👔 Manager | **Skill Validation** | Pending post-training feedback requests. Submit L3 manager ratings — pre-filled, under 5 minutes per request. |
| 👔 Manager | **Team Overview** | Skills health table for all direct reports: gap score bars, top skill gap per person. Click any row to expand full proficiency breakdown. |
| 📊 L&D Admin | **Dashboard** | KPI strip (profiles, avg gap, response rate, trainings), programme effectiveness table (L1/L2/L3), DPDP compliance notice. |
| 📊 L&D Admin | **Programmes** | BCS tier breakdown, programme table with Business Criticality Score + certification badges, certification expiry tracker (with ⚠ due-soon alerts), org-wide skills heat map. |

### Key interactions

- **Mark Complete** a training → proficiency bars update live; BCS badge shows criticality
- **Submit Validation** (Manager) → removes request from pending list
- **Career → Promotion Readiness** → see skill-by-skill gap to next grade
- **Career → IJP Readiness** → % match against each open internal posting
- **Career → Add Story** → submit an L4 impact story (min 30 chars), appears in profile immediately
- **Programmes → Heat Map** → colour-coded org skills distribution across all employees

## Tech stack

- React 19 + Vite 8
- Tailwind CSS v4
- 100% mock data — no backend, no database
- GitHub Pages deploy via GitHub Actions

## PRD coverage (this POC)

| PRD Module | Features demoed |
|------------|----------------|
| Module 1 — Employee Skills Profile | F1.1 Dynamic Skills Inventory, F1.2 Gap Assessment Integration |
| Module 2 — Training-to-Skills Engine | F2.2 Score/Proficiency display, F2.3 Skill Tagging, F2.4 Recommended Pathways, F2.5 Certification Tracking |
| Module 3 — Feedback & L3/L4 Capture | F3.2 Manager L3 Feedback Form, F3.3 L4 Self-Report (Impact Stories) |
| Module 5 — Business Criticality | F5.1 BCS on each programme |
| Module 6 — Career Linkage | F6.1 IJP Readiness Score, F6.2 Promotion Readiness |
| Module 7 — L&D Analytics | F7.1 Programme Dashboard, F7.2 Skills Heat Map (lite) |

## Structure

```
src/
  data/mockData.js        # Employees, trainings (with BCS), skills, feedback,
                          # IJP listings, next-grade requirements, certifications,
                          # impact stories
  views/EmployeeView.jsx  # Module 1/2/3/6: Skills profile + Career Readiness tab
  views/ManagerView.jsx   # Module 3: Skill Validation + Team Overview tab
  views/AdminView.jsx     # Module 5/7: L&D Dashboard + Programmes tab
  components/             # Shared UI: ProficiencyBar, GapBadge
  App.jsx                 # Shell: top bar, sidebar, role switcher (activeNav routed to views)
```

