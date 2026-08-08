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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accuracy_ratings: {
        Row: {
          created_at: string
          id: string
          score: number
          thesis_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          score: number
          thesis_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number
          thesis_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accuracy_ratings_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accuracy_ratings_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          collection_name: string | null
          created_at: string
          id: string
          thesis_id: string
          user_id: string
        }
        Insert: {
          collection_name?: string | null
          created_at?: string
          id?: string
          thesis_id: string
          user_id: string
        }
        Update: {
          collection_name?: string | null
          created_at?: string
          id?: string
          thesis_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_logs: {
        Row: {
          created_at: string
          id: string
          identifier: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
          user_id?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          thesis_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          thesis_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          thesis_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          read: boolean
          thesis_id: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          read?: boolean
          thesis_id: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          read?: boolean
          thesis_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic_level: string | null
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          field_of_study: string | null
          first_name: string | null
          id: string
          last_name: string | null
          methodology: string | null
          research_interests: string[] | null
          research_question: string | null
          research_sources: string | null
          research_theme: string | null
          thesis_statement: string | null
          university: string | null
          user_id: string
          username: string | null
          writing_plan: string | null
        }
        Insert: {
          academic_level?: string | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          field_of_study?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          methodology?: string | null
          research_interests?: string[] | null
          research_question?: string | null
          research_sources?: string | null
          research_theme?: string | null
          thesis_statement?: string | null
          university?: string | null
          user_id: string
          username?: string | null
          writing_plan?: string | null
        }
        Update: {
          academic_level?: string | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          field_of_study?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          methodology?: string | null
          research_interests?: string[] | null
          research_question?: string | null
          research_sources?: string | null
          research_theme?: string | null
          thesis_statement?: string | null
          university?: string | null
          user_id?: string
          username?: string | null
          writing_plan?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string
          id: string
          score: number
          thesis_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          score: number
          thesis_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number
          thesis_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          comment_id: string | null
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          status: string
          thesis_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: string
          thesis_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          thesis_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          authors: string | null
          created_at: string
          id: string
          raw_citation: string
          search_vector: unknown
          thesis_id: string
          title: string | null
          year: number | null
        }
        Insert: {
          authors?: string | null
          created_at?: string
          id?: string
          raw_citation: string
          search_vector?: unknown
          thesis_id: string
          title?: string | null
          year?: number | null
        }
        Update: {
          authors?: string | null
          created_at?: string
          id?: string
          raw_citation?: string
          search_vector?: unknown
          thesis_id?: string
          title?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sources_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sources_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "theses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      theses: {
        Row: {
          abstract: string
          author_name: string
          created_at: string
          degree_type: string | null
          detected_language: string | null
          external_id: string | null
          external_url: string | null
          field: string
          file_url: string | null
          graduation_year: number | null
          id: string
          keywords: string[] | null
          origin: string
          search_vector: unknown
          title: string
          title_translated: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          abstract: string
          author_name: string
          created_at?: string
          degree_type?: string | null
          detected_language?: string | null
          external_id?: string | null
          external_url?: string | null
          field: string
          file_url?: string | null
          graduation_year?: number | null
          id?: string
          keywords?: string[] | null
          origin?: string
          search_vector?: unknown
          title: string
          title_translated?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          abstract?: string
          author_name?: string
          created_at?: string
          degree_type?: string | null
          detected_language?: string | null
          external_id?: string | null
          external_url?: string | null
          field?: string
          file_url?: string | null
          graduation_year?: number | null
          id?: string
          keywords?: string[] | null
          origin?: string
          search_vector?: unknown
          title?: string
          title_translated?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      profiles_public: {
        Row: {
          completed_quests_count: number | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          completed_quests_count?: never
          user_id?: string | null
          username?: string | null
        }
        Update: {
          completed_quests_count?: never
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      theses_public: {
        Row: {
          abstract: string | null
          author_name: string | null
          created_at: string | null
          field: string | null
          graduation_year: number | null
          id: string | null
          search_vector: unknown
          title: string | null
        }
        Insert: {
          abstract?: string | null
          author_name?: string | null
          created_at?: string | null
          field?: string | null
          graduation_year?: number | null
          id?: string | null
          search_vector?: unknown
          title?: string | null
        }
        Update: {
          abstract?: string | null
          author_name?: string | null
          created_at?: string | null
          field?: string | null
          graduation_year?: number | null
          id?: string | null
          search_vector?: unknown
          title?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_chat_logs: { Args: never; Returns: undefined }
      get_field_essentials: {
        Args: { _field?: string; _limit?: number; _min_theses?: number }
        Returns: {
          authors: string
          sample_citation: string
          thesis_count: number
          title: string
          year: number
        }[]
      }
      get_related_theses: {
        Args: { _limit?: number; _min_shared?: number; _thesis_id: string }
        Returns: {
          author_name: string
          degree_type: string
          field: string
          shared_sources: number
          thesis_id: string
          title: string
        }[]
      }
      get_thesis_accuracy: { Args: { thesis_uuid: string }; Returns: number }
      get_thesis_avg_rating: { Args: { thesis_uuid: string }; Returns: number }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      normalize_citation_title: { Args: { _title: string }; Returns: string }
      notify_thesis_owner: {
        Args: { _actor_id: string; _thesis_id: string; _type: string }
        Returns: undefined
      }
      unaccent_immutable: { Args: { _text: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
