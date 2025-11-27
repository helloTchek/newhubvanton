import { apiClient, ApiError } from './api';
import { mockVehicles, mockVehicleReports } from './mockData';
import { Vehicle, VehicleInspectionReport, SearchFilters, ApiResponse, InspectionStatus, PaginationMetadata } from '../types';
import { supabase } from '../lib/supabase';

class VehicleService {
  async getVehicleInspections(vehicleId: string, currentReportId?: string): Promise<ApiResponse<any[]>> {
    try {
      const { data: currentVehicle, error: currentError } = await supabase
        .from('vehicles')
        .select('registration, vin')
        .eq('id', vehicleId)
        .maybeSingle();

      if (currentError) {
        throw new Error(currentError.message);
      }

      if (!currentVehicle) {
        throw new Error('Vehicle not found');
      }

      let vehiclesQuery = supabase
        .from('vehicles')
        .select('id, registration, vin');

      if (currentVehicle.vin) {
        vehiclesQuery = vehiclesQuery.eq('vin', currentVehicle.vin);
      } else {
        vehiclesQuery = vehiclesQuery.eq('registration', currentVehicle.registration);
      }

      const { data: allVehicles, error: vehiclesError } = await vehiclesQuery;

      if (vehiclesError) {
        throw new Error(vehiclesError.message);
      }

      if (!allVehicles || allVehicles.length === 0) {
        return {
          data: [],
          success: true,
          message: 'No inspections found'
        };
      }

      const vehicleIds = allVehicles.map(v => v.id);

      let reportsQuery = supabase
        .from('inspection_reports')
        .select(`
          *,
          vehicle:vehicles (
            id,
            registration,
            vin,
            make,
            model,
            mileage,
            status,
            inspection_date,
            inspection_type,
            images,
            tchek_id
          )
        `)
        .in('vehicle_id', vehicleIds)
        .order('report_date', { ascending: false });

      if (currentReportId) {
        reportsQuery = reportsQuery.neq('id', currentReportId);
      }

      const { data: inspectionReports, error: reportsError } = await reportsQuery;

      if (reportsError) {
        throw new Error(reportsError.message);
      }

      return {
        data: inspectionReports || [],
        success: true,
        message: 'Vehicle inspections retrieved successfully'
      };
    } catch (error: unknown) {
      console.error('getVehicleInspections error:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch vehicle inspections');
    }
  }

  async getVehicles(filters?: SearchFilters): Promise<ApiResponse<Vehicle[]>> {
    try {
      console.log('getVehicles called with filters:', filters);
      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // First, get total count for pagination
      let countQuery = supabase
        .from('vehicles')
        .select('id', { count: 'exact', head: true });

      // Apply the same filters to count query
      if (filters?.query) {
        const searchQuery = filters.query.toLowerCase();
        countQuery = countQuery.or(`registration.ilike.%${searchQuery}%,make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%`);
      }

      if (filters?.statusIds && filters.statusIds.length > 0) {
        countQuery = countQuery.in('status', filters.statusIds);
      } else if (filters?.status && filters.status !== 'all') {
        countQuery = countQuery.eq('status', filters.status);
      }

      if (filters?.companyId && filters.companyId !== 'all') {
        // Validate that companyId is a valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(filters.companyId)) {
          countQuery = countQuery.eq('company_id', filters.companyId);
        }
      }

      if (filters?.inspectionTypeIds && filters.inspectionTypeIds.length > 0) {
        countQuery = countQuery.in('inspection_type', filters.inspectionTypeIds);
      } else if (filters?.inspectionType && filters.inspectionType !== 'all') {
        countQuery = countQuery.eq('inspection_type', filters.inspectionType);
      }

      if (filters?.dateRange?.start && filters?.dateRange?.end) {
        countQuery = countQuery.gte('inspection_date', filters.dateRange.start)
          .lte('inspection_date', filters.dateRange.end);
      }

      if (filters?.customerEmail) {
        countQuery = countQuery.ilike('customer_email', `%${filters.customerEmail}%`);
      }

      if (filters?.customerPhone) {
        countQuery = countQuery.ilike('customer_phone', `%${filters.customerPhone}%`);
      }

      if (filters?.repairCostRange?.min !== undefined && filters.repairCostRange.min !== null) {
        countQuery = countQuery.gte('estimated_cost', filters.repairCostRange.min);
      }

      if (filters?.repairCostRange?.max !== undefined && filters.repairCostRange.max !== null) {
        countQuery = countQuery.lte('estimated_cost', filters.repairCostRange.max);
      }

      if (filters?.mileageRange?.min !== undefined && filters.mileageRange.min !== null) {
        countQuery = countQuery.gte('mileage', filters.mileageRange.min);
      }

      if (filters?.mileageRange?.max !== undefined && filters.mileageRange.max !== null) {
        countQuery = countQuery.lte('mileage', filters.mileageRange.max);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw countError;
      }

      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / pageSize);

      // Now fetch the paginated data
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          companies(
            id,
            name,
            is_fast_track_disabled
          ),
          inspection_reports(
            id,
            manual_review_completed,
            manual_review_completed_at,
            manual_review_completed_by
          ),
          vehicle_tags(
            tag_id,
            tags(
              id,
              name,
              color
            )
          )
        `)
        .range(from, to);

      if (filters?.query) {
        const searchQuery = filters.query.toLowerCase();
        query = query.or(`registration.ilike.%${searchQuery}%,make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%`);
      }

      if (filters?.statusIds && filters.statusIds.length > 0) {
        query = query.in('status', filters.statusIds);
      } else if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.companyId && filters.companyId !== 'all') {
        // Validate that companyId is a valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(filters.companyId)) {
          query = query.eq('company_id', filters.companyId);
        }
      }

      if (filters?.inspectionTypeIds && filters.inspectionTypeIds.length > 0) {
        query = query.in('inspection_type', filters.inspectionTypeIds);
      } else if (filters?.inspectionType && filters.inspectionType !== 'all') {
        query = query.eq('inspection_type', filters.inspectionType);
      }

      if (filters?.dateRange?.start && filters?.dateRange?.end) {
        query = query.gte('inspection_date', filters.dateRange.start)
          .lte('inspection_date', filters.dateRange.end);
      }

      if (filters?.customerEmail) {
        query = query.ilike('customer_email', `%${filters.customerEmail}%`);
      }

      if (filters?.customerPhone) {
        query = query.ilike('customer_phone', `%${filters.customerPhone}%`);
      }

      if (filters?.repairCostRange?.min !== undefined && filters.repairCostRange.min !== null) {
        query = query.gte('estimated_cost', filters.repairCostRange.min);
      }

      if (filters?.repairCostRange?.max !== undefined && filters.repairCostRange.max !== null) {
        query = query.lte('estimated_cost', filters.repairCostRange.max);
      }

      if (filters?.mileageRange?.min !== undefined && filters.mileageRange.min !== null) {
        query = query.gte('mileage', filters.mileageRange.min);
      }

      if (filters?.mileageRange?.max !== undefined && filters.mileageRange.max !== null) {
        query = query.lte('mileage', filters.mileageRange.max);
      }

      if (filters?.tagIds && filters.tagIds.length > 0) {
        query = query.in('id',
          supabase
            .from('vehicle_tags')
            .select('vehicle_id')
            .in('tag_id', filters.tagIds)
        );
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'date';
      const sortOrder = filters?.sortOrder || 'desc';
      const ascending = sortOrder === 'asc';

      switch (sortBy) {
        case 'date':
          query = query.order('inspection_date', { ascending, nullsFirst: false });
          break;
        case 'registration':
          query = query.order('registration', { ascending });
          break;
        case 'make':
          query = query.order('make', { ascending }).order('model', { ascending });
          break;
        case 'value':
          query = query.order('estimated_value', { ascending });
          break;
        case 'repairCost':
          query = query.order('estimated_cost', { ascending });
          break;
        case 'mileage':
          query = query.order('mileage', { ascending });
          break;
        case 'status':
          query = query.order('status', { ascending });
          break;
        default:
          query = query.order('inspection_date', { ascending: false, nullsFirst: false });
      }

      const { data, error } = await query;

      console.log('Query result:', { dataCount: data?.length, error, totalItems });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      const vehiclesWithReports = (data || []).map(async (row: any) => {
        let damageInfo = undefined;
        let reportId = undefined;
        const isFastTrackDisabled = row.companies?.is_fast_track_disabled || false;
        const manualReviewCompleted = row.inspection_reports?.[0]?.manual_review_completed || false;

        if (row.inspection_reports && row.inspection_reports.length > 0) {
          reportId = row.inspection_reports[0].id;
          // Always fetch damage info if we have a report
          damageInfo = await this.getDamageInfo(reportId);
        }

        // Determine actual status based on fast track settings
        let actualStatus = row.status;
        if (row.status === 'inspected' && !isFastTrackDisabled && !manualReviewCompleted) {
          actualStatus = 'to_review';
        }

        // Map vehicle tags
        const tags = (row.vehicle_tags || [])
          .map((vt: any) => vt.tags)
          .filter((tag: any) => tag !== null);

        return {
          id: row.id,
          registration: row.registration,
          vin: row.vin,
          make: row.make,
          model: row.model,
          year: row.year,
          mileage: row.mileage,
          companyId: row.company_id,
          companyName: row.companies?.name || '',
          status: actualStatus,
          inspectionDate: row.inspection_date,
          estimatedValue: parseFloat(row.estimated_value || 0),
          estimatedCost: parseFloat(row.estimated_cost || 0),
          imageUrl: row.image_url || '',
          images: row.images || undefined,
          customerEmail: row.customer_email,
          customerPhone: row.customer_phone,
          inspectionType: row.inspection_type,
          reportId,
          damageInfo,
          isFastTrackDisabled,
          manualReviewCompleted,
          tags
        };
      });

      const vehicles = await Promise.all(vehiclesWithReports);

      const pagination: PaginationMetadata = {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages
      };

      return {
        data: vehicles,
        success: true,
        message: 'Vehicles retrieved successfully',
        pagination
      };
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      throw new ApiError('Failed to fetch vehicles', 'FETCH_VEHICLES_ERROR');
    }
  }
  
  async getVehicleById(id: string): Promise<ApiResponse<Vehicle>> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          companies(
            id,
            name
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new ApiError('Vehicle not found', 'VEHICLE_NOT_FOUND');
      }

      const vehicle: Vehicle = {
        id: data.id,
        registration: data.registration,
        vin: data.vin,
        make: data.make,
        model: data.model,
        year: data.year,
        mileage: data.mileage,
        companyId: data.company_id,
        companyName: data.companies?.name || '',
        status: data.status,
        inspectionDate: data.inspection_date,
        estimatedValue: parseFloat(data.estimated_value || 0),
        estimatedCost: parseFloat(data.estimated_cost || 0),
        imageUrl: data.image_url || '',
        customerEmail: data.customer_email,
        customerPhone: data.customer_phone,
        inspectionType: data.inspection_type
      };

      return {
        data: vehicle,
        success: true,
        message: 'Vehicle retrieved successfully'
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Failed to fetch vehicle:', error);
      throw new ApiError('Failed to fetch vehicle', 'FETCH_VEHICLE_ERROR');
    }
  }
  
  async getVehicleReport(vehicleId: string): Promise<ApiResponse<VehicleInspectionReport>> {
    try {
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select(`
          *,
          companies(id, name)
        `)
        .eq('id', vehicleId)
        .maybeSingle();

      if (vehicleError) throw vehicleError;
      if (!vehicleData) throw new ApiError('Vehicle not found', 'VEHICLE_NOT_FOUND');

      const { data: reportData, error: reportError } = await supabase
        .from('inspection_reports')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .maybeSingle();

      if (reportError) throw reportError;
      if (!reportData) throw new ApiError('Vehicle report not found', 'REPORT_NOT_FOUND');

      const vehicle: Vehicle = {
        id: vehicleData.id,
        registration: vehicleData.registration,
        vin: vehicleData.vin,
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        mileage: vehicleData.mileage,
        companyId: vehicleData.company_id,
        companyName: vehicleData.companies?.name || '',
        status: vehicleData.status,
        inspectionDate: vehicleData.inspection_date,
        estimatedValue: parseFloat(vehicleData.estimated_value || 0),
        estimatedCost: parseFloat(vehicleData.estimated_cost || 0),
        imageUrl: vehicleData.image_url || '',
        customerEmail: vehicleData.customer_email,
        customerPhone: vehicleData.customer_phone,
        inspectionType: vehicleData.inspection_type
      };

      const report: VehicleInspectionReport = {
        id: reportData.id,
        vehicleId: vehicleData.id,
        tchekId: reportData.tchek_id,
        reportDate: reportData.report_date || vehicleData.inspection_date,
        photosDate: reportData.photos_date || reportData.report_date || vehicleData.inspection_date,
        inspector: {
          name: 'Inspector',
          email: 'inspector@tchek.com',
          phone: '+33 1 23 45 67 89',
          company: vehicleData.companies?.name || ''
        },
        customer: {
          name: 'Customer',
          email: vehicleData.customer_email || '',
          phone: vehicleData.customer_phone || '',
          company: vehicleData.companies?.name || ''
        },
        vehicle: vehicle,
        inspectionOverview: [],
        totalCost: parseFloat(reportData.total_cost || 0),
        reportStatus: reportData.report_status as any || 'completed'
      };

      return {
        data: report,
        success: true,
        message: 'Vehicle report retrieved successfully'
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch vehicle report', 'FETCH_REPORT_ERROR');
    }
  }
  
  private async getDamageInfo(reportId: string) {
    try {
      const { data: damages, error } = await supabase
        .from('damages')
        .select('section_id, part_name')
        .eq('report_id', reportId)
        .neq('status', 'false_positive');

      if (error) {
        console.error('Failed to fetch damages:', error);
        return undefined;
      }

      const damageCounts = {
        carBody: 0,
        interior: 0,
        glazing: 0,
        dashboard: 0,
        declarations: 0,
        tires: 0,
        rims: 0
      };

      const tiresDamaged = {
        frontLeft: false,
        frontRight: false,
        rearLeft: false,
        rearRight: false
      };

      const rimsDamaged = {
        frontLeft: false,
        frontRight: false,
        rearLeft: false,
        rearRight: false
      };

      (damages || []).forEach((damage: any) => {
        const sectionId = damage.section_id?.toLowerCase() || '';
        const partName = damage.part_name?.toLowerCase() || '';

        if (sectionId.includes('section-body') || sectionId.includes('body') || sectionId.includes('carbody')) {
          damageCounts.carBody++;
        } else if (sectionId.includes('section-interior') || sectionId.includes('cabin') || sectionId.includes('interior')) {
          damageCounts.interior++;
        } else if (sectionId.includes('section-glass') || sectionId.includes('glass') || sectionId.includes('glazing')) {
          damageCounts.glazing++;
        } else if (sectionId.includes('section-motor') || sectionId.includes('dashboard') || sectionId.includes('motor') || sectionId.includes('warning')) {
          damageCounts.dashboard++;
        } else if (sectionId.includes('section-documents') || sectionId.includes('declaration') || sectionId.includes('documents')) {
          damageCounts.declarations++;
        }

        if (sectionId.includes('section-tires') || sectionId.includes('tire') || sectionId.includes('tires') || partName.includes('tire') || partName.includes('pneu')) {
          damageCounts.tires++;
          if (partName.includes('front') && partName.includes('left')) {
            tiresDamaged.frontLeft = true;
          } else if (partName.includes('front') && partName.includes('right')) {
            tiresDamaged.frontRight = true;
          } else if (partName.includes('rear') && partName.includes('left')) {
            tiresDamaged.rearLeft = true;
          } else if (partName.includes('rear') && partName.includes('right')) {
            tiresDamaged.rearRight = true;
          }
        }

        if (sectionId.includes('section-rim') || sectionId.includes('rim') || partName.includes('rim') || partName.includes('jante')) {
          damageCounts.rims++;
          if (partName.includes('front') && partName.includes('left')) {
            rimsDamaged.frontLeft = true;
          } else if (partName.includes('front') && partName.includes('right')) {
            rimsDamaged.frontRight = true;
          } else if (partName.includes('rear') && partName.includes('left')) {
            rimsDamaged.rearLeft = true;
          } else if (partName.includes('rear') && partName.includes('right')) {
            rimsDamaged.rearRight = true;
          }
        }
      });

      return { damageCounts, tiresDamaged, rimsDamaged };
    } catch (error) {
      console.error('Error fetching damage info:', error);
      return undefined;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const vehicleService = new VehicleService();