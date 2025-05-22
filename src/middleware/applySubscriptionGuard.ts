import { NextResponse, NextRequest } from 'next/server';
import { subscriptionMiddleware, SubscriptionRestriction } from './subscriptionMiddleware';

/**
 * Interface for subscription guard configurations
 */
export interface SubscriptionGuardConfig {
  /**
   * The path pattern for routes that require subscription protection
   * This should be a string or RegExp that matches the paths to protect
   * For example: '/premium-features' or /^\/premium\/.*$/
   */
  pathPattern: string | RegExp;
  
  /**
   * The subscription restriction type to apply
   */
  restriction: SubscriptionRestriction;
  
  /**
   * Whether to redirect users without required subscription
   * @default true
   */
  redirectOnFailure?: boolean;
  
  /**
   * Custom path to redirect to if user lacks required subscription
   * @default '/profile?tab=subscription' (with appropriate locale)
   */
  redirectPath?: string;
}

/**
 * Apply subscription guard to a response in the Next.js middleware
 * 
 * @param request - The Next.js request object
 * @param response - The current response
 * @param guardsConfig - Array of subscription guard configurations
 * @returns Modified response with subscription guard applied if path matches a protected pattern
 */
export async function applySubscriptionGuard(
  request: NextRequest,
  response: NextResponse,
  guardsConfig: SubscriptionGuardConfig[]
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  
  // Check if the current path matches any of the protected patterns
  for (const config of guardsConfig) {
    let isMatch = false;
    
    if (typeof config.pathPattern === 'string') {
      isMatch = pathname === config.pathPattern || pathname.startsWith(config.pathPattern);
    } else if (config.pathPattern instanceof RegExp) {
      isMatch = config.pathPattern.test(pathname);
    }
    
    if (isMatch) {
      // Apply subscription middleware for this route
      return await subscriptionMiddleware(request, response, {
        restriction: config.restriction,
        redirectOnFailure: config.redirectOnFailure,
        redirectPath: config.redirectPath
      });
    }
  }
  
  // Path doesn't match any protected patterns, proceed with original response
  return null;
} 