import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  FlatList,
  TouchableOpacity, 
  Image, 
  Dimensions, 
  Share,
  Modal,
  Platform,
  TextInput,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  Heart, 
  Share2, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize, 
  MessageCircle, 
  PhoneCall,
  Calendar,
  Star,
  CheckCircle2,
  ArrowRight
} from 'lucide-react-native';
import { Theme } from '../styles/theme';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { propertyApi } from '../api/properties';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');
const GOLD = Theme.colors.gold;
const GOLD_GRADIENT = Theme.colors.goldGradient;
const APP_URL = "https://elite-estates.com"; // Future hosting URL

export default function PropertyDetailsScreen({ route, navigation }: any) {
  const { property } = route.params;
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });
  const [offerAmount, setOfferAmount] = useState((property.price || '').toString());

  React.useEffect(() => {
    if (user && property.id) {
      propertyApi.isFavorite(user.id, property.id).then(({ isFavorite }) => {
        setIsFavorite(isFavorite);
      });
    }
  }, [user, property.id]);

  const handleToggleFavorite = async () => {
    if (!user) {
      showLuxuryAlert('Authentication Required', 'Please sign in to save properties to your favorites.');
      return;
    }
    
    // Optimistic Update
    const nextState = !isFavorite;
    setIsFavorite(nextState);

    try {
      await propertyApi.toggleFavorite(user.id, property.id, isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsFavorite(!nextState); // Rollback
    }
  };

  const showLuxuryAlert = (title: string, message: string) => {
    setAlertConfig({ visible: true, title, message });
  };

  const onShare = async () => {
    const propertyUrl = `${APP_URL}/property/${property.id}`;
    const shareMessage = `
🏛️ *ELITE ESTATES EXCLUSIVE* 🏛️

*${property.title.toUpperCase()}*
💰 Price: $${Number(property.price).toLocaleString()}
📍 Location: ${property.address}, ${property.city}

This architectural masterpiece features ${property.bhk} Bedrooms and state-of-the-art amenities. 

✨ *Experience true luxury below:* ✨
🔗 ${propertyUrl}

---
📱 *Download Elite Estates to explore more*
👉 ${APP_URL}/download
    `.trim();

    try {
      await Share.share({
        title: `Elite Estates: ${property.title}`,
        message: shareMessage,
        url: propertyUrl // Supports iOS preview
      });
    } catch (error) {
      console.error(error);
    }
  };

  const images = property.images || [property.image];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ paddingBottom: 160 }}>
        {/* Cinematic Gallery */}
        <View style={styles.imageContainer}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.mainImage} />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={StyleSheet.absoluteFill}
          />

          <SafeAreaView style={styles.imageHeader} edges={['top']}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft color="white" size={24} />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton} onPress={onShare}>
                <Share2 color="white" size={20} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleToggleFavorite}
              >
                <Heart 
                  color={isFavorite ? Theme.colors.gold : "white"} 
                  size={20} 
                  fill={isFavorite ? Theme.colors.gold : "transparent"} 
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          
          <View style={styles.imageCount}>
            <Text style={styles.countText}>1 / {images.length}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(100)}>
            <View style={styles.titleHeader}>
              <View>
                <View style={styles.badgeContainer}>
                  <BlurView intensity={20} style={styles.typeBadge}>
                    <Text style={styles.typeText}>{property.property_type}</Text>
                  </BlurView>
                  <View style={styles.ratingBox}>
                    <Star color="#F59E0B" fill="#F59E0B" size={12} />
                    <Text style={styles.ratingText}>4.9</Text>
                  </View>
                </View>
                <Text style={styles.title}>{property.title}</Text>
                <View style={styles.locationRow}>
                  <MapPin color={GOLD} size={16} />
                  <Text style={styles.locationText}>{property.address}, {property.city}</Text>
                </View>
              </View>
            </View>

            {/* Price Highlight */}
            <View style={styles.priceHighlight}>
              <Text style={styles.priceLabel}>Valuation</Text>
              <Text style={styles.priceValue}>${Number(property.price).toLocaleString()}</Text>
            </View>

            {/* Spec Cards */}
            <View style={styles.specsGrid}>
              <View style={styles.specCard}>
                <View style={styles.specIconCircle}>
                  <BedDouble color={GOLD} size={22} />
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.specVal}>{property.bhk} BHK</Text>
                  <Text style={styles.specLab}>Rooms</Text>
                </View>
              </View>
              <View style={styles.specCard}>
                <View style={styles.specIconCircle}>
                  <Bath color={GOLD} size={22} />
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.specVal}>{property.bathrooms || 2}</Text>
                  <Text style={styles.specLab}>Baths</Text>
                </View>
              </View>
              <View style={styles.specCard}>
                <View style={styles.specIconCircle}>
                  <Maximize color={GOLD} size={22} />
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.specVal}>{Math.floor(property.area_sqft)}</Text>
                  <Text style={styles.specLab}>Sq.ft</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Description Section */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>The Experience</Text>
            <Text style={styles.description}>
              {property.description || `This architectural masterpiece offers unparalleled luxury and world-class design. Situated in the most prestigious district of ${property.city}, this residence combines timeless elegance with cutting-edge technology.`}
            </Text>
          </Animated.View>

          {/* Amenities with Gold Accents */}
          {property.amenities && property.amenities.length > 0 && (
            <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
              <Text style={styles.sectionTitle}>Exclusive Features</Text>
              <View style={styles.amenitiesList}>
                {property.amenities.map((amenity: string) => (
                  <View key={amenity} style={styles.amenityItem}>
                    <CheckCircle2 color={GOLD} size={18} />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Concierge Agent Card */}
          <Animated.View entering={FadeInDown.delay(500)} style={styles.conciergeCard}>
            <View style={styles.conciergeHeader}>
              <Image 
                source={{ uri: property.broker_image || (property.agent?.avatar_url && !property.agent?.avatar_url.includes('storage-error') ? property.agent.avatar_url : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80') }} 
                style={styles.agentAvatar} 
              />
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>
                  {property.broker_name || (property.agent?.full_name && property.agent_id !== user?.id ? property.agent.full_name : 'Julian Sterling')}
                </Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{property.broker_name ? 'Official Developer' : 'Official Estate Broker'}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.conciergeActions}>
              <TouchableOpacity 
                style={styles.conciergeBtn}
                onPress={() => {
                  const brokerId = property.agent_id || property.user_id;
                  if (!brokerId) {
                    setAlertConfig({ visible: true, title: 'Unavailable', message: 'Broker contact is not available for this listing.' });
                    return;
                  }
                  if (brokerId === user?.id) {
                    setAlertConfig({ visible: true, title: 'Notice', message: 'You are the owner of this listing.' });
                    return;
                  }
                  navigation.navigate('Tabs', {
                    screen: 'Inbox',
                    params: {
                      screen: 'ChatDetail',
                      params: { 
                        property, 
                        otherUser: { 
                          id: brokerId, 
                          full_name: property.broker_name || property.agent?.full_name || 'Broker', 
                          avatar_url: property.broker_image || property.agent?.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'
                        } 
                      }
                    }
                  });
                }}
              >
                <MessageCircle color="white" size={20} />
                <Text style={styles.conciergeBtnText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.conciergeBtn, styles.callBtn]}
                onPress={() => {
                  const phone = property.broker_phone || property.agent?.phone;
                  if (phone) {
                    Linking.openURL(`tel:${phone}`);
                  } else {
                    setAlertConfig({ visible: true, title: 'Unavailable', message: 'No contact number is available for this builder/broker.' });
                  }
                }}
              >
                <PhoneCall color={GOLD} size={20} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Solid Bottom Bar */}
      <View style={styles.bottomActionBar}>
        <View style={styles.actionPrice}>
          <Text style={styles.priceTag}>${Number(property.price).toLocaleString()}</Text>
          <Text style={styles.priceSub}>Exclusive Access</Text>
        </View>
        <TouchableOpacity 
          style={styles.bookActionBtn}
          onPress={() => setShowBookingModal(true)}
        >
          <Text style={styles.bookActionText}>Schedule Viewing</Text>
          <ArrowRight size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Premium Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Request Viewing</Text>
                <Text style={styles.modalSub}>Curate your private experience</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBookingModal(false)} style={styles.closeBtn}>
                <ChevronLeft color="white" size={20} style={{ transform: [{ rotate: '-90deg' }] }} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {/* Property Micro-Card */}
              <View style={styles.microCard}>
                <Image source={{ uri: images[0] }} style={styles.microImg} />
                <View style={styles.microInfo}>
                  <Text style={styles.microTitle}>{property.title}</Text>
                  <Text style={styles.microLoc}>{property.city}</Text>
                </View>
                <Text style={styles.microPrice}>${Number(property.price).toLocaleString()}</Text>
              </View>

              {/* Offer Amount Selection */}
              <View style={styles.bookingSection}>
                <Text style={styles.bookingSectionTitle}>Your Bid / Offer Amount ($)</Text>
                <TextInput
                  style={styles.offerInput}
                  placeholder="Enter your offer amount"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="numeric"
                  value={offerAmount}
                  onChangeText={setOfferAmount}
                />
              </View>

              {/* Date Selection */}
              <View style={styles.bookingSection}>
                <Text style={styles.bookingSectionTitle}>Select Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
                  {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                    const date = new Date();
                    date.setDate(date.getDate() + offset);
                    const isSelected = selectedDate.getDate() === date.getDate();
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = date.getDate();
                    
                    return (
                      <TouchableOpacity 
                        key={offset} 
                        style={[styles.dateTile, isSelected && styles.dateTileActive]}
                        onPress={() => setSelectedDate(date)}
                      >
                        <Text style={[styles.dateDay, isSelected && styles.dateTextActive]}>{dayName}</Text>
                        <Text style={[styles.dateNum, isSelected && styles.dateTextActive]}>{dayNum}</Text>
                        {isSelected && <View style={styles.activeDot} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Time Slots */}
              <View style={styles.bookingSection}>
                <Text style={styles.bookingSectionTitle}>Preferred Time</Text>
                <View style={styles.timeGrid}>
                  {['Morning Preview', 'Afternoon Tour', 'Golden Hour', 'Evening Gala'].map((time, idx) => (
                    <TouchableOpacity 
                      key={time} 
                      style={[styles.timeChip, idx === 2 && styles.timeChipActive]}
                    >
                      <Text style={[styles.timeChipText, idx === 2 && styles.timeTextActive]}>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <Text style={styles.modalNote}>
                A dedicated concierge will contact you within 15 minutes to finalize your exclusive itinerary.
              </Text>
              
              <TouchableOpacity 
                style={styles.finalConfirmBtn}
                onPress={async () => {
                  setShowBookingModal(false);
                  
                  if (!user) {
                     setTimeout(() => showLuxuryAlert('Authentication Required', 'Please sign in to make an offer/booking.'), 500);
                     return;
                  }
                  
                  const { error } = await supabase.from('bookings').insert([{
                     property_id: property.id,
                     buyer_id: user.id,
                     agent_id: property.agent_id || property.user_id,
                     booking_date: selectedDate.toISOString(),
                     status: 'pending',
                     notes: JSON.stringify({ offer_amount: Number(offerAmount) || Number(property.price) })
                  }]);

                  setTimeout(() => {
                    if (error) {
                       console.error('Booking Insert Error:', error);
                       showLuxuryAlert('Request Failed', error.message || 'Could not process your request.');
                    } else {
                       showLuxuryAlert('Offer Submitted', 'Your offer has been submitted! The admin will review it shortly.');
                    }
                  }, 500);
                }}
              >
                <LinearGradient colors={GOLD_GRADIENT} style={styles.gradientBtn}>
                  <Text style={styles.finalConfirmText}>Make Offer / Book</Text>
                  <ArrowRight size={20} color="black" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Luxury Alert Modal */}
      <Modal
        visible={alertConfig.visible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.alertOverlay}>
          <Animated.View entering={ZoomIn.duration(400)} style={styles.alertBox}>
            <View style={styles.alertIconBg}>
              <CheckCircle2 color={GOLD} size={32} />
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity 
              style={styles.alertBtn}
              onPress={() => setAlertConfig({ ...alertConfig, visible: false })}
            >
              <LinearGradient colors={GOLD_GRADIENT} style={styles.alertBtnGradient}>
                <Text style={styles.alertBtnText}>Perfect</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
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
  imageContainer: {
    width: width,
    height: 480,
  },
  mainImage: {
    width: width,
    height: '100%',
  },
  imageHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  imageCount: {
    position: 'absolute',
    bottom: 45,
    right: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  content: {
    padding: 25,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: '#050505',
    marginTop: -40,
  },
  titleHeader: {
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  typeBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  typeText: {
    color: GOLD,
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 30,
  },
  locationText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '500',
  },
  priceHighlight: {
    marginBottom: 35,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  priceLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 5,
  },
  priceValue: {
    color: GOLD,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 40,
  },
  specCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  specIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  specVal: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  specLab: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  description: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    minWidth: '45%',
  },
  amenityText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  conciergeCard: {
    backgroundColor: '#0D0D0D',
    borderRadius: 30,
    padding: 25,
    marginBottom: 50,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  conciergeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  agentAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: GOLD,
  },
  agentInfo: {
    marginLeft: 15,
    flex: 1,
  },
  agentName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  roleBadge: {
    marginTop: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  conciergeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  conciergeBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  conciergeBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  callBtn: {
    width: 54,
    flex: 0,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  actionPrice: {
    flex: 1,
  },
  priceTag: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
  },
  priceSub: {
    color: GOLD,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bookActionBtn: {
    backgroundColor: GOLD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    height: 60,
    borderRadius: 20,
    gap: 10,
  },
  bookActionText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    paddingBottom: 50,
    minHeight: 650,
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  modalTitle: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  modalSub: {
    color: GOLD,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    gap: 25,
  },
  microCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  microImg: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  microInfo: {
    flex: 1,
    marginLeft: 15,
  },
  microTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  microLoc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  microPrice: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '900',
  },
  bookingSection: {
    marginTop: 5,
  },
  bookingSectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  dateList: {
    gap: 12,
    paddingRight: 20,
  },
  dateTile: {
    width: 65,
    height: 85,
    borderRadius: 18,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  dateTileActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  dateDay: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateNum: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  dateTextActive: {
    color: 'black',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'black',
    marginTop: 6,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  timeChipActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  timeChipText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  timeTextActive: {
    color: 'black',
  },
  modalNote: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  finalConfirmBtn: {
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientBtn: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  finalConfirmText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '900',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  alertBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#0D0D0D',
    borderRadius: 35,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  alertIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  alertTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  alertMessage: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  alertBtn: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
  },
  alertBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBtnText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  offerInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 54,
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  }
});
