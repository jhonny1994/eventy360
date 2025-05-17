import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest, props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const {
    locale
  } = params;

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');



  const targetRedirectUrl = `${origin}/${locale}/redirect`;
  const response = NextResponse.redirect(targetRedirectUrl, 303);

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
            
            response.cookies.set(name, value, options);
          },
          remove(name: string, options: CookieOptions) {
            
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
      const url = new URL(targetRedirectUrl);
      url.searchParams.set('error', 'auth_callback_failed');
      url.searchParams.set('error_description', exchangeError.message);
      
      response.headers.set('Location', url.toString());
    } else {
      
      const url = new URL(targetRedirectUrl);
      url.searchParams.set('auth_action', 'email_confirmed');
      response.headers.set('Location', url.toString());
    }
    return response;
  }


  const url = new URL(targetRedirectUrl);
  url.searchParams.set('error', 'auth_callback_missing_code');

  response.headers.set('Location', url.toString());
  return response;
} 