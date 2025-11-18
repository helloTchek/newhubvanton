export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          mother_company: string | null
          address: string
          email: string
          phone: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          mother_company?: string | null
          address: string
          email: string
          phone: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          mother_company?: string | null
          address?: string
          email?: string
          phone?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          name: string
          role: 'admin' | 'inspector' | 'manager' | 'viewer'
          company_id: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          role: 'admin' | 'inspector' | 'manager' | 'viewer'
          company_id?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: 'admin' | 'inspector' | 'manager' | 'viewer'
          company_id?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          registration: string
          make: string
          model: string
          year: number
          mileage: number
          company_id: string
          status: 'inspection_in_progress' | 'inspected' | 'to_review'
          estimated_value: number
          estimated_cost: number
          image_url: string | null
          customer_email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registration: string
          make: string
          model: string
          year: number
          mileage?: number
          company_id: string
          status?: 'inspection_in_progress' | 'inspected' | 'to_review'
          estimated_value?: number
          estimated_cost?: number
          image_url?: string | null
          customer_email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registration?: string
          make?: string
          model?: string
          year?: number
          mileage?: number
          company_id?: string
          status?: 'inspection_in_progress' | 'inspected' | 'to_review'
          estimated_value?: number
          estimated_cost?: number
          image_url?: string | null
          customer_email?: string
          created_at?: string
          updated_at?: string
        }
      }
      inspection_reports: {
        Row: {
          id: string
          vehicle_id: string
          tchek_id: string
          inspector_id: string
          report_date: string
          photos_date: string
          total_cost: number
          report_status: 'draft' | 'completed' | 'reviewed' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          tchek_id: string
          inspector_id: string
          report_date?: string
          photos_date?: string
          total_cost?: number
          report_status?: 'draft' | 'completed' | 'reviewed' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          tchek_id?: string
          inspector_id?: string
          report_date?: string
          photos_date?: string
          total_cost?: number
          report_status?: 'draft' | 'completed' | 'reviewed' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      inspection_sections: {
        Row: {
          id: string
          name: string
          icon: string
          sort_order: number
          requires_images: boolean
          requires_ai_analysis: boolean
          requires_human_review: boolean
          is_images_mandatory: boolean
          is_ai_analysis_mandatory: boolean
          is_human_review_mandatory: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string
          sort_order?: number
          requires_images?: boolean
          requires_ai_analysis?: boolean
          requires_human_review?: boolean
          is_images_mandatory?: boolean
          is_ai_analysis_mandatory?: boolean
          is_human_review_mandatory?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          sort_order?: number
          requires_images?: boolean
          requires_ai_analysis?: boolean
          requires_human_review?: boolean
          is_images_mandatory?: boolean
          is_ai_analysis_mandatory?: boolean
          is_human_review_mandatory?: boolean
          created_at?: string
        }
      }
      report_sections: {
        Row: {
          id: string
          report_id: string
          section_id: string
          status: 'passed' | 'minor_issues' | 'major_issues' | 'failed'
          section_status: 'missing_data' | 'needs_review' | 'reviewed' | 'inspect'
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_id: string
          section_id: string
          status?: 'passed' | 'minor_issues' | 'major_issues' | 'failed'
          section_status?: 'missing_data' | 'needs_review' | 'reviewed' | 'inspect'
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          section_id?: string
          status?: 'passed' | 'minor_issues' | 'major_issues' | 'failed'
          section_status?: 'missing_data' | 'needs_review' | 'reviewed' | 'inspect'
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inspection_items: {
        Row: {
          id: string
          report_section_id: string
          name: string
          status: 'passed' | 'minor_issues' | 'major_issues' | 'failed'
          severity: 'low' | 'medium' | 'high' | null
          notes: string | null
          estimated_cost: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_section_id: string
          name: string
          status?: 'passed' | 'minor_issues' | 'major_issues' | 'failed'
          severity?: 'low' | 'medium' | 'high' | null
          notes?: string | null
          estimated_cost?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_section_id?: string
          name?: string
          status?: 'passed' | 'minor_issues' | 'major_issues' | 'failed'
          severity?: 'low' | 'medium' | 'high' | null
          notes?: string | null
          estimated_cost?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
