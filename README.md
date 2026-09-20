# garmin-claude-connector

A connector that integrates Garmin fitness data with Claude AI for intelligent analysis and insights

## VeganGains Tracker

A mobile-first Progressive Web App for tracking calories, carbs, protein, fiber
and fat via barcode scanning and nutrition-label photos, plus a vegan meal
plan generator geared toward muscle building.

### Features

- **Barcode scanner** (camera-based, EAN/UPC) that looks up nutrition data via
  the free [Open Food Facts](https://world.openfoodfacts.org) API.
- **Photo fallback**: when a barcode isn't found, take a photo of the
  nutrition table; on-device OCR (Tesseract.js) drafts the macro values for
  you to confirm/correct.
- **Diary**: daily totals for kcal, protein, carbs, fat and fiber vs. your
  personal targets, stored locally (IndexedDB) — no account, no backend.
- **Goals**: enter weight/height/age/activity/goal to get Mifflin-St-Jeor
  based calorie and macro targets tuned for a protein-forward vegan diet.
- **Vegan meal plan**: a generated example day (breakfast/snacks/lunch/dinner)
  scaled to your targets, plus muscle-building recommendations (protein
  timing, B12/iron/omega-3/creatine, hydration, sleep).

### Development

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run preview  # serve the production build
```

The app is installable as a PWA (works offline for the UI shell; barcode
lookups need a network connection). Camera access requires HTTPS (or
localhost) in the browser.

### Notes

- Nutrition data is only as accurate as Open Food Facts / OCR — always spot
  check before relying on it for medical or strict dietary needs.
- All personal data (profile, diary) stays in the browser's local storage;
  nothing is sent anywhere except the barcode lookup to Open Food Facts.
