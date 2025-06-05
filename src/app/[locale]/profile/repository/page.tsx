import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import RepositoryPageClient from "./RepositoryPageClient";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  const t = await getTranslations({ locale, namespace: "ResearchRepository" });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  };
}

/**
 * Research Repository Main Page - Server Component
 *
 * This component handles metadata generation and renders the client component
 * for the Research Repository page.
 */
export default async function RepositoryPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  return (
    <RepositoryPageClient 
      locale={resolvedParams.locale} 
      searchParams={resolvedSearchParams}
    />
  );
}
 