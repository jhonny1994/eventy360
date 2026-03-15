import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

/**
 * Helper function to safely call RPC functions with proper type assertions
 * This utility helps overcome TypeScript limitations with dynamically added RPC functions
 * 
 * @param supabase The Supabase client instance
 * @param functionName Name of the RPC function to call
 * @param params Parameters to pass to the RPC function
 * @returns The result from the RPC function call with proper typing
 */
export async function callRpcFunction<TResult = unknown, TArgs = unknown>(
  supabase: SupabaseClient,
  functionName: string,
  params?: TArgs
): Promise<{
  data: TResult | null;
  error: PostgrestError | null;
}> {
  // Workaround for TypeScript limitations with dynamically added RPC functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (supabase.rpc as any)(functionName, params);

  return {
    data: response.data as TResult | null,
    error: response.error
  };
}
