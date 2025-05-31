'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Spinner } from 'flowbite-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { createClient } from '@/lib/supabase/client';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface SubmissionTimelineChartProps {
  eventId: string;
  locale: string;
}

type SubmissionTimelineData = {
  date: string;
  count: number;
  status: string;
}[];

export default function SubmissionTimelineChart({ eventId, locale }: SubmissionTimelineChartProps) {
  const supabase = createClient();
  const t = useTranslations('EventStatistics');
  const isRtl = locale === 'ar';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<SubmissionTimelineData>([]);

  useEffect(() => {
    async function fetchTimelineData() {
      setLoading(true);
      setError(null);
      
      try {
        // Get submission timestamps for the past 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data, error } = await supabase
          .from('submissions')
          .select('created_at, status')
          .eq('event_id', eventId)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Process data to group by date and status
          const processedData = data.reduce((acc: Record<string, Record<string, number>>, item) => {
            // Skip items with null status or created_at
            if (!item.status || !item.created_at) return acc;
            
            const date = new Date(item.created_at).toLocaleDateString(
              locale === 'ar' ? 'ar-DZ' : 'en-US',
              { year: 'numeric', month: 'short', day: 'numeric' }
            );
            
            if (!acc[date]) {
              acc[date] = {};
            }
            
            if (!acc[date][item.status]) {
              acc[date][item.status] = 0;
            }
            
            acc[date][item.status]++;
            
            return acc;
          }, {});
          
          // Convert to array format needed for chart
          const formattedData: SubmissionTimelineData = [];
          
          Object.entries(processedData).forEach(([date, statuses]) => {
            Object.entries(statuses).forEach(([status, count]) => {
              formattedData.push({
                date,
                status,
                count
              });
            });
          });
          
          setTimelineData(formattedData);
        }
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError(err instanceof Error ? err.message : t('fetchError'));
      } finally {
        setLoading(false);
      }
    }
    
    fetchTimelineData();
  }, [eventId, locale, supabase, t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500 text-center">{error}</p>
    );
  }

  if (timelineData.length === 0) {
    return (
      <p className="text-gray-500 text-center">{t('noTimelineData')}</p>
    );
  }

  // Process data for the chart
  const dates = Array.from(new Set(timelineData.map(item => item.date)));
  
  // Group data by status
  const dataByStatus: Record<string, number[]> = {};
  
  // Initialize with all dates set to 0 for each status
  const allStatuses = Array.from(new Set(timelineData.map(item => item.status)));
  
  allStatuses.forEach(status => {
    dataByStatus[status] = Array(dates.length).fill(0);
  });
  
  // Fill in actual counts
  timelineData.forEach(item => {
    const dateIndex = dates.indexOf(item.date);
    if (dateIndex !== -1) {
      dataByStatus[item.status][dateIndex] = item.count;
    }
  });

  // Chart data
  const chartData = {
    labels: dates,
    datasets: allStatuses.map((status, index) => {
      // Use different colors for different statuses
      const colors = [
        'rgb(54, 162, 235)',
        'rgb(75, 192, 192)',
        'rgb(255, 99, 132)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)',
        'rgb(255, 206, 86)',
        'rgb(0, 184, 148)',
        'rgb(22, 160, 133)'
      ];
      
      return {
        label: t(`statusLabel.${status}`, { defaultValue: status }),
        data: dataByStatus[status],
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.2)'),
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 3,
        pointHoverRadius: 5
      };
    })
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        reverse: isRtl,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        }
      }
    },
    plugins: {
      legend: {
        position: (isRtl ? 'left' : 'right') as 'left' | 'right',
        rtl: isRtl,
        labels: {
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        rtl: isRtl,
        textDirection: isRtl ? 'rtl' : 'ltr'
      }
    }
  };

  return (
    <div className="h-full w-full">
      <Line data={chartData} options={options} />
    </div>
  );
} 