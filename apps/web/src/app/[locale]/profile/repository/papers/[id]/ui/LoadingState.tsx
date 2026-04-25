'use client';

interface LoadingStateProps {
  locale: string;
}

export default function LoadingState({ locale }: LoadingStateProps) {
  const isRtl = locale === 'ar';

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Paper Header Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse">
        <div className="p-6">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        </div>
      </div>

      {/* Metadata Section Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <div className="h-5 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex items-center mb-1">
                  <div className="w-5 h-5 bg-gray-200 rounded-full mr-2 rtl:ml-2 rtl:mr-0"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-2/3 ml-7 rtl:mr-7 rtl:ml-0"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Abstract Section Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <div className="h-5 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Download Section Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <div className="h-5 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3 sm:mb-0">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-full sm:w-32"></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 