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
  RefreshControl,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, SlidersHorizontal, Map as MapIcon, Grid, Heart, Star, Bed, Maximize2, Home, X, Check } from 'lucide-react-native';
import { Theme } from '../styles/theme';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { propertyApi } from '../api/properties';
import { ShimmerSkeleton } from '../components/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';

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

  // Custom filter modal states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedBhk, setSelectedBhk] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);

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

  // Sync state if navigation params requests opening the filter modal
  useEffect(() => {
    if (route.params?.openFilter) {
      setShowFilterModal(true);
      // Clear navigation param so it doesn't open on subsequent tab changes
      navigation.setParams({ openFilter: undefined });
    }
  }, [route.params?.openFilter, navigation]);

  // Clean, high-performance search input debounce (400ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const hasLoadedOnce = React.useRef(false);

  const fetchProperties = useCallback(async (forceShowLoading = false) => {
    if (!hasLoadedOnce.current || forceShowLoading) {
      setLoading(true);
    }
    try {
      const isTrending = selectedChip === 'Trending';
      
      const filters: any = {
        query: searchQuery,
        type: isTrending ? 'All' : selectedChip,
      };

      if (minPrice && !isNaN(Number(minPrice))) {
        filters.minPrice = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        filters.maxPrice = Number(maxPrice);
      }
      if (onlyFeatured) {
        filters.isFeatured = true;
      }

      // Load properties and favorites concurrently to save loading time
      const [propsRes, favoritesRes] = await Promise.all([
        propertyApi.getProperties(filters),
        user ? propertyApi.getFavorites(user.id) : Promise.resolve({ data: null, error: null })
      ]);
      
      if (propsRes.data) {
        let filteredData = propsRes.data;
        
        // Local pass: BHK filter
        if (selectedBhk !== 'All') {
          const bhkNum = parseInt(selectedBhk);
          filteredData = filteredData.filter((p: any) => p.bhk === bhkNum);
        }

        // Local pass: City filter
        if (selectedCity !== 'All') {
          filteredData = filteredData.filter((p: any) => p.city?.toLowerCase() === selectedCity.toLowerCase());
        }

        if (isTrending) {
          // Simulate trending by filtering high ratings or sorting
          filteredData = filteredData.filter((p: any) => (p.price > 1000000)).slice(0, 8);
        }
        setProperties(filteredData);
      }

      if (favoritesRes?.data) {
        const favIds = new Set(favoritesRes.data.map((f: any) => String(f.property.id)) as string[]);
        setUserFavorites(favIds);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      hasLoadedOnce.current = true;
    }
  }, [searchQuery, selectedChip, user, minPrice, maxPrice, selectedBhk, selectedCity, onlyFeatured]);

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

  const renderPropertyItem = useCallback(({ item, index }: { item: any, index: number }) => {
    const isSold = item.status === 'sold';
    return (
      <Animated.View 
        entering={FadeInUp.delay(Math.min(index * 50, 300))}
        style={[isWeb && { width: cardWidth, marginBottom: 30 }]}
      >
        <TouchableOpacity 
          style={styles.propertyCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('PropertyDetails', { property: item, isFavorite: userFavorites.has(item.id) })}
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
  }, [cardWidth, userFavorites]);

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
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
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

      {/* Luxury Glassmorphic Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleWrap}>
                <Text style={styles.modalTitle}>Filter Catalog</Text>
                <Text style={styles.modalSubTitle}>Curate your luxury parameters</Text>
              </View>
              <TouchableOpacity onPress={() => setShowFilterModal(false)} style={styles.closeBtn}>
                <X color="white" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* BHK Selection */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionLabel}>Rooms / BHK</Text>
                <View style={styles.bhkGrid}>
                  {['All', '1', '2', '3', '4', '5'].map((bhkVal) => {
                    const isSelected = selectedBhk === bhkVal;
                    return (
                      <TouchableOpacity
                        key={bhkVal}
                        style={[styles.bhkChip, isSelected && styles.bhkChipActive]}
                        onPress={() => setSelectedBhk(bhkVal)}
                      >
                        <Text style={[styles.bhkChipText, isSelected && styles.textActive]}>
                          {bhkVal === 'All' ? 'All' : `${bhkVal} BHK`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Price Budget selection */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionLabel}>Budget Valuation ($)</Text>
                <View style={styles.priceRow}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Min Price"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                  <View style={styles.priceDivider} />
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Max Price"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>
              </View>

              {/* City Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionLabel}>City Location</Text>
                <View style={styles.cityGrid}>
                  {['All', 'Delhi', 'Gurgaon', 'Mumbai', 'Noida'].map((cityVal) => {
                    const isSelected = selectedCity === cityVal;
                    return (
                      <TouchableOpacity
                        key={cityVal}
                        style={[styles.cityChip, isSelected && styles.cityChipActive]}
                        onPress={() => setSelectedCity(cityVal)}
                      >
                        <Text style={[styles.cityChipText, isSelected && styles.textActive]}>
                          {cityVal}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Featured toggle */}
              <View style={styles.featuredToggleSection}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featuredToggleTitle}>Editor's Choice Only</Text>
                  <Text style={styles.featuredToggleDesc}>Display verified premier masterpieces</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggleSwitch, onlyFeatured && styles.toggleSwitchActive]}
                  onPress={() => setOnlyFeatured(!onlyFeatured)}
                >
                  <View style={[styles.toggleKnob, onlyFeatured && styles.toggleKnobActive]} />
                </TouchableOpacity>
              </View>

              {/* Action buttons */}
              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setSelectedBhk('All');
                    setSelectedCity('All');
                    setOnlyFeatured(false);
                  }}
                >
                  <Text style={styles.resetBtnText}>Clear All</Text>
                </TouchableOpacity>
                 <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => {
                    setShowFilterModal(false);
                    fetchProperties(true);
                  }}
                >
                  <LinearGradient colors={GOLD_GRADIENT} style={styles.applyBtnGradient}>
                    <Text style={styles.applyBtnText}>Apply Filters</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    flexGrow: 1, // Let scroll content fill available space to prevent black gaps
    paddingHorizontal: 25,
    paddingBottom: 35, // Reduced from 160 to remove the unwanted black bottom gap
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0D0D0D',
    borderRadius: 30,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerTitleWrap: {
    flex: 1,
  },
  modalTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  modalSubTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalBody: {
    gap: 25,
  },
  filterSection: {
    gap: 12,
  },
  sectionLabel: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bhkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bhkChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bhkChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  bhkChipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  textActive: {
    color: GOLD,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 15,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  priceDivider: {
    width: 10,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cityChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  cityChipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  featuredToggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  featuredToggleTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  featuredToggleDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: GOLD,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    transform: [{ translateX: 0 }],
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
    backgroundColor: 'black',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 15,
  },
  resetBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  resetBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  applyBtn: {
    flex: 1.5,
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
  },
  applyBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: 'black',
    fontSize: 15,
    fontWeight: 'bold',
  }
});
