import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Dimensions, 
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, SlidersHorizontal, Map as MapIcon, Grid, Heart, Star } from 'lucide-react-native';
import { Theme } from '../styles/theme';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const PROPERTIES = [
  {
    id: '1',
    title: 'Skyline Penthouse',
    price: '$2,500,000',
    location: 'Manhattan, NY',
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Penthouse',
    bhk: 4,
    area: '3,200 sqft'
  },
  {
    id: '2',
    title: 'Emerald Valley Villa',
    price: '$1,800,000',
    location: 'Beverly Hills, CA',
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Villa',
    bhk: 5,
    area: '4,500 sqft'
  },
  {
    id: '3',
    title: 'Ocean View Loft',
    price: '$950,000',
    location: 'Miami, FL',
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672033835-c0ed43d8383e?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Loft',
    bhk: 2,
    area: '1,500 sqft'
  }
];

const FILTER_CHIPS = ['All', 'Apartments', 'Villas', 'Lofts', 'Houses'];

export default function ExploreScreen({ navigation }: any) {
  const [selectedChip, setSelectedChip] = useState('All');
  const [isMapView, setIsMapView] = useState(false);

  const renderPropertyItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100)}>
      <TouchableOpacity 
        style={styles.propertyCard}
        onPress={() => navigation.navigate('PropertyDetails', { property: item })}
      >
        <Image source={{ uri: item.images[0] }} style={styles.propertyImage} />
        <TouchableOpacity style={styles.favoriteButton}>
          <Heart color="white" size={18} />
        </TouchableOpacity>
        
        <View style={styles.propertyDetails}>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{item.price}</Text>
            <View style={styles.ratingBox}>
              <Star color="#F59E0B" fill="#F59E0B" size={14} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
          
          <Text style={styles.titleText}>{item.title}</Text>
          
          <View style={styles.locationRow}>
            <MapPin color={Theme.colors.textMuted} size={14} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
          
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>{item.bhk} BHK</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>{item.area}</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>{item.type}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.welcomeText}>Find Your</Text>
          <Text style={styles.brandText}>Elite Estate</Text>
        </View>
        <TouchableOpacity style={styles.profileImageContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }} 
            style={styles.profileAvatar}
          />
        </TouchableOpacity>
      </View>

      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search color={Theme.colors.primary} size={20} />
          <TextInput 
            placeholder="Search by city, neighborhood..." 
            placeholderTextColor={Theme.colors.textMuted}
            style={styles.searchInput}
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
      <FlatList 
        data={PROPERTIES}
        renderItem={renderPropertyItem}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>Found 128 Properties</Text>
            <TouchableOpacity 
              style={styles.viewToggle}
              onPress={() => navigation.navigate('Map')}
            >
              <MapIcon color={Theme.colors.primary} size={20} />
              <Text style={styles.toggleText}>Map View</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
  },
  welcomeText: {
    color: Theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  brandText: {
    color: Theme.colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    height: 60,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    color: Theme.colors.text,
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: Theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipsContainer: {
    marginBottom: Theme.spacing.sm,
  },
  chipsList: {
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  selectedChip: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  chipText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedChipText: {
    color: 'white',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  resultsCount: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.glass,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  toggleText: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultsList: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  propertyCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  propertyImage: {
    width: '100%',
    height: 220,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyDetails: {
    padding: Theme.spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceText: {
    color: Theme.colors.secondary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  titleText: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: 12,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  featureDivider: {
    width: 1,
    height: 15,
    backgroundColor: Theme.colors.border,
  }
});
