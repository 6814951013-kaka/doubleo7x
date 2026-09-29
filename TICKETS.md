# Tickets and points

The ticket poster opens the existing demo booking form. The countdown uses the
same event date: October 31, 2026, 18:00 Asia/Bangkok. Booking closes at that time.
Demo receipts persist locally; no payment is processed.

Free point refills (500, 1,500, or 5,000) share the existing `ring-game-v1` wallet
and preserve prediction history. Points cannot pay for tickets or cash out.

Optionally set `VITE_TICKET_CHECKOUT_URL` to the actual seller's HTTPS page and
rebuild. This adds a separate external ticket link, retaining the demo booking.
In Vercel, set the variable in project environment settings. Locally, use
`client/.env.local`. This public URL must never contain secret API keys.

Run `npm run build` to build the site.
