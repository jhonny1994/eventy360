import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Helper function to safely call RPC functions with proper type assertions
 * This utility helps overcome TypeScript limitations with dynamically added RPC functions
 * 
 * @param supabase The Supabase client instance
 * @param functionName Name of the RPC function to call
 * @param params Parameters to pass to the RPC function
 * @returns The result from the RPC function call with proper typing
 */
export async function callRpcFunction<T>(
  supabase: SupabaseClient,
  functionName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any
): Promise<{
  data: T | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}> {
  // Workaround for TypeScript limitations with dynamically added RPC functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (supabase.rpc as any)(functionName, params);
  
  return {
    data: response.data as T | null,
    error: response.error
  };
}
