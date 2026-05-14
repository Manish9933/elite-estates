import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, Phone, Video, MoreHorizontal } from 'lucide-react-native';
import { Theme } from '../styles/theme';
import { supabase } from '../lib/supabase';

export default function ChatDetailScreen({ route, navigation }: any) {
  const { chat } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // Initial mock data
  useEffect(() => {
    setMessages([
      { id: '1', text: 'Hello! I saw your listing for the Skyline Penthouse.', senderId: 'me', time: '10:00 AM' },
      { id: '2', text: 'Hello! Yes, it is still available. Would you like to schedule a viewing?', senderId: 'other', time: '10:05 AM' },
    ]);
  }, []);

  // Supabase Realtime Subscription Placeholder
  useEffect(() => {
    // In a real app, you would subscribe here
    // const channel = supabase.channel('chat-room')
    //   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
    //     setMessages(prev => [...prev, payload.new]);
    //   })
    //   .subscribe();
    // return () => { supabase.removeChannel(channel) };
  }, []);

  const sendMessage = () => {
    if (message.trim().length === 0) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      senderId: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Simulate scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: any) => {
    const isMe = item.senderId === 'me';
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {item.text}
          </Text>
        </View>
        <Text style={styles.messageTime}>{item.time}</Text>
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
          <Image source={{ uri: chat.avatar }} style={styles.smallAvatar} />
          <View>
            <Text style={styles.headerName}>{chat.name}</Text>
            <Text style={styles.headerStatus}>{chat.online ? 'Online' : 'Offline'}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}><Phone color={Theme.colors.text} size={20} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}><Video color={Theme.colors.text} size={20} /></TouchableOpacity>
        </View>
      </View>

      <FlatList 
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

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
