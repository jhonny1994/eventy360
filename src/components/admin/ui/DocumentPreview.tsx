"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Spinner, Alert } from "flowbite-react";
import { HiExclamationCircle, HiDocumentText } from "react-icons/hi";
import Image from "next/image";

type DocumentPreviewProps = {
  documentPath: string;
  translations: {
    loading: string;
    notFound: string;
    openInNewTab: string;
  };
};

/**
 * Component to preview verification documents
 * Handles both images and PDFs with appropriate rendering
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

  const supabase = createClient();

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentPath) {
        setError("Document path is missing");
        setLoading(false);
        return;
      }

      try {
        // Parse bucket and path from document_path (format: bucket_name/user_id/filename)
        const [bucketName, ...pathParts] = documentPath.split("/");
        const filePath = pathParts.join("/");

        if (!bucketName || !filePath) {
          throw new Error("Invalid document path format");
        }

        const { data, error } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(filePath, 60); // 60 seconds expiry

        if (error) {
          throw error;
        }

        if (!data || !data.signedUrl) {
          throw new Error("Failed to generate document URL");
        }

        setDocumentUrl(data.signedUrl);

        // Check if document is an image based on file extension
        const fileExtension = filePath.split(".").pop()?.toLowerCase();
        setIsImage(
          ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension || "")
        );
      } catch (err) {
        console.error("Error fetching document:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentPath, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
        <span className="ml-2">{translations.loading}</span>
      </div>
    );
  }

  if (error || !documentUrl) {
    return (
      <Alert color="failure" icon={HiExclamationCircle}>
        <span>
          {translations.notFound}: {error}
        </span>
      </Alert>
    );
  }

  if (isImage) {
    return (
      <div className="flex justify-center">
        <Image
          src={documentUrl}
          alt="Verification Document"
          width={600}
          height={800}
          className="max-w-full max-h-[600px] object-contain rounded border dark:border-gray-700"
        />
      </div>
    );
  }

  // For PDF or other document types, render an embed/iframe with download link fallback
  return (
    <div className="document-container">
      <object
        data={documentUrl}
        type="application/pdf"
        width="100%"
        height="600px"
        className="border rounded dark:border-gray-700"
      >
        <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded border">
          <HiDocumentText className="h-6 w-6 mr-2" />
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {translations.openInNewTab}
          </a>
        </div>
      </object>
    </div>
  );
}
