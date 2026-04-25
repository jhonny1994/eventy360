'use client';

import { useState, useEffect } from 'react';
import { Card, Select, Label, Button, Datepicker } from 'flowbite-react';
import { HiFilter, HiX } from 'react-icons/hi';
import { useAuth } from '@/hooks/useAuth';
import useTranslations from '@/hooks/useTranslations';
import useLocale from '@/hooks/useLocale';
import TopicSelector from '@/components/ui/TopicSelector';

interface Wilaya {
  id: number;
  name_ar: string;
  name_other: string;
}

interface Daira {
  id: number;
  name_ar: string;
  name_other: string;
  wilaya_id: number;
}

interface RepositoryFiltersProps {
  selectedTopics: string[];
  selectedLocation: number | null;
  selectedDaira: number | null;
  selectedResearcher: string | null;
  startDate: string;
  endDate: string;
  onFiltersChange: (filters: {
    topics?: string[];
    location?: number | null;
    daira?: number | null;
    startDate?: string;
    endDate?: string;
    researcher?: string | null;
  }) => void;
  wilayas: Wilaya[];
  topics: { id: string; name_translations: Record<string, string>; slug: string; }[];
  isLoading: boolean;
  locale: string;
}

/**
 * Filter controls for research repository
 * Includes topic, location, researcher, and date filters
 * Uses standardized hooks:
 * - useAuth: For supabase client access
 * - useTranslations: For i18n translations
 * - useLocale: For RTL/LTR detection and date formatting
 */
export default function RepositoryFilters({
  selectedTopics,
  selectedLocation,
  selectedDaira,
  selectedResearcher,
  startDate,
  endDate,
  onFiltersChange,
  wilayas,
  topics,
  isLoading,
  locale
}: RepositoryFiltersProps) {
  const isRtl = locale === 'ar';
  const t = useTranslations('ResearchRepository.filters');
  useLocale();
  const { supabase } = useAuth();

  // Local state for form values
  const [filters, setFilters] = useState({
    topics: selectedTopics,
    location: selectedLocation,
    daira: selectedDaira,
    researcher: selectedResearcher,
    startDate,
    endDate
  });

  const [dairas, setDairas] = useState<Daira[]>([]);
  const [dairasLoading, setDairasLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load dairas when wilaya (location) changes
  useEffect(() => {
    const fetchDairas = async () => {
      if (!filters.location) {
        setDairas([]);
        return;
      }

      setDairasLoading(true);
      try {
        const { data, error } = await supabase
          .from('dairas')
          .select('id, name_ar, name_other, wilaya_id')
          .eq('wilaya_id', filters.location);

        if (error) throw error;
        setDairas(data || []);
      } catch {
        // Silently fail, UI will show no dairas
      } finally {
        setDairasLoading(false);
      }
    };

    fetchDairas();
  }, [filters.location, supabase]);

  // Reset daira when wilaya changes
  useEffect(() => {
    if (filters.location !== selectedLocation) {
      setFilters(prev => ({ ...prev, daira: null }));
    }
  }, [filters.location, selectedLocation]);

  // Check if any filters are active
  const hasActiveFilters = selectedTopics.length > 0 ||
    selectedLocation ||
    selectedDaira ||
    selectedResearcher ||
    startDate ||
    endDate;

  // Apply filters
  const handleApplyFilters = () => {
    onFiltersChange(filters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      topics: [],
      location: null,
      daira: null,
      researcher: null,
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
    setFilters(prev => ({ ...prev, location: value, daira: null }));
  };

  // Handle daira change
  const handleDairaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : null;
    setFilters(prev => ({ ...prev, daira: value }));
  };

  // Handle researcher change
  const handleResearcherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, researcher: e.target.value || null }));
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
              {selectedTopics.length +
                (selectedLocation ? 1 : 0) +
                (selectedDaira ? 1 : 0) +
                (selectedResearcher ? 1 : 0) +
                (startDate ? 1 : 0) +
                (endDate ? 1 : 0)}
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
              {t('reset')}
            </Button>
          )}
          <Button
            color="light"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? t('collapse') : t('title')}
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Topics Filter */}
            <div>
              <Label htmlFor="topics-filter">{t('topics')}</Label>
              <TopicSelector
                id="topics-filter"
                multiple
                value={filters.topics}
                onChange={handleTopicsChange}
                placeholder={t('topicsPlaceholder')}
                locale={locale}
                topics={topics}
              />
            </div>

            {/* Wilaya Filter */}
            <div>
              <Label htmlFor="location-filter">{t('wilaya')}</Label>
              <div className="relative">
                <Select
                  id="location-filter"
                  value={filters.location || ''}
                  onChange={handleLocationChange}
                  disabled={isLoading}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  style={isRtl ? { textAlign: 'right', paddingRight: '2.5rem' } : {}}
                >
                  <option value="">{t('wilayaPlaceholder')}</option>
                  {wilayas.map((wilaya) => (
                    <option key={wilaya.id} value={wilaya.id}>
                      {locale === 'ar' ? wilaya.name_ar : wilaya.name_other}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Daira Filter */}
            <div>
              <Label htmlFor="daira-filter">{t('daira')}</Label>
              <div className="relative">
                <Select
                  id="daira-filter"
                  value={filters.daira || ''}
                  onChange={handleDairaChange}
                  disabled={!filters.location || dairasLoading}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  style={isRtl ? { textAlign: 'right', paddingRight: '2.5rem' } : {}}
                >
                  <option value="">
                    {dairasLoading ? t('loadingDairas') : t('dairaPlaceholder')}
                  </option>
                  {dairas.map((daira) => (
                    <option key={daira.id} value={daira.id}>
                      {locale === 'ar' ? daira.name_ar : daira.name_other}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Researcher Filter */}
            <div>
              <Label htmlFor="researcher-filter">{t('researcher')}</Label>
              <TextInput
                id="researcher-filter"
                type="text"
                value={filters.researcher || ''}
                onChange={handleResearcherChange}
                placeholder={t('researcherPlaceholder')}
                dir={isRtl ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Start Date Filter */}
            <div>
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
                placeholder={t('startDate')}
                language={locale}
              />
            </div>

            {/* End Date Filter */}
            <div>
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
                placeholder={t('endDate')}
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

// TextInput component for researcher filter
function TextInput({
  id,
  type,
  value,
  onChange,
  placeholder,
  dir
}: {
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  dir?: 'rtl' | 'ltr';
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      dir={dir}
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    />
  );
} 