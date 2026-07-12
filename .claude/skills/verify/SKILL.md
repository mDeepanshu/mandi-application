---
name: verify
description: How to run and drive the Mandi app for runtime verification
---

# Verifying the Mandi frontend

## Launch
- Backend must be running at `http://localhost:8080/mandi/` (check: `curl -H "deviceId: 41" http://localhost:8080/mandi/party/listAllParties?partyType=VYAPARI`).
- Dev server: `BROWSER=none npm start` on port 3000 — but the user often already has it running; check `curl http://localhost:3000` first.
- Feature pages are lazy-loaded chunks; grepping `bundle.js` for a feature's strings proves nothing.

## Drive (Playwright)
- `npm i playwright-core` in scratchpad, launch with `channel: "msedge"` (installed on this machine), headless works.
- Login: single password input `getByLabel("Password")`, fill `6789` (from `.env` REACT_APP_PASS). App lands on Ledger (`/`).
- Vyapari autocomplete: `getByRole("combobox", { name: "Vyapari Name" })` — NOT getByLabel (matches the listbox too when open). Fill an idNo, then click `.MuiAutocomplete-option` (don't press Enter — Enter triggers an immediate fetch).
- Date fields: `getByLabel("FROM DATE")` / `("TO DATE")`, fill `yyyy-mm-dd`.
- Snackbar text: `.MuiAlert-message`.
- MasterTable tbody contains a few extra structural rows beyond logical data rows; compare scrapes against each other, not against expected row counts.

## Data facts (local dev DB)
- 672 vyapari parties; only a handful have transactions (idNos 1002, 1003, 1005, 1008 as of 2026-07). 1002's partyId is `10`.
- All backend calls need header `deviceId: 41`.
- Simulate backend outage with `page.route("**/<path>**", r => r.abort())` — gateway errors are swallowed silently (no snackbar), table just keeps previous content.
