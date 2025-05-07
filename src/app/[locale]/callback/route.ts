import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest, { params: { locale } }: { params: { locale: string } }) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Initialize the response object. We will set its redirect URL and cookies.
  // Always redirect to our central redirect page which will handle the routing
  const targetRedirectUrl = `${origin}/${locale}/redirect`;
  const response = NextResponse.redirect(targetRedirectUrl, 303); // Use 303 for POST-success redirect logic

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // This is the crucial part: set the cookie on the response object.
            response.cookies.set(name, value, options);
          },
          remove(name: string, options: CookieOptions) {
            // Also crucial: remove the cookie from the response object.
            response.cookies.delete({ 
              name,
              path: options.path,
              domain: options.domain,
            });
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[AuthCallback] Error exchanging code:', exchangeError.message);
      const url = new URL(targetRedirectUrl);
      url.searchParams.set('error', 'auth_callback_failed');
      url.searchParams.set('error_description', exchangeError.message);
      // Update the location header on the existing response object
      response.headers.set('Location', url.toString());
    } else {
      // Set success parameter on redirect URL
      const url = new URL(targetRedirectUrl);
      url.searchParams.set('auth_action', 'email_confirmed');
      response.headers.set('Location', url.toString());
    }
    return response;
  }

  // Code was not present in query parameters
  console.error('[AuthCallback] No code found in query parameters.');
  const url = new URL(targetRedirectUrl);
  url.searchParams.set('error', 'auth_callback_missing_code');
  // Update the location header on the existing response object
  response.headers.set('Location', url.toString());
  return response;
} 