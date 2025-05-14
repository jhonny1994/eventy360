import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(
  request: NextRequest,
  context: { params: { locale: string } }
) {
  const { locale } = context.params;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const baseRedirectUrl = `${origin}/${locale}/admin/redirect`;
    // Initialize a response object. We will redirect and set cookies on this response.
    const response = NextResponse.redirect(baseRedirectUrl, 303);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: '', ...options, maxAge: 0 });
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    const finalRedirectUrlWithParams = new URL(baseRedirectUrl);
    if (exchangeError) {
      finalRedirectUrlWithParams.searchParams.set('error', 'auth_pkce_failed');
      finalRedirectUrlWithParams.searchParams.set('error_description', exchangeError.message);
    } else {
      finalRedirectUrlWithParams.searchParams.set('auth_action', 'admin_pkce_success');
    }
    // Update the Location header on the response object
    response.headers.set('Location', finalRedirectUrlWithParams.toString());

    return response; // Return the response with cookies set and correct redirect location
  }

  // If no 'code', this route is being misused or there's a configuration error.
  // Magic links should point to a different client-side handling page.
  // Redirect to the admin login page with an error.
  const errorRedirectUrl = new URL(`${origin}/${locale}/admin/login`);
  errorRedirectUrl.searchParams.set('error', 'invalid_callback_path');
  errorRedirectUrl.searchParams.set(
    'error_description',
    'This callback URL is for server-side code exchange. Magic links should use a different callback path.'
  );
  return NextResponse.redirect(errorRedirectUrl.toString(), { status: 303 });
} 