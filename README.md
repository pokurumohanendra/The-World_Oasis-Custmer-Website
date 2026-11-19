# The Wild Oasis Customer Website

Customer-facing reservation application for a fictional luxury cabin retreat in the Italian Dolomites. Guests can browse cabins, check availability, sign in with Google, create reservations, and manage their profile and bookings. It shares its Supabase project with the employee-facing Wild Oasis admin application.

## Features

- Marketing home and about pages
- Cabin catalog with capacity filtering and detail pages
- Availability calendar with booked dates disabled
- Reservation price and guest-count calculation
- Google OAuth through NextAuth/Auth.js
- Automatic guest creation on first sign-in
- Protected guest account and profile pages
- Reservation creation, editing, and cancellation
- Ownership checks before booking updates or deletion
- Server rendering, incremental revalidation, and optimized images
- Loading, error, and not-found states

## Technology stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 14.1.4 App Router |
| UI | React 18, Tailwind CSS 3 |
| Authentication | NextAuth 5 beta / Auth.js, Google OAuth |
| Database and storage | Supabase |
| Dates | date-fns, react-day-picker |
| Icons | Heroicons |
| CSS build | PostCSS, Autoprefixer |

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/about` | Public | Retreat information |
| `/cabins` | Public | Cabin list and capacity filters |
| `/cabins/[cabinId]` | Public | Cabin details, availability, and booking |
| `/cabins/thankyou` | Public | Booking confirmation |
| `/login` | Public | Google sign-in |
| `/account` | Authenticated | Guest dashboard |
| `/account/profile` | Authenticated | Profile management |
| `/account/reservations` | Authenticated | Reservation list |
| `/account/reservations/edit/[bookingId]` | Authenticated | Reservation editing |
| `/api/auth/[...nextauth]` | Endpoint | Auth.js handlers |
| `/api/cabins/[cabinId]` | Endpoint | Cabin lookup API |

`middleware.js` protects every `/account/*` route.

## Project structure

```text
app/
|-- _components/             Reusable server and client components
|-- _lib/
|   |-- actions.js           Authenticated server mutations
|   |-- auth.js              Auth.js configuration and callbacks
|   |-- data-service.js      Supabase reads and guest creation
|   `-- supabase.js          Supabase client
|-- _styles/globals.css      Tailwind and global styles
|-- account/                 Protected guest pages
|-- api/                     Auth and cabin route handlers
|-- cabins/                  Cabin pages and booking confirmation
|-- layout.js                Root layout and metadata
|-- loading.js               Root loading UI
|-- error.js                 Root error boundary
`-- page.js                  Home page
public/                      Images and branding
docs/ARCHITECTURE.md         Technical architecture
middleware.js                Account authentication guard
next.config.mjs              Image host configuration
tailwind.config.js           Design tokens and scan paths
```

See [Architecture](docs/ARCHITECTURE.md) for request, authentication, data, and mutation flows.

## Prerequisites

- Node.js 20 LTS (recommended for this Next.js 14 project)
- npm
- A Supabase project with the required tables and images
- A Google Cloud OAuth client

## Local setup

1. Clone and enter the repository:

   ```bash
   git clone https://github.com/pokurumohanendra/The-World_Oasis-Custmer-Website.git
   cd The-World_Oasis-Custmer-Website
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create the environment file:

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

   On macOS/Linux, use `cp .env.local.example .env.local`.

4. Fill in every value in `.env.local`.

5. Add this authorized redirect URI to the Google OAuth client:

   ```text
   http://localhost:3000/api/auth/callback/google
   ```

6. Start the application:

   ```bash
   npm run dev
   ```

7. Open <http://localhost:3000>.

## Environment variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_SECRET=generate-a-random-secret
```

| Variable | Required | Description |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_KEY` | Fallback | Anonymous key, used only without a service-role key |
| `SUPABASE_SERVICE_ROLE_KEY` | Recommended | Privileged server-only database key |
| `AUTH_GOOGLE_ID` | Yes | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Yes | Google OAuth client secret |
| `AUTH_SECRET` | Yes | Secret used to protect authentication data |

Generate an authentication secret with `npx auth secret`.

### Security warning

Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_` variable. The service-role key bypasses Supabase Row Level Security and must stay server-side. This repository's `.gitignore` excludes environment files, dependencies, and build output.

If a secret is pasted into an issue, chat, log, or commit, rotate it immediately in its provider dashboard. Removing it from the visible text does not make the old credential safe again.

## Supabase requirements

The application expects the following tables:

- `Cabins`
- `bookings`
- `guests`
- `settings`

Cabin images must be publicly accessible from a Supabase Storage bucket/path named `Cabin_images`.

The shared database has legacy field names normalized by `app/_lib/data-service.js`:

| Database name | Application name |
| --- | --- |
| `Cabins` | `cabins` relationship/object |
| `start` | `startDate` |
| `fullname` | `fullName` |
| `natinality` | `nationality` |

Do not correct these names only in this application. Migrate the Supabase schema and all dependent applications together.

### Data relationships

- A guest is uniquely identified by email.
- A booking belongs to a guest through `guestId`.
- A booking belongs to a cabin through `cabinId`.
- Cabin availability comes from booking date ranges and status.
- Booking limits come from the single `settings` row.

## Authentication flow

1. The guest selects Google sign-in on `/login`.
2. Auth.js performs the OAuth exchange.
3. The `signIn` callback looks up the guest by email.
4. A `guests` row is created when none exists.
5. The `session` callback adds the database ID as `session.user.guestId`.
6. Middleware grants authenticated access to `/account/*`.

Production must register the deployed callback URL too:

```text
https://your-domain.example/api/auth/callback/google
```

## Reservations and authorization

Mutations are Next.js server actions in `app/_lib/actions.js`:

- `createBooking` attaches the authenticated guest and initializes status/payment fields.
- `updateBooking` verifies booking ownership before updating guest count and observations.
- `deleteBooking` verifies booking ownership before deletion.
- `updateGuest` updates only the signed-in guest and validates the national ID.
- Mutations revalidate affected routes and redirect where appropriate.

These ownership checks are essential because the server-side Supabase client may use a service-role key.

## Rendering and caching

- Pages primarily use React Server Components.
- Interactive controls use client components.
- `/cabins` revalidates every hour (`3600` seconds).
- `/about` revalidates every day (`86400` seconds).
- Mutations call `revalidatePath` for affected pages.
- Route-level loading, error, and not-found files provide feedback.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run an existing production build |
| `npm run prod` | Build and start production |
| `npm run lint` | Run the configured Next.js lint command |

Before deployment, run:

```bash
npm install
npm run build
```

## Production deployment

This application requires a Node.js-capable host and is not configured as a static export.

1. Install dependencies with `npm ci` or `npm install`.
2. Provide all environment variables through the host's secret manager.
3. Run `npm run build`.
4. Start with `npm run start`.
5. Register the production Auth.js callback URL with Google.
6. Allow Next.js Image Optimization to reach Supabase Storage.

For another Supabase project, update `next.config.mjs`:

```js
images: {
  remotePatterns: [{
    protocol: "https",
    hostname: "your-project.supabase.co",
    pathname: "/storage/v1/object/public/Cabin_images/**",
  }],
}
```

## Troubleshooting

### `'next' is not recognized`

Dependencies are missing or incomplete:

```bash
npm install
npm run dev
```

### Google sign-in fails

- Verify `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET`.
- Verify the exact callback URL in Google Cloud.
- Ensure the OAuth consent screen permits the test account.
- Ensure the guest table accepts the generated record.

### Cabin images do not load

- Ensure Supabase Storage objects are public.
- Confirm the `Cabin_images` bucket/path.
- Confirm the hostname in `next.config.mjs`.
- Restart Next.js after configuration changes.

### Database queries fail

- Verify table/column names, capitalization, and legacy spellings.
- Verify the Supabase URL and server key.
- Verify the relationship used by `Cabins(name, image)`.
- Inspect the server console for the Supabase error.

### Account pages redirect to login

- Ensure Google sign-in completed.
- Ensure a guest row exists for the authenticated email.
- Clear stale cookies after changing `AUTH_SECRET`.

## Development guidelines

- Keep credentials only in `.env.local`.
- Prefer server components for data fetching.
- Isolate browser interaction in focused client components.
- Put authenticated mutations in `app/_lib/actions.js`.
- Check both authentication and resource ownership.
- Revalidate every page affected by a mutation.
- Preserve schema normalization until a coordinated migration.
- Run a production build before deployment.

## Known limitations

- The Supabase image hostname is project-specific.
- The shared database contains legacy naming.
- Anonymous and privileged Supabase clients are not separated.
- Automated tests and CI workflows are not currently included.
- The project is not configured for static export.

## License

No license file is currently included. Unless one is added, standard copyright restrictions apply.
