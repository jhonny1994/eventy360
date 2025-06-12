'use client';

import { useMemo } from 'react';
import { Select, Label } from 'flowbite-react';
import { useLocale, useTranslations } from 'next-intl';

export interface Topic {
  id: string;
  slug: string;
  name_translations: {
    ar?: string;
    en?: string;
    fr?: string;
    [key: string]: string | undefined;
  };
  created_at?: string;
  updated_at?: string;
}

export interface TopicSelectorProps {
  /** Multiple selection mode when true, single selection when false */
  multiple?: boolean;
  /** Current selected topic ID(s) */
  value?: string | string[];
  /** Function called when selection changes */
  onChange: (value: string | string[]) => void;
  /** Label for the select element */
  label?: string;
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** Placeholder text when no option is selected */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** ID attribute for the select element */
  id?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Fixed locale for the component (defaults to current locale) */
  locale?: string;
  /** Array of topic objects to display */
  topics: Topic[];
}

/**
 * A reusable component for selecting topics from the database
 * Supports both single and multiple selection modes
 */
export default function TopicSelector({
  multiple = false,
  value,
  onChange,
  label,
  className = '',
  placeholder,
  required = false,
  error,
  id = 'topic-selector',
  disabled = false,
  locale: fixedLocale,
  topics = []
}: TopicSelectorProps) {
  // Hooks for locale and translations
  const currentLocale = useLocale();
  const locale = fixedLocale || currentLocale;
  const isRtl = locale === 'ar';
  const t = useTranslations('AdminTopics');
  
  // Handle selection change
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (multiple) {
      // For multiple selection, convert selected options to an array of values
      const selectedOptions = Array.from(event.target.selectedOptions);
      const selectedValues = selectedOptions.map(option => option.value);
      onChange(selectedValues);
    } else {
      // For single selection, just get the value
      onChange(event.target.value);
    }
  };
  
  // Get the display name based on the current locale
  const getTopicName = (topic: Topic) => {
    if (!topic.name_translations) return '';
    
    // First try the current locale
    if (topic.name_translations[locale]) {
      return topic.name_translations[locale];
    }
    
    // Fall back to Arabic as the primary language
    if (topic.name_translations.ar) {
      return topic.name_translations.ar;
    }
    
    // If all else fails, try English or French
    return topic.name_translations.en || topic.name_translations.fr || '';
  };
  
  // Create memoized array of selected values for multiple selection mode
  const selectedValues = useMemo(() => {
    if (!value) return multiple ? [] : '';
    return value;
  }, [value, multiple]);
  
  return (
    <div className={`${className}`}>
      {label && (
        <div className="mb-2 block">
          <Label
            htmlFor={id}
            className="text-sm font-medium"
          >
            {label}
            {required && <span className="text-red-500 ms-1">*</span>}
          </Label>
        </div>
      )}
      
      <Select
        id={id}
        multiple={multiple}
        value={selectedValues}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className="w-full"
        dir={isRtl ? 'rtl' : 'ltr'}
        style={isRtl ? { textAlign: 'right', paddingRight: '2.5rem' } : {}}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {topics.map((topic) => (
          <option key={topic.id} value={topic.id}>
            {getTopicName(topic)}
          </option>
        ))}
        
        {topics.length === 0 && (
          <option value="" disabled>
            {t('noTopics') || 'No topics available'}
          </option>
        )}
      </Select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 