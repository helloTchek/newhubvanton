import { supabase } from '../lib/supabase';

export interface UserPreferences {
  id?: string;
  userId: string;
  viewMode: 'grid' | 'list';
  filters: {
    query?: string;
    status?: string;
    companyId?: string;
    inspectionType?: string;
    userId?: string;
    customerEmail?: string;
    customerPhone?: string;
  };
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  columnOrder: string[];
  visibleColumns: {
    image: boolean;
    registration: boolean;
    vin: boolean;
    makeModel: boolean;
    company: boolean;
    status: boolean;
    inspectionDate: boolean;
    inspectionId: boolean;
    inspectionType: boolean;
    aiInspectionBadge: boolean;
    mileage: boolean;
    value: boolean;
    tags: boolean;
    carBody: boolean;
    rim: boolean;
    glass: boolean;
    interior: boolean;
    tires: boolean;
    dashboard: boolean;
    declarations: boolean;
  };
  visibleCardFields: {
    image: boolean;
    registration: boolean;
    vin: boolean;
    makeModel: boolean;
    age: boolean;
    mileage: boolean;
    company: boolean;
    customerEmail: boolean;
    inspectionDate: boolean;
    inspectionId: boolean;
    inspectionType: boolean;
    aiInspectionBadge: boolean;
    repairCost: boolean;
    value: boolean;
    damageResults: boolean;
    tags: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

class UserPreferencesService {
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading user preferences:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Migrate old data format if needed
    const visibleColumns = data.visible_columns || {};

    // Remove deprecated 'vehicle' field and ensure all required fields exist
    const migratedVisibleColumns = {
      image: visibleColumns.image !== undefined ? visibleColumns.image : true,
      registration: visibleColumns.registration !== undefined ? visibleColumns.registration : true,
      vin: visibleColumns.vin !== undefined ? visibleColumns.vin : true,
      makeModel: visibleColumns.makeModel !== undefined ? visibleColumns.makeModel : true,
      company: visibleColumns.company !== undefined ? visibleColumns.company : true,
      status: visibleColumns.status !== undefined ? visibleColumns.status : true,
      inspectionDate: visibleColumns.inspectionDate !== undefined ? visibleColumns.inspectionDate : true,
      inspectionId: visibleColumns.inspectionId !== undefined ? visibleColumns.inspectionId : true,
      inspectionType: visibleColumns.inspectionType !== undefined ? visibleColumns.inspectionType : true,
      aiInspectionBadge: visibleColumns.aiInspectionBadge !== undefined ? visibleColumns.aiInspectionBadge : true,
      mileage: visibleColumns.mileage !== undefined ? visibleColumns.mileage : true,
      value: visibleColumns.value !== undefined ? visibleColumns.value : true,
      tags: visibleColumns.tags !== undefined ? visibleColumns.tags : true,
      carBody: visibleColumns.carBody !== undefined ? visibleColumns.carBody : true,
      rim: visibleColumns.rim !== undefined ? visibleColumns.rim : true,
      glass: visibleColumns.glass !== undefined ? visibleColumns.glass : true,
      interior: visibleColumns.interior !== undefined ? visibleColumns.interior : true,
      tires: visibleColumns.tires !== undefined ? visibleColumns.tires : true,
      dashboard: visibleColumns.dashboard !== undefined ? visibleColumns.dashboard : true,
      declarations: visibleColumns.declarations !== undefined ? visibleColumns.declarations : true,
    };

    const visibleCardFields = data.visible_card_fields || {};
    const migratedVisibleCardFields = {
      image: visibleCardFields.image !== undefined ? visibleCardFields.image : true,
      registration: visibleCardFields.registration !== undefined ? visibleCardFields.registration : true,
      vin: visibleCardFields.vin !== undefined ? visibleCardFields.vin : true,
      makeModel: visibleCardFields.makeModel !== undefined ? visibleCardFields.makeModel : true,
      age: visibleCardFields.age !== undefined ? visibleCardFields.age : true,
      mileage: visibleCardFields.mileage !== undefined ? visibleCardFields.mileage : true,
      company: visibleCardFields.company !== undefined ? visibleCardFields.company : true,
      customerEmail: visibleCardFields.customerEmail !== undefined ? visibleCardFields.customerEmail : true,
      inspectionDate: visibleCardFields.inspectionDate !== undefined ? visibleCardFields.inspectionDate : true,
      inspectionId: visibleCardFields.inspectionId !== undefined ? visibleCardFields.inspectionId : true,
      inspectionType: visibleCardFields.inspectionType !== undefined ? visibleCardFields.inspectionType : true,
      aiInspectionBadge: visibleCardFields.aiInspectionBadge !== undefined ? visibleCardFields.aiInspectionBadge : true,
      repairCost: visibleCardFields.repairCost !== undefined ? visibleCardFields.repairCost : true,
      value: visibleCardFields.value !== undefined ? visibleCardFields.value : true,
      damageResults: visibleCardFields.damageResults !== undefined ? visibleCardFields.damageResults : true,
      tags: visibleCardFields.tags !== undefined ? visibleCardFields.tags : true,
    };

    return {
      id: data.id,
      userId: data.user_id,
      viewMode: data.view_mode,
      filters: data.filters,
      sortBy: data.sort_by,
      sortOrder: data.sort_order,
      columnOrder: data.column_order,
      visibleColumns: migratedVisibleColumns,
      visibleCardFields: migratedVisibleCardFields,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: preferences.userId,
        view_mode: preferences.viewMode,
        filters: preferences.filters,
        sort_by: preferences.sortBy,
        sort_order: preferences.sortOrder,
        column_order: preferences.columnOrder,
        visible_columns: preferences.visibleColumns,
        visible_card_fields: preferences.visibleCardFields
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving user preferences:', error);
      throw new Error('Failed to save user preferences');
    }
  }
}

export const userPreferencesService = new UserPreferencesService();
