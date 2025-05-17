export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_actions_log: {
        Row: {
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: number
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          brochure_url: string | null
          created_at: string
          created_by: string
          daira_id: number
          email: string
          event_axes_translations: Json
          event_date: string
          event_end_date: string
          event_name_translations: Json
          event_objectives_translations: Json
          event_subtitle_translations: Json | null
          event_type: Database["public"]["Enums"]["event_type_enum"]
          format: Database["public"]["Enums"]["event_format_enum"]
          full_paper_deadline: string
          id: string
          logo_url: string | null
          phone: string
          price: number | null
          problem_statement_translations: Json
          qr_code_url: string | null
          scientific_committees_translations: Json | null
          speakers_keynotes_translations: Json | null
          status: Database["public"]["Enums"]["event_status_enum"]
          submission_deadline: string
          submission_guidelines_translations: Json
          submission_verdict_deadline: string
          target_audience_translations: Json | null
          updated_at: string
          website: string | null
          who_organizes_translations: Json
          wilaya_id: number
        }
        Insert: {
          brochure_url?: string | null
          created_at?: string
          created_by: string
          daira_id: number
          email: string
          event_axes_translations: Json
          event_date: string
          event_end_date: string
          event_name_translations: Json
          event_objectives_translations: Json
          event_subtitle_translations?: Json | null
          event_type: Database["public"]["Enums"]["event_type_enum"]
          format: Database["public"]["Enums"]["event_format_enum"]
          full_paper_deadline: string
          id?: string
          logo_url?: string | null
          phone: string
          price?: number | null
          problem_statement_translations: Json
          qr_code_url?: string | null
          scientific_committees_translations?: Json | null
          speakers_keynotes_translations?: Json | null
          status: Database["public"]["Enums"]["event_status_enum"]
          submission_deadline: string
          submission_guidelines_translations: Json
          submission_verdict_deadline: string
          target_audience_translations?: Json | null
          updated_at?: string
          website?: string | null
          who_organizes_translations: Json
          wilaya_id: number
        }
        Update: {
          brochure_url?: string | null
          created_at?: string
          created_by?: string
          daira_id?: number
          email?: string
          event_axes_translations?: Json
          event_date?: string
          event_end_date?: string
          event_name_translations?: Json
          event_objectives_translations?: Json
          event_subtitle_translations?: Json | null
          event_type?: Database["public"]["Enums"]["event_type_enum"]
          format?: Database["public"]["Enums"]["event_format_enum"]
          full_paper_deadline?: string
          id?: string
          logo_url?: string | null
          phone?: string
          price?: number | null
          problem_statement_translations?: Json
          qr_code_url?: string | null
          scientific_committees_translations?: Json | null
          speakers_keynotes_translations?: Json | null
          status?: Database["public"]["Enums"]["event_status_enum"]
          submission_deadline?: string
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
      payments: {
        Row: {
          admin_notes: string | null
          admin_verifier_id: string | null
          amount: number
          billing_period: Database["public"]["Enums"]["billing_period_enum"]
          created_at: string
          id: string
          payment_method_reported: Database["public"]["Enums"]["payment_method_enum"]
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
          payment_method_reported: Database["public"]["Enums"]["payment_method_enum"]
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
          payment_method_reported?: Database["public"]["Enums"]["payment_method_enum"]
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
      submissions: {
        Row: {
          abstract_file_metadata: Json | null
          abstract_file_url: string | null
          abstract_translations: Json
          created_at: string
          event_id: string
          full_paper_file_metadata: Json | null
          full_paper_file_url: string | null
          id: string
          review_date: string | null
          review_feedback_translations: Json | null
          status: Database["public"]["Enums"]["submission_status_enum"]
          submission_date: string
          submitted_by: string
          title_translations: Json
          updated_at: string
        }
        Insert: {
          abstract_file_metadata?: Json | null
          abstract_file_url?: string | null
          abstract_translations: Json
          created_at?: string
          event_id: string
          full_paper_file_metadata?: Json | null
          full_paper_file_url?: string | null
          id?: string
          review_date?: string | null
          review_feedback_translations?: Json | null
          status: Database["public"]["Enums"]["submission_status_enum"]
          submission_date?: string
          submitted_by: string
          title_translations: Json
          updated_at?: string
        }
        Update: {
          abstract_file_metadata?: Json | null
          abstract_file_url?: string | null
          abstract_translations?: Json
          created_at?: string
          event_id?: string
          full_paper_file_metadata?: Json | null
          full_paper_file_url?: string | null
          id?: string
          review_date?: string | null
          review_feedback_translations?: Json | null
          status?: Database["public"]["Enums"]["submission_status_enum"]
          submission_date?: string
          submitted_by?: string
          title_translations?: Json
          updated_at?: string
        }
        Relationships: [
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
      billing_period_to_interval: {
        Args: { period: Database["public"]["Enums"]["billing_period_enum"] }
        Returns: unknown
      }
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      check_subscriptions_expiry: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_my_profile: {
        Args: { profile_data: Json }
        Returns: undefined
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      queue_trial_expiry_notification: {
        Args: {
          profile_id: string
          days_remaining: number
          template_key: string
        }
        Returns: undefined
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
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
      event_status_enum: "published" | "active" | "completed" | "canceled"
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
        | "received"
        | "under_review"
        | "accepted"
        | "rejected"
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
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      event_status_enum: ["published", "active", "completed", "canceled"],
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
        "received",
        "under_review",
        "accepted",
        "rejected",
      ],
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
