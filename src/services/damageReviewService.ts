import { supabase } from '../lib/supabase';
import {
  DamageImage,
  Damage,
  DamageReviewSession,
  VehicleMetadata,
  DamageStatus,
  BoundingBox,
  PartReviewInfo,
  SectionReviewInfo,
  SECTION_PARTS
} from '../types/damageReview';
import { DbDamageRow, DbDamageImageRow } from '../types/database-rows';

export class DamageReviewService {
  // Helper function to convert snake_case database row to camelCase Damage object
  private static fromDbDamage(dbRow: DbDamageRow): Damage {
    return {
      id: dbRow.id,
      reportId: dbRow.report_id,
      imageId: dbRow.image_id,
      damageGroupId: dbRow.damage_group_id,
      sectionId: dbRow.section_id,
      partName: dbRow.part_name,
      location: dbRow.location,
      damageType: dbRow.damage_type,
      severity: dbRow.severity,
      status: dbRow.status,
      boundingBox: dbRow.bounding_box,
      confidenceScore: dbRow.confidence_score,
      reviewedBy: dbRow.reviewed_by,
      reviewedAt: dbRow.reviewed_at,
      notes: dbRow.notes,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };
  }

  // Helper for DamageImage
  private static fromDbDamageImage(dbRow: DbDamageImageRow): DamageImage {
    return {
      id: dbRow.id,
      reportId: dbRow.report_id,
      imageUrl: dbRow.image_url,
      sectionId: dbRow.section_id,
      partName: dbRow.part_name,
      capturedAt: dbRow.captured_at,
      createdAt: dbRow.created_at
    };
  }

  // Helper function to convert camelCase Damage object to snake_case for database
  private static toDbDamage(damage: Partial<Damage>): Record<string, any> {
    const dbObj: Record<string, any> = {};

    if (damage.reportId !== undefined) dbObj.report_id = damage.reportId;
    if (damage.imageId !== undefined) dbObj.image_id = damage.imageId;
    if (damage.damageGroupId !== undefined) dbObj.damage_group_id = damage.damageGroupId;
    if (damage.sectionId !== undefined) dbObj.section_id = damage.sectionId;
    if (damage.partName !== undefined) dbObj.part_name = damage.partName;
    if (damage.location !== undefined) dbObj.location = damage.location;
    if (damage.damageType !== undefined) dbObj.damage_type = damage.damageType;
    if (damage.severity !== undefined) dbObj.severity = damage.severity;
    if (damage.status !== undefined) dbObj.status = damage.status;
    if (damage.boundingBox !== undefined) dbObj.bounding_box = damage.boundingBox;
    if (damage.confidenceScore !== undefined) dbObj.confidence_score = damage.confidenceScore;
    if (damage.reviewedBy !== undefined) dbObj.reviewed_by = damage.reviewedBy;
    if (damage.reviewedAt !== undefined) dbObj.reviewed_at = damage.reviewedAt;
    if (damage.notes !== undefined) dbObj.notes = damage.notes;

    return dbObj;
  }

  // Damage Images
  static async getImagesForReport(reportId: string): Promise<DamageImage[]> {
    const { data, error } = await supabase
      .from('damage_images')
      .select('*')
      .eq('report_id', reportId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.fromDbDamageImage);
  }

  static async getImagesForSection(reportId: string, sectionId: string): Promise<DamageImage[]> {
    const { data, error } = await supabase
      .from('damage_images')
      .select('*')
      .eq('report_id', reportId)
      .eq('section_id', sectionId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.fromDbDamageImage);
  }

  static async getImagesForPart(reportId: string, sectionId: string, partName: string): Promise<DamageImage[]> {
    const { data, error } = await supabase
      .from('damage_images')
      .select('*')
      .eq('report_id', reportId)
      .eq('section_id', sectionId)
      .eq('part_name', partName)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.fromDbDamageImage);
  }

  // Damages
  static async getDamagesForReport(reportId: string): Promise<Damage[]> {
    const { data, error } = await supabase
      .from('damages')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.fromDbDamage);
  }

  static async getDamagesForImage(imageId: string): Promise<Damage[]> {
    const { data, error } = await supabase
      .from('damages')
      .select('*')
      .eq('image_id', imageId)
      .order('severity', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.fromDbDamage);
  }

  static async getDamagesForPart(reportId: string, sectionId: string, partName: string): Promise<Damage[]> {
    const { data, error } = await supabase
      .from('damages')
      .select('*')
      .eq('report_id', reportId)
      .eq('section_id', sectionId)
      .eq('part_name', partName)
      .order('severity', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.fromDbDamage);
  }

  static async getDamagesByGroup(damageGroupId: string): Promise<Damage[]> {
    const { data, error } = await supabase
      .from('damages')
      .select('*')
      .eq('damage_group_id', damageGroupId);

    if (error) throw error;
    return (data || []).map(this.fromDbDamage);
  }

  static async updateDamage(damageId: string, updates: Partial<Damage>): Promise<Damage> {
    const dbUpdates = {
      ...this.toDbDamage(updates),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('damages')
      .update(dbUpdates)
      .eq('id', damageId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Damage not found');
    return this.fromDbDamage(data);
  }

  static async updateDamageStatus(
    damageId: string,
    status: DamageStatus,
    reviewerId: string,
    notes?: string
  ): Promise<Damage> {
    return this.updateDamage(damageId, {
      status,
      reviewedBy: reviewerId,
      reviewedAt: new Date().toISOString(),
      notes: notes || ''
    });
  }

  static async updateDamageGroup(
    damageGroupId: string,
    updates: Partial<Damage>
  ): Promise<Damage[]> {
    const dbUpdates = {
      ...this.toDbDamage(updates),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('damages')
      .update(dbUpdates)
      .eq('damage_group_id', damageGroupId)
      .select();

    if (error) throw error;
    return (data || []).map(this.fromDbDamage);
  }

  static async createDamage(damage: Omit<Damage, 'id' | 'createdAt' | 'updatedAt'>): Promise<Damage> {
    const dbDamage = {
      ...this.toDbDamage(damage as Partial<Damage>),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('damages')
      .insert(dbDamage)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create damage');
    return this.fromDbDamage(data);
  }

  static async deleteDamage(damageId: string): Promise<void> {
    const { error } = await supabase
      .from('damages')
      .delete()
      .eq('id', damageId);

    if (error) throw error;
  }

  // Bulk operations
  static async updateMultipleDamages(damageIds: string[], updates: Partial<Damage>): Promise<Damage[]> {
    const dbUpdates = {
      ...this.toDbDamage(updates),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('damages')
      .update(dbUpdates)
      .in('id', damageIds)
      .select();

    if (error) throw error;
    return (data || []).map(this.fromDbDamage);
  }

  static async markPartDamagesAsFalsePositive(
    reportId: string,
    sectionId: string,
    partName: string,
    reviewerId: string
  ): Promise<Damage[]> {
    const { data, error } = await supabase
      .from('damages')
      .update({
        status: 'false_positive' as DamageStatus,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('report_id', reportId)
      .eq('section_id', sectionId)
      .eq('part_name', partName)
      .select();

    if (error) throw error;
    return (data || []).map(this.fromDbDamage);
  }

  static async validatePartDamages(
    reportId: string,
    sectionId: string,
    partName: string,
    reviewerId: string
  ): Promise<Damage[]> {
    const { data, error } = await supabase
      .from('damages')
      .update({
        status: 'validated' as DamageStatus,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('report_id', reportId)
      .eq('section_id', sectionId)
      .eq('part_name', partName)
      .eq('status', 'pending')
      .select();

    if (error) throw error;
    return (data || []).map(this.fromDbDamage);
  }

  // Review Sessions
  static async getOrCreateReviewSession(
    reportId: string,
    sectionId: string,
    reviewerId: string
  ): Promise<DamageReviewSession> {
    const { data: existing, error: fetchError } = await supabase
      .from('damage_review_sessions')
      .select('*')
      .eq('report_id', reportId)
      .eq('section_id', sectionId)
      .eq('reviewer_id', reviewerId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      return existing;
    }

    const { data: newSession, error: createError } = await supabase
      .from('damage_review_sessions')
      .insert({
        report_id: reportId,
        section_id: sectionId,
        reviewer_id: reviewerId,
        section_status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (createError) throw createError;
    if (!newSession) throw new Error('Failed to create review session');
    return newSession;
  }

  static async updateReviewSession(
    sessionId: string,
    updates: Partial<DamageReviewSession>
  ): Promise<DamageReviewSession> {
    const { data, error } = await supabase
      .from('damage_review_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Review session not found');
    return data;
  }

  static async markReportAsManuallyReviewed(
    reportId: string,
    reviewerId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('inspection_reports')
      .update({
        manual_review_completed: true,
        manual_review_completed_at: new Date().toISOString(),
        manual_review_completed_by: reviewerId
      })
      .eq('id', reportId);

    if (error) throw error;
  }

  static async completeReviewSession(sessionId: string, comments: string = ''): Promise<DamageReviewSession> {
    return this.updateReviewSession(sessionId, {
      section_status: 'completed',
      completed_at: new Date().toISOString(),
      comments
    });
  }

  static async getReviewSessionsForReport(reportId: string): Promise<DamageReviewSession[]> {
    const { data, error } = await supabase
      .from('damage_review_sessions')
      .select('*')
      .eq('report_id', reportId);

    if (error) throw error;
    return data || [];
  }

  // Vehicle Metadata
  static async getVehicleMetadata(vehicleId: string): Promise<VehicleMetadata | null> {
    const { data, error } = await supabase
      .from('vehicle_metadata')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async updateVehicleMetadata(
    vehicleId: string,
    updates: Partial<VehicleMetadata>
  ): Promise<VehicleMetadata> {
    const existing = await this.getVehicleMetadata(vehicleId);

    if (existing) {
      const { data, error } = await supabase
        .from('vehicle_metadata')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('vehicle_id', vehicleId)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Failed to update vehicle metadata');
      return data;
    } else {
      const { data, error } = await supabase
        .from('vehicle_metadata')
        .insert({
          vehicle_id: vehicleId,
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Failed to create vehicle metadata');
      return data;
    }
  }

  // Aggregated data for UI
  static async getPartReviewInfo(
    reportId: string,
    sectionId: string,
    partName: string
  ): Promise<PartReviewInfo> {
    const [images, damages] = await Promise.all([
      this.getImagesForPart(reportId, sectionId, partName),
      this.getDamagesForPart(reportId, sectionId, partName)
    ]);

    const reviewedDamages = damages.filter(d => d.status !== 'pending').length;

    return {
      partName,
      sectionId,
      totalDamages: damages.length,
      reviewedDamages,
      images,
      damages,
      isComplete: reviewedDamages === damages.length && damages.length > 0
    };
  }

  static async getSectionReviewInfo(reportId: string, sectionId: string): Promise<SectionReviewInfo> {
    const sectionName = this.getSectionName(sectionId);
    const parts = SECTION_PARTS[sectionId] || [];

    const [allDamages, reviewSession] = await Promise.all([
      this.getDamagesForReport(reportId),
      supabase
        .from('damage_review_sessions')
        .select('*')
        .eq('report_id', reportId)
        .eq('section_id', sectionId)
        .maybeSingle()
        .then(({ data }) => data)
    ]);

    // Filter damages for this section (data is already in camelCase after transformation)
    const sectionDamages = allDamages.filter(d => d.sectionId === sectionId);
    const uniqueParts = [...new Set(sectionDamages.map(d => d.partName))];

    const partInfos = await Promise.all(
      uniqueParts.map(partName => this.getPartReviewInfo(reportId, sectionId, partName))
    );

    const totalDamages = sectionDamages.length;
    const reviewedDamages = sectionDamages.filter(d => d.status !== 'pending').length;
    const reviewedParts = partInfos.filter(p => p.isComplete).length;

    return {
      sectionId,
      sectionName,
      parts: partInfos,
      totalParts: uniqueParts.length,
      reviewedParts,
      totalDamages,
      reviewedDamages,
      status: reviewSession?.section_status || 'not_started',
      isComplete: reviewedDamages === totalDamages && totalDamages > 0
    };
  }

  static getSectionName(sectionId: string): string {
    const names: Record<string, string> = {
      'exterior': 'Exterior',
      'exterior-body': 'Body Panels',
      'rims': 'Rims',
      'tires': 'Tires',
      'glazing': 'Glass & Mirrors',
      'interior': 'Interior',
      'motor': 'Engine & Motor'
    };
    return names[sectionId] || sectionId;
  }
}
