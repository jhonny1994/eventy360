"use client";

import React from 'react';
import { useTranslations } from "next-intl";
import { HiOutlineDocumentReport, HiOutlinePresentationChartBar, HiOutlineDocumentSearch, HiOutlineEye, HiOutlineCalendar } from "react-icons/hi";
import { ResearcherStats, OrganizerStats } from "../api/getUserStats";
import ProfileCard from "./ProfileCard";

interface ProfileStatsProps {
  userType: "researcher" | "organizer" | "admin";
  stats: ResearcherStats | OrganizerStats;
  locale: string;
}

/**
 * Displays user statistics based on user type
 * Shows different metrics for researchers vs. organizers
 */
export default function ProfileStats({ userType, stats, locale }: ProfileStatsProps) {
  const t = useTranslations("ProfilePage");
  const isRtl = locale === 'ar';
  
  // Define stats cards based on user type
  const statsCards = userType === "researcher" 
    ? getResearcherStatsCards(stats as ResearcherStats, isRtl, t)
    : getOrganizerStatsCards(stats as OrganizerStats, isRtl, t);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {statsCards.map((card, index) => (
        <ProfileCard locale={locale} key={index}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${card.bgColor} ${card.textColor} ${isRtl ? 'ml-4' : 'mr-4'}`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-lg font-medium">{card.title}</h3>
              <p className="text-3xl font-bold mt-1">{card.value}</p>
            </div>
          </div>
        </ProfileCard>
      ))}
    </div>
  );
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactElement;
  bgColor: string;
  textColor: string;
}

type TranslationFunction = (key: string) => string;

// Helper function to get researcher stats cards
function getResearcherStatsCards(stats: ResearcherStats, isRtl: boolean, t: TranslationFunction): StatCard[] {
  return [
    {
      title: t("submissionsCount"),
      value: stats.totalSubmissions,
      icon: <HiOutlineDocumentReport className="h-6 w-6" />,
      bgColor: "bg-blue-100 dark:bg-blue-900",
      textColor: "text-blue-600 dark:text-blue-300"
    },
    {
      title: t("acceptedPapers"),
      value: stats.acceptedPapers,
      icon: <HiOutlineDocumentSearch className="h-6 w-6" />,
      bgColor: "bg-green-100 dark:bg-green-900",
      textColor: "text-green-600 dark:text-green-300"
    },
    {
      title: t("paperViews"),
      value: stats.paperViews,
      icon: <HiOutlineEye className="h-6 w-6" />,
      bgColor: "bg-purple-100 dark:bg-purple-900",
      textColor: "text-purple-600 dark:text-purple-300"
    },
  ];
}

// Helper function to get organizer stats cards
function getOrganizerStatsCards(stats: OrganizerStats, isRtl: boolean, t: TranslationFunction): StatCard[] {
  return [
    {
      title: t("eventsCreated"),
      value: stats.totalEvents,
      icon: <HiOutlineCalendar className="h-6 w-6" />,
      bgColor: "bg-blue-100 dark:bg-blue-900",
      textColor: "text-blue-600 dark:text-blue-300"
    },
    {
      title: t("activeEvents"),
      value: stats.activeEvents,
      icon: <HiOutlinePresentationChartBar className="h-6 w-6" />,
      bgColor: "bg-green-100 dark:bg-green-900",
      textColor: "text-green-600 dark:text-green-300"
    },
    {
      title: t("submissionsReceived"),
      value: stats.totalSubmissionsReceived,
      icon: <HiOutlineDocumentReport className="h-6 w-6" />,
      bgColor: "bg-purple-100 dark:bg-purple-900",
      textColor: "text-purple-600 dark:text-purple-300"
    },
  ];
} 