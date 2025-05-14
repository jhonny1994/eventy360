# Admin Authentication Flow

## Overview

Admin authentication in Eventy360 is invitation-based and uses Supabase Magic Links. This document describes the flow and components involved.

## Authentication Flow

1. **Admin Invitation**:
   - Admin users are invited via the `invite-admin` Edge Function
   - The function creates a user with admin privileges in the database
   - A magic link is generated and sent to the invited user's email

2. **Authentication Process**:
   - When the invited admin clicks the magic link, they are directed to `/admin/auth/magic-callback`
   - The page extracts tokens from the URL hash fragment
   - Sessions are established client-side using `supabase.auth.setSession()`
   - User is redirected to `/admin/redirect` where middleware validates admin status

3. **Profile Completion**:
   - New admins are directed to complete their profile at `/admin/create-account`
   - After profile completion, they can access the admin dashboard

## Important Notes

- The application uses magic links exclusively for admin authentication
- Magic links should redirect to `/admin/auth/magic-callback` (not `/admin/auth/callback`)
- The ADMIN_INVITE_REDIRECT_URL environment variable can be set in Supabase to customize the redirect URL

## Troubleshooting

If admin invitations aren't working:

1. Check that the Edge Function is using the correct redirect URL
2. Ensure the magic-callback page is correctly handling URL hash parameters
3. Verify middleware is allowing access to the magic-callback path 