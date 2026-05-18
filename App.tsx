import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Home, Search, Heart, MessageSquare, User } from 'lucide-react-native';
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import PropertyDetailsScreen from './src/screens/PropertyDetailsScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import AuthScreen from './src/screens/AuthScreen';
import SavedScreen from './src/screens/SavedScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminDashboard from './admin/DashboardScreen';
import { Theme } from './src/styles/theme';
import { View, Text, Platform, TouchableOpacity, Dimensions, ActivityIndicator, Animated, ScrollView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const MapScreen = Platform.select({
  web: require('./src/screens/web/MapScreen').default,
  default: require('./src/screens/MapScreen').default,
});

const LoadingScreen = Platform.select({
  web: require('./src/screens/web/LoadingScreen').default,
  default: require('./src/screens/LoadingScreen').default,
});

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const GOLD = '#D4AF37';

// ... (HomeStack, ExploreStack, ChatStack remain the same)
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
  </Stack.Navigator>
);

const ExploreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ExploreMain" component={ExploreScreen} />
    <Stack.Screen name="Map" component={MapScreen} />
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

const PulseLine = ({ bottom }: { bottom: number }) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const createPulseLoop = () => {
      scaleAnim.setValue(0);
      opacityAnim.setValue(1);

      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 2400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => createPulseLoop());
    };

    createPulseLoop();
  }, [scaleAnim, opacityAnim]);

  return (
    <View style={{
      position: 'absolute',
      bottom: bottom, // Positioned dynamically based on safe area inset
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      overflow: 'hidden',
      zIndex: 9999,
    }}>
      <Animated.View style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        transform: [{ scaleX: scaleAnim }],
        opacity: opacityAnim,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      }} />
    </View>
  );
};

const TabNavigator = () => {
  const { width } = Dimensions.get('window');
  const isLargeScreen = width > 800;
  const isWeb = Platform.OS === 'web';
  const insets = useSafeAreaInsets();

  // Dynamic bottom inset to clear Android system navigation keys or gesture bars
  const bottomInset = insets.bottom;
  // Dynamic tab height: taller on safe-area gesture devices, standard & tight on system key devices
  const tabHeight = Platform.OS === 'ios' ? (64 + insets.bottom) : (bottomInset > 0 ? (72 + bottomInset) : 72);

  return (
    <View style={{ flex: 1, backgroundColor: '#050505' }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: isWeb && isLargeScreen,
          header: (props) => (isWeb && isLargeScreen) ? <WebNavbar {...props} /> : null,
          tabBarStyle: {
            backgroundColor: '#0D0D0D',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.08)',
            height: tabHeight,
            paddingBottom: bottomInset > 0 ? (bottomInset + 6) : 8,
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
            fontSize: 12,
            fontWeight: '700',
            marginBottom: Platform.OS === 'android' ? (bottomInset > 0 ? 6 : 4) : 4,
          },
          tabBarIcon: ({ color }) => {
            const size = 26; // Perfectly sized icon for the layout
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
      {!isLargeScreen && <PulseLine bottom={tabHeight - 2} />}
    </View>
  );
};

const MainStack = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  state: { hasError: boolean, error: Error | null } = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Something went wrong</Text>
          <ScrollView style={{ backgroundColor: '#111', padding: 15, borderRadius: 10, width: '100%', maxHeight: 400 }}>
            <Text style={{ color: '#ff5555', fontFamily: 'monospace', fontSize: 14 }}>
              {this.state.error?.toString()}
            </Text>
            <Text style={{ color: '#aaa', fontFamily: 'monospace', fontSize: 12, marginTop: 10 }}>
              {this.state.error?.stack}
            </Text>
          </ScrollView>
          <TouchableOpacity 
            onPress={() => {
              if (Platform.OS === 'web') {
                window.location.reload();
              }
            }}
            style={{ marginTop: 20, backgroundColor: '#D4AF37', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5 }}
          >
            <Text style={{ color: '#000', fontWeight: 'bold' }}>Reload App</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync('#050505');
      NavigationBar.setButtonStyleAsync('light');
    }
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <MainStack />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
