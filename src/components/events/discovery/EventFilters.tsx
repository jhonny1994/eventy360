'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, Select, Label, Button, Datepicker } from 'flowbite-react';
import { HiFilter, HiX } from 'react-icons/hi';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import TopicSelector from '@/components/ui/TopicSelector';
import type { Database } from '@/database.types';

interface Wilaya {
  id: number;
  name_ar: string;
  name_other: string;
}

interface EventFiltersProps {
  selectedTopics: string[];
  selectedLocation: number | null;
  selectedStatus: Database['public']['Enums']['event_status_enum'][];
  selectedFormat: Database['public']['Enums']['event_format_enum'][];
  startDate: string;
  endDate: string;
  onFiltersChange: (filters: {
    topics?: string[];
    location?: number | null;
    status?: string[];
    format?: string[];
    startDate?: string;
    endDate?: string;
  }) => void;
  locale: string;
}

/**
 * Filter controls for event discovery
 * Includes topic, location, status, format, and date filters
 */
export default function EventFilters({
  selectedTopics,
  selectedLocation,
  selectedStatus,
  selectedFormat,
  startDate,
  endDate,
  onFiltersChange,
  locale
}: EventFiltersProps) {
  const isRtl = locale === 'ar';
  const t = useTranslations('Events.filters');
  const tEnums = useTranslations('Enums');
  const supabase = createClient();

  // Local state for form values
  const [filters, setFilters] = useState({
    topics: selectedTopics,
    location: selectedLocation,
    status: selectedStatus,
    format: selectedFormat,
    startDate,
    endDate
  });

  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load wilayas (provinces)
  useEffect(() => {
    const loadWilayas = async () => {
      try {        const { data, error } = await supabase
          .from('wilayas')
          .select('id, name_ar, name_other')
          .order('id');

        if (error) throw error;
        setWilayas(data || []);
      } catch (error) {
        console.error('Error loading wilayas:', error);
      }
    };

    loadWilayas();
  }, [supabase]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedTopics.length > 0 ||
      selectedLocation ||
      selectedStatus.length > 0 ||
      selectedFormat.length > 0 ||
      startDate ||
      endDate
    );
  }, [selectedTopics, selectedLocation, selectedStatus, selectedFormat, startDate, endDate]);

  // Apply filters
  const handleApplyFilters = () => {
    onFiltersChange(filters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      topics: [],
      location: null,
      status: [],
      format: [],
      startDate: '',
      endDate: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Handle topic selection
  const handleTopicsChange = (topics: string | string[]) => {
    const topicArray = Array.isArray(topics) ? topics : [topics];
    setFilters(prev => ({ ...prev, topics: topicArray }));
  };

  // Handle location change
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : null;
    setFilters(prev => ({ ...prev, location: value }));
  };

  // Handle status change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Database['public']['Enums']['event_status_enum'];
    if (value) {
      const newStatus = filters.status.includes(value)
        ? filters.status.filter(s => s !== value)
        : [...filters.status, value];
      setFilters(prev => ({ ...prev, status: newStatus }));
    }
  };

  // Handle format change
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Database['public']['Enums']['event_format_enum'];
    if (value) {
      const newFormat = filters.format.includes(value)
        ? filters.format.filter(f => f !== value)
        : [...filters.format, value];
      setFilters(prev => ({ ...prev, format: newFormat }));
    }
  };

  return (
    <Card className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <HiFilter className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5 text-gray-500`} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('title')}
          </h3>
          {hasActiveFilters && (
            <span className={`${isRtl ? 'mr-2' : 'ml-2'} bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300`}>
              {t('activeCount', { count: (
                selectedTopics.length +
                (selectedLocation ? 1 : 0) +
                selectedStatus.length +
                selectedFormat.length +
                (startDate ? 1 : 0) +
                (endDate ? 1 : 0)
              )})}
            </span>
          )}
        </div>
          <div className={`flex items-center ${isRtl ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
          {hasActiveFilters && (
            <Button
              color="light"
              size="sm"
              onClick={handleClearFilters}
            >
              <HiX className={`${isRtl ? 'ml-1' : 'mr-1'} h-4 w-4`} />
              {t('clearAll')}
            </Button>
          )}
          <Button
            color="light"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? t('collapse') : t('expand')}
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">            {/* Topics Filter */}
            <div>
              <Label htmlFor="topics-filter">{t('topics')}</Label>
              <TopicSelector
                id="topics-filter"
                multiple
                value={filters.topics}
                onChange={handleTopicsChange}
                placeholder={t('selectTopics')}
                locale={locale}
              />
            </div>            {/* Location Filter */}
            <div>
              <Label htmlFor="location-filter">{t('location')}</Label>
              <div className="relative">
                <Select
                  id="location-filter"
                  value={filters.location || ''}
                  onChange={handleLocationChange}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  style={isRtl ? { textAlign: 'right', paddingRight: '2.5rem' } : {}}
                >
                  <option value="">{t('allLocations')}</option>
                  {wilayas.map((wilaya) => (
                    <option key={wilaya.id} value={wilaya.id}>
                      {locale === 'ar' ? wilaya.name_ar : wilaya.name_other}
                    </option>
                  ))}
                </Select>
              </div>
            </div>{/* Status Filter */}
            <div>
              <Label htmlFor="status-filter">{t('status')}</Label>
              <div className="relative">
                <Select
                  id="status-filter"
                  multiple
                  value={filters.status}
                  onChange={handleStatusChange}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  style={isRtl ? { textAlign: 'right', paddingRight: '2.5rem' } : {}}
                >
                  <option value="">{t('allStatuses')}</option>
                  <option value="published">{tEnums('EventStatus.published')}</option>
                  <option value="abstract_review">{tEnums('EventStatus.abstract_review')}</option>
                  <option value="full_paper_submission_open">{tEnums('EventStatus.full_paper_submission_open')}</option>
                  <option value="full_paper_review">{tEnums('EventStatus.full_paper_review')}</option>
                  <option value="completed">{tEnums('EventStatus.completed')}</option>
                  <option value="canceled">{tEnums('EventStatus.canceled')}</option>
                </Select>
              </div>
            </div>            {/* Format Filter */}
            <div>
              <Label htmlFor="format-filter">{t('format')}</Label>
              <div className="relative">
                <Select
                  id="format-filter"
                  multiple
                  value={filters.format}
                  onChange={handleFormatChange}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  style={isRtl ? { textAlign: 'right', paddingRight: '2.5rem' } : {}}
                >
                  <option value="">{t('allFormats')}</option>
                  <option value="physical">{tEnums('EventFormat.physical')}</option>
                  <option value="virtual">{tEnums('EventFormat.virtual')}</option>
                  <option value="hybrid">{tEnums('EventFormat.hybrid')}</option>
                </Select>
              </div>
            </div>{/* Start Date Filter */}            <div>
              <Label htmlFor="start-date-filter">{t('startDate')}</Label>
              <Datepicker
                id="start-date-filter"
                value={filters.startDate ? new Date(filters.startDate) : undefined}
                onChange={(date: Date | null) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    startDate: date ? date.toISOString().split('T')[0] : '' 
                  }))
                }
                placeholder={t('selectStartDate')}
                language={locale}
              />
            </div>

            {/* End Date Filter */}            <div>
              <Label htmlFor="end-date-filter">{t('endDate')}</Label>
              <Datepicker
                id="end-date-filter"
                value={filters.endDate ? new Date(filters.endDate) : undefined}
                onChange={(date: Date | null) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    endDate: date ? date.toISOString().split('T')[0] : '' 
                  }))
                }
                placeholder={t('selectEndDate')}
                language={locale}
              />
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="flex justify-end pt-4">
            <Button
              color="info"
              onClick={handleApplyFilters}
            >
              {t('apply')}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
