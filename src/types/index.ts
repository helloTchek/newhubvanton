// Core data models
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt?: string;
  createdBy?: string;
}

export interface Company {
  id: string;
  name: string;
  motherCompany?: string;
  address: string;
  email: string;
  phone: string;
  vehicleCount: number;
  logo?: string;
  isFastTrackDisabled?: boolean;
}

export type ImageQuality = 'good' | 'acceptable' | 'bad' | 'none';
export type AIInspectionStatus = 'worked' | 'light_issue' | 'did_not_work' | 'none';
export type ManualReviewType = 'customer' | 'tchek' | null;

export interface AIInspectionInfo {
  imageQuality: ImageQuality;
  aiStatus: AIInspectionStatus;
  manualReviewType: ManualReviewType;
}

export interface Vehicle {
  id: string;
  registration: string;
  vin?: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  companyId: string;
  companyName: string;
  status: VehicleStatus;
  statusUpdatedAt?: string;
  inspectionDate?: string;
  estimatedValue: number;
  estimatedCost: number;
  imageUrl: string;
  images?: string[];
  customerEmail: string;
  customerPhone?: string;
  inspectionType?: InspectionType;
  reportId?: string;
  externalId?: string;
  damageInfo?: VehicleDamageInfo;
  isFastTrackDisabled?: boolean;
  manualReviewCompleted?: boolean;
  aiInspectionInfo?: AIInspectionInfo;
  sharedReport?: SharedReportInfo;
  tags?: Tag[];
}

export interface SharedReportInfo {
  id: string;
  sharedAt: string;
  sharedBy: string;
  sharedByName: string;
  sharedTo: string[];
  message?: string;
}

export interface SharedReport {
  id: string;
  reportId: string;
  vehicleId: string;
  sharedBy: string;
  sharedByName?: string;
  sharedTo: string[];
  message?: string;
  sharedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleDamageInfo {
  damageCounts: {
    carBody: number;
    interior: number;
    glazing: number;
    dashboard: number;
    declarations: number;
    tires: number;
    rims: number;
  };
  tiresDamaged: {
    frontLeft: boolean;
    frontRight: boolean;
    rearLeft: boolean;
    rearRight: boolean;
  };
  rimsDamaged: {
    frontLeft: boolean;
    frontRight: boolean;
    rearLeft: boolean;
    rearRight: boolean;
  };
}

export interface VehicleInspectionReport {
  id: string;
  vehicleId: string;
  tchekId: string;
  reportDate: string;
  photosDate: string;
  inspector: InspectorInfo;
  customer: CustomerInfo;
  vehicle: Vehicle;
  inspectionOverview: InspectionSection[];
  totalCost: number;
  reportStatus: ReportStatus;
  manualReviewCompleted?: boolean;
  manualReviewCompletedAt?: string;
  manualReviewCompletedBy?: string;
}

export interface InspectorInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface InspectionSection {
  id: string;
  name: string;
  status: InspectionStatus;
  items: InspectionItem[];
  icon: string;
  sectionStatus: SectionStatus;
  isVisible: boolean;
  configuration: SectionConfiguration;
}

export interface InspectionItem {
  id: string;
  name: string;
  status: InspectionStatus;
  severity?: 'low' | 'medium' | 'high';
  notes?: string;
  estimatedCost?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  companyName?: string;
  avatar?: string;
}

// New section management types
export interface SectionConfiguration {
  requiresImages: boolean;
  requiresAIAnalysis: boolean;
  requiresHumanReview: boolean;
  isImagesMandatory: boolean;
  isAIAnalysisMandatory: boolean;
  isHumanReviewMandatory: boolean;
}

export interface CompanyConfiguration {
  id: string;
  companyId: string;
  visibleSections: string[];
  sectionConfigurations: Record<string, SectionConfiguration>;
}

// Enums
export type VehicleStatus =
  | 'link_sent'
  | 'chased_up'
  | 'inspection_in_progress'
  | 'inspected'
  | 'to_review'
  | 'archived';
export type InspectionType = 'api' | 'manual_upload' | 'remote_inspection' | 'onsite_inspection';
export type InspectionStatus = 'passed' | 'minor_issues' | 'major_issues' | 'failed';
export type ReportStatus = 'draft' | 'completed' | 'reviewed' | 'archived';
export type UserRole = 'admin' | 'inspector' | 'manager' | 'viewer';
export type SectionStatus = 'missing_data' | 'needs_review' | 'reviewed' | 'inspect';

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  pagination?: PaginationMetadata;
}

export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export type FilterType =
  | 'inspectionType'
  | 'status'
  | 'dateRange'
  | 'company'
  | 'userId'
  | 'customerEmail'
  | 'customerPhone';

export type SortField = 'date' | 'registration' | 'make' | 'value' | 'status' | 'repairCost' | 'mileage';
export type SortOrder = 'asc' | 'desc';

export interface SearchFilters {
  query: string;
  status: VehicleStatus | 'all';
  statusIds?: VehicleStatus[];
  companyId: string | 'all';
  inspectionType?: InspectionType | 'all';
  inspectionTypeIds?: InspectionType[];
  dateRange?: {
    start: string;
    end: string;
  };
  repairCostRange?: {
    min?: number;
    max?: number;
  };
  mileageRange?: {
    min?: number;
    max?: number;
  };
  userId?: string | 'all';
  customerEmail?: string;
  customerPhone?: string;
  sharedStatus?: 'all' | 'shared' | 'not_shared';
  tagIds?: string[];
  sortBy?: SortField;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface ViewMode {
  vehicles: 'grid' | 'list';
  companies: 'grid' | 'list';
}