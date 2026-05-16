import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MoreVertical, MessageSquare } from 'lucide-react-native';
import { Theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { messageApi } from '../api/messages';

const GOLD = '#D4AF37';

export default function ChatListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await messageApi.getChatList(user.id);
      if (data) {
        const conversationsMap = new Map();
        data.forEach((msg: any) => {
          const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
          
          // Safety check: if the other user profile doesn't exist, skip or use fallback
          if (!otherUser) return;

          if (!conversationsMap.has(otherUser.id)) {
            conversationsMap.set(otherUser.id, {
              id: otherUser.id,
              name: otherUser.full_name || 'User',
              avatar: otherUser.avatar_url || `https://i.pravatar.cc/150?u=${otherUser.id}`,
              lastMessage: msg.content,
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unread: msg.is_read ? 0 : (msg.receiver_id === user.id ? 1 : 0),
              online: false,
              property: msg.property
            });
          }
        });
        setChats(Array.from(conversationsMap.values()));
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChats();
    
    if (!user?.id) return;

    // Subscribe to new messages
    const subscription = messageApi.subscribeToMessages(user.id, (payload) => {
      fetchChats();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchChats, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  const renderChatItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatDetail', { 
        chat: item,
        otherUser: { id: item.id, full_name: item.name, avatar_url: item.avatar }
      })}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && <View style={styles.onlineBadge} />}
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text 
            style={[styles.lastMessage, item.unread > 0 && styles.unreadMessage]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unread}</Text>
            </View>
          )}
        </View>
        {item.property && (
          <Text style={styles.propertyTag}>Property: {item.property.title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MoreVertical color={Theme.colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color={Theme.colors.textMuted} size={20} />
          <Text style={styles.searchPlaceholder}>Search messages...</Text>
        </View>
      </View>

      <FlatList 
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MessageSquare size={60} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyText}>No messages yet. Start a conversation from a property page!</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'android' ? 60 : 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchContainer: {
    paddingHorizontal: 25,
    marginBottom: 25,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 18,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  searchPlaceholder: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 25,
    paddingBottom: 160,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#050505',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 18,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.2,
  },
  time: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    flex: 1,
    fontWeight: '400',
  },
  unreadMessage: {
    color: GOLD,
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: GOLD,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 12,
  },
  unreadCount: {
    color: 'black',
    fontSize: 10,
    fontWeight: '900',
  },
  propertyTag: {
    fontSize: 11,
    color: GOLD,
    marginTop: 6,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 25,
    lineHeight: 26,
    fontWeight: '500',
  }
});
