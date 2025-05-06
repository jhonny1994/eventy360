'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '!bg-background !text-foreground !border !border-border !shadow-lg', // Use Tailwind classes if preferred, adding !important if needed
          duration: 5000,
          style: {
            // background: 'var(--background)', // Already handled by className?
            // color: 'var(--foreground)',
            // border: '1px solid var(--border)',
            // Add any specific inline styles needed
          },
          // Default options for specific types
          success: {
            duration: 3000,
            // iconTheme can be used for icon colors
            iconTheme: {
              primary: '#10B981', // Example green
              secondary: '#FFFFFF',
            },
          },
          error: {
            duration: 5000,
             iconTheme: {
              primary: '#EF4444', // Example red
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </>
  );
} 