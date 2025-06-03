/**
 * TopicSelectionStep
 * 
 * This component provides the topic selection step in the event creation process,
 * allowing organizers to associate their event with relevant academic topics.
 * 
 * Features:
 * - Searchable topic selection interface
 * - Selected topics summary with removal option
 * - Real-time filtering of topics based on search query
 * - Visual indicators for selected topics
 * 
 * Standardized Patterns Used:
 * - useAuth: For Supabase client access instead of direct createClient
 * - useTranslations: Custom hook for internationalization
 * - useLocale: For locale-aware formatting and RTL support
 * - Consistent error handling and loading states
 */

"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import useTranslations from "@/hooks/useTranslations";
import useLocale from "@/hooks/useLocale";
import { Label, Checkbox, TextInput } from "flowbite-react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useAuth } from "@/hooks/useAuth";

import { CreateEventFormDataStatic as CreateEventFormData } from "@/lib/schemas/event";

interface TopicSelectionStepProps {
  form: UseFormReturn<CreateEventFormData>;
}

interface Topic {
  id: string;
  slug: string;
  name_ar: string;
}

export default function TopicSelectionStep({ form }: TopicSelectionStepProps) {
  const t = useTranslations("Events.Creation");
  const locale = useLocale();
  const { supabase } = useAuth();
  const isRtl = locale === 'ar';
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { watch, setValue, formState: { errors } } = form;
  const selectedTopicIds = watch("topic_ids") || [];

  // Load topics on component mount
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const { data, error } = await supabase
          .from("topics")
          .select("id, slug, name_translations")
          .order("name_translations->ar");

        if (error) throw error;
          // Transform the data to extract Arabic names
        const topicsData: Topic[] = (data || []).map(topic => ({
          id: topic.id,
          slug: topic.slug,
          name_ar: (topic.name_translations as { ar?: string })?.ar || topic.slug
        }));

        setTopics(topicsData);
        setFilteredTopics(topicsData);
      } catch  {
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, [supabase]);
  // Filter topics based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTopics(topics);
    } else {
      const filtered = topics.filter(topic =>
        topic.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTopics(filtered);
    }
  }, [searchQuery, topics]);
  const handleTopicToggle = (topicId: string) => {
    const currentSelection = selectedTopicIds;
    const isSelected = currentSelection.includes(topicId);
    
    let newSelection: string[];
    if (isSelected) {
      newSelection = currentSelection.filter((id: string) => id !== topicId);
    } else {
      newSelection = [...currentSelection, topicId];
    }
    
    setValue("topic_ids", newSelection, { shouldValidate: true });
  };

  const isTopicSelected = (topicId: string) => {
    return selectedTopicIds.includes(topicId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t("topicSelection.title")}
          </h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t("topicSelection.title")}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {t("topicSelection.description")} <span className="text-red-500">*</span>
        </p>
        {errors.topic_ids && (
          <div className="text-red-600 dark:text-red-400 text-sm">
            {String(errors.topic_ids.message)}
          </div>
        )}
      </div>      {/* Search Topics */}
      <div>
        <Label htmlFor="topic-search">
          بحث في المواضيع
        </Label>
        <div className="relative">
          <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
            <HiMagnifyingGlass className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <TextInput
            id="topic-search"
            type="text"
            placeholder={t("topicSelection.search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isRtl ? 'pr-10' : 'pl-10'}
            dir={isRtl ? "rtl" : "ltr"}
          />
        </div>
      </div>      {/* Selected Topics Count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t("topicSelection.selection.selected", { count: selectedTopicIds.length })}
        </span>
        {selectedTopicIds.length > 0 && (
          <button
            type="button"
            onClick={() => setValue("topic_ids", [], { shouldValidate: true })}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            مسح التحديد
          </button>
        )}
      </div>

      {/* Topics Grid */}
      <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchQuery ? t("topicSelection.noResults") : t("topicSelection.noTopics")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  isTopicSelected(topic.id)
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => handleTopicToggle(topic.id)}
              >
                <Checkbox
                  id={`topic-${topic.id}`}
                  checked={isTopicSelected(topic.id)}
                  onChange={() => handleTopicToggle(topic.id)}
                  className="mr-3"
                />
                <label
                  htmlFor={`topic-${topic.id}`}
                  className="flex-1 cursor-pointer text-sm"
                >
                  {topic.name_ar}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>      {/* Selected Topics Summary */}
      {selectedTopicIds.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            المواضيع المختارة
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedTopicIds.map((topicId: string) => {
              const topic = topics.find(t => t.id === topicId);
              if (!topic) return null;
              
              return (
                <span
                  key={topicId}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {topic.name_ar}
                  <button
                    type="button"
                    onClick={() => handleTopicToggle(topicId)}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
