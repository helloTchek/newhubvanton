import { supabase } from '../lib/supabase';

export type InternalEventType =
  | 'report_shared_internal'
  | 'report_shared_email'
  | 'status_changed'
  | 'damage_updated';

interface InternalEvent {
  id: string;
  eventType: InternalEventType;
  reportId: string | null;
  vehicleId: string;
  userId: string;
  eventData: Record<string, unknown>;
  createdAt: string;
}

interface CreateEventParams {
  eventType: InternalEventType;
  reportId?: string;
  vehicleId: string;
  eventData?: Record<string, unknown>;
}

class InternalEventsService {
  async createEvent(params: CreateEventParams): Promise<InternalEvent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('internal_events')
        .insert({
          event_type: params.eventType,
          report_id: params.reportId || null,
          vehicle_id: params.vehicleId,
          user_id: user.id,
          event_data: params.eventData || {},
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        eventType: data.event_type,
        reportId: data.report_id,
        vehicleId: data.vehicle_id,
        userId: data.user_id,
        eventData: data.event_data,
        createdAt: data.created_at,
      };
    } catch (error: unknown) {
      console.error('Failed to create internal event:', error);
      return null;
    }
  }

  async getEventsByVehicle(vehicleId: string): Promise<InternalEvent[]> {
    try {
      const { data, error } = await supabase
        .from('internal_events')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map((row) => ({
        id: row.id,
        eventType: row.event_type,
        reportId: row.report_id,
        vehicleId: row.vehicle_id,
        userId: row.user_id,
        eventData: row.event_data,
        createdAt: row.created_at,
      }));
    } catch (error: unknown) {
      console.error('Failed to get events:', error);
      return [];
    }
  }

  async getEventsByReport(reportId: string): Promise<InternalEvent[]> {
    try {
      const { data, error } = await supabase
        .from('internal_events')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map((row) => ({
        id: row.id,
        eventType: row.event_type,
        reportId: row.report_id,
        vehicleId: row.vehicle_id,
        userId: row.user_id,
        eventData: row.event_data,
        createdAt: row.created_at,
      }));
    } catch (error: unknown) {
      console.error('Failed to get events:', error);
      return [];
    }
  }
}

export const internalEventsService = new InternalEventsService();
