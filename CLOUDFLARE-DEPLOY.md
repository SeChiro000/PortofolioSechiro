# Deploy SeChiro Studio to Cloudflare Workers

The application uses the OpenNext Cloudflare adapter so its Next.js pages and API routes run on Workers. Artwork uploads live in R2, and the shared guestbook and daily device limit live in D1. Portfolio images are served through the Worker, so the R2 bucket does not need a public URL.

## One-time Cloudflare setup

1. Install dependencies with `npm install`.
2. Sign in to Cloudflare with `npx wrangler login`.
3. Create the R2 bucket: `npx wrangler r2 bucket create sechiro-portfolio-art`.
4. Create the D1 database: `npx wrangler d1 create sechiro-portfolio-guestbook`.
5. Copy the database ID from Wrangler's output into `wrangler.jsonc`, replacing the all-zero `database_id` placeholder.
6. Apply the D1 schema locally with `npm run cf:d1:migrate:local`. Before production deploy, apply it remotely with `npm run cf:d1:migrate:prod`.
7. Add the production secrets without putting their values in source control:

   - `npx wrangler secret put PORTFOLIO_ADMIN_PASSWORD`
   - `npx wrangler secret put GUESTBOOK_DEVICE_SECRET`

## Local preview

Copy `.dev.vars.example` to `.dev.vars`, then replace both example values with private secrets. Run `npm run cf:typegen` and `npm run cf:preview` to preview the app in the Workers runtime.

## Deploy

Run `npm run cf:deploy`. Wrangler will print the deployed Worker URL. To use a custom domain, attach it to the Worker in the Cloudflare dashboard.

OpenNext warns that Windows builds can fail unpredictably. This project built and started in the local Workers preview on Windows, but use WSL for production builds/deploys if available.

The guestbook identifies a browser profile with a signed HTTP-only cookie. Clearing cookies or changing browser/device creates a new profile, so the daily limit is a practical spam barrier rather than hardware-level identity.

## Notes

- Artwork uploaded at `/studio` is stored in R2 and survives site deploys.
- The old filesystem-based admin upload, artwork JSON, and GitHub sync routes have been removed. They could not persist safely in Workers and were not protected consistently.
- The two 3D models in `public/` are each about 27 MB. This does not prevent deployment, but compressing the model assets would improve first-load time, especially on mobile.
