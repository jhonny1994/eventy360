import { NextResponse, type NextRequest } from 'next/server';
import { createCallbackClient } from '@/lib/supabase/callback-client';

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
    const supabase = createCallbackClient(request, response);

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