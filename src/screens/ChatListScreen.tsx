import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MoreVertical } from 'lucide-react-native';
import { Theme } from '../styles/theme';

const CHATS = [
  {
    id: '1',
    name: 'Marcus Sterling',
    lastMessage: 'The penthouse is available for viewing tomorrow.',
    time: '10:30 AM',
    avatar: 'https://i.pravatar.cc/150?u=agent',
    unread: 2,
    online: true
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    lastMessage: 'Thank you for the information!',
    time: 'Yesterday',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    unread: 0,
    online: false
  }
];

export default function ChatListScreen({ navigation }: any) {
  const renderChatItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatDetail', { chat: item })}
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
      </View>
    </TouchableOpacity>
  );

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
        data={CHATS}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  iconButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.md,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    gap: 10,
  },
  searchPlaceholder: {
    color: Theme.colors.textMuted,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: Theme.spacing.lg,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Theme.colors.secondary,
    borderWidth: 2,
    borderColor: Theme.colors.background,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 15,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    color: Theme.colors.text,
    fontSize: 17,
    fontWeight: 'bold',
  },
  time: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    flex: 1,
  },
  unreadMessage: {
    color: Theme.colors.text,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: Theme.colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 10,
  },
  unreadCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  }
});
