import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Dimensions, 
  Image,
  Platform,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, SlidersHorizontal, Map as MapIcon, Grid, Heart, Star, Bed, Maximize2, Home } from 'lucide-react-native';
import { Theme } from '../styles/theme';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { propertyApi } from '../api/properties';
import { ShimmerSkeleton } from '../components/Skeleton';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const GOLD = Theme.colors.gold;
const GOLD_GRADIENT = Theme.colors.goldGradient;

const FILTER_CHIPS = ['All', 'Trending', 'Apartment', 'Villa', 'Penthouse', 'Mansion', 'Townhouse'];

export default function ExploreScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const [selectedChip, setSelectedChip] = useState(route.params?.type || 'All');
  const [searchInput, setSearchInput] = useState(route.params?.query || '');
  const [searchQuery, setSearchQuery] = useState(route.params?.query || '');
  const [properties, setProperties] = useState<any[]>([]);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  // Sync state if navigation params supply a search query
  useEffect(() => {
    if (route.params?.query) {
      setSearchInput(route.params.query);
      setSearchQuery(route.params.query);
    }
  }, [route.params?.query]);

  // Sync state if navigation params supply a category chip
  useEffect(() => {
    if (route.params?.type) {
      setSelectedChip(route.params.type);
    }
  }, [route.params?.type]);

  // Clean, high-performance search input debounce (400ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const isTrending = selectedChip === 'Trending';
      
      // Load properties and favorites concurrently to save loading time
      const [propsRes, favoritesRes] = await Promise.all([
        propertyApi.getProperties({
          query: searchQuery,
          type: isTrending ? 'All' : selectedChip
        }),
        user ? propertyApi.getFavorites(user.id) : Promise.resolve({ data: null, error: null })
      ]);
      
      if (propsRes.data) {
        let filteredData = propsRes.data;
        if (isTrending) {
          // Simulate trending by filtering high ratings or randomizing/sorting
          filteredData = propsRes.data.filter((p: any) => (p.price > 1000000)).slice(0, 8);
        }
        setProperties(filteredData);
      }

      if (favoritesRes?.data) {
        const favIds = new Set(favoritesRes.data.map((f: any) => f.property.id));
        setUserFavorites(favIds);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedChip, user]);

  useEffect(() => {
    if (isFocused) {
      fetchProperties();
    }
  }, [isFocused, fetchProperties]);

  const handleToggleFavorite = async (propertyId: string) => {
    if (!user) return;
    const isFav = userFavorites.has(propertyId);

    // Optimistic Update
    const newFavs = new Set(userFavorites);
    if (isFav) newFavs.delete(propertyId);
    else newFavs.add(propertyId);
    setUserFavorites(newFavs);

    try {
      await propertyApi.toggleFavorite(user.id, propertyId, isFav);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Rollback on error
      setUserFavorites(userFavorites);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const numColumns = width > 1200 ? 3 : width > 800 ? 2 : 1;
  const cardWidth = width > 800 ? (width - (isWeb ? 120 : 40) - (numColumns - 1) * 20) / numColumns : width - 40;

  const renderPropertyItem = ({ item, index }: { item: any, index: number }) => {
    const isSold = item.status === 'sold';
    return (
      <Animated.View 
        entering={FadeInUp.delay(Math.min(index * 50, 300))}
        style={[isWeb && { width: cardWidth, marginBottom: 30 }]}
      >
        <TouchableOpacity 
          style={styles.propertyCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('PropertyDetails', { property: item })}
        >
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.images?.[0] || 'https://via.placeholder.com/600' }} 
              style={[styles.propertyImage, isSold && { opacity: 0.45 }]} 
            />
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>ELITE COLLECTION</Text>
            </View>
            <View style={styles.floatingPrice}>
              <Text style={styles.priceSymbol}>$</Text>
              <Text style={styles.priceValue}>{Number(item.price).toLocaleString()}</Text>
            </View>
            {isSold && (
              <View style={styles.soldOverlay}>
                <View style={styles.soldBadgeContainer}>
                  <Text style={styles.soldBadgeText}>SOLD OUT</Text>
                </View>
              </View>
            )}
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => handleToggleFavorite(item.id)}
            >
              <Heart 
                color={userFavorites.has(item.id) ? Theme.colors.gold : "white"} 
                size={20} 
                fill={userFavorites.has(item.id) ? Theme.colors.gold : "transparent"} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.propertyDetails}>
            <View style={styles.typeRow}>
              <View style={styles.typeTag}>
                <Text style={styles.typeText}>{item.property_type?.toUpperCase()}</Text>
              </View>
            <View style={styles.ratingBox}>
              <Star color={GOLD} fill={GOLD} size={12} />
              <Text style={styles.ratingText}>4.9</Text>
            </View>
          </View>
          
          <Text style={styles.titleText} numberOfLines={1}>{item.title}</Text>
          
          <View style={styles.locationRow}>
            <MapPin color={GOLD} size={16} />
            <Text style={styles.locationText} numberOfLines={1}>{item.address}</Text>
          </View>
          
          <View style={styles.luxurySpecs}>
            <View style={styles.specItem}>
              <View style={styles.specIconBg}>
                <Bed color={GOLD} size={16} />
              </View>
              <Text style={styles.specText}>{item.bhk || 0} Beds</Text>
            </View>
            <View style={styles.specItem}>
              <View style={styles.specIconBg}>
                <Maximize2 color={GOLD} size={16} />
              </View>
              <Text style={styles.specText}>{item.area_sqft || '0'} Sqft</Text>
            </View>
            <View style={styles.specItem}>
              <View style={styles.specIconBg}>
                <Home color={GOLD} size={16} />
              </View>
              <Text style={styles.specText}>{item.bhk > 3 ? 'Elite' : 'Boutique'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search color={GOLD} size={20} />
          <TextInput 
            placeholder="Search by city, neighborhood..." 
            placeholderTextColor={Theme.colors.textMuted}
            style={styles.searchInput}
            value={searchInput}
            onChangeText={setSearchInput}
          />
          <TouchableOpacity style={styles.filterButton}>
            <SlidersHorizontal color="white" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.chipsContainer}>
        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_CHIPS}
          renderItem={({ item }: { item: string }) => (
            <TouchableOpacity 
              style={[
                styles.chip, 
                selectedChip === item && styles.selectedChip
              ]}
              onPress={() => setSelectedChip(item)}
            >
              <Text style={[
                styles.chipText,
                selectedChip === item && styles.selectedChipText
              ]}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item: string) => item}
          contentContainerStyle={styles.chipsList}
        />
      </View>

      {/* Results List */}
      {loading && !refreshing ? (
        <View style={{ flex: 1, padding: 25 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            <ShimmerSkeleton width={140} height={20} borderRadius={4} />
            <ShimmerSkeleton width={100} height={20} borderRadius={4} />
          </View>
          <FlatList 
            data={[1, 2, 3, 4]}
            numColumns={numColumns}
            key={`skeleton-${numColumns}`}
            renderItem={() => (
              <View style={{ width: cardWidth, marginBottom: 30, marginRight: numColumns > 1 ? 20 : 0 }}>
                <ShimmerSkeleton width="100%" height={250} borderRadius={30} style={{ marginBottom: 15 }} />
                <ShimmerSkeleton width="60%" height={20} borderRadius={4} style={{ marginBottom: 8 }} />
                <ShimmerSkeleton width="40%" height={15} borderRadius={4} style={{ marginBottom: 15 }} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <ShimmerSkeleton width={60} height={30} borderRadius={10} />
                  <ShimmerSkeleton width={60} height={30} borderRadius={10} />
                  <ShimmerSkeleton width={60} height={30} borderRadius={10} />
                </View>
              </View>
            )}
            keyExtractor={i => i.toString()}
            columnWrapperStyle={numColumns > 1 ? { gap: 20 } : null}
          />
        </View>
      ) : (
        <FlatList 
          key={isWeb ? `grid-${numColumns}` : 'list'}
          numColumns={numColumns}
          data={properties}
          renderItem={renderPropertyItem}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={[
            styles.resultsList,
            isWeb && { maxWidth: 1400, alignSelf: 'center', width: '100%' }
          ]}
          columnWrapperStyle={isWeb && numColumns > 1 ? { gap: 20 } : null}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />
          }
          ListHeaderComponent={() => (
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>Found {properties.length} Properties</Text>
              <TouchableOpacity 
                style={styles.viewToggle}
                onPress={() => navigation.navigate('Map')}
              >
                <MapIcon color={GOLD} size={20} />
                <Text style={styles.toggleText}>Map View</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={{ marginTop: 50, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>No properties found matching your criteria.</Text>
            </View>
          )}
        />
      )}
    </View>
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
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 64,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  filterButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  chipsContainer: {
    marginBottom: 20,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  chipsList: {
    paddingHorizontal: 25,
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  selectedChip: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  chipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '700',
  },
  selectedChipText: {
    color: 'black',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  resultsCount: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  toggleText: {
    color: GOLD,
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultsList: {
    paddingHorizontal: 25,
    paddingBottom: 160,
  },
  propertyCard: {
    backgroundColor: '#0D0D0D',
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: isWeb ? 0 : 30,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    height: 280,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  premiumBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(5, 5, 5, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GOLD,
  },
  premiumText: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(5, 5, 5, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  floatingPrice: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#050505',
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  priceSymbol: {
    color: GOLD,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 2,
  },
  priceValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  propertyDetails: {
    padding: 25,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  titleText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 25,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  luxurySpecs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 20,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  specIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  specText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldBadgeContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GOLD,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  soldBadgeText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  }
});
