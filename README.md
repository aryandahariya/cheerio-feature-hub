# Cheerio Feature Discovery Hub

A polished React + Vite prototype for helping a D2C brand owner discover and configure Cheerio features.

## Local Development

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Open the localhost URL printed by Vite, usually `http://localhost:5173`.

## Production Build

```bash
npm run build
```

## Browser Smoke Test

```bash
npm run test:e2e
```

## Vercel Deployment

Import this folder into Vercel as a Vite project. Use:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

This prototype uses localStorage only. It does not send real messages, connect to WhatsApp, or use live Cheerio integrations.
