"use client";

import { useState } from "react";
import { Tooltip, Button } from "flowbite-react";
import { HiInformationCircle, HiX } from "react-icons/hi";
import { ProfileCompletionStats } from "../api/getUserStats";

interface ProfileCompletionDetailsProps {
  completionStats: ProfileCompletionStats;
  translations: Record<string, string>;
  locale: string;
}

/**
 * Component that displays detailed information about profile completion
 * Shows each step and whether it's completed or not with full RTL support
 */
export default function ProfileCompletionDetails({ 
  completionStats, 
  translations, 
  locale 
}: ProfileCompletionDetailsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const isRtl = locale === 'ar';
  
  // Map step keys to display names using translations
  const getStepDisplayName = (stepKey: string): string => {
    // In page.tsx, the translations are already flattened
    return translations[stepKey] || stepKey;
  };

  return (
    <>
      {/* Info button with tooltip */}
      <Tooltip 
        content={translations.viewCompletionDetails}
        placement={isRtl ? "right" : "left"}
        style="light"
      >
        <Button
          size="xs"
          color="light"
          pill
          onClick={() => setIsOpen(true)}
          className="p-1"
        >
          <HiInformationCircle className="h-4 w-4" />
        </Button>
      </Tooltip>

      {/* Custom modal with proper RTL support and standard Flowbite background */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 dark:bg-gray-900/80">
          <div 
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
            dir={isRtl ? 'rtl' : 'ltr'}
            style={{ maxHeight: '90vh' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {translations.completionDetailsTitle}
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <HiX className="w-5 h-5" />
                <span className="sr-only">{translations.close}</span>
              </button>
            </div>
            
            {/* Modal body */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <div className="space-y-4">
                <p className="text-gray-500 dark:text-gray-400">
                  {translations.completionDetailsDescription}
                </p>
                
                <div className="space-y-3">
                  {completionStats.totalSteps.map((step) => {
                    const isCompleted = completionStats.completedSteps.includes(step);
                    return (
                      <div 
                        key={step} 
                        className={`flex ${isRtl ? 'flex-row-reverse text-right' : 'text-left'} items-center p-3 rounded-lg ${
                          isCompleted 
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900'
                            : 'bg-gray-50 dark:bg-gray-800'
                        } border`}
                      >
                        <div
                          className={`flex-shrink-0 p-1 rounded-full ${
                            isCompleted
                              ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300'
                              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          } ${isRtl ? 'ml-3' : 'mr-3'}`}
                        >
                          {isCompleted ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-4.707-9.293a1 1 0 000 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium flex-grow">{getStepDisplayName(step)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Modal footer with RTL-aware button placement */}
            <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} items-center p-4 border-t border-gray-200 dark:border-gray-700`}>
              <Button 
                color="primary"
                onClick={() => setIsOpen(false)}
              >
                {translations.close}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 