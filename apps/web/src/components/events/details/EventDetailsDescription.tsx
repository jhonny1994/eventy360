'use client';

/**
 * EventDetailsDescription component for displaying comprehensive event information
 * 
 * Uses standardized hooks:
 * - useTranslations: For i18n translations
 * - useLocale: For locale-aware rendering
 */
import React from 'react'
import { Tag, Users, Target, Lightbulb, BookOpen, UserCheck, MapPin, Mail, Phone, Globe, QrCode, Building } from 'lucide-react'
import Image from 'next/image'
import useTranslations from '@/hooks/useTranslations'
import useLocale from '@/hooks/useLocale'

interface EventDetailsDescriptionProps {
  event: {
    id: string
    title: string
    description: string
    topics: string[] | null
    event_type: string
    problem_statement: string
    target_audience: string | null
    scientific_committees: string | null
    speakers_keynotes: string | null
    submission_guidelines: string
    who_organizes: string
    logo_url: string | null
    qr_code_url: string | null
    website: string | null
    phone: string
    email: string
    location: string | null
    event_axes_translations: { [key: string]: string } | null
    organizer: {
      id: string
      display_name: string | null
      bio: string | null
      university: string
      profile_picture_url: string | null
    } | null
  }
  locale: string
}

export function EventDetailsDescription({ event, locale }: EventDetailsDescriptionProps) {
  const t = useTranslations('EventDetails.description')
  const currentLocale = useLocale()
  const isRtl = currentLocale === 'ar'

  return (
    <div className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Row 1: Event Logo and QR Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Logo */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2 text-purple-600" />
            {t('logo.title')}
          </h3>
          <div className="flex justify-center items-center min-h-[200px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            {event.logo_url ? (
              <div className="relative w-full h-48">
                <Image
                  src={event.logo_url}
                  alt={`${event.title} logo`}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Building className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">
                  {t('logo.noLogo')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <QrCode className="w-5 h-5 mr-2 text-purple-600" />
            {t('qrCode.title')}
          </h3>
          <div className="flex justify-center items-center min-h-[200px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            {event.qr_code_url ? (
              <div className="relative w-48 h-48">
                <Image
                  src={event.qr_code_url}
                  alt={`${event.title} QR code`}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <QrCode className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">
                  {t('qrCode.noQrCode')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Who Organizes Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          {t('whoOrganizes.title')}
        </h3>
        <div className="prose prose-gray max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {event.who_organizes || t('whoOrganizes.empty')}
          </div>
        </div>
      </div>

      {/* Problem Statement Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-purple-600" />
          {t('problemStatement.title')}
        </h3>
        <div className="prose prose-gray max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {event.problem_statement || t('problemStatement.empty')}
          </div>
        </div>
      </div>

      {/* Objectives Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-600" />
          {t('objectives.title')}
        </h3>
        <div className="prose prose-gray max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {event.description || t('objectives.empty')}
          </div>
        </div>
      </div>

      {/* Event Axes Section */}
      {event.event_axes_translations && event.event_axes_translations[locale] && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Tag className="w-5 h-5 mr-2 text-purple-600" />
            {t('eventAxes.title')}
          </h3>
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {event.event_axes_translations[locale] || t('eventAxes.empty')}
            </div>
          </div>
        </div>
      )}

      {/* Topics Section */}
      {event.topics && event.topics.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-600" />
            {t('topics.title')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {event.topics.map((topic, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Submission Guidelines Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
          {t('submissionGuidelines.title')}
        </h3>
        <div className="prose prose-gray max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {event.submission_guidelines || t('submissionGuidelines.empty')}
          </div>
        </div>
      </div>

      {/* Target Audience Section */}
      {event.target_audience && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserCheck className="w-5 h-5 mr-2 text-purple-600" />
            {t('targetAudience')}
          </h3>
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {event.target_audience}
            </div>
          </div>
        </div>
      )}

      {/* Scientific Committee Section */}
      {event.scientific_committees && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            {t('scientificCommittee.title')}
          </h3>
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {event.scientific_committees}
            </div>
          </div>
        </div>
      )}

      {/* Speakers & Keynotes Section */}
      {event.speakers_keynotes && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            {t('speakers')}
          </h3>
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {event.speakers_keynotes}
            </div>
          </div>
        </div>
      )}

      {/* Location Section */}
      {event.location && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-purple-600" />
            {t('location.title')}
          </h3>
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed">
              {event.location}
            </div>
          </div>
        </div>
      )}

      {/* Contact & Links Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-purple-600" />
          {t('contact.title')}
        </h3>
        <div className="space-y-3">
          {/* Email */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{t('contact.email')}:</span>
            <a 
              href={`mailto:${event.email}`}
              className="text-sm text-purple-600 hover:text-purple-800 underline"
            >
              {event.email}
            </a>
          </div>

          {/* Phone */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{t('contact.phone')}:</span>
            <a 
              href={`tel:${event.phone}`}
              className="text-sm text-purple-600 hover:text-purple-800 underline"
            >
              {event.phone}
            </a>
          </div>

          {/* Website */}
          {event.website && (
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{t('contact.website')}:</span>
              <a 
                href={event.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:text-purple-800 underline"
              >
                {event.website}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
