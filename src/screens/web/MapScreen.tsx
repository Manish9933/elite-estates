import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  TouchableOpacity, 
  Image,
  Animated,
  Platform
} from 'react-native';
import { Theme } from '../../styles/theme';
import { ChevronLeft, Star, MapPin, Compass, Search, Sparkles, Navigation } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const GOLD = '#D4AF37';

const MOCK_PROPERTIES = [
  {
    id: '1',
    title: 'The Obsidian Villa',
    price: 12500000,
    rating: '4.98',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600',
    top: '32%',
    left: '25%',
    beds: 5,
    baths: 6,
    sqft: '8,400 sqft',
    area: 'Bel Air, CA'
  },
  {
    id: '2',
    title: 'Aurelia Penthouse',
    price: 8200000,
    rating: '4.95',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600',
    top: '48%',
    left: '62%',
    beds: 3,
    baths: 4,
    sqft: '4,200 sqft',
    area: 'Manhattan, NY'
  },
  {
    id: '3',
    title: 'Glasshouse Estate',
    price: 15800000,
    rating: '4.99',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
    top: '25%',
    left: '70%',
    beds: 6,
    baths: 8,
    sqft: '11,200 sqft',
    area: 'Miami, FL'
  }
];

export default function MapScreen({ navigation }: any) {
  const [selectedProperty, setSelectedProperty] = useState<any>(MOCK_PROPERTIES[0]);
  const pulseAnim = React.useRef(new Animated.Value(0.4)).current;
  const radarRotate = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for markers
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Radar scan line rotation
    Animated.loop(
      Animated.timing(radarRotate, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = radarRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      {/* Premium Digital Grid Satellite Map Graphics (Full CSS / SVG Mockup) */}
      <View style={styles.mapContainer}>
        {/* Glowing Radar scan element */}
        <Animated.View style={[styles.radarScanner, { transform: [{ rotate: spin }] }]} />

        {/* Abstract Vector Map Lines & Grid */}
        <View style={styles.gridOverlay} />
        
        {/* Stylized Vector Roads/Rivers */}
        <View style={[styles.vectorLine, { top: '35%', height: 2, width: '100%', backgroundColor: 'rgba(212, 175, 55, 0.15)' }]} />
        <View style={[styles.vectorLine, { left: '45%', width: 2, height: '100%', backgroundColor: 'rgba(212, 175, 55, 0.15)' }]} />
        <View style={[styles.vectorLine, { top: '65%', height: 4, width: '100%', backgroundColor: 'rgba(47, 84, 150, 0.2)', transform: [{ rotate: '-10deg' }] }]} />

        {/* Radar concentric circular guides */}
        <View style={[styles.radarCircle, { width: 300, height: 300, borderRadius: 150 }]} />
        <View style={[styles.radarCircle, { width: 550, height: 550, borderRadius: 275 }]} />
        <View style={[styles.radarCircle, { width: 800, height: 800, borderRadius: 400 }]} />

        {/* Interactive Property Map Markers */}
        {MOCK_PROPERTIES.map((prop) => {
          const isSelected = selectedProperty?.id === prop.id;
          return (
            <TouchableOpacity
              key={prop.id}
              style={[
                styles.markerWrapper,
                { top: prop.top as any, left: prop.left as any }
              ]}
              onPress={() => setSelectedProperty(prop)}
              activeOpacity={0.9}
            >
              {/* Outer Glow Pulse */}
              <Animated.View style={[
                styles.markerPulse,
                { 
                  transform: [{ scale: pulseAnim.interpolate({ inputRange: [0.4, 1], outputRange: [1, 1.8] }) }],
                  opacity: pulseAnim.interpolate({ inputRange: [0.4, 1], outputRange: [0.6, 0] })
                }
              ]} />
              
              <View style={[
                styles.markerBubble,
                isSelected && styles.selectedMarkerBubble
              ]}>
                <MapPin size={13} color={isSelected ? '#000000' : GOLD} fill={isSelected ? '#000000' : 'transparent'} />
                <Text style={[
                  styles.markerText,
                  isSelected && styles.selectedMarkerText
                ]}>
                  ${(prop.price / 1000000).toFixed(1)}M
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Header Overlay */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        
        <View style={styles.searchBox}>
          <Search color="rgba(255,255,255,0.4)" size={16} style={{ marginRight: 8 }} />
          <Text style={styles.searchBoxText}>Premium Digital Radar View</Text>
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>LIVE</Text>
          </View>
        </View>
      </View>

      {/* Status Notice Indicator */}
      <View style={styles.radarStatus}>
        <Compass color={GOLD} size={14} style={{ marginRight: 6 }} />
        <Text style={styles.radarStatusText}>RADAR POSITION LOCK: CALIFORNIA • NY • MIAMI</Text>
      </View>

      {/* Luxury Interactive Property Preview Card */}
      {selectedProperty && (
        <TouchableOpacity 
          style={styles.previewCard}
          activeOpacity={0.95}
          onPress={() => navigation.navigate('PropertyDetails', { property: selectedProperty })}
        >
          <Image source={{ uri: selectedProperty.image }} style={styles.previewImage} />
          
          <View style={styles.previewInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {selectedProperty.title}
              </Text>
              <View style={styles.ratingRow}>
                <Star color={GOLD} fill={GOLD} size={11} />
                <Text style={styles.ratingText}>{selectedProperty.rating}</Text>
              </View>
            </View>

            <Text style={styles.previewArea}>{selectedProperty.area}</Text>
            
            <View style={styles.specRow}>
              <Text style={styles.specText}>{selectedProperty.beds} Beds</Text>
              <View style={styles.specDivider} />
              <Text style={styles.specText}>{selectedProperty.baths} Baths</Text>
              <View style={styles.specDivider} />
              <Text style={styles.specText}>{selectedProperty.sqft}</Text>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.previewPrice}>
                ${Number(selectedProperty.price).toLocaleString()}
              </Text>
              <View style={styles.exploreBtn}>
                <Navigation color="#050505" size={12} style={{ marginRight: 4 }} />
                <Text style={styles.exploreBtnText}>DETAILS</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    overflow: 'hidden',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#050a12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundImage: `
      linear-gradient(rgba(212, 175, 55, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(212, 175, 55, 0.04) 1px, transparent 1px)
    `,
    backgroundSize: '30px 30px',
    opacity: 0.8,
  },
  vectorLine: {
    position: 'absolute',
    opacity: 0.6,
  },
  radarCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.07)',
    borderStyle: 'dashed',
  },
  radarScanner: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundImage: 'conic-gradient(from 0deg, rgba(212, 175, 55, 0.12) 0deg, rgba(212, 175, 55, 0) 90deg, transparent 360deg)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  
  // Custom styled Marker elements
  markerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  markerPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GOLD,
  },
  markerBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    gap: 5,
  },
  selectedMarkerBubble: {
    backgroundColor: GOLD,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.12 }],
  },
  markerText: {
    color: GOLD,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: -0.2,
  },
  selectedMarkerText: {
    color: '#000000',
    fontWeight: '900',
  },

  // Header Elements
  header: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 24 : 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 15,
    zIndex: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 20, 30, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  searchBox: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(15, 20, 30, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backdropFilter: 'blur(10px)',
  },
  searchBoxText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  activePill: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activePillText: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Status HUD below header
  radarStatus: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 85 : 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(5, 5, 5, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  radarStatusText: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // High-fidelity absolute luxury Preview Card matching GOSAI styles
  previewCard: {
    position: 'absolute',
    bottom: 30,
    width: width > 540 ? 460 : width - 40,
    left: width > 540 ? (width - 460) / 2 : 20,
    backgroundColor: 'rgba(15, 22, 35, 0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
    backdropFilter: 'blur(16px)',
    zIndex: 20,
  },
  previewImage: {
    width: 95,
    height: 95,
    borderRadius: 16,
    backgroundColor: '#1E293B',
  },
  previewInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '700',
  },
  previewArea: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    opacity: 0.8,
  },
  specText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '500',
  },
  specDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: GOLD,
    marginHorizontal: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  previewPrice: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '800',
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: '#050505',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.2,
  }
});
