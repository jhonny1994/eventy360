"use client";

import React from "react";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

interface EventDetailsLocationProps {
  event: {
    location: string | null;
  };
}

export function EventDetailsLocation({
  event,
}: EventDetailsLocationProps) {
  const t = useTranslations("EventDetails.location");
  // Get location (now always a string from wilaya, daira)
  const location = event.location;

  // If no location, don't render
  if (!location) {
    return null;
  }

  // Generate Google Maps URL for directions
  const generateMapsUrl = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-gray-600" />
        {t("title")}
      </h2>
      <div className="space-y-4">        {/* Location/Address Information */}
        {location && (
          <div>
            <p className="text-gray-700 mb-3">{location}</p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <a
                href={generateMapsUrl(location)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                <Navigation className="w-4 h-4 mr-2" />
                {t("directions.getDirections")}
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(location);
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
              >
                {t("copyAddress")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
