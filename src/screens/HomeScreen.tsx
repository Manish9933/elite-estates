import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  ImageBackground,
  Image,
  Platform,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Theme } from '../styles/theme';
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  FadeInUp, 
  ZoomIn, 
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { propertyApi } from '../api/properties';
import { profileApi } from '../api/profiles';
import { supabase as supabaseClient } from '../lib/supabase';
import { CATEGORIES } from '../utils/mockData';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const GOLD = '#D4AF37';
const GOLD_GRADIENT = ['#F9F295', '#E0AA3E', '#B88A44', '#D4AF37'] as const;

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [nearbyProperties, setNearbyProperties] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [globalStats, setGlobalStats] = useState({ locations: '0', agents: '0', rating: '4.9' });

  const fetchHomeData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [featured, nearby, profileRes, favoritesRes, counts] = await Promise.all([
        propertyApi.getProperties({ isFeatured: true }),
        propertyApi.getProperties(),
        profileApi.getProfile(user.id),
        propertyApi.getFavorites(user.id),
        Promise.all([
          supabaseClient.from('properties').select('*', { count: 'exact', head: true }),
          supabaseClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agent')
        ])
      ]);

      if (featured.data) setFeaturedProperties(featured.data);
      if (nearby.data) setNearbyProperties(nearby.data.slice(0, 6));
      if (profileRes.data) setProfile(profileRes.data);
      
      if (favoritesRes.data) {
        const favIds = new Set(favoritesRes.data.map((f: any) => f.property.id));
        setUserFavorites(favIds);
      }
      
      const [propCount, agentCount] = counts;
      setGlobalStats({
        locations: propCount.count ? `${(propCount.count * 12).toLocaleString()}+` : '2.5k+',
        agents: agentCount.count ? agentCount.count.toString() : '150+',
        rating: '4.9'
      });
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const heroScale = useSharedValue(1);

  useEffect(() => {
    fetchHomeData();
    heroScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 6000 }),
        withTiming(1, { duration: 6000 })
      ),
      -1,
      true
    );
  }, [fetchHomeData]);

  const animatedHeroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }]
  }));

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
      // Rollback if failed
      setUserFavorites(userFavorites);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  const numColumns = width > 1200 ? 3 : width > 800 ? 2 : 1;
  const cardWidth = width > 800 ? (width - (isWeb ? 120 : 40) - (numColumns - 1) * 30) / numColumns : width - 40;
  const horizontalCardWidth = width > 800 ? cardWidth : width * 0.88;

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning Elegance';
    if (hour < 17) return 'Afternoon Prestige';
    return 'Evening Serenity';
  };

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';
  const userImage = profile?.avatar_url || user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/150?u=elite';

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />
        }
      >
        
        {/* Cinematic Hero */}
          <Animated.View style={[styles.heroBackground, animatedHeroStyle]}>
            <ImageBackground 
              source={{ uri: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80' }}
              style={styles.heroBackground}
              imageStyle={{ borderRadius: isWeb ? 30 : 0 }}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.95)']}
                style={styles.heroGradient}
              >
                <Animated.View entering={FadeInUp.duration(1000)} style={styles.heroContent}>
                  <View style={styles.headerTop}>
                  <View>
                    <Text style={styles.greeting}>{getTimeGreeting()},</Text>
                    <Text style={styles.userName}>{userName}</Text>
                  </View>
                    <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
                      <Image source={{ uri: userImage }} style={styles.profileImg} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.heroBottom}>
                    <Animated.Text entering={FadeInDown.delay(200).duration(800)} style={styles.heroTitle}>
                      Discover Your{'\n'}<Text style={{ color: GOLD }}>Eternal</Text> Domain
                    </Animated.Text>
                    
                    <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.searchBar}>
                      <LucideIcons.Search color="rgba(255,255,255,0.4)" size={20} />
                      <TextInput 
                        placeholder="Search locations, styles..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        style={styles.searchInput}
                        value={search}
                        onChangeText={setSearch}
                      />
                      <TouchableOpacity style={styles.filterBtn} onPress={() => navigation.navigate('Explore')}>
                        <LucideIcons.Filter color="black" size={18} />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                </Animated.View>
              </LinearGradient>
            </ImageBackground>
          </Animated.View>

        {/* Floating Quick Stats */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.statsBar}>
          <BlurView intensity={40} style={styles.statsContent}>
            <View style={styles.statItem}>
              <LucideIcons.Globe size={18} color={GOLD} />
              <Text style={styles.statVal}>{globalStats.locations}</Text>
              <Text style={styles.statLab}>Portfolio</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <LucideIcons.ShieldCheck size={18} color={GOLD} />
              <Text style={styles.statVal}>{globalStats.agents}</Text>
              <Text style={styles.statLab}>Elite Agents</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <LucideIcons.Star size={18} color={GOLD} />
              <Text style={styles.statVal}>{globalStats.rating}</Text>
              <Text style={styles.statLab}>Global CSAT</Text>
            </View>
          </BlurView>
        </Animated.View>

        {/* Collections Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exclusive Collections</Text>
            <TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate('Explore')}>
              <Text style={styles.seeAllText}>Explore</Text>
              <LucideIcons.ArrowRight size={14} color={GOLD} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {CATEGORIES.map((cat, index) => (
              <Animated.View key={cat.id} entering={FadeInRight.delay(index * 100)}>
                <TouchableOpacity 
                  style={styles.categoryCard}
                  onPress={() => navigation.navigate('Explore', { type: cat.name })}
                >
                  <View style={styles.categoryIconWrapper}>
                    <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                  </View>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Handpicked Section */}
        {featuredProperties.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Curated Portfolio</Text>
              <LinearGradient colors={GOLD_GRADIENT} start={[0,0]} end={[1,0]} style={styles.badge}>
                <LucideIcons.Award size={12} color="black" fill="black" />
                <Text style={styles.badgeText}>ELITE SELECTION</Text>
              </LinearGradient>
            </View>
            
            <ScrollView 
              horizontal={!isWeb || width < 800} 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.featuredList,
                isWeb && width >= 800 && styles.featuredGrid
              ]}
            >
              {featuredProperties.map((prop, index) => (
                <Animated.View 
                  key={prop.id} 
                  entering={FadeInDown.delay(index * 150).springify()}
                  layout={LinearTransition}
                  style={[styles.propCardWrapper, { width: horizontalCardWidth }]}
                >
                  <TouchableOpacity 
                    activeOpacity={0.9}
                    style={styles.propCard}
                    onPress={() => navigation.navigate('PropertyDetails', { property: prop })}
                  >
                    <ImageBackground source={{ uri: prop.images?.[0] || 'https://via.placeholder.com/400' }} style={styles.propImage} imageStyle={{ borderRadius: 28 }}>
                      <LinearGradient 
                        colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']} 
                        style={[StyleSheet.absoluteFill, { borderRadius: 28 }]} 
                      />
                      <View style={styles.propCardHeader}>
                        <BlurView intensity={40} style={styles.propType}>
                          <Text style={styles.propTypeText}>{prop.property_type}</Text>
                        </BlurView>
                        <TouchableOpacity 
                          style={styles.favBtn}
                          onPress={() => handleToggleFavorite(prop.id)}
                        >
                          <LucideIcons.Heart 
                            color={userFavorites.has(prop.id) ? Theme.colors.gold : "white"} 
                            size={18} 
                            fill={userFavorites.has(prop.id) ? Theme.colors.gold : "transparent"} 
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.propImageOverlay}>
                        <View style={styles.verifiedBadge}>
                          <LucideIcons.ShieldCheck size={10} color={Theme.colors.gold} />
                          <Text style={styles.verifiedText}>VERIFIED ASSET</Text>
                        </View>
                      </View>
                    </ImageBackground>
                    
                    <View style={styles.propInfo}>
                      <View style={styles.propTitleRow}>
                        <Text style={styles.propName} numberOfLines={1}>{prop.title}</Text>
                        <View style={styles.propRating}>
                          <LucideIcons.Star size={10} color={GOLD} fill={GOLD} />
                          <Text style={styles.propRatingText}>4.9</Text>
                        </View>
                      </View>
                      <View style={styles.propLocation}>
                        <LucideIcons.MapPin size={12} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.propLocationText} numberOfLines={1}>{prop.address}, {prop.city}</Text>
                      </View>
                      <View style={styles.propPriceRow}>
                        <View>
                          <Text style={styles.priceLabel}>ASKING PRICE</Text>
                          <Text style={styles.propPrice}>${Number(prop.price).toLocaleString()}</Text>
                        </View>
                        <TouchableOpacity style={styles.viewBtn}>
                          <LucideIcons.ArrowRight size={20} color="black" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Map Experience */}
        <Animated.View entering={ZoomIn.delay(800)} style={styles.mapBanner}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80' }}
            style={styles.mapBannerBg}
            imageStyle={{ borderRadius: 28 }}
          >
            <BlurView intensity={25} style={styles.mapBannerContent}>
              <View style={styles.mapIconCircle}>
                <LucideIcons.Map size={24} color="black" />
              </View>
              <View style={styles.mapTextContainer}>
                <Text style={styles.mapBannerTitle}>Territory Matrix</Text>
                <Text style={styles.mapBannerSub}>Immersive 3D location discovery</Text>
              </View>
              <TouchableOpacity style={styles.mapGoBtn} onPress={() => navigation.navigate('Explore')}>
                <Text style={styles.mapGoText}>Enter</Text>
              </TouchableOpacity>
            </BlurView>
          </ImageBackground>
        </Animated.View>

        {/* Masterpieces Section */}
        {nearbyProperties.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby Masterpieces</Text>
            </View>
            
            <View style={[
              styles.featuredList,
              styles.featuredGrid
            ]}>
              {nearbyProperties.map((prop, index) => (
                <Animated.View 
                  key={prop.id} 
                  entering={FadeInDown.delay(index * 150).springify()}
                  layout={LinearTransition}
                  style={[styles.propCardWrapper, { width: cardWidth }]}
                >
                  <TouchableOpacity 
                    style={styles.propCard}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('PropertyDetails', { property: prop })}
                  >
                    <ImageBackground source={{ uri: prop.images?.[0] || 'https://via.placeholder.com/400' }} style={styles.propImage} imageStyle={{ borderRadius: 28 }}>
                      <LinearGradient 
                        colors={['rgba(0,0,0,0.3)', 'transparent']} 
                        style={[StyleSheet.absoluteFill, { borderRadius: 28 }]} 
                      />
                      <View style={styles.propCardHeader}>
                        <BlurView intensity={20} style={styles.propType}>
                          <Text style={styles.propTypeText}>{prop.property_type}</Text>
                        </BlurView>
                      </View>
                    </ImageBackground>
                    
                    <View style={styles.propInfo}>
                      <Text style={styles.propName} numberOfLines={1}>{prop.title}</Text>
                      <View style={styles.propLocation}>
                        <LucideIcons.MapPin size={10} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.propLocationText} numberOfLines={1}>{prop.address}</Text>
                      </View>
                      <View style={styles.propPriceRow}>
                        <Text style={styles.propPrice}>${Number(prop.price).toLocaleString()}</Text>
                        <View style={styles.propRating}>
                           <LucideIcons.Star size={8} color={GOLD} fill={GOLD} />
                           <Text style={[styles.propRatingText, {fontSize: 10}]}>4.8</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  scrollContent: {
    paddingBottom: 100,
    maxWidth: isWeb ? 1400 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  heroSection: {
    paddingHorizontal: isWeb ? 40 : 0,
    paddingTop: isWeb ? 20 : 0,
    height: isWeb ? 600 : 540,
  },
  heroBackground: {
    flex: 1,
    overflow: 'hidden',
  },
  heroGradient: {
    flex: 1,
    padding: 25,
    paddingTop: Platform.OS === 'android' ? 55 : 25,
    justifyContent: 'space-between',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: GOLD,
    padding: 2,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  profileImg: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  heroBottom: {
    marginBottom: 30,
  },
  heroTitle: {
    color: 'white',
    fontSize: isWeb ? 58 : 42,
    fontWeight: 'bold',
    lineHeight: isWeb ? 66 : 50,
    marginBottom: 35,
    letterSpacing: -0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    paddingHorizontal: 22,
    height: 72,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...Platform.select({
      web: { backdropFilter: 'blur(30px)' }
    }),
  } as any,
  searchInput: {
    flex: 1,
    marginLeft: 15,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  filterBtn: {
    backgroundColor: GOLD,
    width: 48,
    height: 48,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  statsBar: {
    marginTop: -30,
    marginHorizontal: 25,
    zIndex: 10,
  },
  statsContent: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20,20,20,0.85)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'space-around',
    alignItems: 'center',
    overflow: 'hidden',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statVal: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLab: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  section: {
    marginTop: 45,
    paddingHorizontal: isWeb ? 40 : 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seeAllText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '700',
  },
  categoryList: {
    paddingRight: 40,
    gap: 18,
  },
  categoryCard: {
    alignItems: 'center',
    gap: 10,
  },
  categoryIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  badgeText: {
    color: 'black',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  featuredList: {
    gap: 28,
  },
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 25,
  },
  propCardWrapper: {
    marginBottom: isWeb ? 35 : 0,
  },
  propCard: {
    backgroundColor: '#0D0D0D',
    borderRadius: 38,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  propImage: {
    width: '100%',
    height: 260,
    padding: 18,
  },
  propCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  propType: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  propTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  favBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propInfo: {
    padding: 18,
    paddingTop: 15,
  },
  propTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  propName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  propRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  propRatingText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  propLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  propLocationText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  propPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 18,
  },
  propPrice: {
    color: GOLD,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  viewBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  propImageOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 15,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  verifiedText: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  priceLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  mapBanner: {
    marginTop: 55,
    marginHorizontal: isWeb ? 40 : 25,
    marginBottom: 25,
    height: 190,
  },
  mapBannerBg: {
    flex: 1,
    overflow: 'hidden',
  },
  mapBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 28,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  mapIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GOLD,
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  mapTextContainer: {
    flex: 1,
    marginLeft: 22,
  },
  mapBannerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  mapBannerSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 5,
  },
  mapGoBtn: {
    backgroundColor: 'white',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
  },
  mapGoText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
