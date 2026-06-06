# GradeCalc

GradeCalc is now a Node.js + React app that lets students:

- Paste their current gradebook text
- Parse current assignments (local parser or AI parser with Puter.js)
- Add only missing upcoming grades manually
- See current and projected grades instantly

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## AI parsing notes

- Select **AI parser (Puter.js)** in the UI.
- GradeCalc uses `@heyputer/puter.js` on the frontend.
- If AI parsing fails, GradeCalc automatically falls back to the local parser.
