# Ticket checkout

Run `npm run dev` locally and `npm run build` for Vercel.

Points are a free, browser-local demo. They cannot pay for tickets or cash out.

Set `VITE_TICKET_CHECKOUT_URL` to the organizer's actual HTTPS checkout page in
Vercel's environment variables, then rebuild. For local development, set it in
`client/.env.local` and restart Vite. This is a public URL, never a secret key.

Until configured, the button links to the fight list and the page says ticket
sales are unavailable. Payment and ticket delivery happen on the seller's site.
Confirm demo event names and dates in `client/app.js` and `client/index.html`
against the seller's event before enabling sales.
