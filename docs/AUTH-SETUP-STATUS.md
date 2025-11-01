# Authentication Setup — Google OAuth

⚠️ DISK SPACE ISSUE: npm install previously failed (342 MB free). Free up ~500+ MB before installing.

## Required Package (install when space is available)

```bash
cd multivendor-web
npm install next-auth@^4.24.5
```

Note: Google provider is built into next-auth; no additional package needed. `bcryptjs` is optional and only required if you also keep credentials login.

## What's Prepared

1. ✅ `pages/api/auth/[...nextauth].ts` — NextAuth configured with GoogleProvider
2. ✅ `lib/auth/` — Auth utilities and helpers (session hooks, withAuth)
3. ✅ `pages/login.tsx` — Offers “Continue with Google”
4. ✅ `pages/register.tsx` — Optional (SSO-first approach)
5. ✅ `pages/profile.tsx` — Protected profile page

## Environment variables (.env.local)

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated-secret>
GOOGLE_CLIENT_ID=<from Google Cloud>
GOOGLE_CLIENT_SECRET=<from Google Cloud>
```

## Google Cloud Console setup

1. Create an OAuth 2.0 Client ID (type: Web application).
2. Authorized redirect URI:
   - http://localhost:3000/api/auth/callback/google
3. Add the Client ID and Client Secret to `.env.local`.

## Next Steps

1. Free up disk space (target ≥ 500 MB):
   - `npm cache clean --force`
   - Clear `%TEMP%` folder
   - Remove unused applications
2. Install dependencies: `npm install`
3. Start the app: `npm run dev` then test login at `/login`.

## Notes

- If backend GraphQL needs a token, you can forward the NextAuth session accessToken from `session.accessToken` in API calls.
- Credentials-based auth and user mutations are optional when using Google SSO-first.
