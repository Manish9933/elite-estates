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
  Modal
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
  Star
} from 'lucide-react-native';
import { Theme } from '../styles/theme';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen({ route, navigation }: any) {
  const { property } = route.params;
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing property: ${property.title} in ${property.location} for ${property.price}!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const images = property.images || [property.image]; // Fallback to single image if array missing

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Image Gallery */}
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
          <SafeAreaView style={styles.imageHeader} edges={['top']}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft color={Theme.colors.text} size={24} />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton} onPress={onShare}>
                <Share2 color={Theme.colors.text} size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Heart color={Theme.colors.text} size={20} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          <View style={styles.imageCount}>
            <Text style={styles.countText}>1 / {images.length}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(100)}>
            <View style={styles.titleRow}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{property.type}</Text>
              </View>
              <View style={styles.ratingRow}>
                <Star color="#F59E0B" fill="#F59E0B" size={16} />
                <Text style={styles.ratingText}>{property.rating} (42 reviews)</Text>
              </View>
            </View>
            
            <Text style={styles.title}>{property.title}</Text>
            
            <View style={styles.locationRow}>
              <MapPin color={Theme.colors.primary} size={18} />
              <Text style={styles.locationText}>{property.location}</Text>
            </View>

            <View style={styles.specsRow}>
              <View style={styles.specItem}>
                <View style={styles.specIcon}>
                  <BedDouble color={Theme.colors.primary} size={20} />
                </View>
                <Text style={styles.specValue}>{property.bhk} BHK</Text>
                <Text style={styles.specLabel}>Bedroom</Text>
              </View>
              <View style={styles.specItem}>
                <View style={styles.specIcon}>
                  <Bath color={Theme.colors.primary} size={20} />
                </View>
                <Text style={styles.specValue}>3</Text>
                <Text style={styles.specLabel}>Bathroom</Text>
              </View>
              <View style={styles.specItem}>
                <View style={styles.specIcon}>
                  <Maximize color={Theme.colors.primary} size={20} />
                </View>
                <Text style={styles.specValue}>{property.area.split(' ')[0]}</Text>
                <Text style={styles.specLabel}>Sqft</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              Experience luxury living at its finest in this stunning {property.type}. 
              Located in the heart of {property.location}, this property offers 
              unparalleled views, high-end finishes, and state-of-the-art amenities. 
              Perfect for families looking for comfort and elegance.
            </Text>
            <TouchableOpacity>
              <Text style={styles.readMore}>Read More</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {['Wifi', 'Pool', 'Gym', 'Parking', 'Security', 'Garden'].map((amenity) => (
                <View key={amenity} style={styles.amenityItem}>
                  <View style={styles.amenityDot} />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)} style={styles.agentCard}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=agent' }} style={styles.agentAvatar} />
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>Marcus Sterling</Text>
              <Text style={styles.agentTitle}>Senior Property Agent</Text>
            </View>
            <View style={styles.agentActions}>
              <TouchableOpacity style={styles.agentActionButton}>
                <MessageCircle color={Theme.colors.primary} size={22} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.agentActionButton}>
                <PhoneCall color={Theme.colors.primary} size={22} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule a Tour</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Select Preferred Date</Text>
              <View style={styles.datePickerPlaceholder}>
                <Calendar color={Theme.colors.primary} size={24} />
                <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>
              </View>
              
              <Text style={styles.modalDescription}>
                Our agent will contact you shortly to confirm the appointment.
              </Text>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => {
                  alert('Tour requested successfully!');
                  setShowBookingModal(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Confirm Request</Text>
              </TouchableOpacity>
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
    backgroundColor: Theme.colors.background,
  },
  imageContainer: {
    width: width,
    height: 400,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCount: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: Theme.spacing.lg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Theme.colors.background,
    marginTop: -30,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeText: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  locationText: {
    color: Theme.colors.textMuted,
    fontSize: 16,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  specItem: {
    width: (width - 64) / 3,
    backgroundColor: Theme.colors.surface,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  specIcon: {
    marginBottom: 8,
  },
  specValue: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  specLabel: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 12,
  },
  description: {
    color: Theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 24,
  },
  readMore: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
    marginTop: 8,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    minWidth: '28%',
  },
  amenityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
    marginRight: 8,
  },
  amenityText: {
    color: Theme.colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  agentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  agentName: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  agentTitle: {
    color: Theme.colors.textMuted,
    fontSize: 13,
  },
  agentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  agentActionButton: {
    width: 40,
    height: 40,
    backgroundColor: Theme.colors.background,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingHorizontal: Theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  priceContainer: {
    flex: 1,
  },
  bottomPriceLabel: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  bottomPrice: {
    color: Theme.colors.secondary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    minWidth: 160,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: Theme.spacing.lg,
    minHeight: 400,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: Theme.colors.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeText: {
    color: Theme.colors.textMuted,
    fontSize: 16,
  },
  modalBody: {
    gap: 20,
  },
  modalLabel: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Theme.colors.background,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  dateText: {
    color: Theme.colors.text,
    fontSize: 16,
  },
  modalDescription: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
