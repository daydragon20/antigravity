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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          category: Database["public"]["Enums"]["activity_category"]
          created_at: string
          created_by: string | null
          description: string
          duration: number
          effects: Database["public"]["Enums"]["activity_effect"][]
          effort: Database["public"]["Enums"]["activity_effort"]
          id: string
          is_global: boolean
          location: string | null
          materials: string | null
          name: string
        }
        Insert: {
          category: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          created_by?: string | null
          description: string
          duration?: number
          effects?: Database["public"]["Enums"]["activity_effect"][]
          effort?: Database["public"]["Enums"]["activity_effort"]
          id?: string
          is_global?: boolean
          location?: string | null
          materials?: string | null
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          created_by?: string | null
          description?: string
          duration?: number
          effects?: Database["public"]["Enums"]["activity_effect"][]
          effort?: Database["public"]["Enums"]["activity_effort"]
          id?: string
          is_global?: boolean
          location?: string | null
          materials?: string | null
          name?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          activity_id: string | null
          activity_name: string
          completed_at: string
          energy_after: number | null
          energy_before: number | null
          id: string
          mood_after: number | null
          mood_before: number | null
          notes: string | null
          rating: number | null
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          activity_name: string
          completed_at?: string
          energy_after?: number | null
          energy_before?: number | null
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          rating?: number | null
          user_id: string
        }
        Update: {
          activity_id?: string | null
          activity_name?: string
          completed_at?: string
          energy_after?: number | null
          energy_before?: number | null
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      energy_logs: {
        Row: {
          energy: number
          id: string
          mood: number
          notes: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          energy: number
          id?: string
          mood: number
          notes?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          energy?: number
          id?: string
          mood?: number
          notes?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      health_reminders: {
        Row: {
          completed: boolean | null
          created_at: string
          duration: number | null
          id: string
          scheduled_time: string
          title: string
          type: Database["public"]["Enums"]["reminder_type"]
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          duration?: number | null
          id?: string
          scheduled_time: string
          title: string
          type: Database["public"]["Enums"]["reminder_type"]
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          duration?: number | null
          id?: string
          scheduled_time?: string
          title?: string
          type?: Database["public"]["Enums"]["reminder_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          break_duration: number | null
          created_at: string
          id: string
          max_tasks_per_block: number | null
          meal_times: Json | null
          movement_interval: number | null
          name: string | null
          notifications_enabled: boolean | null
          sleep_time: string | null
          snack_times: string[] | null
          updated_at: string
          user_id: string
          wake_time: string | null
          work_end_time: string | null
          work_start_time: string | null
        }
        Insert: {
          break_duration?: number | null
          created_at?: string
          id?: string
          max_tasks_per_block?: number | null
          meal_times?: Json | null
          movement_interval?: number | null
          name?: string | null
          notifications_enabled?: boolean | null
          sleep_time?: string | null
          snack_times?: string[] | null
          updated_at?: string
          user_id: string
          wake_time?: string | null
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Update: {
          break_duration?: number | null
          created_at?: string
          id?: string
          max_tasks_per_block?: number | null
          meal_times?: Json | null
          movement_interval?: number | null
          name?: string | null
          notifications_enabled?: boolean | null
          sleep_time?: string | null
          snack_times?: string[] | null
          updated_at?: string
          user_id?: string
          wake_time?: string | null
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean | null
          created_at: string
          deadline: string | null
          description: string | null
          duration: number
          effort: Database["public"]["Enums"]["effort_level"]
          id: string
          importance: number
          scheduled_time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          duration?: number
          effort?: Database["public"]["Enums"]["effort_level"]
          id?: string
          importance?: number
          scheduled_time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          duration?: number
          effort?: Database["public"]["Enums"]["effort_level"]
          id?: string
          importance?: number
          scheduled_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_category:
        | "energy_boost"
        | "rest_relaxation"
        | "mental_stimulation"
        | "physical_health"
        | "mental_wellbeing"
        | "creativity"
        | "social_interaction"
        | "education"
        | "self_reflection"
        | "mini_challenge"
      activity_effect:
        | "energy_boost"
        | "relaxation"
        | "focus"
        | "mental_stimulation"
        | "physical_improvement"
        | "social_connection"
        | "creativity"
        | "learning"
      activity_effort: "low" | "medium" | "high"
      effort_level: "low" | "medium" | "high"
      reminder_type: "meal" | "movement" | "rest"
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
      activity_category: [
        "energy_boost",
        "rest_relaxation",
        "mental_stimulation",
        "physical_health",
        "mental_wellbeing",
        "creativity",
        "social_interaction",
        "education",
        "self_reflection",
        "mini_challenge",
      ],
      activity_effect: [
        "energy_boost",
        "relaxation",
        "focus",
        "mental_stimulation",
        "physical_improvement",
        "social_connection",
        "creativity",
        "learning",
      ],
      activity_effort: ["low", "medium", "high"],
      effort_level: ["low", "medium", "high"],
      reminder_type: ["meal", "movement", "rest"],
    },
  },
} as const
