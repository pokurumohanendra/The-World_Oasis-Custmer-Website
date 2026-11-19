# The Wild Oasis Website

Customer-facing Next.js application for browsing cabins and managing
reservations. It shares the same Supabase project as the employee admin app.

## Setup

1. Copy `.env.local.example` to `.env.local`.
2. Add the Supabase project values.
3. Add a server-only Supabase service-role key. Never prefix it with
   `NEXT_PUBLIC_` and never commit `.env.local`.
4. Create Google OAuth credentials and add the client ID and secret.
5. Add `http://localhost:3000/api/auth/callback/google` as an authorized Google
   redirect URI.
6. Run `npm install` and `npm run dev`.

The project is adapted to the existing database names: `Cabins`,
`Cabin_images`, `start`, `fullname`, and `natinality`.

## Required environment variables

```env
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

Use the service-role key only in this server-rendered project. Authorization in
`app/_lib/actions.js` ensures customers can update or delete only their own
reservations.

## Commands

```bash
npm run dev
npm run build
npm run start
```
