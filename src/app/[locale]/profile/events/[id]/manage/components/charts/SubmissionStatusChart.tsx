'use client';

import { useTranslations } from 'next-intl';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

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

interface SubmissionStatusChartProps {
  stats: SubmissionStats;
  locale: string;
}

export default function SubmissionStatusChart({ stats, locale }: SubmissionStatusChartProps) {
  const t = useTranslations('EventStatistics');
  const isRtl = locale === 'ar';
  
  // Define the data for the chart
  const chartData = {
    labels: [
      t('statusLabel.abstractSubmitted'),
      t('statusLabel.abstractAccepted'),
      t('statusLabel.abstractRejected'),
      t('statusLabel.fullPaperSubmitted'),
      t('statusLabel.fullPaperAccepted'),
      t('statusLabel.fullPaperRejected'),
      t('statusLabel.revisionRequested'),
      t('statusLabel.completed')
    ],
    datasets: [
      {
        label: t('submissionCount'),
        data: [
          stats.abstract_submitted,
          stats.abstract_accepted,
          stats.abstract_rejected,
          stats.full_paper_submitted,
          stats.full_paper_accepted,
          stats.full_paper_rejected,
          stats.revision_requested,
          stats.completed
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',   // blue
          'rgba(75, 192, 192, 0.7)',   // teal
          'rgba(255, 99, 132, 0.7)',   // red
          'rgba(153, 102, 255, 0.7)',  // purple
          'rgba(0, 184, 148, 0.7)',    // green
          'rgba(255, 159, 64, 0.7)',   // orange
          'rgba(255, 206, 86, 0.7)',   // yellow
          'rgba(22, 160, 133, 0.7)'    // emerald
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(0, 184, 148, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(22, 160, 133, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: (isRtl ? 'left' : 'right') as 'left' | 'right',
        rtl: isRtl,
        labels: {
          // This more specific font property overrides the global property
          font: {
            size: 12
          },
          padding: 15
        }
      },
      tooltip: {
        rtl: isRtl,
        textDirection: isRtl ? 'rtl' : 'ltr',
        callbacks: {
          label: function(context: TooltipItem<'doughnut'>) {
            const label = context.label || '';
            const value = context.raw !== undefined ? Number(context.raw) : 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      {stats.total_submissions > 0 ? (
        <Doughnut data={chartData} options={options} />
      ) : (
        <p className="text-gray-500 text-center">{t('noDataAvailable')}</p>
      )}
    </div>
  );
} 