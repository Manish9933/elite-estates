import { supabase } from '../lib/supabase';

export const messageApi = {
  /**
   * Get chat list for a user
   */
  getChatList: async (userId: string) => {
    // This is a complex query to get unique conversations with the last message
    // Simplified version: get all messages where user is sender or receiver
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (id, full_name, avatar_url),
        receiver:receiver_id (id, full_name, avatar_url),
        property:property_id (id, title, broker_name, broker_image)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  /**
   * Get messages between two users for a property
   */
  getMessages: async (userId: string, otherId: string, propertyId?: string) => {
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (full_name, avatar_url)
      `)
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`);

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    return await query.order('created_at', { ascending: true });
  },

  /**
   * Send a message
   */
  sendMessage: async (message: { sender_id: string; receiver_id: string; content: string; property_id?: string }) => {
    return await supabase
      .from('messages')
      .insert(message);
  },

  /**
   * Subscribe to real-time messages
   */
  subscribeToMessages: (userId: string, callback: (payload: any) => void) => {
    if (!userId) return { unsubscribe: () => {} };
    
    // Using a fixed name ensures only one active subscription per user session
    const channelName = `realtime_messages_${userId}`;
    
    // Remove existing channel if it exists to prevent errors
    supabase.removeChannel(supabase.channel(channelName));

    return supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  /**
   * Delete a single message
   */
  deleteMessage: async (messageId: string) => {
    return await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
  },

  /**
   * Delete an entire conversation
   */
  deleteChat: async (userId: string, otherId: string, propertyId?: string) => {
    let query = supabase
      .from('messages')
      .delete()
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`);
    
    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    return await query;
  }
};
