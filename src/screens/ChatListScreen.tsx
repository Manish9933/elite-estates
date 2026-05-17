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
  Platform,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MoreVertical, MessageSquare, Trash2, CheckSquare, X, AlertTriangle, Archive, BellOff, Filter, Info } from 'lucide-react-native';
import { Theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { messageApi } from '../api/messages';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ShimmerSkeleton } from '../components/Skeleton';

const GOLD = Theme.colors.primary;
const DARK_SURFACE = Theme.colors.surface;

export default function ChatListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [confirmClearVisible, setConfirmClearVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });

  const showLuxuryAlert = (title: string, message: string) => {
    setAlertConfig({ visible: true, title, message });
  };

  const fetchChats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await messageApi.getChatList(user.id);
      if (data) {
        const conversationsMap = new Map();
        data.forEach((msg: any) => {
          const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
          const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          
          // Safety check: if the other user profile doesn't exist, skip or use fallback
          if (!otherUserId) return;

          const conversationKey = `${otherUserId}_${msg.property_id || 'general'}`;
          if (!conversationsMap.has(conversationKey)) {
            conversationsMap.set(conversationKey, {
              id: conversationKey,
              otherUserId: otherUserId,
              name: msg.property?.broker_name || otherUser.full_name || 'User',
              avatar: msg.property?.broker_image || otherUser.avatar_url || `https://i.pravatar.cc/150?u=${otherUser.id}`,
              lastMessage: msg.content,
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unread: msg.is_read ? 0 : (msg.receiver_id === user.id ? 1 : 0),
              online: false,
              property: msg.property_id ? { ...msg.property, id: msg.property_id, property_id: msg.property_id } : null
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

  const handleDeleteChat = (item: any) => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete your conversation with ${item.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              const { error } = await messageApi.deleteChat(user.id, item.otherUserId, item.property?.id);
              if (error) throw error;
              fetchChats(); // Refresh list
            } catch (err) {
              console.error('Error deleting chat:', err);
              Alert.alert('Error', 'Could not delete the conversation.');
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  const handleMoreOptions = () => {
    setOptionsVisible(true);
  };

  const renderChatItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.chatItem}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ChatDetail', { 
        chat: item,
        otherUser: { id: item.otherUserId, full_name: item.name, avatar_url: item.avatar },
        property: item.property
      })}
      onLongPress={() => handleDeleteChat(item)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && <View style={styles.onlineBadge} />}
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
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
            <LinearGradient colors={Theme.colors.goldGradient} style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unread}</Text>
            </LinearGradient>
          )}
        </View>
        {item.property && (
          <View style={styles.propertyBadge}>
             <Text style={styles.propertyTag}>{item.property.title}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
           <ShimmerSkeleton width={120} height={32} borderRadius={6} />
           <ShimmerSkeleton width={32} height={32} borderRadius={16} />
        </View>
        <View style={{ paddingHorizontal: 25, marginTop: 20 }}>
           {[1, 2, 3, 4, 5, 6].map(i => (
             <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 25 }}>
               <ShimmerSkeleton width={60} height={60} borderRadius={30} />
               <View style={{ flex: 1, marginLeft: 15 }}>
                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                   <ShimmerSkeleton width={100} height={18} borderRadius={4} />
                   <ShimmerSkeleton width={50} height={14} borderRadius={4} />
                 </View>
                 <ShimmerSkeleton width="80%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                 <ShimmerSkeleton width={80} height={18} borderRadius={9} />
               </View>
             </View>
           ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleMoreOptions}>
          <MoreVertical color={Theme.colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <BlurView intensity={10} tint="dark" style={styles.searchBar}>
          <Search color={Theme.colors.primary} size={18} />
          <Text style={styles.searchPlaceholder}>Search dossiers & messages...</Text>
        </BlurView>
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

      {/* Custom Theme Options Modal */}
      <Modal visible={optionsVisible} transparent animationType="fade" onRequestClose={() => setOptionsVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOptionsVisible(false)}>
          <View style={styles.optionsModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Inbox Options</Text>
              <TouchableOpacity onPress={() => setOptionsVisible(false)} style={styles.closeBtn}>
                <X size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => {
                setChats(prevChats => prevChats.map(chat => ({ ...chat, unread: 0 })));
                setOptionsVisible(false);
              }}
            >
              <View style={styles.optionIconContainer}>
                <CheckSquare size={20} color={GOLD} />
              </View>
              <Text style={styles.optionText}>Mark All as Read</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => {
                setOptionsVisible(false);
                setTimeout(() => showLuxuryAlert("Filter", "Showing unread messages only."), 300);
              }}
            >
              <View style={styles.optionIconContainer}>
                <Filter size={20} color={GOLD} />
              </View>
              <Text style={styles.optionText}>Filter Unread</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => {
                setOptionsVisible(false);
                setTimeout(() => showLuxuryAlert("Archived", "Archived folder is empty."), 300);
              }}
            >
              <View style={styles.optionIconContainer}>
                <Archive size={20} color={GOLD} />
              </View>
              <Text style={styles.optionText}>Archived Chats</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => {
                setOptionsVisible(false);
                setTimeout(() => showLuxuryAlert("Notifications", "Inbox notifications muted for 8 hours."), 300);
              }}
            >
              <View style={styles.optionIconContainer}>
                <BellOff size={20} color={GOLD} />
              </View>
              <Text style={styles.optionText}>Mute Notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionItem, { borderBottomWidth: 0 }]}
              onPress={() => {
                setOptionsVisible(false);
                setTimeout(() => setConfirmClearVisible(true), 300);
              }}
            >
              <View style={[styles.optionIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Trash2 size={20} color="#EF4444" />
              </View>
              <Text style={[styles.optionText, { color: '#EF4444' }]}>Clear All Messages</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Custom Theme Confirm Clear Modal */}
      <Modal visible={confirmClearVisible} transparent animationType="slide" onRequestClose={() => setConfirmClearVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.alertIconBg}>
              <AlertTriangle size={32} color="#EF4444" />
            </View>
            <Text style={styles.confirmTitle}>Clear Inbox</Text>
            <Text style={styles.confirmMessage}>Are you sure you want to clear your entire inbox? This action cannot be undone.</Text>
            
            <View style={styles.confirmBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmClearVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.destructiveBtn}
                onPress={() => {
                  setChats([]);
                  setConfirmClearVisible(false);
                }}
              >
                <Text style={styles.destructiveBtnText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Luxury Alert Modal */}
      <Modal visible={alertConfig.visible} transparent animationType="fade" onRequestClose={() => setAlertConfig({ ...alertConfig, visible: false })}>
        <View style={styles.modalOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.alertIconBgGeneric}>
              <Info size={32} color={Theme.colors.gold} />
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity 
              style={styles.alertBtn}
              onPress={() => setAlertConfig({ ...alertConfig, visible: false })}
            >
              <LinearGradient colors={Theme.colors.goldGradient} style={styles.alertBtnGradient}>
                <Text style={styles.alertBtnText}>Dismiss</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flex: 1,
    marginRight: 10,
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
  propertyBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  propertyTag: {
    fontSize: 9,
    color: GOLD,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  optionsModalCard: {
    width: '100%',
    backgroundColor: '#0D0D0D',
    borderRadius: 30,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmCard: {
    width: '100%',
    backgroundColor: '#0D0D0D',
    borderRadius: 35,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  alertIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmMessage: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  confirmBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 15,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  destructiveBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destructiveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#0D0D0D',
    borderRadius: 35,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: Theme.colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  alertIconBgGeneric: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  alertTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  alertMessage: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  alertBtn: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
  },
  alertBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBtnText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
