export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_actions_log: {
        Row: {
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: number
          ip_address: unknown
          target_entity_id: string | null
          target_entity_type: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: number
          ip_address?: unknown
          target_entity_id?: string | null
          target_entity_type?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["admin_action_type"]
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: number
          ip_address?: unknown
          target_entity_id?: string | null
          target_entity_type?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_log_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_profiles: {
        Row: {
          created_at: string
          name: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          name: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          name?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          account_holder: string | null
          account_number_rib: string | null
          bank_name: string | null
          base_price_organizer_monthly: number
          base_price_researcher_monthly: number
          created_at: string
          discount_annual: number
          discount_biannual: number
          discount_quarterly: number
          id: string
          payment_email: string | null
          updated_at: string
        }
        Insert: {
          account_holder?: string | null
          account_number_rib?: string | null
          bank_name?: string | null
          base_price_organizer_monthly?: number
          base_price_researcher_monthly?: number
          created_at?: string
          discount_annual?: number
          discount_biannual?: number
          discount_quarterly?: number
          id?: string
          payment_email?: string | null
          updated_at?: string
        }
        Update: {
          account_holder?: string | null
          account_number_rib?: string | null
          bank_name?: string | null
          base_price_organizer_monthly?: number
          base_price_researcher_monthly?: number
          created_at?: string
          discount_annual?: number
          discount_biannual?: number
          discount_quarterly?: number
          id?: string
          payment_email?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          event_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dairas: {
        Row: {
          created_at: string
          id: number
          name_ar: string
          name_other: string
          updated_at: string
          wilaya_id: number
        }
        Insert: {
          created_at?: string
          id: number
          name_ar: string
          name_other: string
          updated_at?: string
          wilaya_id: number
        }
        Update: {
          created_at?: string
          id?: number
          name_ar?: string
          name_other?: string
          updated_at?: string
          wilaya_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "dairas_wilaya_id_fkey"
            columns: ["wilaya_id"]
            isOneToOne: false
            referencedRelation: "wilayas"
            referencedColumns: ["id"]
          },
        ]
      }
      email_log: {
        Row: {
          attempted_at: string
          created_at: string
          error_message: string | null
          id: string
          last_attempt_at: string | null
          payload: Json | null
          queue_id: number | null
          recipient_email: string
          resend_message_id: string | null
          retry_count: number | null
          status: Database["public"]["Enums"]["email_log_status_enum"]
          subject_sent: string
          template_key: string | null
        }
        Insert: {
          attempted_at?: string
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          payload?: Json | null
          queue_id?: number | null
          recipient_email: string
          resend_message_id?: string | null
          retry_count?: number | null
          status: Database["public"]["Enums"]["email_log_status_enum"]
          subject_sent: string
          template_key?: string | null
        }
        Update: {
          attempted_at?: string
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          payload?: Json | null
          queue_id?: number | null
          recipient_email?: string
          resend_message_id?: string | null
          retry_count?: number | null
          status?: Database["public"]["Enums"]["email_log_status_enum"]
          subject_sent?: string
          template_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_log_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "notification_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_log_template_key_fkey"
            columns: ["template_key"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["template_key"]
          },
        ]
      }
      email_templates: {
        Row: {
          available_placeholders: string[] | null
          body_html_translations: Json
          created_at: string
          description_translations: Json | null
          subject_translations: Json
          template_key: string
          updated_at: string
        }
        Insert: {
          available_placeholders?: string[] | null
          body_html_translations: Json
          created_at?: string
          description_translations?: Json | null
          subject_translations: Json
          template_key: string
          updated_at?: string
        }
        Update: {
          available_placeholders?: string[] | null
          body_html_translations?: Json
          created_at?: string
          description_translations?: Json | null
          subject_translations?: Json
          template_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_topics: {
        Row: {
          created_at: string
          event_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          topic_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_topics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          abstract_review_result_date: string | null
          abstract_submission_deadline: string | null
          brochure_url: string | null
          created_at: string
          created_by: string
          daira_id: number
          deleted_at: string | null
          email: string
          event_axes_translations: Json
          event_date: string
          event_end_date: string
          event_name_translations: Json
          event_objectives_translations: Json
          event_subtitle_translations: Json | null
          event_type: Database["public"]["Enums"]["event_type_enum"]
          format: Database["public"]["Enums"]["event_format_enum"]
          full_paper_submission_deadline: string | null
          id: string
          logo_url: string | null
          phone: string
          price: number | null
          problem_statement_translations: Json
          qr_code_url: string | null
          scientific_committees_translations: Json | null
          speakers_keynotes_translations: Json | null
          status: Database["public"]["Enums"]["event_status_enum"]
          submission_guidelines_translations: Json
          submission_verdict_deadline: string
          target_audience_translations: Json | null
          updated_at: string
          website: string | null
          who_organizes_translations: Json
          wilaya_id: number
        }
        Insert: {
          abstract_review_result_date?: string | null
          abstract_submission_deadline?: string | null
          brochure_url?: string | null
          created_at?: string
          created_by: string
          daira_id: number
          deleted_at?: string | null
          email: string
          event_axes_translations: Json
          event_date: string
          event_end_date: string
          event_name_translations: Json
          event_objectives_translations: Json
          event_subtitle_translations?: Json | null
          event_type: Database["public"]["Enums"]["event_type_enum"]
          format: Database["public"]["Enums"]["event_format_enum"]
          full_paper_submission_deadline?: string | null
          id?: string
          logo_url?: string | null
          phone: string
          price?: number | null
          problem_statement_translations: Json
          qr_code_url?: string | null
          scientific_committees_translations?: Json | null
          speakers_keynotes_translations?: Json | null
          status?: Database["public"]["Enums"]["event_status_enum"]
          submission_guidelines_translations: Json
          submission_verdict_deadline: string
          target_audience_translations?: Json | null
          updated_at?: string
          website?: string | null
          who_organizes_translations: Json
          wilaya_id: number
        }
        Update: {
          abstract_review_result_date?: string | null
          abstract_submission_deadline?: string | null
          brochure_url?: string | null
          created_at?: string
          created_by?: string
          daira_id?: number
          deleted_at?: string | null
          email?: string
          event_axes_translations?: Json
          event_date?: string
          event_end_date?: string
          event_name_translations?: Json
          event_objectives_translations?: Json
          event_subtitle_translations?: Json | null
          event_type?: Database["public"]["Enums"]["event_type_enum"]
          format?: Database["public"]["Enums"]["event_format_enum"]
          full_paper_submission_deadline?: string | null
          id?: string
          logo_url?: string | null
          phone?: string
          price?: number | null
          problem_statement_translations?: Json
          qr_code_url?: string | null
          scientific_committees_translations?: Json | null
          speakers_keynotes_translations?: Json | null
          status?: Database["public"]["Enums"]["event_status_enum"]
          submission_guidelines_translations?: Json
          submission_verdict_deadline?: string
          target_audience_translations?: Json | null
          updated_at?: string
          website?: string | null
          who_organizes_translations?: Json
          wilaya_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_daira_id_fkey"
            columns: ["daira_id"]
            isOneToOne: false
            referencedRelation: "dairas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_wilaya_id_fkey"
            columns: ["wilaya_id"]
            isOneToOne: false
            referencedRelation: "wilayas"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          attempts: number
          created_at: string
          id: number
          last_attempt_at: string | null
          last_error: string | null
          notification_type: Database["public"]["Enums"]["notification_type_enum"]
          payload_data: Json | null
          process_after: string | null
          recipient_profile_id: string | null
          status: Database["public"]["Enums"]["queue_status_enum"]
          template_key: string | null
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: number
          last_attempt_at?: string | null
          last_error?: string | null
          notification_type?: Database["public"]["Enums"]["notification_type_enum"]
          payload_data?: Json | null
          process_after?: string | null
          recipient_profile_id?: string | null
          status?: Database["public"]["Enums"]["queue_status_enum"]
          template_key?: string | null
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: number
          last_attempt_at?: string | null
          last_error?: string | null
          notification_type?: Database["public"]["Enums"]["notification_type_enum"]
          payload_data?: Json | null
          process_after?: string | null
          recipient_profile_id?: string | null
          status?: Database["public"]["Enums"]["queue_status_enum"]
          template_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_template_key_fkey"
            columns: ["template_key"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["template_key"]
          },
        ]
      }
      organizer_profiles: {
        Row: {
          bio_translations: Json | null
          created_at: string
          daira_id: number
          institution_type: Database["public"]["Enums"]["institution_type_enum"]
          language: string
          name_translations: Json
          profile_id: string
          profile_picture_url: string | null
          updated_at: string
          wilaya_id: number
        }
        Insert: {
          bio_translations?: Json | null
          created_at?: string
          daira_id: number
          institution_type: Database["public"]["Enums"]["institution_type_enum"]
          language?: string
          name_translations: Json
          profile_id: string
          profile_picture_url?: string | null
          updated_at?: string
          wilaya_id: number
        }
        Update: {
          bio_translations?: Json | null
          created_at?: string
          daira_id?: number
          institution_type?: Database["public"]["Enums"]["institution_type_enum"]
          language?: string
          name_translations?: Json
          profile_id?: string
          profile_picture_url?: string | null
          updated_at?: string
          wilaya_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "organizer_profiles_daira_id_fkey"
            columns: ["daira_id"]
            isOneToOne: false
            referencedRelation: "dairas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizer_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizer_profiles_wilaya_id_fkey"
            columns: ["wilaya_id"]
            isOneToOne: false
            referencedRelation: "wilayas"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_analytics: {
        Row: {
          action_type: string
          created_at: string
          id: string
          submission_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          submission_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paper_analytics_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          admin_notes: string | null
          admin_verifier_id: string | null
          amount: number
          billing_period: Database["public"]["Enums"]["billing_period_enum"]
          created_at: string
          id: string
          payer_notes: string | null
          payment_method_reported: Database["public"]["Enums"]["payment_method_enum"]
          proof_document_path: string | null
          reference_number: string | null
          reported_at: string
          status: Database["public"]["Enums"]["payment_status_enum"]
          subscription_id: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          admin_verifier_id?: string | null
          amount: number
          billing_period: Database["public"]["Enums"]["billing_period_enum"]
          created_at?: string
          id?: string
          payer_notes?: string | null
          payment_method_reported: Database["public"]["Enums"]["payment_method_enum"]
          proof_document_path?: string | null
          reference_number?: string | null
          reported_at?: string
          status?: Database["public"]["Enums"]["payment_status_enum"]
          subscription_id?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          admin_verifier_id?: string | null
          amount?: number
          billing_period?: Database["public"]["Enums"]["billing_period_enum"]
          created_at?: string
          id?: string
          payer_notes?: string | null
          payment_method_reported?: Database["public"]["Enums"]["payment_method_enum"]
          proof_document_path?: string | null
          reference_number?: string | null
          reported_at?: string
          status?: Database["public"]["Enums"]["payment_status_enum"]
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_admin_verifier_id_fkey"
            columns: ["admin_verifier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          is_extended_profile_complete: boolean
          is_verified: boolean
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type_enum"]
        }
        Insert: {
          created_at?: string
          id: string
          is_extended_profile_complete?: boolean
          is_verified?: boolean
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type_enum"]
        }
        Update: {
          created_at?: string
          id?: string
          is_extended_profile_complete?: boolean
          is_verified?: boolean
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type_enum"]
        }
        Relationships: []
      }
      researcher_profiles: {
        Row: {
          academic_position: string | null
          bio_translations: Json | null
          created_at: string
          daira_id: number
          institution: string
          language: string
          name: string
          profile_id: string
          profile_picture_url: string | null
          updated_at: string
          wilaya_id: number
        }
        Insert: {
          academic_position?: string | null
          bio_translations?: Json | null
          created_at?: string
          daira_id: number
          institution: string
          language?: string
          name: string
          profile_id: string
          profile_picture_url?: string | null
          updated_at?: string
          wilaya_id: number
        }
        Update: {
          academic_position?: string | null
          bio_translations?: Json | null
          created_at?: string
          daira_id?: number
          institution?: string
          language?: string
          name?: string
          profile_id?: string
          profile_picture_url?: string | null
          updated_at?: string
          wilaya_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "researcher_profiles_daira_id_fkey"
            columns: ["daira_id"]
            isOneToOne: false
            referencedRelation: "dairas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "researcher_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "researcher_profiles_wilaya_id_fkey"
            columns: ["wilaya_id"]
            isOneToOne: false
            referencedRelation: "wilayas"
            referencedColumns: ["id"]
          },
        ]
      }
      researcher_topic_subscriptions: {
        Row: {
          created_at: string
          profile_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          topic_id: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "researcher_topic_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "researcher_topic_subscriptions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_feedback: {
        Row: {
          created_at: string
          feedback_content: string
          id: string
          providing_user_id: string | null
          role_at_submission: Database["public"]["Enums"]["user_type_enum"]
          submission_version_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feedback_content: string
          id?: string
          providing_user_id?: string | null
          role_at_submission: Database["public"]["Enums"]["user_type_enum"]
          submission_version_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feedback_content?: string
          id?: string
          providing_user_id?: string | null
          role_at_submission?: Database["public"]["Enums"]["user_type_enum"]
          submission_version_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_feedback_providing_user_id_fkey"
            columns: ["providing_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_feedback_submission_version_id_fkey"
            columns: ["submission_version_id"]
            isOneToOne: false
            referencedRelation: "submission_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_versions: {
        Row: {
          abstract_file_metadata: Json | null
          abstract_file_url: string | null
          abstract_translations: Json
          created_at: string
          full_paper_file_metadata: Json | null
          full_paper_file_url: string | null
          id: string
          submission_id: string
          submitted_at: string
          title_translations: Json
          version_number: number
        }
        Insert: {
          abstract_file_metadata?: Json | null
          abstract_file_url?: string | null
          abstract_translations: Json
          created_at?: string
          full_paper_file_metadata?: Json | null
          full_paper_file_url?: string | null
          id?: string
          submission_id: string
          submitted_at?: string
          title_translations: Json
          version_number: number
        }
        Update: {
          abstract_file_metadata?: Json | null
          abstract_file_url?: string | null
          abstract_translations?: Json
          created_at?: string
          full_paper_file_metadata?: Json | null
          full_paper_file_url?: string | null
          id?: string
          submission_id?: string
          submitted_at?: string
          title_translations?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "submission_versions_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          abstract_file_metadata: Json | null
          abstract_file_url: string | null
          abstract_status:
            | Database["public"]["Enums"]["submission_status_enum"]
            | null
          abstract_translations: Json
          created_at: string
          current_abstract_version_id: string | null
          current_full_paper_version_id: string | null
          deleted_at: string | null
          event_id: string
          full_paper_file_metadata: Json | null
          full_paper_file_url: string | null
          full_paper_status:
            | Database["public"]["Enums"]["submission_status_enum"]
            | null
          id: string
          review_date: string | null
          status: Database["public"]["Enums"]["submission_status_enum"] | null
          submission_date: string
          submitted_by: string
          title_translations: Json
          updated_at: string
        }
        Insert: {
          abstract_file_metadata?: Json | null
          abstract_file_url?: string | null
          abstract_status?:
            | Database["public"]["Enums"]["submission_status_enum"]
            | null
          abstract_translations: Json
          created_at?: string
          current_abstract_version_id?: string | null
          current_full_paper_version_id?: string | null
          deleted_at?: string | null
          event_id: string
          full_paper_file_metadata?: Json | null
          full_paper_file_url?: string | null
          full_paper_status?:
            | Database["public"]["Enums"]["submission_status_enum"]
            | null
          id?: string
          review_date?: string | null
          status?: Database["public"]["Enums"]["submission_status_enum"] | null
          submission_date?: string
          submitted_by: string
          title_translations: Json
          updated_at?: string
        }
        Update: {
          abstract_file_metadata?: Json | null
          abstract_file_url?: string | null
          abstract_status?:
            | Database["public"]["Enums"]["submission_status_enum"]
            | null
          abstract_translations?: Json
          created_at?: string
          current_abstract_version_id?: string | null
          current_full_paper_version_id?: string | null
          deleted_at?: string | null
          event_id?: string
          full_paper_file_metadata?: Json | null
          full_paper_file_url?: string | null
          full_paper_status?:
            | Database["public"]["Enums"]["submission_status_enum"]
            | null
          id?: string
          review_date?: string | null
          status?: Database["public"]["Enums"]["submission_status_enum"] | null
          submission_date?: string
          submitted_by?: string
          title_translations?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_current_abstract_version"
            columns: ["current_abstract_version_id"]
            isOneToOne: false
            referencedRelation: "submission_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_current_full_paper_version"
            columns: ["current_full_paper_version_id"]
            isOneToOne: false
            referencedRelation: "submission_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          start_date: string
          status: Database["public"]["Enums"]["subscription_status_enum"]
          tier: Database["public"]["Enums"]["subscription_tier_enum"]
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status_enum"]
          tier?: Database["public"]["Enums"]["subscription_tier_enum"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status_enum"]
          tier?: Database["public"]["Enums"]["subscription_tier_enum"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string
          id: string
          name_translations: Json
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_translations: Json
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_translations?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          created_at: string
          document_path: string
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["verification_request_status"]
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_path: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["verification_request_status"]
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_path?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["verification_request_status"]
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wilayas: {
        Row: {
          created_at: string
          id: number
          name_ar: string
          name_other: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: number
          name_ar: string
          name_other: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name_ar?: string
          name_other?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_verification_requests: {
        Row: {
          admin_name: string | null
          days_pending: number | null
          document_path: string | null
          id: string | null
          is_verified: boolean | null
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          profile_picture_url: string | null
          rejection_reason: string | null
          status:
            | Database["public"]["Enums"]["verification_request_status"]
            | null
          status_label: string | null
          submitted_at: string | null
          user_id: string | null
          user_name: string | null
          user_type: Database["public"]["Enums"]["user_type_enum"] | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      latest_verification_requests: {
        Row: {
          created_at: string | null
          document_path: string | null
          id: string | null
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          status:
            | Database["public"]["Enums"]["verification_request_status"]
            | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_request_details: {
        Row: {
          admin_name: string | null
          document_path: string | null
          id: string | null
          is_verified: boolean | null
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          profile_picture_url: string | null
          rejection_reason: string | null
          status:
            | Database["public"]["Enums"]["verification_request_status"]
            | null
          submitted_at: string | null
          user_id: string | null
          user_name: string | null
          user_type: Database["public"]["Enums"]["user_type_enum"] | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      activate_subscription: {
        Args: { subscription_id: string }
        Returns: boolean
      }
      add_author_revision_notes: {
        Args: { p_notes: string; p_submission_id: string; p_version_id: string }
        Returns: boolean
      }
      billing_period_to_interval: {
        Args: { period: Database["public"]["Enums"]["billing_period_enum"] }
        Returns: unknown
      }
      calculate_event_statistics: {
        Args: { p_event_id: string }
        Returns: Json
      }
      check_subscriptions_expiry: { Args: never; Returns: undefined }
      complete_my_profile: { Args: { profile_data: Json }; Returns: undefined }
      complete_submission: {
        Args: { p_submission_id: string }
        Returns: boolean
      }
      create_admin_invitation: {
        Args: { p_invited_user_email: string; p_magic_link: string }
        Returns: undefined
      }
      create_deadline_notifications: { Args: never; Returns: undefined }
      discover_events: {
        Args: {
          daira_id_param?: number
          end_date?: string
          event_format_filter?: Database["public"]["Enums"]["event_format_enum"][]
          event_status_filter?: Database["public"]["Enums"]["event_status_enum"][]
          limit_count?: number
          offset_count?: number
          p_organizer_id?: string
          search_query?: string
          start_date?: string
          topic_ids?: string[]
          wilaya_id_param?: number
        }
        Returns: {
          abstract_submission_deadline: string
          daira_name: string
          event_date: string
          event_end_date: string
          event_name: string
          event_subtitle: string
          format: Database["public"]["Enums"]["event_format_enum"]
          id: string
          logo_url: string
          organizer_name: string
          rank: number
          status: Database["public"]["Enums"]["event_status_enum"]
          topics: string[]
          total_records: number
          wilaya_name: string
        }[]
      }
      discover_papers: {
        Args: {
          author_name_filter?: string
          daira_id_param?: number
          end_date?: string
          limit_count?: number
          offset_count?: number
          organizer_id?: string
          search_query?: string
          start_date?: string
          topic_ids?: string[]
          wilaya_id_param?: number
        }
        Returns: {
          author_daira_id: number
          author_id: string
          author_institution: string
          author_name: string
          author_wilaya_id: number
          event_date: string
          event_id: string
          event_name_translations: Json
          event_topic_ids: string[]
          full_paper_file_metadata: Json
          full_paper_file_url: string
          id: string
          paper_abstract_translations: Json
          paper_title_translations: Json
          rank: number
          submission_date: string
          total_records: number
        }[]
      }
      filter_events_by_date_range: {
        Args: {
          end_date?: string
          limit_count?: number
          offset_count?: number
          start_date?: string
        }
        Returns: {
          abstract_submission_deadline: string
          daira_name: string
          event_date: string
          event_end_date: string
          event_name: string
          event_subtitle: string
          format: Database["public"]["Enums"]["event_format_enum"]
          id: string
          logo_url: string
          organizer_name: string
          status: Database["public"]["Enums"]["event_status_enum"]
          topics: string[]
          wilaya_name: string
        }[]
      }
      filter_events_by_location: {
        Args: {
          daira_id_param?: number
          limit_count?: number
          offset_count?: number
          wilaya_id_param: number
        }
        Returns: {
          abstract_submission_deadline: string
          daira_name: string
          event_date: string
          event_end_date: string
          event_name: string
          event_subtitle: string
          format: Database["public"]["Enums"]["event_format_enum"]
          id: string
          logo_url: string
          organizer_name: string
          status: Database["public"]["Enums"]["event_status_enum"]
          topics: string[]
          wilaya_name: string
        }[]
      }
      filter_events_by_topic: {
        Args: {
          limit_count?: number
          offset_count?: number
          topic_ids: string[]
        }
        Returns: {
          abstract_submission_deadline: string
          daira_name: string
          event_date: string
          event_end_date: string
          event_name: string
          event_subtitle: string
          format: Database["public"]["Enums"]["event_format_enum"]
          id: string
          logo_url: string
          organizer_name: string
          status: Database["public"]["Enums"]["event_status_enum"]
          topics: string[]
          wilaya_name: string
        }[]
      }
      get_daira_name: {
        Args: { p_daira_id: number; p_locale?: string }
        Returns: string
      }
      get_event_submission_stats: {
        Args: { event_id: string }
        Returns: {
          abstract_accepted: number
          abstract_rejected: number
          abstract_submitted: number
          completed: number
          full_paper_accepted: number
          full_paper_rejected: number
          full_paper_submitted: number
          revision_requested: number
          total_submissions: number
        }[]
      }
      get_events_by_status: {
        Args: {
          limit_count?: number
          offset_count?: number
          status_filter: Database["public"]["Enums"]["event_status_enum"]
        }
        Returns: {
          abstract_submission_deadline: string
          daira_name: string
          event_date: string
          event_end_date: string
          event_name: string
          event_subtitle: string
          format: Database["public"]["Enums"]["event_format_enum"]
          id: string
          logo_url: string
          organizer_name: string
          status: Database["public"]["Enums"]["event_status_enum"]
          topics: string[]
          wilaya_name: string
        }[]
      }
      get_featured_events: {
        Args: { limit_count?: number }
        Returns: {
          abstract_submission_deadline: string
          daira_name: string
          event_date: string
          event_end_date: string
          event_name: string
          event_subtitle: string
          format: Database["public"]["Enums"]["event_format_enum"]
          id: string
          logo_url: string
          organizer_name: string
          status: Database["public"]["Enums"]["event_status_enum"]
          topics: string[]
          wilaya_name: string
        }[]
      }
      get_feedback_for_version: {
        Args: { p_version_id: string }
        Returns: {
          created_at: string
          feedback_content: string
          id: string
          provider_name: string
          providing_user_id: string
          role_at_submission: Database["public"]["Enums"]["user_type_enum"]
          submission_version_id: string
          updated_at: string
        }[]
      }
      get_paper_analytics: {
        Args: { p_submission_id: string }
        Returns: {
          download_count: number
          last_downloaded_at: string
          last_viewed_at: string
          view_count: number
        }[]
      }
      get_paper_analytics_over_time: {
        Args: {
          p_end_date?: string
          p_interval?: string
          p_start_date?: string
          p_submission_id: string
        }
        Returns: {
          date: string
          downloads: number
          views: number
        }[]
      }
      get_papers_analytics: {
        Args: { p_submission_ids: string[] }
        Returns: {
          download_count: number
          submission_id: string
          view_count: number
        }[]
      }
      get_payment_details: { Args: { payment_id: string }; Returns: Json }
      get_payments_with_user_details: { Args: never; Returns: Json[] }
      get_public_events: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          abstract_review_result_date: string | null
          abstract_submission_deadline: string | null
          brochure_url: string | null
          created_at: string
          created_by: string
          daira_id: number
          deleted_at: string | null
          email: string
          event_axes_translations: Json
          event_date: string
          event_end_date: string
          event_name_translations: Json
          event_objectives_translations: Json
          event_subtitle_translations: Json | null
          event_type: Database["public"]["Enums"]["event_type_enum"]
          format: Database["public"]["Enums"]["event_format_enum"]
          full_paper_submission_deadline: string | null
          id: string
          logo_url: string | null
          phone: string
          price: number | null
          problem_statement_translations: Json
          qr_code_url: string | null
          scientific_committees_translations: Json | null
          speakers_keynotes_translations: Json | null
          status: Database["public"]["Enums"]["event_status_enum"]
          submission_guidelines_translations: Json
          submission_verdict_deadline: string
          target_audience_translations: Json | null
          updated_at: string
          website: string | null
          who_organizes_translations: Json
          wilaya_id: number
        }[]
        SetofOptions: {
          from: "*"
          to: "events"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_subscription_details: {
        Args: { target_user_id?: string }
        Returns: Json
      }
      get_subscription_pricing: {
        Args: {
          billing_period: Database["public"]["Enums"]["billing_period_enum"]
          user_type: Database["public"]["Enums"]["user_type_enum"]
        }
        Returns: Json
      }
      get_wilaya_name: {
        Args: { p_locale?: string; p_wilaya_id: number }
        Returns: string
      }
      handle_submission_feedback: {
        Args: {
          p_decision_status: string
          p_feedback_content: string
          p_submission_id: string
        }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      jsonb_values_to_text: { Args: { data: Json }; Returns: string }
      purge_expired_deletions: { Args: never; Returns: undefined }
      queue_trial_expiry_notification: {
        Args: {
          days_remaining: number
          profile_id: string
          template_key: string
        }
        Returns: undefined
      }
      record_manual_payment: {
        Args: {
          admin_notes?: string
          amount: number
          billing_period: Database["public"]["Enums"]["billing_period_enum"]
          payment_method?: Database["public"]["Enums"]["payment_method_enum"]
          target_user_id: string
        }
        Returns: Json
      }
      restore_event: { Args: { p_event_id: string }; Returns: boolean }
      restore_submission: {
        Args: { p_submission_id: string }
        Returns: boolean
      }
      review_abstract: {
        Args: {
          p_feedback: string
          p_status: Database["public"]["Enums"]["submission_status_enum"]
          p_submission_id: string
        }
        Returns: boolean
      }
      review_full_paper: {
        Args: {
          p_feedback: string
          p_status: Database["public"]["Enums"]["submission_status_enum"]
          p_submission_id: string
        }
        Returns: boolean
      }
      search_events: {
        Args: {
          limit_count?: number
          offset_count?: number
          search_query: string
        }
        Returns: {
          abstract_submission_deadline: string
          daira_name: string
          event_date: string
          event_end_date: string
          event_name: string
          event_subtitle: string
          format: Database["public"]["Enums"]["event_format_enum"]
          id: string
          logo_url: string
          organizer_name: string
          rank: number
          status: Database["public"]["Enums"]["event_status_enum"]
          topics: string[]
          wilaya_name: string
        }[]
      }
      soft_delete_event: { Args: { p_event_id: string }; Returns: boolean }
      soft_delete_submission: {
        Args: { p_submission_id: string }
        Returns: boolean
      }
      submit_abstract: {
        Args: {
          p_abstract_file_metadata: Json
          p_abstract_file_url: string
          p_abstract_translations: Json
          p_event_id: string
          p_title_translations: Json
        }
        Returns: string
      }
      submit_full_paper: {
        Args: {
          p_full_paper_file_metadata: Json
          p_full_paper_file_url: string
          p_submission_id: string
        }
        Returns: string
      }
      submit_revision: {
        Args: {
          p_full_paper_file_metadata: Json
          p_full_paper_file_url: string
          p_revision_notes?: string
          p_submission_id: string
        }
        Returns: string
      }
      track_paper_activity: {
        Args: { p_action_type: string; p_submission_id: string }
        Returns: string
      }
      update_event_status_based_on_date: { Args: never; Returns: undefined }
      verify_payment: {
        Args: {
          p_admin_notes?: string
          payment_id: string
          rejection_reason?: string
          verify_status: Database["public"]["Enums"]["payment_status_enum"]
        }
        Returns: Json
      }
    }
    Enums: {
      admin_action_type:
        | "awarded_badge"
        | "removed_badge"
        | "recorded_payment"
        | "updated_payment_status"
        | "admin_login"
        | "admin_user_edit"
        | "admin_event_edit"
        | "admin_submission_edit"
        | "admin_topic_create"
        | "admin_topic_update"
        | "admin_topic_delete"
        | "admin_email_template_edit"
        | "processed_verification_request"
      billing_period_enum: "monthly" | "quarterly" | "biannual" | "annual"
      email_log_status_enum: "attempted" | "sent" | "failed" | "retry_attempted"
      event_format_enum: "physical" | "virtual" | "hybrid"
      event_status_enum:
        | "published"
        | "abstract_review"
        | "full_paper_submission_open"
        | "full_paper_review"
        | "completed"
        | "canceled"
      event_type_enum:
        | "scientific_event"
        | "cultural_event"
        | "sports_event"
        | "competition"
      institution_type_enum:
        | "university"
        | "university_center"
        | "national_school"
        | "research_center"
        | "research_laboratory"
        | "activities_service"
        | "research_team"
      notification_type_enum: "immediate" | "scheduled"
      payment_method_enum: "bank" | "check" | "cash" | "online"
      payment_status_enum: "pending_verification" | "verified" | "rejected"
      queue_status_enum: "pending" | "processing" | "completed" | "failed"
      submission_status_enum:
        | "abstract_submitted"
        | "abstract_accepted"
        | "abstract_rejected"
        | "full_paper_submitted"
        | "full_paper_accepted"
        | "full_paper_rejected"
        | "revision_requested"
        | "revision_under_review"
        | "completed"
      submission_type_enum: "abstract" | "full_paper" | "supplementary"
      subscription_status_enum: "active" | "expired" | "trial" | "cancelled"
      subscription_tier_enum:
        | "free"
        | "paid_researcher"
        | "paid_organizer"
        | "trial"
      user_type_enum: "researcher" | "organizer" | "admin"
      verification_request_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_action_type: [
        "awarded_badge",
        "removed_badge",
        "recorded_payment",
        "updated_payment_status",
        "admin_login",
        "admin_user_edit",
        "admin_event_edit",
        "admin_submission_edit",
        "admin_topic_create",
        "admin_topic_update",
        "admin_topic_delete",
        "admin_email_template_edit",
        "processed_verification_request",
      ],
      billing_period_enum: ["monthly", "quarterly", "biannual", "annual"],
      email_log_status_enum: ["attempted", "sent", "failed", "retry_attempted"],
      event_format_enum: ["physical", "virtual", "hybrid"],
      event_status_enum: [
        "published",
        "abstract_review",
        "full_paper_submission_open",
        "full_paper_review",
        "completed",
        "canceled",
      ],
      event_type_enum: [
        "scientific_event",
        "cultural_event",
        "sports_event",
        "competition",
      ],
      institution_type_enum: [
        "university",
        "university_center",
        "national_school",
        "research_center",
        "research_laboratory",
        "activities_service",
        "research_team",
      ],
      notification_type_enum: ["immediate", "scheduled"],
      payment_method_enum: ["bank", "check", "cash", "online"],
      payment_status_enum: ["pending_verification", "verified", "rejected"],
      queue_status_enum: ["pending", "processing", "completed", "failed"],
      submission_status_enum: [
        "abstract_submitted",
        "abstract_accepted",
        "abstract_rejected",
        "full_paper_submitted",
        "full_paper_accepted",
        "full_paper_rejected",
        "revision_requested",
        "revision_under_review",
        "completed",
      ],
      submission_type_enum: ["abstract", "full_paper", "supplementary"],
      subscription_status_enum: ["active", "expired", "trial", "cancelled"],
      subscription_tier_enum: [
        "free",
        "paid_researcher",
        "paid_organizer",
        "trial",
      ],
      user_type_enum: ["researcher", "organizer", "admin"],
      verification_request_status: ["pending", "approved", "rejected"],
    },
  },
} as const
