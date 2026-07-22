# CalorieCue Landing Page

Landing page for CalorieCue iOS app, hosted at [caloriecue.app](https://caloriecue.app).

## Pages

- `/` - Homepage
- `/privacy` - Privacy Policy
- `/terms` - Terms of Service
- `/support` - Support & FAQs

## Development

```bash
npm install
npm run dev
```

## Deployment

This site is deployed on Vercel. Push to `main` to auto-deploy.

### GA4 privacy gate

Deployment is blocked until an authorized GA4 editor verifies that **Page
changes based on browser history events** is disabled under Admin → Data streams
→ the CalorieCue web stream → Enhanced measurement → Page views → Advanced
settings. `send_page_view: false` does not disable those history-triggered
Enhanced Measurement events; the application sends its own sanitized virtual
page views instead. See [Google's page-view guidance](https://developers.google.com/analytics/devguides/collection/ga4/views#disable_page_changes_based_on_browser_history_events).

## Tech Stack

- Next.js 15
- React 19
- Tailwind CSS
- TypeScript
