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
      contact_recipients: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          provider: string | null
          recipient_email: string
          related_id: string | null
          related_table: string | null
          status: string
          subject: string
          template_key: string | null
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          recipient_email: string
          related_id?: string | null
          related_table?: string | null
          status?: string
          subject: string
          template_key?: string | null
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          recipient_email?: string
          related_id?: string | null
          related_table?: string | null
          status?: string
          subject?: string
          template_key?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          id: string
          invoice_date: string
          invoice_number: string
          order_id: string
          pdf_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_date?: string
          invoice_number: string
          order_id: string
          pdf_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          order_id?: string
          pdf_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          incentive_id: string | null
          is_active: boolean
          last_email_sent_at: string | null
          last_seen_at: string | null
          promo_code: string | null
          promo_code_id: string | null
          source_path: string | null
          status: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          incentive_id?: string | null
          is_active?: boolean
          last_email_sent_at?: string | null
          last_seen_at?: string | null
          promo_code?: string | null
          promo_code_id?: string | null
          source_path?: string | null
          status?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          incentive_id?: string | null
          is_active?: boolean
          last_email_sent_at?: string | null
          last_seen_at?: string | null
          promo_code?: string | null
          promo_code_id?: string | null
          source_path?: string | null
          status?: string
          subscribed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_subscribers_incentive_id_fkey"
            columns: ["incentive_id"]
            isOneToOne: false
            referencedRelation: "popup_incentives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_subscribers_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          reference_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          is_preorder: boolean | null
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          size: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_preorder?: boolean | null
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          size: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          is_preorder?: boolean | null
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          size?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          customer_email: string
          customer_name: string | null
          id: string
          shipping_address: Json | null
          status: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email: string
          customer_name?: string | null
          id?: string
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id?: string | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string | null
          id?: string
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      popup_config: {
        Row: {
          cooldown_days: number
          cta_label: string
          display_delay_seconds: number
          display_scroll_percent: number
          exclude_paths: string[] | null
          id: string
          include_paths: string[] | null
          is_active: boolean
          rgpd_text: string
          subtitle: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cooldown_days?: number
          cta_label?: string
          display_delay_seconds?: number
          display_scroll_percent?: number
          exclude_paths?: string[] | null
          id?: string
          include_paths?: string[] | null
          is_active?: boolean
          rgpd_text?: string
          subtitle?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cooldown_days?: number
          cta_label?: string
          display_delay_seconds?: number
          display_scroll_percent?: number
          exclude_paths?: string[] | null
          id?: string
          include_paths?: string[] | null
          is_active?: boolean
          rgpd_text?: string
          subtitle?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      popup_incentives: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          promo_code: string
          short_desc: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          promo_code: string
          short_desc?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          promo_code?: string
          short_desc?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          position: number
          product_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          position?: number
          product_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          position?: number
          product_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          alert_threshold: number | null
          created_at: string
          id: string
          low_stock_threshold: number | null
          product_id: string
          size: number
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          alert_threshold?: number | null
          created_at?: string
          id?: string
          low_stock_threshold?: number | null
          product_id: string
          size: number
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          alert_threshold?: number | null
          created_at?: string
          id?: string
          low_stock_threshold?: number | null
          product_id?: string
          size?: number
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          alt_text: string | null
          category: string
          characteristics: Json | null
          color: string | null
          created_at: string
          description: string | null
          description_fournisseur: string | null
          featured_area: string | null
          featured_end_at: string | null
          featured_label: string | null
          featured_priority: number | null
          featured_start_at: string | null
          heel_height_cm: number | null
          id: string
          is_featured: boolean | null
          material: string | null
          name: string
          preorder: boolean | null
          preorder_notification_sent: boolean | null
          preorder_notification_threshold: number | null
          preorder_pending_count: number | null
          price: number
          reference_fournisseur: string | null
          slug: string | null
          tags: string[] | null
          tva_rate_id: string | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          category: string
          characteristics?: Json | null
          color?: string | null
          created_at?: string
          description?: string | null
          description_fournisseur?: string | null
          featured_area?: string | null
          featured_end_at?: string | null
          featured_label?: string | null
          featured_priority?: number | null
          featured_start_at?: string | null
          heel_height_cm?: number | null
          id: string
          is_featured?: boolean | null
          material?: string | null
          name: string
          preorder?: boolean | null
          preorder_notification_sent?: boolean | null
          preorder_notification_threshold?: number | null
          preorder_pending_count?: number | null
          price: number
          reference_fournisseur?: string | null
          slug?: string | null
          tags?: string[] | null
          tva_rate_id?: string | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          category?: string
          characteristics?: Json | null
          color?: string | null
          created_at?: string
          description?: string | null
          description_fournisseur?: string | null
          featured_area?: string | null
          featured_end_at?: string | null
          featured_label?: string | null
          featured_priority?: number | null
          featured_start_at?: string | null
          heel_height_cm?: number | null
          id?: string
          is_featured?: boolean | null
          material?: string | null
          name?: string
          preorder?: boolean | null
          preorder_notification_sent?: boolean | null
          preorder_notification_threshold?: number | null
          preorder_pending_count?: number | null
          price?: number
          reference_fournisseur?: string | null
          slug?: string | null
          tags?: string[] | null
          tva_rate_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_tva_rate_id_fkey"
            columns: ["tva_rate_id"]
            isOneToOne: false
            referencedRelation: "tva_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promo_assignments: {
        Row: {
          assigned_at: string
          email: string
          id: string
          promo_code_id: string
          subscriber_id: string
        }
        Insert: {
          assigned_at?: string
          email: string
          id?: string
          promo_code_id: string
          subscriber_id: string
        }
        Update: {
          assigned_at?: string
          email?: string
          id?: string
          promo_code_id?: string
          subscriber_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_assignments_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_assignments_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          label: string | null
          min_cart_amount: number | null
          starts_at: string | null
          type: string
          updated_at: string
          usage_limit_per_email: number
          usage_limit_total: number | null
          used_count: number
          value: number | null
        }
        Insert: {
          code: string
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          min_cart_amount?: number | null
          starts_at?: string | null
          type: string
          updated_at?: string
          usage_limit_per_email?: number
          usage_limit_total?: number | null
          used_count?: number
          value?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          min_cart_amount?: number | null
          starts_at?: string | null
          type?: string
          updated_at?: string
          usage_limit_per_email?: number
          usage_limit_total?: number | null
          used_count?: number
          value?: number | null
        }
        Relationships: []
      }
      shipments: {
        Row: {
          carrier: string | null
          created_at: string
          delivery_date: string | null
          id: string
          notes: string | null
          order_id: string
          shipment_date: string | null
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_id: string
          shipment_date?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          carrier?: string | null
          created_at?: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          shipment_date?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity_change: number
          reference_id: string | null
          size: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity_change: number
          reference_id?: string | null
          size: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity_change?: number
          reference_id?: string | null
          size?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      tva_rates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          rate: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          rate: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_email: { Args: never; Returns: string }
      generate_invoice_number: { Args: never; Returns: string }
      get_all_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
        }[]
      }
      get_user_email: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_preorder_count: {
        Args: { _product_id: string; _quantity: number }
        Returns: undefined
      }
      notify_admins: {
        Args: {
          _message: string
          _reference_id: string
          _title: string
          _type: string
        }
        Returns: undefined
      }
      notify_backoffice: {
        Args: {
          _message: string
          _reference_id: string
          _title: string
          _type: string
        }
        Returns: undefined
      }
      reserve_stock_for_order: {
        Args: { _order_id: string }
        Returns: undefined
      }
      sync_products_from_json: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "ADMIN" | "BACKOFFICE" | "USER"
      order_status:
        | "PENDING"
        | "PAID"
        | "CANCELLED"
        | "REFUNDED"
        | "A_PREPARER"
        | "EXPEDIE"
        | "LIVRE"
        | "RETOUR"
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
      app_role: ["ADMIN", "BACKOFFICE", "USER"],
      order_status: [
        "PENDING",
        "PAID",
        "CANCELLED",
        "REFUNDED",
        "A_PREPARER",
        "EXPEDIE",
        "LIVRE",
        "RETOUR",
      ],
    },
  },
} as const
