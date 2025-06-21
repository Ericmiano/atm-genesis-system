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
      admin_actions: {
        Row: {
          action: Database["public"]["Enums"]["admin_action_type"]
          admin_id: string
          details: string
          id: string
          reason: string | null
          target_loan_id: string | null
          target_user_id: string | null
          timestamp: string
        }
        Insert: {
          action: Database["public"]["Enums"]["admin_action_type"]
          admin_id: string
          details: string
          id?: string
          reason?: string | null
          target_loan_id?: string | null
          target_user_id?: string | null
          timestamp?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["admin_action_type"]
          admin_id?: string
          details?: string
          id?: string
          reason?: string | null
          target_loan_id?: string | null
          target_user_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_target_loan_id_fkey"
            columns: ["target_loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      atm_sessions: {
        Row: {
          end_time: string | null
          id: string
          is_active: boolean
          session_id: string
          start_time: string
          user_id: string
        }
        Insert: {
          end_time?: string | null
          id?: string
          is_active?: boolean
          session_id: string
          start_time?: string
          user_id: string
        }
        Update: {
          end_time?: string | null
          id?: string
          is_active?: boolean
          session_id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "atm_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          details: string
          id: string
          ip_address: unknown | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details: string
          id?: string
          ip_address?: unknown | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: string
          id?: string
          ip_address?: unknown | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          name: string
          type: Database["public"]["Enums"]["bill_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["bill_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["bill_type"]
        }
        Relationships: []
      }
      fraud_alerts: {
        Row: {
          description: string
          id: string
          resolved: boolean
          severity: Database["public"]["Enums"]["fraud_severity"]
          timestamp: string
          type: Database["public"]["Enums"]["fraud_alert_type"]
          user_id: string
        }
        Insert: {
          description: string
          id?: string
          resolved?: boolean
          severity: Database["public"]["Enums"]["fraud_severity"]
          timestamp?: string
          type: Database["public"]["Enums"]["fraud_alert_type"]
          user_id: string
        }
        Update: {
          description?: string
          id?: string
          resolved?: boolean
          severity?: Database["public"]["Enums"]["fraud_severity"]
          timestamp?: string
          type?: Database["public"]["Enums"]["fraud_alert_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_payments: {
        Row: {
          amount: number
          id: string
          interest_portion: number
          loan_id: string
          payment_date: string
          principal_portion: number
          remaining_balance: number
          status: Database["public"]["Enums"]["transaction_status"]
        }
        Insert: {
          amount: number
          id?: string
          interest_portion: number
          loan_id: string
          payment_date?: string
          principal_portion: number
          remaining_balance: number
          status?: Database["public"]["Enums"]["transaction_status"]
        }
        Update: {
          amount?: number
          id?: string
          interest_portion?: number
          loan_id?: string
          payment_date?: string
          principal_portion?: number
          remaining_balance?: number
          status?: Database["public"]["Enums"]["transaction_status"]
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          application_date: string
          approval_date: string | null
          collateral: string | null
          created_at: string
          disbursement_date: string | null
          id: string
          interest_rate: number
          monthly_payment: number
          next_payment_date: string | null
          principal: number
          purpose: string
          remaining_balance: number
          status: Database["public"]["Enums"]["loan_status"]
          term_months: number
          total_amount: number
          type: Database["public"]["Enums"]["loan_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          application_date?: string
          approval_date?: string | null
          collateral?: string | null
          created_at?: string
          disbursement_date?: string | null
          id?: string
          interest_rate: number
          monthly_payment: number
          next_payment_date?: string | null
          principal: number
          purpose: string
          remaining_balance: number
          status?: Database["public"]["Enums"]["loan_status"]
          term_months: number
          total_amount: number
          type: Database["public"]["Enums"]["loan_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          application_date?: string
          approval_date?: string | null
          collateral?: string | null
          created_at?: string
          disbursement_date?: string | null
          id?: string
          interest_rate?: number
          monthly_payment?: number
          next_payment_date?: string | null
          principal?: number
          purpose?: string
          remaining_balance?: number
          status?: Database["public"]["Enums"]["loan_status"]
          term_months?: number
          total_amount?: number
          type?: Database["public"]["Enums"]["loan_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          description: string
          from_account: string | null
          id: string
          loan_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          timestamp: string
          to_account: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          description: string
          from_account?: string | null
          id?: string
          loan_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          timestamp?: string
          to_account?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          description?: string
          from_account?: string | null
          id?: string
          loan_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          timestamp?: string
          to_account?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_number: string
          balance: number
          card_number: string
          card_type: Database["public"]["Enums"]["card_type"]
          created_at: string
          credit_score: number | null
          cvv: string
          email: string
          expiry_date: string
          failed_attempts: number
          failed_password_attempts: number
          id: string
          is_locked: boolean
          last_login: string | null
          last_password_attempt: string | null
          lock_date: string | null
          lock_reason: string | null
          monthly_income: number | null
          must_change_password: boolean
          name: string
          password_last_changed: string | null
          pin: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string
        }
        Insert: {
          account_number: string
          balance?: number
          card_number: string
          card_type: Database["public"]["Enums"]["card_type"]
          created_at?: string
          credit_score?: number | null
          cvv: string
          email: string
          expiry_date: string
          failed_attempts?: number
          failed_password_attempts?: number
          id: string
          is_locked?: boolean
          last_login?: string | null
          last_password_attempt?: string | null
          lock_date?: string | null
          lock_reason?: string | null
          monthly_income?: number | null
          must_change_password?: boolean
          name: string
          password_last_changed?: string | null
          pin: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username: string
        }
        Update: {
          account_number?: string
          balance?: number
          card_number?: string
          card_type?: Database["public"]["Enums"]["card_type"]
          created_at?: string
          credit_score?: number | null
          cvv?: string
          email?: string
          expiry_date?: string
          failed_attempts?: number
          failed_password_attempts?: number
          id?: string
          is_locked?: boolean
          last_login?: string | null
          last_password_attempt?: string | null
          lock_date?: string | null
          lock_reason?: string | null
          monthly_income?: number | null
          must_change_password?: boolean
          name?: string
          password_last_changed?: string | null
          pin?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_account: {
        Args: {
          user_email: string
          user_password: string
          user_name: string
          initial_balance?: number
        }
        Returns: string
      }
      delete_user_account: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      generate_unique_account_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      admin_action_type:
        | "UNLOCK_ACCOUNT"
        | "RESET_PIN"
        | "RESET_PASSWORD"
        | "APPROVE_LOAN"
        | "REJECT_LOAN"
        | "SUSPEND_USER"
        | "ACTIVATE_USER"
        | "ADJUST_BALANCE"
        | "RESOLVE_FRAUD_ALERT"
      bill_type: "UTILITY" | "SUBSCRIPTION" | "CREDIT_CARD" | "LOAN"
      card_type: "VISA" | "MASTERCARD"
      fraud_alert_type:
        | "SUSPICIOUS_AMOUNT"
        | "MULTIPLE_ATTEMPTS"
        | "UNUSUAL_PATTERN"
        | "LARGE_LOAN_REQUEST"
      fraud_severity: "LOW" | "MEDIUM" | "HIGH"
      loan_status:
        | "PENDING"
        | "APPROVED"
        | "ACTIVE"
        | "COMPLETED"
        | "DEFAULTED"
        | "REJECTED"
      loan_type: "PERSONAL" | "BUSINESS" | "EMERGENCY" | "EDUCATION"
      transaction_status: "SUCCESS" | "FAILED" | "PENDING"
      transaction_type:
        | "WITHDRAWAL"
        | "DEPOSIT"
        | "TRANSFER"
        | "BALANCE_INQUIRY"
        | "BILL_PAYMENT"
        | "PIN_CHANGE"
        | "LOAN_DISBURSEMENT"
        | "LOAN_PAYMENT"
      user_role: "USER" | "ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
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
        "UNLOCK_ACCOUNT",
        "RESET_PIN",
        "RESET_PASSWORD",
        "APPROVE_LOAN",
        "REJECT_LOAN",
        "SUSPEND_USER",
        "ACTIVATE_USER",
        "ADJUST_BALANCE",
        "RESOLVE_FRAUD_ALERT",
      ],
      bill_type: ["UTILITY", "SUBSCRIPTION", "CREDIT_CARD", "LOAN"],
      card_type: ["VISA", "MASTERCARD"],
      fraud_alert_type: [
        "SUSPICIOUS_AMOUNT",
        "MULTIPLE_ATTEMPTS",
        "UNUSUAL_PATTERN",
        "LARGE_LOAN_REQUEST",
      ],
      fraud_severity: ["LOW", "MEDIUM", "HIGH"],
      loan_status: [
        "PENDING",
        "APPROVED",
        "ACTIVE",
        "COMPLETED",
        "DEFAULTED",
        "REJECTED",
      ],
      loan_type: ["PERSONAL", "BUSINESS", "EMERGENCY", "EDUCATION"],
      transaction_status: ["SUCCESS", "FAILED", "PENDING"],
      transaction_type: [
        "WITHDRAWAL",
        "DEPOSIT",
        "TRANSFER",
        "BALANCE_INQUIRY",
        "BILL_PAYMENT",
        "PIN_CHANGE",
        "LOAN_DISBURSEMENT",
        "LOAN_PAYMENT",
      ],
      user_role: ["USER", "ADMIN"],
    },
  },
} as const
