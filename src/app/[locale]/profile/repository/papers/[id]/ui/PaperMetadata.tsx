'use client';

import { useState, useEffect } from 'react';
import { HiUser, HiAcademicCap, HiCalendar, HiTag, HiLocationMarker, HiEye, HiDownload, HiClock } from 'react-icons/hi';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/database.types';
import Link from 'next/link';

// Extend the Paper type to include analytics data
type Paper = Database['public']['Functions']['discover_papers']['Returns'][0] & {
  view_count?: number;
  download_count?: number;
};

interface PaperMetadataProps {
  paper: Paper;
  eventName: string;
  locale: string;
}

export default function PaperMetadata({ paper, eventName, locale }: PaperMetadataProps) {
  const t = useTranslations('ResearchRepository.paperDetails');
  const { supabase } = useAuth();
  const [wilayaName, setWilayaName] = useState<string | null>(null);
  const [dairaName, setDairaName] = useState<string | null>(null);
  const [topicNames, setTopicNames] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isDataFetched, setIsDataFetched] = useState(false);
  
  useEffect(() => {
    const fetchLocationData = async () => {
      setError(null);
      
      try {
        // Fetch wilaya name if author_wilaya_id exists
        if (paper.author_wilaya_id) {
          const { data: wilayaData, error: wilayaError } = await supabase.rpc('get_wilaya_name', {
            p_wilaya_id: paper.author_wilaya_id,
            p_locale: locale
          });
          
          if (wilayaError) throw wilayaError;
          setWilayaName(wilayaData);
        }
        
        // Fetch daira name if author_daira_id exists
        if (paper.author_daira_id) {
          const { data: dairaData, error: dairaError } = await supabase.rpc('get_daira_name', {
            p_daira_id: paper.author_daira_id,
            p_locale: locale
          });
          
          if (dairaError) throw dairaError;
          setDairaName(dairaData);
        }
        
        // Fetch topic names if event_topic_ids exists
        if (paper.event_topic_ids && paper.event_topic_ids.length > 0) {
          // Fetch topics data from the topics table
          const { data: topicsData, error: topicsError } = await supabase
            .from('topics')
            .select('id, name_translations')
            .in('id', paper.event_topic_ids);
          
          if (topicsError) throw topicsError;
          
          if (topicsData && topicsData.length > 0) {
            // Extract topic names from the translated fields based on locale
            const names = topicsData.map(topic => {
              const nameTranslations = topic.name_translations as Record<string, string>;
              return nameTranslations[locale] || 
                     Object.values(nameTranslations)[0] || 
                     t('topic');
            });
            
            setTopicNames(names);
          }
        }

        setIsDataFetched(true);
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setError(err as Error);
        setIsDataFetched(true); // Still mark as fetched so UI can render with error state
      }
    };
    
    fetchLocationData();
  }, [paper.author_wilaya_id, paper.author_daira_id, paper.event_topic_ids, locale, supabase, t]);
  
  const getFormattedDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    return new Date(dateString).toLocaleDateString(
      locale === 'ar' ? 'ar-DZ' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };
  
  // Format the submission date
  const submissionDate = getFormattedDate(paper.submission_date);
  
  // If data is still being fetched, don't render the component yet
  // This helps prevent partial loading states and lets the parent component 
  // handle the overall loading state
  if (!isDataFetched) {
    return null;
  }
  
  if (error) {
    console.error('Error in PaperMetadata:', error);
    // Continue rendering with available data, just log the error
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Author */}
      {paper.author_name && (
        <div className="flex flex-col">
          <div className="flex items-center mb-1">
            <HiUser className="w-5 h-5 text-gray-400 mr-2 rtl:ml-2 rtl:mr-0" />
            <h3 className="text-sm font-medium text-gray-900">{t('author')}</h3>
          </div>
          <p className="text-sm text-gray-600 ml-7 rtl:mr-7 rtl:ml-0">{paper.author_name}</p>
        </div>
      )}

      {/* Institution */}
      {paper.author_institution && (
        <div className="flex flex-col">
          <div className="flex items-center mb-1">
            <HiAcademicCap className="w-5 h-5 text-gray-400 mr-2 rtl:ml-2 rtl:mr-0" />
            <h3 className="text-sm font-medium text-gray-900">{t('institution')}</h3>
          </div>
          <p className="text-sm text-gray-600 ml-7 rtl:mr-7 rtl:ml-0">{paper.author_institution}</p>
        </div>
      )}

      {/* Submission Date */}
      {paper.submission_date && (
        <div className="flex flex-col">
          <div className="flex items-center mb-1">
            <HiClock className="w-5 h-5 text-gray-400 mr-2 rtl:ml-2 rtl:mr-0" />
            <h3 className="text-sm font-medium text-gray-900">{t('submissionDate')}</h3>
          </div>
          <p className="text-sm text-gray-600 ml-7 rtl:mr-7 rtl:ml-0">{submissionDate}</p>
        </div>
      )}

      {/* Event Name & Event Link - Title converted to link */}
      {paper.event_id && eventName && (
        <div className="flex flex-col">
          <div className="flex items-center mb-1">
            <HiCalendar className="w-5 h-5 text-gray-400 mr-2 rtl:ml-2 rtl:mr-0" />
            <h3 className="text-sm font-medium text-gray-900">{t('event')}</h3>
          </div>
          <div className="ml-7 rtl:mr-7 rtl:ml-0">
            <Link 
              href={`/${locale}/profile/events/${paper.event_id}`}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {eventName}
            </Link>
          </div>
        </div>
      )}

      {/* Topics */}
      {topicNames.length > 0 && (
        <div className="flex flex-col">
          <div className="flex items-center mb-1">
            <HiTag className="w-5 h-5 text-gray-400 mr-2 rtl:ml-2 rtl:mr-0" />
            <h3 className="text-sm font-medium text-gray-900">{t('topics')}</h3>
          </div>
          <p className="text-sm text-gray-600 ml-7 rtl:mr-7 rtl:ml-0">{topicNames.join(', ')}</p>
        </div>
      )}

      {/* Location */}
      {(wilayaName || dairaName) && (
        <div className="flex flex-col">
          <div className="flex items-center mb-1">
            <HiLocationMarker className="w-5 h-5 text-gray-400 mr-2 rtl:ml-2 rtl:mr-0" />
            <h3 className="text-sm font-medium text-gray-900">{t('location')}</h3>
          </div>
          <p className="text-sm text-gray-600 ml-7 rtl:mr-7 rtl:ml-0">
            {[
              wilayaName && `${t('wilaya')} ${wilayaName}`,
              dairaName && `${t('daira')} ${dairaName}`
            ].filter(Boolean).join(', ')}
          </p>
        </div>
      )}

      {/* Views */}
      {typeof paper.view_count === 'number' && (
        <div className="flex flex-col">
          <div className="flex items-center mb-1">
            <HiEye className="w-5 h-5 text-gray-400 mr-2 rtl:ml-2 rtl:mr-0" />
            <h3 className="text-sm font-medium text-gray-900">{t('views')}</h3>
            </div>
          <p className="text-sm text-gray-600 ml-7 rtl:mr-7 rtl:ml-0">{paper.view_count}</p>
            </div>
      )}

      {/* Downloads */}
      {typeof paper.download_count === 'number' && (
        <div className="flex flex-col">
          <div className="flex items-center mb-1">
            <HiDownload className="w-5 h-5 text-gray-400 mr-2 rtl:ml-2 rtl:mr-0" />
            <h3 className="text-sm font-medium text-gray-900">{t('downloads')}</h3>
          </div>
          <p className="text-sm text-gray-600 ml-7 rtl:mr-7 rtl:ml-0">{paper.download_count}</p>
        </div>
      )}
    </div>
  );
}