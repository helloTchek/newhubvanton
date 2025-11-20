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

    return {
      id: data.id,
      userId: data.user_id,
      viewMode: data.view_mode,
      filters: data.filters,
      sortBy: data.sort_by,
      sortOrder: data.sort_order,
      columnOrder: data.column_order,
      visibleColumns: data.visible_columns,
      visibleCardFields: data.visible_card_fields,
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
