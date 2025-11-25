import { supabase } from '../lib/supabase';
import { Tag } from '../types';
import { ApiError } from './api';

class TagService {
  async getAllTags(): Promise<Tag[]> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;

      return (data || []).map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        createdAt: tag.created_at,
        createdBy: tag.created_by
      }));
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      throw new ApiError('Failed to fetch tags', 'FETCH_TAGS_ERROR');
    }
  }

  async createTag(name: string, color: string): Promise<Tag> {
    try {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new ApiError('User not authenticated', 'AUTH_ERROR');
      }

      const { data, error } = await supabase
        .from('tags')
        .insert({
          name,
          color,
          created_by: userData.user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        color: data.color,
        createdAt: data.created_at,
        createdBy: data.created_by
      };
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw new ApiError('Failed to create tag', 'CREATE_TAG_ERROR');
    }
  }

  async addTagToVehicle(vehicleId: string, tagId: string): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new ApiError('User not authenticated', 'AUTH_ERROR');
      }

      // Check if tag already exists for this vehicle
      const { data: existing } = await supabase
        .from('vehicle_tags')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .eq('tag_id', tagId)
        .maybeSingle();

      if (existing) {
        // Tag already exists, no need to add again
        return;
      }

      const { error } = await supabase
        .from('vehicle_tags')
        .insert({
          vehicle_id: vehicleId,
          tag_id: tagId,
          created_by: userData.user.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to add tag to vehicle:', error);
      throw new ApiError('Failed to add tag to vehicle', 'ADD_TAG_ERROR');
    }
  }

  async removeTagFromVehicle(vehicleId: string, tagId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('vehicle_tags')
        .delete()
        .eq('vehicle_id', vehicleId)
        .eq('tag_id', tagId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to remove tag from vehicle:', error);
      throw new ApiError('Failed to remove tag from vehicle', 'REMOVE_TAG_ERROR');
    }
  }

  async deleteTag(tagId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete tag:', error);
      throw new ApiError('Failed to delete tag', 'DELETE_TAG_ERROR');
    }
  }

  async addTagToMultipleVehicles(vehicleIds: string[], tagId: string): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new ApiError('User not authenticated', 'AUTH_ERROR');
      }

      // First, check which vehicles already have this tag
      const { data: existingTags } = await supabase
        .from('vehicle_tags')
        .select('vehicle_id')
        .eq('tag_id', tagId)
        .in('vehicle_id', vehicleIds);

      const existingVehicleIds = new Set((existingTags || []).map((t: any) => t.vehicle_id));

      // Only insert tags for vehicles that don't already have this tag
      const vehiclesToTag = vehicleIds.filter(id => !existingVehicleIds.has(id));

      if (vehiclesToTag.length === 0) {
        // All vehicles already have this tag
        return;
      }

      const records = vehiclesToTag.map(vehicleId => ({
        vehicle_id: vehicleId,
        tag_id: tagId,
        created_by: userData.user.id
      }));

      const { error } = await supabase
        .from('vehicle_tags')
        .insert(records);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to add tag to vehicles:', error);
      throw new ApiError('Failed to add tag to vehicles', 'BULK_ADD_TAG_ERROR');
    }
  }

  async removeTagFromMultipleVehicles(vehicleIds: string[], tagId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('vehicle_tags')
        .delete()
        .in('vehicle_id', vehicleIds)
        .eq('tag_id', tagId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to remove tag from vehicles:', error);
      throw new ApiError('Failed to remove tag from vehicles', 'BULK_REMOVE_TAG_ERROR');
    }
  }
}

export const tagService = new TagService();
