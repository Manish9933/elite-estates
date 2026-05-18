import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  ImageBackground,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Star, Heart, Trash2, Building2 } from 'lucide-react-native';
import { Theme } from '../styles/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { propertyApi } from '../api/properties';
import { ShimmerSkeleton } from '../components/Skeleton';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const GOLD = '#D4AF37';

export default function SavedScreen({ navigation }: any) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const hasLoadedOnce = React.useRef(false);

  const fetchFavorites = useCallback(async (forceShowLoading = false) => {
    if (!user) return;
    if (!hasLoadedOnce.current || forceShowLoading) {
      setLoading(true);
    }
    try {
      const { data, error } = await propertyApi.getFavorites(user.id);
      if (data) {
        // Data is an array of objects with property field
        setFavorites(data.map((f: any) => f.property).filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      hasLoadedOnce.current = true;
    }
  }, [user]);

  useEffect(() => {
    if (isFocused) {
      fetchFavorites();
    }
  }, [isFocused, fetchFavorites]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const handleRemove = async (propertyId: string) => {
    if (!user) return;
    try {
      await propertyApi.toggleFavorite(user.id, propertyId, true);
      setFavorites(favorites.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const numColumns = isWeb ? (width > 1200 ? 3 : width > 800 ? 2 : 1) : 1;
  const cardWidth = isWeb ? (width - 80 - (numColumns - 1) * 20) / numColumns : width - 40;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <ShimmerSkeleton width={200} height={32} borderRadius={6} />
          <ShimmerSkeleton width={150} height={16} borderRadius={4} style={{ marginTop: 10 }} />
        </View>
        <ScrollView contentContainerStyle={styles.listContainer}>
          {[1, 2, 3].map(i => (
            <View key={i} style={{ marginBottom: 25 }}>
               <ShimmerSkeleton width="100%" height={320} borderRadius={30} />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Properties</Text>
        <Text style={styles.subtitle}>{favorites.length} architectural masterpieces</Text>
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.listContainer,
          isWeb && { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />
        }
      >
        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Building2 size={60} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyText}>You haven't saved any properties yet.</Text>
            <TouchableOpacity 
              style={styles.exploreBtn}
              onPress={() => navigation.navigate('Explore')}
            >
              <Text style={styles.exploreBtnText}>Discover Properties</Text>
            </TouchableOpacity>
          </View>
        ) : (
          favorites.map((prop, index) => (
            <Animated.View 
              key={prop.id} 
              entering={FadeInUp.delay(Math.min(index * 50, 300))}
              style={[styles.cardWrapper, isWeb && { width: cardWidth, marginHorizontal: 10 }]}
            >
              <TouchableOpacity 
                style={styles.propertyCard}
                onPress={() => navigation.navigate('PropertyDetails', { property: prop, isFavorite: true })}
              >
                <ImageBackground source={{ uri: prop.images?.[0] || 'https://via.placeholder.com/400' }} style={styles.propertyImage} imageStyle={{ borderRadius: 28 }}>
                  {prop.status === 'sold' && (
                    <View style={styles.soldOverlay}>
                      <Text style={styles.soldOverlayText}>SOLD OUT</Text>
                    </View>
                  )}
                  <View style={styles.cardHeader}>
                    <View style={styles.typeTag}>
                      <Text style={styles.typeText}>{prop.property_type}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemove(prop.id)}
                    >
                      <Trash2 color="white" size={16} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.solidInfo}>
                    <View style={styles.infoTop}>
                      <Text style={styles.propertyName} numberOfLines={1}>{prop.title}</Text>
                      <View style={styles.ratingRow}>
                        <Star color="#F59E0B" fill="#F59E0B" size={12} />
                        <Text style={styles.ratingText}>4.9</Text>
                      </View>
                    </View>
                    
                    <View style={styles.infoBottom}>
                      <View style={styles.locationRow}>
                        <MapPin color="rgba(255,255,255,0.7)" size={12} />
                        <Text style={styles.locationText} numberOfLines={1}>{prop.address}</Text>
                      </View>
                      <Text style={styles.priceText}>${Number(prop.price).toLocaleString()}</Text>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'android' ? 60 : 20,
    paddingBottom: 15,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: GOLD,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 6,
  },
  listContainer: {
    flexGrow: 1, // Let scroll content fill available space to prevent black gaps
    padding: 25,
    paddingBottom: 35, // Reduced from 160 to remove the unwanted black bottom gap
  },
  cardWrapper: {
    marginBottom: 25,
  },
  propertyCard: {
    height: 320,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  propertyImage: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  typeText: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  solidInfo: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  infoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  propertyName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 10,
  },
  locationText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  priceText: {
    color: GOLD,
    fontSize: 18,
    fontWeight: '900',
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
    marginBottom: 35,
    lineHeight: 26,
    fontWeight: '500',
  },
  exploreBtn: {
    backgroundColor: GOLD,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 18,
  },
  exploreBtnText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  soldOverlayText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2.5,
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    overflow: 'hidden',
  },
});
