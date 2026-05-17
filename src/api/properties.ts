import { supabase } from '../lib/supabase';

export interface PropertyFilter {
  query?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
}

export const propertyApi = {
  /**
   * Get properties with filters
   */
  getProperties: async (filters?: PropertyFilter) => {
    let query = supabase
      .from('properties')
      .select(`
        *,
        agent:agent_id (
          full_name,
          avatar_url,
          phone
        )
      `)
      .in('status', ['available', 'sold']);

    if (filters?.query) {
      query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,address.ilike.%${filters.query}%`);
    }

    if (filters?.type && filters.type !== 'All') {
      query = query.eq('property_type', filters.type);
    }

    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.isFeatured) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  /**
   * Get property by ID
   */
  getPropertyById: async (id: string) => {
    return await supabase
      .from('properties')
      .select(`
        *,
        agent:agent_id (
          full_name,
          avatar_url,
          phone
        )
      `)
      .eq('id', id)
      .single();
  },

  /**
   * Get favorite properties for a user
   */
  getFavorites: async (userId: string) => {
    return await supabase
      .from('favorites')
      .select(`
        property:property_id (
          *,
          agent:agent_id (
            full_name,
            avatar_url,
            phone
          )
        )
      `)
      .eq('user_id', userId);
  },

  /**
   * Toggle favorite
   */
  toggleFavorite: async (userId: string, propertyId: string, isFavorite: boolean) => {
    if (isFavorite) {
      return await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('property_id', propertyId);
    } else {
      return await supabase
        .from('favorites')
        .insert({ user_id: userId, property_id: propertyId });
    }
  },

  /**
   * Check if a property is favorited
   */
  isFavorite: async (userId: string, propertyId: string) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('user_id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .single();
    
    return { isFavorite: !!data, error };
  }
};
