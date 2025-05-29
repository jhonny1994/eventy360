'use client';

import { useTranslations } from 'next-intl';
import { Card } from 'flowbite-react';
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  FileText, 
  AlertCircle, 
  CheckCheck
} from 'lucide-react';

// Type for the stats
type SubmissionStats = {
  total_submissions: number;
  abstract_submitted: number;
  abstract_accepted: number;
  abstract_rejected: number;
  full_paper_submitted: number;
  full_paper_accepted: number;
  full_paper_rejected: number;
  revision_requested: number;
  completed: number;
};

interface MetricsGridProps {
  stats: SubmissionStats;
  locale: string;
}

export default function MetricsGrid({ stats, locale }: MetricsGridProps) {
  const t = useTranslations('EventStatistics');
  const isRtl = locale === 'ar';

  // Calculate acceptance rates
  const abstractAcceptanceRate = stats.abstract_submitted > 0
    ? Math.round((stats.abstract_accepted / stats.abstract_submitted) * 100)
    : 0;
    
  const paperAcceptanceRate = stats.full_paper_submitted > 0
    ? Math.round((stats.full_paper_accepted / stats.full_paper_submitted) * 100)
    : 0;

  // Define metrics for the grid
  const metrics = [
    {
      title: t('totalSubmissions'),
      value: stats.total_submissions,
      icon: <ClipboardList className="h-8 w-8 text-blue-600" />,
      color: 'blue'
    },
    {
      title: t('abstractAcceptanceRate'),
      value: `${abstractAcceptanceRate}%`,
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      color: 'green'
    },
    {
      title: t('abstractAccepted'),
      value: stats.abstract_accepted,
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      color: 'green'
    },
    {
      title: t('abstractRejected'),
      value: stats.abstract_rejected,
      icon: <XCircle className="h-8 w-8 text-red-600" />,
      color: 'red'
    },
    {
      title: t('fullPaperSubmitted'),
      value: stats.full_paper_submitted,
      icon: <FileText className="h-8 w-8 text-indigo-600" />,
      color: 'indigo'
    },
    {
      title: t('revisionRequested'),
      value: stats.revision_requested,
      icon: <AlertCircle className="h-8 w-8 text-amber-600" />,
      color: 'amber'
    },
    {
      title: t('paperAcceptanceRate'),
      value: `${paperAcceptanceRate}%`,
      icon: <CheckCheck className="h-8 w-8 text-emerald-600" />,
      color: 'emerald'
    },
    {
      title: t('completed'),
      value: stats.completed,
      icon: <CheckCheck className="h-8 w-8 text-emerald-600" />,
      color: 'emerald'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="p-4">
          <div className={`flex ${isRtl ? 'flex-row-reverse' : ''} items-center justify-between`}>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {metric.title}
              </p>
              <p className={`text-2xl font-bold text-${metric.color}-600`}>
                {metric.value}
              </p>
            </div>
            <div className={`p-3 bg-${metric.color}-50 rounded-lg`}>
              {metric.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 