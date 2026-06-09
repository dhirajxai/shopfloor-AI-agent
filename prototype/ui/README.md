# Prototype UI — Allocation Board

Run the prototype locally with a static server (no build tools required):

1. Start a simple Python server from the `prototype/ui` folder:

```bash
cd prototype/ui
python3 -m http.server 8000
```

2. Open http://localhost:8000 in your browser.

Notes:
- This is a static HTML/CSS/JS prototype. It uses in-memory sample data and does not persist changes.
- Interactions: drag & drop work-order cards between machine lanes, double-click a card to edit assignment, and view the audit log at right.
