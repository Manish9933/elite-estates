import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Home, Search, Heart, MessageSquare, User } from 'lucide-react-native';
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import MapScreen from './src/screens/MapScreen';
import PropertyDetailsScreen from './src/screens/PropertyDetailsScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import { Theme } from './src/styles/theme';
import { View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack for Home and Details
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
  </Stack.Navigator>
);

// Stack for Explore and Details
const ExploreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ExploreMain" component={ExploreScreen} />
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
  </Stack.Navigator>
);

// Stack for Chat
const ChatStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ChatList" component={ChatListScreen} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
  </Stack.Navigator>
);

// Placeholder screens
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={{ flex: 1, backgroundColor: Theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color: Theme.colors.text, fontSize: 20 }}>{name} Screen</Text>
  </View>
);

const SavedScreen = () => <PlaceholderScreen name="Saved" />;
const ProfileScreen = () => <PlaceholderScreen name="Profile" />;

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Theme.colors.surface,
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 10,
          },
          tabBarActiveTintColor: Theme.colors.primary,
          tabBarInactiveTintColor: Theme.colors.textMuted,
          tabBarIcon: ({ color, size }) => {
            switch (route.name) {
              case 'Home': return <Home color={color} size={size} />;
              case 'Explore': return <Search color={color} size={size} />;
              case 'Saved': return <Heart color={color} size={size} />;
              case 'Inbox': return <MessageSquare color={color} size={size} />;
              case 'Profile': return <User color={color} size={size} />;
              default: return null;
            }
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Explore" component={ExploreStack} />
        <Tab.Screen name="Saved" component={SavedScreen} />
        <Tab.Screen name="Inbox" component={ChatStack} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
