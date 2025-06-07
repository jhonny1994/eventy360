"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Spinner, Alert, Button } from "flowbite-react";
import { HiExclamationCircle, HiDocumentText, HiRefresh } from "react-icons/hi";
import Image from "next/image";
import { useLocale } from "next-intl";

type DocumentPreviewProps = {
  documentPath: string;
  translations: {
    loading: string;
    notFound: string;
    openInNewTab: string;
    documentPathMissing?: string;
    invalidDocumentPath?: string;
    invalidDocumentStructure?: string;
    failedToGenerateUrl?: string;
    unknownError?: string;
    verificationDocument?: string;
    refreshDocument?: string;
  };
  locale?: string; // Kept for backward compatibility
};

/**
 * Component to preview verification documents
 * Handles both images and PDFs with appropriate rendering
 * Supports RTL languages with proper icon positioning
 * Uses the application's locale context for consistent RTL behavior
 *
 * @param props - Component props
 * @returns Document preview UI based on document type
 */
export default function DocumentPreview({
  documentPath,
  translations,
}: DocumentPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(false);
  
  // Get locale from application context
  const appLocale = useLocale();
  
  // Determine if we're using RTL
  const isRtl = appLocale === 'ar';
  
  // Get appropriate margin class based on RTL or LTR
  const getIconMarginClass = () => {
    if (isRtl) {
      return 'ml-1'; // For RTL languages, margin on left
    }
    return 'mr-1'; // For LTR languages, margin on right
  };
  
  // Get appropriate space class for flex containers
  const getSpaceClass = () => {
    if (isRtl) {
      return 'space-x-reverse space-x-2'; // For RTL languages
    }
    return 'space-x-2'; // For LTR languages
  };

  // Use Auth hook to get Supabase client
  const { supabase } = useAuth();

  const fetchDocument = useCallback(async () => {
    if (!documentPath) {
      setError(translations.documentPathMissing || "Document path is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
            
      let bucketName: string;
      let filePath: string;
      
      // In the database we store paths like "verification_documents/user_id/filename"
      // But for storage.createSignedUrl, we need bucket="verification_documents" and path="user_id/filename"
      if (documentPath.startsWith('verification_documents/')) {
        // This is the format stored in the verification_requests table
        bucketName = 'verification_documents';
        filePath = documentPath.substring('verification_documents/'.length);
      } else if (documentPath.includes('/')) {
        // Fallback to the old parsing logic
        const firstSlashIndex = documentPath.indexOf('/');
        bucketName = documentPath.substring(0, firstSlashIndex);
        filePath = documentPath.substring(firstSlashIndex + 1);
      } else {
        throw new Error(translations.invalidDocumentPath || "Invalid document path format");
      }

      if (!bucketName || !filePath) {
        throw new Error(translations.invalidDocumentPath || "Invalid document path format");
      }


      // Generate a longer-lived URL (5 minutes) to avoid frequent refreshes
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 300);

      if (error) {
        
        // Check for specific error types
        if (error.message.includes("Not Found")) {
          throw new Error(translations.notFound || "Document not found");
        } else if (error.message.includes("permission")) {
          throw new Error(`${translations.unknownError || "Permission error"}: ${error.message}`);
        } else {
          throw error;
        }
      }

      if (!data || !data.signedUrl) {
        throw new Error(translations.failedToGenerateUrl || "Failed to generate document URL");
      }

      setDocumentUrl(data.signedUrl);

      // Check if document is an image based on file extension
      const fileExtension = filePath.split(".").pop()?.toLowerCase();
      setIsImage(
        ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension || "")
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : (translations.unknownError || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [documentPath, supabase.storage, translations]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" dir={isRtl ? 'rtl' : 'ltr'}>
        <Spinner size="lg" />
        <span className={isRtl ? 'mr-2' : 'ml-2'}>{translations.loading}</span>
      </div>
    );
  }

  if (error || !documentUrl) {
    return (
      <Alert color="failure" icon={HiExclamationCircle} className="mt-2 mb-4">
        <div className="flex flex-col space-y-2" dir={isRtl ? 'rtl' : 'ltr'}>
          <span>{error || translations.notFound}</span>
          <Button color="light" size="xs" onClick={fetchDocument} className="self-start">
            <HiRefresh className={getIconMarginClass()} />
            {translations.refreshDocument || "Refresh document"}
          </Button>
        </div>
      </Alert>
    );
  }

  if (isImage) {
    return (
      <div className="flex flex-col items-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="relative w-full max-w-full">
          <Image
            src={documentUrl}
            alt={translations.verificationDocument || "Verification Document"}
            width={600}
            height={800}
            className="max-w-full max-h-[600px] object-contain rounded border dark:border-gray-700"
            onError={() => {
              setError(translations.notFound || "Error loading image");
            }}
            unoptimized // Use for external URLs
          />
        </div>
        <div className={`mt-4 flex ${getSpaceClass()}`}>
          <Button 
            onClick={fetchDocument}
            color="light"
            size="sm"
          >
            <HiRefresh className={getIconMarginClass()} />
            {translations.refreshDocument || "Refresh document"}
          </Button>
          <Button
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            color="light"
            size="sm"
            as="a"
          >
            {translations.openInNewTab || "Open in new tab"}
          </Button>
        </div>
      </div>
    );
  }

  // For PDF or other document types, render an embed/iframe with download link fallback
  return (
    <div className="document-container flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      <object
        data={documentUrl}
        type="application/pdf"
        width="100%"
        height="600px"
        className="border rounded dark:border-gray-700"
      >
        <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded border">
          <HiDocumentText className={`h-6 w-6 ${getIconMarginClass()}`} />
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {translations.openInNewTab || "Open document in new tab"}
          </a>
        </div>
      </object>
      <div className={`mt-4 flex ${getSpaceClass()} justify-center`}>
        <Button 
          onClick={fetchDocument}
          color="light"
          size="sm"
        >
          <HiRefresh className={getIconMarginClass()} />
          {translations.refreshDocument || "Refresh document"}
        </Button>
        <Button
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          color="light"
          size="sm"
          as="a"
        >
          {translations.openInNewTab || "Open document in new tab"}
        </Button>
      </div>
    </div>
  );
}
