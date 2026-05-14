import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Dimensions, 
  ImageBackground 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Filter, Star, Heart, ArrowRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Theme } from '../styles/theme';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', name: 'Apartments', icon: '🏢' },
  { id: '2', name: 'Villas', icon: '🏡' },
  { id: '3', name: 'Penthouses', icon: '🏙️' },
  { id: '4', name: 'Houses', icon: '🏠' },
];

const FEATURED_PROPERTIES = [
  {
    id: '1',
    title: 'Skyline Penthouse',
    price: '$2,500,000',
    location: 'Manhattan, NY',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    type: 'Penthouse'
  },
  {
    id: '2',
    title: 'Emerald Valley Villa',
    price: '$1,800,000',
    location: 'Beverly Hills, CA',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    type: 'Villa'
  }
];

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Find your dream</Text>
            <Text style={styles.title}>Elite Estate</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <ImageBackground 
              source={{ uri: 'https://i.pravatar.cc/150?u=elite' }} 
              style={styles.profileImage}
              imageStyle={{ borderRadius: Theme.borderRadius.full }}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.searchContainer}>
          <TouchableOpacity 
            style={styles.searchInputWrapper}
            onPress={() => navigation.navigate('Explore')}
          >
            <Search color={Theme.colors.textMuted} size={20} style={styles.searchIcon} />
            <Text style={{ color: Theme.colors.textMuted, fontSize: 16 }}>Search by location, type...</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Filter color={Theme.colors.text} size={20} />
          </TouchableOpacity>
        </Animated.View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
            {CATEGORIES.map((cat, index) => (
              <Animated.View key={cat.id} entering={FadeInRight.delay(index * 100)}>
                <TouchableOpacity style={styles.categoryItem}>
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Featured */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Properties</Text>
            <TouchableOpacity>
              <ArrowRight color={Theme.colors.primary} size={20} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
            {FEATURED_PROPERTIES.map((prop, index) => (
              <Animated.View key={prop.id} entering={FadeInRight.delay(index * 200)}>
                <TouchableOpacity 
                  style={styles.propertyCard}
                  onPress={() => navigation.navigate('PropertyDetails', { property: prop })}
                >
                  <ImageBackground source={{ uri: prop.image }} style={styles.propertyImage} imageStyle={{ borderRadius: Theme.borderRadius.lg }}>
                    <BlurView intensity={20} style={styles.typeTag}>
                      <Text style={styles.typeText}>{prop.type}</Text>
                    </BlurView>
                    <TouchableOpacity style={styles.favoriteButton}>
                      <Heart color="white" size={18} />
                    </TouchableOpacity>
                  </ImageBackground>
                  <View style={styles.propertyInfo}>
                    <View style={styles.propertyTitleRow}>
                      <Text style={styles.propertyName}>{prop.title}</Text>
                      <View style={styles.ratingRow}>
                        <Star color="#F59E0B" fill="#F59E0B" size={14} />
                        <Text style={styles.ratingText}>{prop.rating}</Text>
                      </View>
                    </View>
                    <View style={styles.locationRow}>
                      <MapPin color={Theme.colors.textMuted} size={14} />
                      <Text style={styles.locationText}>{prop.location}</Text>
                    </View>
                    <Text style={styles.priceText}>{prop.price}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Promotional Banner */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.banner}>
          <LinearGradient 
            colors={[Theme.colors.primary, '#4F46E5']} 
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 1}} 
            style={styles.bannerGradient}
          >
            <View>
              <Text style={styles.bannerTitle}>List your property</Text>
              <Text style={styles.bannerSub}>Earn more with Elite Estates</Text>
            </View>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Join as Agent</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Minimal LinearGradient fallback if expo-linear-gradient is not loaded correctly in this environment
const LinearGradient = ({ children, colors, style }: any) => (
  <View style={[style, { backgroundColor: colors[0] }]}>{children}</View>
);

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
    paddingTop: Theme.spacing.md,
  },
  greeting: {
    color: Theme.colors.textMuted,
    fontSize: 16,
    fontFamily: Theme.fonts.regular,
  },
  title: {
    color: Theme.colors.text,
    fontSize: 28,
    fontFamily: Theme.fonts.bold,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.xl,
    gap: Theme.spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    height: 54,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Theme.colors.text,
    fontSize: 16,
  },
  filterButton: {
    width: 54,
    height: 54,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: Theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    color: Theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    color: Theme.colors.primary,
    fontSize: 14,
  },
  categoriesList: {
    paddingLeft: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  categoryItem: {
    backgroundColor: Theme.colors.surface,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryName: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  featuredList: {
    paddingLeft: Theme.spacing.lg,
    gap: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  propertyCard: {
    width: width * 0.7,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    padding: Theme.spacing.md,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyInfo: {
    padding: Theme.spacing.md,
  },
  propertyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyName: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
  },
  priceText: {
    color: Theme.colors.secondary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: Theme.spacing.sm,
  },
  banner: {
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
  },
  bannerGradient: {
    padding: Theme.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  bannerButton: {
    backgroundColor: 'white',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  bannerButtonText: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
  }
});
