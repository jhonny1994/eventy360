"use client";

import dynamic from "next/dynamic";
import { HiOutlineUser } from "react-icons/hi";
import { ProfileCompletionStats } from "../api/getUserStats";
import { Progress } from "flowbite-react";

// Import the ProfileCompletionDetails component with no SSR
const ProfileCompletionDetails = dynamic(
  () => import("./ProfileCompletionDetails"),
  { ssr: false }
);

interface ProfileCompletionCardProps {
  profileCompletion: ProfileCompletionStats;
  completionColorClass: string;
  translations: Record<string, string>;
  locale: string;
  isRtl: boolean;
}

export default function ProfileCompletionCard({
  profileCompletion,
  completionColorClass,
  translations,
  locale,
  isRtl
}: ProfileCompletionCardProps) {
  const completionPercentage = profileCompletion.completionPercentage;
  
  // Determine progress color based on completion percentage
  const getProgressColor = () => {
    if (completionPercentage >= 80) return "green";
    if (completionPercentage >= 50) return "blue";
    return "yellow";
  };
  
  return (
    <div className="flex items-start w-full">
      {/* Icon section */}
      <div
        className={`flex-shrink-0 p-3 rounded-full ${completionColorClass} ${isRtl ? 'ml-4' : 'mr-4'}`}
      >
        <HiOutlineUser className="h-6 w-6" />
      </div>
      
      {/* Content section */}
      <div className="flex-grow">
        <div>
          <h3 className="text-lg font-medium">{translations.profileCompletion}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {translations.completionDetailsDescription}
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-4">
          <Progress
            progress={completionPercentage}
            color={getProgressColor()}
            size="lg"
          />
        </div>
        
        <div className="flex items-center justify-between mt-3">
          {/* Stats */}
          <p className="text-sm font-medium">
            {profileCompletion.completedSteps.length}/{profileCompletion.totalSteps.length} {translations.completedSteps}
          </p>
          
          {/* Details button - properly aligned */}
          <div>
            <ProfileCompletionDetails
              completionStats={profileCompletion}
              translations={translations}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 