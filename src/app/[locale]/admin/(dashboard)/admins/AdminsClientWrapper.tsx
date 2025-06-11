"use client";

import { ReactNode } from "react";

type AdminsClientWrapperProps = {
  children: ReactNode;
};

/**
 * Client component wrapper for the Admins page
 * Simple wrapper for client-side functionality
 */
export default function AdminsClientWrapper({
  children,
}: AdminsClientWrapperProps) {
  return <>{children}</>;
}
