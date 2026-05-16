import { supabase } from '../lib/supabase';

export const profileApi = {
  /**
   * Get user profile
   */
  getProfile: async (userId: string) => {
    return await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId: string, updates: any) => {
    return await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
  },

  /**
   * Get user stats (Saved, Viewings, Offers)
   */
  getUserStats: async (userId: string) => {
    const { count: savedCount } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: viewingsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_id', userId);

    // Offers could be bookings with a specific status or a separate table
    // For now, let's just use 0 or another metric
    const offersCount = 0; 

    return {
      saved: savedCount || 0,
      viewings: viewingsCount || 0,
      offers: offersCount,
    };
  }
};
