import { ApiResponse } from '../types';
import { supabase } from '../lib/supabase';

class ChaseUpService {
  async sendChaseUp(vehicleId: string, method: 'email' | 'sms', message?: string): Promise<ApiResponse<void>> {
    await this.delay(1000);

    try {
      console.log(`Sending ${method} chase up for vehicle ${vehicleId}`);
      if (message) {
        console.log(`Message: ${message}`);
      }

      // Update vehicle status to chased_up
      const { error } = await supabase
        .from('vehicles')
        .update({
          status: 'chased_up',
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId);

      if (error) {
        throw error;
      }

      return {
        data: undefined,
        success: true,
        message: `Chase up ${method} sent successfully`
      };
    } catch (error) {
      throw new Error(`Failed to send ${method} chase up`);
    }
  }

  async sendBulkChaseUp(vehicleIds: string[], method: 'email' | 'sms'): Promise<ApiResponse<void>> {
    await this.delay(1500);

    try {
      console.log(`Sending bulk ${method} chase up for ${vehicleIds.length} vehicles`);

      // Update all vehicle statuses to chased_up
      const { error } = await supabase
        .from('vehicles')
        .update({
          status: 'chased_up',
          updated_at: new Date().toISOString()
        })
        .in('id', vehicleIds);

      if (error) {
        throw error;
      }

      return {
        data: undefined,
        success: true,
        message: `Bulk chase up ${method} sent successfully to ${vehicleIds.length} vehicles`
      };
    } catch (error) {
      throw new Error(`Failed to send bulk ${method} chase up`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const chaseUpService = new ChaseUpService();
