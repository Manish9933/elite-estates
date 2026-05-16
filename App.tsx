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
import AuthScreen from './src/screens/AuthScreen';
import SavedScreen from './src/screens/SavedScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminDashboard from './admin/DashboardScreen';
import { Theme } from './src/styles/theme';
import { View, Text, Platform, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const GOLD = '#D4AF37';

// ... (HomeStack, ExploreStack, ChatStack remain the same)
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
  </Stack.Navigator>
);

const ExploreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ExploreMain" component={ExploreScreen} />
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ChatList" component={ChatListScreen} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
  </Stack.Navigator>
);

const WebNavbar = ({ navigation, route: currentRoute }: any) => {
  const routes = [
    { name: 'Home', icon: Home },
    { name: 'Explore', icon: Search },
    { name: 'Saved', icon: Heart },
    { name: 'Inbox', icon: MessageSquare },
    { name: 'Profile', icon: User },
  ];

  const activeName = currentRoute.name;

  return (
    <View style={{
      height: 80,
      backgroundColor: '#050505',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 50,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.05)',
      zIndex: 1000,
    }}>
      <Text style={{ color: Theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>
        Elite <Text style={{ color: Theme.colors.primary }}>Estate</Text>
      </Text>
      
      <View style={{ flexDirection: 'row', gap: 40 }}>
        {routes.map((item) => {
          const isFocused = activeName === item.name;
          const color = isFocused ? Theme.colors.primary : Theme.colors.textMuted;
          const Icon = item.icon;
          
          return (
            <TouchableOpacity 
              key={item.name}
              onPress={() => navigation.navigate(item.name)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
            >
              <Icon color={color} size={22} />
              <Text style={{ 
                color, 
                fontSize: 16, 
                fontWeight: isFocused ? '700' : '600',
                letterSpacing: 0.5 
              }}>{item.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const TabNavigator = () => {
  const { width } = Dimensions.get('window');
  const isLargeScreen = width > 800;
  const isWeb = Platform.OS === 'web';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: isWeb && isLargeScreen,
        header: (props) => (isWeb && isLargeScreen) ? <WebNavbar {...props} /> : null,
        tabBarStyle: {
          backgroundColor: '#0D0D0D',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)',
          height: Platform.OS === 'ios' ? 88 : 95,
          paddingBottom: Platform.OS === 'ios' ? 30 : 35,
          paddingTop: 10,
          display: isWeb && isLargeScreen ? 'none' : 'flex',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        } as any,
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: Platform.OS === 'android' ? 2 : 0,
        },
        tabBarIcon: ({ color }) => {
          const size = 24;
          if (route.name === 'Home') return <Home color={color} size={size} strokeWidth={2} />;
          if (route.name === 'Explore') return <Search color={color} size={size} strokeWidth={2} />;
          if (route.name === 'Saved') return <Heart color={color} size={size} strokeWidth={2} />;
          if (route.name === 'Inbox') return <MessageSquare color={color} size={size} strokeWidth={2} />;
          if (route.name === 'Profile') return <User color={color} size={size} strokeWidth={2} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Explore" component={ExploreStack} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Inbox" component={ChatStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const MainStack = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <MainStack />
      </NavigationContainer>
    </AuthProvider>
  );
}
