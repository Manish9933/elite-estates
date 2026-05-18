import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, Phone, Video, MoreHorizontal } from 'lucide-react-native';
import { Theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { messageApi } from '../api/messages';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ShimmerSkeleton } from '../components/Skeleton';

const GOLD = Theme.colors.primary;
const DARK_SURFACE = Theme.colors.surface;

export default function ChatDetailScreen({ route, navigation }: any) {
  const { otherUser, property } = route.params;
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = useCallback(async () => {
    if (!user || !otherUser) return;
    try {
      const { data, error } = await messageApi.getMessages(user.id, otherUser.id, property?.id || property?.property_id);
      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user, otherUser, property]);

  useEffect(() => {
    fetchMessages();
    
    if (!user?.id) return;

    // Subscribe to new messages
    const subscription = messageApi.subscribeToMessages(user.id, (payload) => {
      // Add message if it's from this conversation
      if (payload.new.sender_id === otherUser.id || payload.new.receiver_id === otherUser.id) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === payload.new.id);
          if (exists) return prev;
          return [...prev, payload.new];
        });
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchMessages, user, otherUser]);

  const sendMessage = async () => {
    if (message.trim().length === 0 || !user) return;
    
    // Safety: ensure we have a valid receiver ID
    const receiverId = otherUser?.id;
    if (!receiverId) {
      console.error('Cannot send message: otherUser.id is missing', { otherUser, property });
      Alert.alert('Error', 'Cannot identify the recipient. Please go back and try again.');
      return;
    }
    
    const content = message.trim();
    setMessage('');

    try {
      const { data, error } = await messageApi.sendMessage({
        sender_id: user.id,
        receiver_id: receiverId,
        content: content,
        property_id: property?.id || property?.property_id
      });

      if (error) throw error;

      // Optimistically update or refetch
      // The sendMessage response data doesn't contain the full object sometimes depending on Supabase version
      // Let's just refetch or manually add
      const newMessage = {
        id: Date.now().toString(),
        content,
        sender_id: user.id,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = (msgId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await messageApi.deleteMessage(msgId);
              if (error) throw error;
              // Remove message from local state
              setMessages(prev => prev.filter(m => m.id !== msgId));
            } catch (err) {
              console.error('Error deleting message:', err);
              Alert.alert('Error', 'Could not delete the message.');
            }
          }
        }
      ]
    );
  };

  const renderMessage = ({ item }: any) => {
    const isMe = item.sender_id === user?.id;
    return (
      <TouchableOpacity 
        style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}
        onLongPress={() => handleDeleteMessage(item.id)}
        activeOpacity={0.9}
      >
        {isMe ? (
          <LinearGradient 
            colors={Theme.colors.goldGradient} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.myBubble]}
          >
            <Text style={[styles.messageText, styles.myMessageText]}>
              {item.content}
            </Text>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.otherBubble]}>
            <Text style={[styles.messageText, styles.otherMessageText]}>
              {item.content}
            </Text>
          </View>
        )}
        <Text style={[styles.messageTime, isMe && { textAlign: 'right' }]}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleCall = () => {
    // Safely retrieve the contact's phone number or use a secure fallback
    const phoneNumber = otherUser?.phone || '+15550000000';
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Unavailable', 'Your device does not support secure calling.');
      }
    }).catch(err => console.error('Call Error:', err));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <BlurView intensity={20} tint="dark" style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={GOLD} size={28} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: otherUser.avatar_url || `https://i.pravatar.cc/150?u=${otherUser.id}` }} 
              style={styles.smallAvatar} 
            />
            <View style={styles.headerOnlineDot} />
          </View>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.headerName} numberOfLines={1}>{otherUser.full_name}</Text>
            <Text style={styles.headerStatus}>Agent • Online</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
            <Phone color={GOLD} size={20} />
          </TouchableOpacity>
        </View>
      </BlurView>

      {loading ? (
        <View style={{ flex: 1, padding: 20 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <View key={i} style={{ 
              alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start',
              marginBottom: 20,
              width: '70%'
            }}>
              <ShimmerSkeleton 
                width="100%" 
                height={60} 
                borderRadius={20} 
                style={{ 
                  borderTopRightRadius: i % 2 === 0 ? 4 : 20,
                  borderTopLeftRadius: i % 2 === 0 ? 20 : 4,
                }} 
              />
              <ShimmerSkeleton 
                width={60} 
                height={12} 
                borderRadius={4} 
                style={{ 
                  marginTop: 6, 
                  alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start' 
                }} 
              />
            </View>
          ))}
        </View>
      ) : (
        <FlatList 
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={Theme.colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, message.trim().length === 0 && styles.sendButtonDisabled]} 
              onPress={sendMessage}
              disabled={message.trim().length === 0}
            >
              <Send color="white" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  smallAvatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: GOLD,
  },
  headerOnlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#050505',
  },
  headerName: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  headerStatus: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  messageList: {
    padding: 20,
    paddingBottom: 40,
  },
  messageContainer: {
    marginBottom: 20,
    maxWidth: '85%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#0D0D0D',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  myMessageText: {
    color: 'black',
    fontWeight: '700',
  },
  otherMessageText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 6,
    fontWeight: '600',
  },
  inputArea: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#0D0D0D',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 15,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    fontWeight: '500',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    shadowOpacity: 0,
    elevation: 0,
  }
});
