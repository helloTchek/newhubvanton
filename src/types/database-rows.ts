// Database row types for type-safe database interactions
// These represent the structure of data returned from Supabase queries

export interface DbDamageRow {
  id: string;
  report_id: string;
  image_id: string;
  damage_group_id: string | null;
  section_id: string;
  part_name: string;
  location: string;
  damage_type: string;
  severity: string;
  status: string;
  bounding_box: Record<string, number> | null;
  confidence_score: number;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbDamageImageRow {
  id: string;
  report_id: string;
  image_url: string;
  section_id: string;
  part_name: string;
  captured_at: string;
  created_at: string;
}

export interface DbVehicleRow {
  id: string;
  registration: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  company_id: string;
  status: string;
  inspection_date: string | null;
  estimated_value: number;
  estimated_cost: number;
  image_url: string;
  customer_email: string;
  customer_phone: string | null;
  inspection_type: string | null;
  report_id: string | null;
  is_fast_track_disabled: boolean;
  manual_review_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbCompanyRow {
  id: string;
  name: string;
  mother_company: string | null;
  address: string;
  email: string;
  phone: string;
  logo: string | null;
  is_fast_track_disabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbUserProfileRow {
  id: string;
  name: string;
  role: string;
  company_id: string | null;
  avatar_url: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}
