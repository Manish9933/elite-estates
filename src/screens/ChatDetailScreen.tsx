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
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, Phone, Video, MoreHorizontal } from 'lucide-react-native';
import { Theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { messageApi } from '../api/messages';

const GOLD = '#D4AF37';

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
      const { data, error } = await messageApi.getMessages(user.id, otherUser.id, property?.id);
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
      // If message is from this sender, add to list (only if not already there)
      if (payload.new.sender_id === otherUser.id) {
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
    if (message.trim().length === 0 || !user || !otherUser) return;
    
    const content = message.trim();
    setMessage('');

    try {
      const { data, error } = await messageApi.sendMessage({
        sender_id: user.id,
        receiver_id: otherUser.id,
        content: content,
        property_id: property?.id
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

  const renderMessage = ({ item }: any) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {item.content}
          </Text>
        </View>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={Theme.colors.text} size={28} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Image 
            source={{ uri: otherUser.avatar_url || `https://i.pravatar.cc/150?u=${otherUser.id}` }} 
            style={styles.smallAvatar} 
          />
          <View>
            <Text style={styles.headerName}>{otherUser.full_name}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}><Phone color={Theme.colors.text} size={20} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}><Video color={Theme.colors.text} size={20} /></TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={GOLD} />
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
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerName: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerStatus: {
    color: Theme.colors.secondary,
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  messageList: {
    padding: Theme.spacing.lg,
  },
  messageContainer: {
    marginBottom: 20,
    maxWidth: '80%',
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
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: Theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: Theme.colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: Theme.colors.text,
  },
  messageTime: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputArea: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Theme.colors.surface,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  input: {
    flex: 1,
    color: Theme.colors.text,
    fontSize: 15,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: Theme.colors.surfaceLight,
  }
});
