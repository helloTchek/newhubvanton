import { supabase } from '../lib/supabase';
import { ThemeConfiguration, ThemeConfigurationInput } from '../types/theme';

const mapDbToTheme = (data: any): ThemeConfiguration => ({
  id: data.id,
  companyId: data.company_id,
  logoUrl: data.logo_url,
  logoDarkUrl: data.logo_dark_url,
  primaryColor: data.primary_color,
  accentColor: data.accent_color,
  dominantColor: data.dominant_color,
  textPrimaryColor: data.text_primary_color,
  backgroundPrimaryColor: data.background_primary_color,
  isActive: data.is_active,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  createdBy: data.created_by
});

export const themeService = {
  async getActiveTheme(companyId?: string): Promise<ThemeConfiguration | null> {
    try {
      let query = supabase
        .from('theme_configurations')
        .select('*')
        .eq('is_active', true);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error fetching active theme:', error);
        return null;
      }

      return data ? mapDbToTheme(data) : null;
    } catch (error) {
      console.error('Error in getActiveTheme:', error);
      return null;
    }
  },

  async getThemeByCompanyId(companyId: string): Promise<ThemeConfiguration | null> {
    try {
      const { data, error } = await supabase
        .from('theme_configurations')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching theme by company:', error);
        return null;
      }

      return data ? mapDbToTheme(data) : null;
    } catch (error) {
      console.error('Error in getThemeByCompanyId:', error);
      return null;
    }
  },

  async createTheme(input: ThemeConfigurationInput): Promise<ThemeConfiguration> {
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('theme_configurations')
        .insert({
          company_id: input.companyId,
          logo_url: input.logoUrl,
          logo_dark_url: input.logoDarkUrl,
          primary_color: input.primaryColor,
          accent_color: input.accentColor,
          dominant_color: input.dominantColor,
          text_primary_color: input.textPrimaryColor,
          background_primary_color: input.backgroundPrimaryColor,
          created_by: userData.user?.id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return mapDbToTheme(data);
    } catch (error) {
      console.error('Error creating theme:', error);
      throw error;
    }
  },

  async updateTheme(themeId: string, input: Partial<ThemeConfigurationInput>): Promise<ThemeConfiguration> {
    try {
      const updateData: any = {};

      if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl;
      if (input.logoDarkUrl !== undefined) updateData.logo_dark_url = input.logoDarkUrl;
      if (input.primaryColor !== undefined) updateData.primary_color = input.primaryColor;
      if (input.accentColor !== undefined) updateData.accent_color = input.accentColor;
      if (input.dominantColor !== undefined) updateData.dominant_color = input.dominantColor;
      if (input.textPrimaryColor !== undefined) updateData.text_primary_color = input.textPrimaryColor;
      if (input.backgroundPrimaryColor !== undefined) updateData.background_primary_color = input.backgroundPrimaryColor;

      const { data, error } = await supabase
        .from('theme_configurations')
        .update(updateData)
        .eq('id', themeId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return mapDbToTheme(data);
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  },

  async deleteTheme(themeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('theme_configurations')
        .delete()
        .eq('id', themeId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error deleting theme:', error);
      throw error;
    }
  }
};
