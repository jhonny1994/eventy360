import React from 'react'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface EventDetailsLocationProps {
  event: {
    venue: { [key: string]: string } | string | null
    location: { [key: string]: string } | string | null
  }
  locale: string
}

export function EventDetailsLocation({ event, locale }: EventDetailsLocationProps) {
  const t = useTranslations('EventDetails.location')
  
  // Get localized venue and location
  const venue = typeof event.venue === 'object' 
    ? event.venue?.[locale] || event.venue?.['ar'] || null
    : event.venue || null

  const location = typeof event.location === 'object'
    ? event.location?.[locale] || event.location?.['ar'] || null
    : event.location || null

  // If no venue or location, don't render
  if (!venue && !location) {
    return null
  }

  // Generate Google Maps URL for directions
  const generateMapsUrl = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-gray-600" />
        {t('venue')} & {t('address')}
      </h2>
      
      <div className="space-y-4">
        {/* Venue Information */}        {venue && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('venue')}</h3>
            <p className="text-gray-700">{venue}</p>
          </div>
        )}

        {/* Location/Address Information */}
        {location && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('address')}</h3>
            <p className="text-gray-700 mb-3">{location}</p>
            
            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <a
                href={generateMapsUrl(location)}
                target="_blank"
                rel="noopener noreferrer"                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                <Navigation className="w-4 h-4 mr-2" />
                {t('directions.getDirections')}
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(location)
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
              >
                {t('copyAddress')}
              </button>
            </div>
          </div>
        )}

        {/* Map Placeholder */}
        {location && (
          <div className="mt-6">            <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">{t('map.placeholder')}</p>
                <a
                  href={generateMapsUrl(location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-flex items-center"
                >
                  {t('map.viewOnGoogleMaps')}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        )}        {/* Additional Location Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                {t('guidelines.title')}
              </h4>
              <p className="text-sm text-blue-700">
                {t('guidelines.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
