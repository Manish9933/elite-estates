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
  RefreshControl,
  Modal,
  PanResponder,
  Animated as RNAnimated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Theme } from '../styles/theme';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
  ZoomIn,
  LinearTransition,
  FadeOutRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { propertyApi } from '../api/properties';
import { profileApi } from '../api/profiles';
import { supabase as supabaseClient } from '../lib/supabase';
import { CATEGORIES } from '../utils/mockData';
import { ShimmerSkeleton } from '../components/Skeleton';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const GOLD = '#D4AF37';
const GOLD_GRADIENT = ['#F9F295', '#E0AA3E', '#B88A44', '#D4AF37'] as const;
export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const isFocused = useIsFocused();
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [trendingProperties, setTrendingProperties] = useState<any[]>([]);
  const [nearbyProperties, setNearbyProperties] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [globalStats, setGlobalStats] = useState({ locations: '0', agents: '0', rating: '4.9' });
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [lastDismissedNotif, setLastDismissedNotif] = useState<any>(null);
  const [showUndoBanner, setShowUndoBanner] = useState(false);
  const undoTimer = React.useRef<any>(null);

  const fetchHomeData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Set solid luxury defaults first so screen renders instantly
      setGlobalStats({
        locations: '2,500+',
        agents: '150+',
        rating: '4.9'
      });

      // Optimized parallel fetching of core data (consolidated redundant queries)
      const [nearby, profileRes, favoritesRes, bookingsRes] = await Promise.all([
        propertyApi.getProperties(),
        profileApi.getProfile(user.id),
        propertyApi.getFavorites(user.id),
        supabaseClient.from('bookings').select('*, properties(title, price)').eq('buyer_id', user.id).order('created_at', { ascending: false })
      ]);

      if (nearby.data) {
        const allProps = nearby.data;
        // Filter featured properties locally to save a whole roundtrip network call!
        setFeaturedProperties(allProps.filter((p: any) => p.is_featured));
        setNearbyProperties(allProps.slice(0, 6));
        setTrendingProperties(allProps.slice(2, 7)); // Just pick some as trending for now
      }
      
      if (profileRes.data) setProfile(profileRes.data);

      if (favoritesRes.data) {
        const favIds = new Set(favoritesRes.data.map((f: any) => f.property.id));
        setUserFavorites(favIds);
      }

      if (bookingsRes.data) {
        const list: any[] = [];
        bookingsRes.data.forEach((b: any) => {
          let amt = b.properties?.price || 0;
          if (b.notes) {
            try {
              const parsed = JSON.parse(b.notes);
              if (parsed && typeof parsed.offer_amount === 'number') {
                amt = parsed.offer_amount;
              }
            } catch (e) {
              const num = Number(b.notes);
              if (!isNaN(num) && num > 0) amt = num;
            }
          }

          if (b.status === 'accepted') {
            list.push({
              id: `book-${b.id}-acc`,
              title: 'Offer Accepted! 🎉',
              message: `Congratulations! Your offer of $${(amt / 1000).toFixed(0)}k for ${b.properties?.title || 'Property'} has been accepted!`,
              date: new Date(b.created_at).toLocaleDateString(),
              type: 'success'
            });
          } else if (b.status === 'rejected') {
            list.push({
              id: `book-${b.id}-rej`,
              title: 'Offer Rejected',
              message: `Your offer of $${(amt / 1000).toFixed(0)}k for ${b.properties?.title || 'Property'} was not accepted.`,
              date: new Date(b.created_at).toLocaleDateString(),
              type: 'error'
            });
          } else if (b.status === 'countered') {
            list.push({
              id: `book-${b.id}-cnt`,
              title: 'Counter Offer Received 🏷️',
              message: `A new counter offer of $${(amt / 1000).toFixed(0)}k was submitted for ${b.properties?.title || 'Property'}.`,
              date: new Date(b.created_at).toLocaleDateString(),
              type: 'info'
            });
          } else {
            list.push({
              id: `book-${b.id}-pend`,
              title: 'Offer Pending Review',
              message: `Your offer of $${(amt / 1000).toFixed(0)}k for ${b.properties?.title || 'Property'} is pending agent/admin review.`,
              date: new Date(b.created_at).toLocaleDateString(),
              type: 'pending'
            });
          }
        });
        setNotificationsList(list);
        setUnreadCount(list.filter(item => item.type !== 'pending').length);
      }

      // Lazy background query for exact statistics so we do not block the UI loading thread
      Promise.all([
        supabaseClient.from('properties').select('*', { count: 'exact', head: true }),
        supabaseClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agent'),
        supabaseClient.from('bookings').select('*', { count: 'exact', head: true }),
        supabaseClient.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'accepted')
      ]).then((counts) => {
        const [propCount, agentCount, totalBookingsCount, acceptedBookingsCount] = counts;
        const totalBookings = totalBookingsCount?.count || 0;
        const acceptedBookings = acceptedBookingsCount?.count || 0;
        const dynamicCsatValue = totalBookings > 0 ? (4.5 + (acceptedBookings / totalBookings) * 0.5).toFixed(1) : '4.9';

        setGlobalStats({
          locations: propCount.count ? `${(propCount.count * 12).toLocaleString()}+` : '2,500+',
          agents: agentCount.count ? agentCount.count.toString() : '150+',
          rating: dynamicCsatValue
        });
      }).catch(err => {
        console.log('Lazy background stats fetch failed (non-blocking):', err);
      });

    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const heroScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isFocused) {
      fetchHomeData();
    }
  }, [isFocused, fetchHomeData]);

  useEffect(() => {
    heroScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 6000 }),
        withTiming(1, { duration: 6000 })
      ),
      -1,
      true
    );

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedHeroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }]
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: withTiming(pulseScale.value === 1 ? 0.6 : 1)
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
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';
  const userImage = profile?.avatar_url || user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/150?u=elite';

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
            <View>
              <ShimmerSkeleton width={120} height={20} borderRadius={4} style={{ marginBottom: 8 }} />
              <ShimmerSkeleton width={180} height={32} borderRadius={6} />
            </View>
            <ShimmerSkeleton width={50} height={50} borderRadius={25} />
          </View>

          <ShimmerSkeleton width="100%" height={60} borderRadius={15} style={{ marginBottom: 40 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 }}>
            <ShimmerSkeleton width="30%" height={70} borderRadius={20} />
            <ShimmerSkeleton width="30%" height={70} borderRadius={20} />
            <ShimmerSkeleton width="30%" height={70} borderRadius={20} />
          </View>

          <View style={{ marginBottom: 30 }}>
            <ShimmerSkeleton width={200} height={25} borderRadius={4} style={{ marginBottom: 20 }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2, 3].map(i => (
                <ShimmerSkeleton key={i} width={300} height={400} borderRadius={30} style={{ marginRight: 20 }} />
              ))}
            </ScrollView>
          </View>

          <View>
            <ShimmerSkeleton width={180} height={25} borderRadius={4} style={{ marginBottom: 20 }} />
            <ShimmerSkeleton width="100%" height={250} borderRadius={30} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Dynamic filtering for search queries
  const filteredTrending = trendingProperties.filter((p: any) => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.address.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    (p.property_type && p.property_type.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredFeatured = featuredProperties.filter((p: any) => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.address.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    (p.property_type && p.property_type.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredNearby = nearbyProperties.filter((p: any) => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.address.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    (p.property_type && p.property_type.toLowerCase().includes(search.toLowerCase()))
  );

  const showNoResults = search !== '' && 
    filteredTrending.length === 0 && 
    filteredFeatured.length === 0 && 
    filteredNearby.length === 0;

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
        <View style={styles.heroContainer}>
          <Animated.Image
            source={{ uri: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80' }}
            style={[StyleSheet.absoluteFill, animatedHeroStyle]}
            resizeMode="cover"
          />
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity style={styles.notificationBtn} onPress={() => setShowNotificationsModal(true)}>
                    <LucideIcons.Bell color="white" size={22} />
                    {unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{unreadCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
                    <Image source={{ uri: userImage }} style={styles.profileImg} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.heroBottom}>
                <Animated.Text entering={FadeInDown.delay(200).duration(800)} style={styles.heroTitle}>
                  Find Your{'\n'}<Text style={{ color: GOLD }}>Dream</Text> Home
                </Animated.Text>

                <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.searchBar}>
                  <LucideIcons.Search color="rgba(255,255,255,0.4)" size={20} />
                  <TextInput
                    placeholder="Search locations, styles..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={() => navigation.navigate('Explore', { query: search })}
                    returnKeyType="search"
                  />
                  <TouchableOpacity style={styles.filterBtn} onPress={() => navigation.navigate('Explore', { query: search, openFilter: true })}>
                    <LucideIcons.Filter color={GOLD} size={18} />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Animated.View>
          </LinearGradient>
        </View>

        {/* Floating Quick Stats */}
        <Animated.View entering={FadeInUp.delay(500)} style={[styles.statsBar, styles.statsContainer]}>
          <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />
          <View style={styles.statsContent}>
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
          </View>
        </Animated.View>

        {/* Collections Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Categories</Text>
            <TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate('Explore')}>
              <Text style={styles.seeAllText}>Explore</Text>
              <LucideIcons.ArrowRight size={14} color={GOLD} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {CATEGORIES.map((cat, index) => (
              <Animated.View
                key={cat.id}
                entering={FadeInRight.delay(Math.min(index * 40, 200)).duration(800).springify()}
              >
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

        {/* Trending Section - LUXURIOUS */}
        {filteredTrending.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Trending Homes</Text>
                <Text style={styles.sectionSub}>Popular this week</Text>
              </View>
              <TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate('Explore', { sort: 'trending' })}>
                <Text style={styles.seeAllText}>View All</Text>
                <LucideIcons.TrendingUp size={14} color={GOLD} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingList}>
              {filteredTrending.map((prop, index) => (
                <Animated.View
                  key={`trending-${prop.id}`}
                  entering={FadeInRight.delay(Math.min(index * 50, 250)).duration(800).springify()}
                  style={styles.trendingCardWrapper}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('PropertyDetails', { property: prop })}
                    style={styles.trendingCard}
                  >
                    <ImageBackground
                      source={{ uri: prop.images?.[0] || 'https://via.placeholder.com/400' }}
                      style={styles.trendingImage}
                      imageStyle={{ borderRadius: 24 }}
                    >
                      <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
                        style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
                      />

                      <View style={styles.trendingHeader}>
                        <BlurView intensity={30} style={styles.trendingBadge}>
                          <LucideIcons.Zap size={10} color={GOLD} fill={GOLD} />
                          <Text style={styles.trendingBadgeText}>POPULAR</Text>
                        </BlurView>
                        <TouchableOpacity 
                          style={styles.trendingFav}
                          onPress={() => handleToggleFavorite(prop.id)}
                        >
                          <LucideIcons.Heart 
                            size={14} 
                            color={userFavorites.has(prop.id) ? Theme.colors.gold : "white"} 
                            fill={userFavorites.has(prop.id) ? Theme.colors.gold : "transparent"} 
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.trendingContent}>
                        <Text style={styles.trendingTitle} numberOfLines={1}>{prop.title}</Text>
                        <View style={styles.trendingFooter}>
                          <Text style={styles.trendingPrice}>${Number(prop.price).toLocaleString()}</Text>
                          <View style={styles.trendingRating}>
                            <LucideIcons.Star size={10} color={GOLD} fill={GOLD} />
                            <Text style={styles.trendingRatingText}>4.9</Text>
                          </View>
                        </View>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Handpicked Section */}
        {filteredFeatured.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Properties</Text>
              <LinearGradient colors={GOLD_GRADIENT} start={[0, 0]} end={[1, 0]} style={styles.badge}>
                <LucideIcons.Award size={12} color="black" fill="black" />
                <Text style={styles.badgeText}>EDITOR'S CHOICE</Text>
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
              {filteredFeatured.map((prop, index) => (
                <Animated.View
                  key={prop.id}
                  entering={FadeInDown.delay(Math.min(index * 50, 250)).springify()}
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
                          <Text style={styles.verifiedText}>VERIFIED</Text>
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
        {!showNoResults && (
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
                  <Text style={styles.mapBannerTitle}>Interactive Map</Text>
                  <Text style={styles.mapBannerSub}>Find homes near you on the map</Text>
                </View>
                <TouchableOpacity style={styles.mapGoBtn} onPress={() => navigation.navigate('Explore')}>
                  <Text style={styles.mapGoText}>Enter</Text>
                </TouchableOpacity>
              </BlurView>
            </ImageBackground>
          </Animated.View>
        )}

        {/* Masterpieces Section */}
        {filteredNearby.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Homes Near You</Text>
                <Text style={styles.sectionSub}>Luxury homes in your neighborhood</Text>
              </View>
              <View style={styles.nearbyIndicator}>
                <Animated.View style={[styles.pulsePoint, animatedPulseStyle]} />
                <Text style={styles.nearbyText}>Live Location</Text>
              </View>
            </View>

            <View style={[
              styles.featuredList,
              styles.featuredGrid
            ]}>
              {filteredNearby.map((prop, index) => (
                <Animated.View
                  key={prop.id}
                  entering={FadeInDown.delay(Math.min(index * 50, 250)).springify()}
                  layout={LinearTransition}
                  style={[styles.propCardWrapper, { width: cardWidth }]}
                >
                  <TouchableOpacity
                    style={styles.masterpieceCard}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('PropertyDetails', { property: prop })}
                  >
                    <ImageBackground source={{ uri: prop.images?.[0] || 'https://via.placeholder.com/400' }} style={styles.masterpieceImage} imageStyle={{ borderRadius: 32 }}>
                      <LinearGradient
                        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
                        style={[StyleSheet.absoluteFill, { borderRadius: 32 }]}
                      />
                      <View style={styles.masterpieceBadge}>
                        <LucideIcons.Navigation size={10} color="black" fill="black" />
                        <Text style={styles.masterpieceBadgeText}>NEARBY</Text>
                      </View>
                    </ImageBackground>

                    <View style={styles.masterpieceInfo}>
                      <View style={styles.masterpieceTitleRow}>
                        <Text style={styles.masterpieceName} numberOfLines={1}>{prop.title}</Text>
                        <View style={styles.masterpieceRating}>
                          <LucideIcons.Star size={10} color={GOLD} fill={GOLD} />
                          <Text style={styles.masterpieceRatingText}>4.8</Text>
                        </View>
                      </View>
                      <View style={styles.masterpieceLocation}>
                        <LucideIcons.MapPin size={12} color={GOLD} />
                        <Text style={styles.masterpieceLocationText} numberOfLines={1}>{prop.address}</Text>
                      </View>
                      <View style={styles.masterpiecePriceRow}>
                        <Text style={styles.masterpiecePrice}>${Number(prop.price).toLocaleString()}</Text>
                        <TouchableOpacity style={styles.masterpieceViewBtn}>
                          <LucideIcons.ChevronRight size={18} color={GOLD} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>
        )}

        {showNoResults && (
          <Animated.View entering={FadeInUp.duration(600)} style={styles.noResultsContainer}>
            <LucideIcons.Search size={48} color="rgba(255, 255, 255, 0.2)" style={{ marginBottom: 15 }} />
            <Text style={styles.noResultsTitle}>No Masterpieces Found</Text>
            <Text style={styles.noResultsText}>
              We couldn't find any properties matching "{search}".
            </Text>
          </Animated.View>
        )}

      </ScrollView>

      {/* Premium Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowNotificationsModal(false);
          setUnreadCount(0);
        }}
      >
        <BlurView intensity={50} style={StyleSheet.absoluteFill} tint="dark">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 }}>
            <View style={{
              width: '100%',
              maxWidth: 450,
              backgroundColor: '#0D0D0D',
              borderRadius: 30,
              borderWidth: 1.5,
              borderColor: 'rgba(212, 175, 55, 0.2)',
              overflow: 'hidden',
              paddingBottom: 20,
              maxHeight: '80%',
            }}>
              {/* Header */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingVertical: 20,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.05)',
                backgroundColor: '#111111',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <LucideIcons.Bell color={GOLD} size={20} />
                  <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 18, letterSpacing: 0.5 }}>Notifications</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowNotificationsModal(false);
                    setUnreadCount(0);
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <LucideIcons.X color="#FFF" size={16} />
                </TouchableOpacity>
              </View>

              {/* List */}
              <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} showsVerticalScrollIndicator={false}>
                {notificationsList.length > 0 ? (
                  notificationsList.map((notif) => {
                    let borderColor = 'rgba(255,255,255,0.05)';
                    let glowColor = 'rgba(255,255,255,0.02)';
                    if (notif.type === 'success') {
                      borderColor = 'rgba(16, 185, 129, 0.2)';
                      glowColor = 'rgba(16, 185, 129, 0.05)';
                    } else if (notif.type === 'error') {
                      borderColor = 'rgba(239, 68, 68, 0.2)';
                      glowColor = 'rgba(239, 68, 68, 0.05)';
                    } else if (notif.type === 'info') {
                      borderColor = 'rgba(0, 229, 255, 0.2)';
                      glowColor = 'rgba(0, 229, 255, 0.05)';
                    }

                    return (
                      <Animated.View
                        key={notif.id}
                        exiting={FadeOutRight}
                        layout={LinearTransition}
                        style={{ marginVertical: 4 }}
                      >
                        <View style={{
                          borderRadius: 18,
                          padding: 16,
                          borderWidth: 1,
                          borderColor,
                          backgroundColor: glowColor,
                        }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <Text style={{ color: GOLD, fontSize: 13, fontWeight: '800', flex: 1, marginRight: 10 }}>{notif.title}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                              <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{notif.date}</Text>
                              <TouchableOpacity
                                onPress={() => {
                                  if (Platform.OS !== 'web') {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
                                  }
                                  setNotificationsList(prev => prev.filter(item => item.id !== notif.id));
                                  setLastDismissedNotif(notif);
                                  setShowUndoBanner(true);

                                  if (undoTimer.current) clearTimeout(undoTimer.current);
                                  undoTimer.current = setTimeout(() => {
                                    setShowUndoBanner(false);
                                  }, 5000);
                                }}
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 10,
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderWidth: 1,
                                  borderColor: 'rgba(255, 255, 255, 0.1)',
                                }}
                              >
                                <LucideIcons.Trash2 color="#EF4444" size={10} />
                              </TouchableOpacity>
                            </View>
                          </View>
                          <Text style={{ color: '#DDD', fontSize: 12, lineHeight: 18 }}>{notif.message}</Text>
                        </View>
                      </Animated.View>
                    );
                  })
                ) : (
                  <View style={{ alignItems: 'center', paddingVertical: 40, gap: 15 }}>
                    <LucideIcons.Inbox color="rgba(255,255,255,0.15)" size={48} />
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' }}>No notifications found</Text>
                  </View>
                )}
              </ScrollView>

              {/* Footer */}
              <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
                {showUndoBanner && (
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#1C1C1E',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                    marginBottom: 12,
                  }}>
                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>Notification dismissed</Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (lastDismissedNotif) {
                          setNotificationsList(prev => [lastDismissedNotif, ...prev]);
                          setLastDismissedNotif(null);
                          setShowUndoBanner(false);
                          if (undoTimer.current) clearTimeout(undoTimer.current);
                        }
                      }}
                    >
                      <Text style={{ color: GOLD, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 }}>UNDO</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => {
                    setShowNotificationsModal(false);
                    setUnreadCount(0);
                  }}
                  style={{
                    backgroundColor: GOLD,
                    borderRadius: 14,
                    height: 48,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#000', fontWeight: '800', fontSize: 14 }}>Dismiss & Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  scrollContent: {
    flexGrow: 1, // Let scroll content fill available space to prevent black gaps
    paddingBottom: 30, // Reduced from 100 to remove the unwanted black bottom gap
    maxWidth: isWeb ? 1400 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  heroSection: {
    paddingHorizontal: isWeb ? 40 : 0,
    paddingTop: isWeb ? 20 : 0,
    height: isWeb ? 600 : 540,
  },
  heroContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: isWeb ? 30 : 0,
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
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: GOLD,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#000',
  },
  unreadText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: 48,
    height: 48,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  statsBar: {
    marginTop: -30,
    marginHorizontal: 25,
    zIndex: 10,
  },
  statsContainer: {
    backgroundColor: 'rgba(20,20,20,0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    overflow: 'hidden',
  },
  statsContent: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
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
    gap: 12,
    flexWrap: 'wrap',
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
  trendingList: {
    paddingRight: 40,
    gap: 20,
    paddingVertical: 10,
  },
  trendingCardWrapper: {
    width: 260,
    height: 320,
    marginRight: 20,
  },
  trendingCard: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    ...Platform.select({
      web: {
        transition: 'transform 0.4s ease, border-color 0.4s ease',
        ':hover': {
          transform: 'translateY(-10px)',
          borderColor: GOLD,
        }
      } as any
    })
  },
  trendingImage: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    overflow: 'hidden',
  },
  trendingBadgeText: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  trendingFav: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  trendingContent: {
    gap: 8,
  },
  trendingTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  trendingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingPrice: {
    color: GOLD,
    fontSize: 18,
    fontWeight: '900',
  },
  trendingRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendingRatingText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: 'bold',
  },
  sectionSub: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
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
    flex: 1,
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
  },
  nearbyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  pulsePoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD,
  },
  nearbyText: {
    color: GOLD,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  masterpieceCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 40,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  masterpieceImage: {
    width: '100%',
    height: 220,
    justifyContent: 'flex-start',
    padding: 15,
  },
  masterpieceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: GOLD,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  masterpieceBadgeText: {
    color: 'black',
    fontSize: 9,
    fontWeight: 'bold',
  },
  masterpieceInfo: {
    padding: 15,
  },
  masterpieceTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  masterpieceName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  masterpieceRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  masterpieceRatingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  masterpieceLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 15,
  },
  masterpieceLocationText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    flex: 1,
  },
  masterpiecePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masterpiecePrice: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
  },
  masterpieceViewBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 40,
    backgroundColor: '#0D0D0D',
    borderRadius: 28,
    marginHorizontal: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  noResultsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  noResultsText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  clearSearchBtn: {
    backgroundColor: GOLD,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  clearSearchBtnText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
