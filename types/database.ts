export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          linkedin_id: string | null;
          credits: number;
          role: "user" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          linkedin_id?: string | null;
          credits?: number;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          linkedin_id?: string | null;
          credits?: number;
          role?: "user" | "admin";
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          input_type: "linkedin_url" | "csv_upload" | "manual";
          linkedin_urls: string[];
          contact_type: "email" | "phone" | "both";
          quantity: number;
          amount_paid: number;
          paypal_order_id: string | null;
          email_draft_requested: boolean;
          status: "pending" | "processing" | "completed" | "failed" | "refunded";
          created_at: string;
          delivered_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          input_type: "linkedin_url" | "csv_upload" | "manual";
          linkedin_urls?: string[];
          contact_type: "email" | "phone" | "both";
          quantity: number;
          amount_paid: number;
          paypal_order_id?: string | null;
          email_draft_requested?: boolean;
          status?: "pending" | "processing" | "completed" | "failed" | "refunded";
          created_at?: string;
          delivered_at?: string | null;
        };
        Update: {
          input_type?: "linkedin_url" | "csv_upload" | "manual";
          linkedin_urls?: string[];
          contact_type?: "email" | "phone" | "both";
          quantity?: number;
          amount_paid?: number;
          paypal_order_id?: string | null;
          email_draft_requested?: boolean;
          status?: "pending" | "processing" | "completed" | "failed" | "refunded";
          delivered_at?: string | null;
        };
      };
      credit_logs: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: "purchase" | "usage" | "refund" | "admin_grant";
          note: string | null;
          admin_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: "purchase" | "usage" | "refund" | "admin_grant";
          note?: string | null;
          admin_id?: string | null;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
