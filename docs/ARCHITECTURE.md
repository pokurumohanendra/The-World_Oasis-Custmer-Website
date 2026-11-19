# Architecture

This document explains how requests, authentication, database reads, and mutations move through The Wild Oasis Customer Website.

## System overview

```text
Browser
  |
  v
Next.js App Router
  |-- Public pages and route handlers
  |-- Auth.js middleware and callbacks
  |-- Server actions
  `-- Client components for interactive UI
          |
          v
      Supabase
      |-- PostgreSQL tables
      `-- Public cabin-image storage

Country selection also reads names and flags from REST Countries.
```

## Application boundaries

The project uses React Server Components for pages and data loading. Client components handle browser interaction such as date selection, filtering, form state, and pending UI.

- `app/**/page.js`: route entry points and composition
- `app/_components`: reusable UI
- `app/_lib/data-service.js`: database reads and guest creation
- `app/_lib/actions.js`: authenticated mutations
- `app/_lib/auth.js`: OAuth, sessions, and guest synchronization
- `middleware.js`: `/account/*` access control
- `app/api`: Auth.js and cabin HTTP endpoints

## Data access

`app/_lib/supabase.js` creates a server-side Supabase client. It prefers `SUPABASE_SERVICE_ROLE_KEY` and falls back to `SUPABASE_KEY`. A service-role client can bypass Row Level Security, so it must never enter client bundles and every mutation must enforce authorization.

Main data operations:

- Cabin list, detail, and price reads
- Guest lookup and creation
- Booking list and detail reads
- Booked-date calculation
- Global settings lookup
- Country list fetch

Normalization helpers translate legacy database fields into consistent application properties without a schema migration.

## Authentication lifecycle

```text
Google sign-in
  -> /api/auth/callback/google
  -> look up guest by email
  -> create missing guest
  -> attach database guestId to session.user
  -> middleware allows /account/*
```

Bookings use the Supabase guest ID—not the OAuth provider ID—for ownership.

## Booking creation

```text
Cabin page loads availability and settings
  -> guest chooses valid dates
  -> form submits createBooking
  -> action requires a session
  -> action attaches guestId and defaults
  -> booking is inserted
  -> cabin page is revalidated
  -> redirect to /cabins/thankyou
```

New bookings are initialized as unpaid, without breakfast, and `unconfirmed`.

## Booking update and deletion

Both operations:

1. Read the authenticated session.
2. Load bookings for `session.user.guestId`.
3. Verify the requested booking belongs to that guest.
4. Mutate only after ownership is established.
5. Revalidate affected account routes.

This blocks cross-account changes caused by modified URLs or form values.

## Profile updates

`updateGuest` targets the guest ID in the session. It validates an alphanumeric 6–12 character national ID, extracts nationality and flag data, writes the legacy `natinality` column, and revalidates the profile page.

## Availability

The data service loads future bookings plus checked-in bookings. It expands each booking interval with `eachDayOfInterval`, flattens the dates, and supplies them to the date selector as unavailable days.

## Caching

- Cabin list: one-hour incremental revalidation
- About page: one-day incremental revalidation
- Booking/profile mutations: explicit path revalidation
- Authenticated pages: session-bound server rendering

New mutations must revalidate every route that displays the changed record.

## Error handling

- Missing cabins call Next.js `notFound()`.
- Data failures log the Supabase error server-side and throw user-safe errors.
- `app/error.js` handles rendering failures.
- Loading files provide streaming fallbacks.
- Server actions reject unauthenticated and unauthorized requests before mutation.

## External services

### Supabase

Provides PostgreSQL data and public cabin images. Remote images must match the allowlist in `next.config.mjs`.

### Google OAuth

Provides identity. Callback URLs must match the active origin exactly.

### REST Countries

The profile country selector fetches:

```text
https://restcountries.com/v2/all?fields=name,flag
```

## Security checklist

- Never expose or commit the service-role key.
- Treat every server action as a public server entry point.
- Authenticate every user-specific mutation.
- Authorize booking ownership separately from URL/form values.
- Validate and constrain user-provided fields.
- Keep OAuth credentials and `AUTH_SECRET` outside source control.
- Use Row Level Security as defense in depth where compatible with the shared admin application.
- Rotate any credential exposed in chat, logs, issues, or commits.

## Safe extension process

1. Add reads to `data-service.js`.
2. Add authenticated mutations to `actions.js`.
3. Use the session guest ID for ownership.
4. Keep browser behavior in focused client components.
5. Keep route pages server-rendered where possible.
6. Document new environment variables and schema fields.
7. Revalidate every affected route.
8. Verify with `npm run build` before deployment.
