import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import CreateEventForm from "@/components/events/creation/CreateEventForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Events.Creation");
  
  return {
    title: t("title"), 
    description: t("subtitle"), 
  };
}

interface CreateEventPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function CreateEventPage({ params }: CreateEventPageProps) {
  const { locale } = await params;
    const supabase = await createServerSupabaseClient();

    // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect(`/${locale}/login`);
  }

  // Get user profile to verify they are an organizer
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_type, is_verified")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect(`/${locale}/complete-profile`);
  }

  // Only organizers can create events
  if (profile.user_type !== "organizer") {
    redirect(`/${locale}/profile`);
  }
  const t = await getTranslations("Events.Creation");
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              {t("subtitle")}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 md:p-8">
              <CreateEventForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
