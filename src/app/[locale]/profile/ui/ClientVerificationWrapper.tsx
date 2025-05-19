'use client';

import VerificationSection from './VerificationSection';

interface ClientVerificationWrapperProps {
  isVerified: boolean;
  userId: string;
  translations: {
    verified: string;
    notVerified: string;
    verifiedLabel: string;
    verificationDescription: {
      verified: string;
      notVerified: string;
    };
    requestVerification: string;
    verificationStatusError: string;
  };
}

/**
 * Client component wrapper for VerificationSection
 * This component serves as a bridge between server and client components
 * allowing us to avoid passing function callbacks from server to client
 */
export default function ClientVerificationWrapper({
  isVerified,
  userId,
  translations
}: ClientVerificationWrapperProps) {
  // We don't need onStatusChange anymore as it was causing the event handler error
  // State is managed inside the VerificationSection component
  return (
    <VerificationSection
      isVerified={isVerified}
      userId={userId}
      translations={translations}
    />
  );
} 