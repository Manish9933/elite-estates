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
import { useAuth } from '../context/AuthContext';
import { propertyApi } from '../api/properties';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const GOLD = Theme.colors.gold;
const GOLD_GRADIENT = Theme.colors.goldGradient;

const FILTER_CHIPS = ['All', 'Apartment', 'Villa', 'Penthouse', 'Mansion', 'Townhouse'];

export default function ExploreScreen({ navigation, route }: any) {
  const [selectedChip, setSelectedChip] = useState(route.params?.type || 'All');
  const [searchQuery, setSearchQuery] = useState(route.params?.query || '');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await propertyApi.getProperties({
        query: searchQuery,
        type: selectedChip
      });
      if (data) setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedChip]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const numColumns = width > 1200 ? 3 : width > 800 ? 2 : 1;
  const cardWidth = width > 800 ? (width - (isWeb ? 120 : 40) - (numColumns - 1) * 20) / numColumns : width - 40;

  const renderPropertyItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View 
      entering={FadeInUp.delay(index * 100)}
      style={[isWeb && { width: cardWidth, marginBottom: 30 }]}
    >
      <TouchableOpacity 
        style={styles.propertyCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PropertyDetails', { property: item })}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/600' }} style={styles.propertyImage} />
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>ELITE COLLECTION</Text>
          </View>
          <TouchableOpacity style={styles.favoriteButton}>
            <Heart color="white" size={20} fill={item.isFavorite ? "white" : "transparent"} />
          </TouchableOpacity>
          <View style={styles.floatingPrice}>
            <Text style={styles.priceSymbol}>$</Text>
            <Text style={styles.priceValue}>{Number(item.price).toLocaleString()}</Text>
          </View>
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
          
          <Text style={styles.titleText}>{item.title}</Text>
          
          <View style={styles.locationRow}>
            <MapPin color={GOLD} size={16} />
            <Text style={styles.locationText}>{item.address}</Text>
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
            value={searchQuery}
            onChangeText={setSearchQuery}
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={GOLD} />
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
  }
});
