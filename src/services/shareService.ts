import { supabase } from '../lib/supabase';
import { SharedReport, ApiResponse } from '../types';

interface ShareReportParams {
  reportId: string;
  vehicleId: string;
  sharedTo: string[];
  message?: string;
}

class ShareService {
  async shareReport(params: ShareReportParams): Promise<ApiResponse<SharedReport>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('shared_reports')
        .insert({
          report_id: params.reportId,
          vehicle_id: params.vehicleId,
          shared_by: user.id,
          shared_to: params.sharedTo,
          message: params.message || null,
          shared_at: new Date().toISOString(),
        })
        .select(`
          *,
          user_profiles!shared_reports_shared_by_fkey(name)
        `)
        .single();

      if (error) {
        throw error;
      }

      const sharedReport: SharedReport = {
        id: data.id,
        reportId: data.report_id,
        vehicleId: data.vehicle_id,
        sharedBy: data.shared_by,
        sharedByName: data.user_profiles?.name,
        sharedTo: data.shared_to,
        message: data.message,
        sharedAt: data.shared_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: sharedReport,
        success: true,
        message: 'Report shared successfully',
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share report';
      console.error('Share report error:', error);
      throw new Error(errorMessage);
    }
  }

  async getSharedReportsByVehicle(vehicleId: string): Promise<ApiResponse<SharedReport[]>> {
    try {
      const { data, error } = await supabase
        .from('shared_reports')
        .select(`
          *,
          user_profiles!shared_reports_shared_by_fkey(name)
        `)
        .eq('vehicle_id', vehicleId)
        .order('shared_at', { ascending: false });

      if (error) {
        throw error;
      }

      const sharedReports: SharedReport[] = (data || []).map((row) => ({
        id: row.id,
        reportId: row.report_id,
        vehicleId: row.vehicle_id,
        sharedBy: row.shared_by,
        sharedByName: row.user_profiles?.name,
        sharedTo: row.shared_to,
        message: row.message,
        sharedAt: row.shared_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return {
        data: sharedReports,
        success: true,
        message: 'Shared reports retrieved successfully',
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get shared reports';
      console.error('Get shared reports error:', error);
      throw new Error(errorMessage);
    }
  }

  async getLatestSharedReport(vehicleId: string): Promise<SharedReport | null> {
    try {
      const { data, error } = await supabase
        .from('shared_reports')
        .select(`
          *,
          user_profiles!shared_reports_shared_by_fkey(name)
        `)
        .eq('vehicle_id', vehicleId)
        .order('shared_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        reportId: data.report_id,
        vehicleId: data.vehicle_id,
        sharedBy: data.shared_by,
        sharedByName: data.user_profiles?.name,
        sharedTo: data.shared_to,
        message: data.message,
        sharedAt: data.shared_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get latest shared report';
      console.error('Get latest shared report error:', error);
      throw new Error(errorMessage);
    }
  }
}

export const shareService = new ShareService();
