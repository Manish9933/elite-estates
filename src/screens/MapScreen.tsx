import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  TouchableOpacity, 
  Image,
  Platform
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Theme } from '../styles/theme';
import { ChevronLeft, Star } from 'lucide-react-native';

import { propertyApi } from '../api/properties';

const { width, height } = Dimensions.get('window');
const GOLD = '#D4AF37';

export default function MapScreen({ navigation }: any) {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data } = await propertyApi.getProperties();
        if (data) {
          // Add some random offsets if coordinates are missing or same
          const processed = data.map((p: any, idx: number) => ({
            ...p,
            location: {
              latitude: p.latitude || 40.7128 + (idx * 0.01),
              longitude: p.longitude || -74.0060 + (idx * 0.01)
            }
          }));
          setProperties(processed);
        }
      } catch (error) {
        console.error('Error fetching map properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 40.7128,
            longitude: -74.0060,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          customMapStyle={mapStyle}
        >
          {properties.map((prop) => (
            <Marker
              key={prop.id}
              coordinate={prop.location}
              onPress={() => setSelectedProperty(prop)}
              tracksViewChanges={false}
            >
              <View style={[
                styles.marker, 
                selectedProperty?.id === prop.id && styles.selectedMarker
              ]}>
                <Text style={[
                  styles.markerText,
                  selectedProperty?.id === prop.id && styles.selectedMarkerText
                ]}>${(prop.price / 1000000).toFixed(1)}M</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={[styles.map, { backgroundColor: Theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: Theme.colors.text }}>Map View not supported on Web</Text>
        </View>
      )}

      {/* Header Overlay */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Text style={styles.searchBoxText}>Explore Homes on Map</Text>
        </View>
      </View>

      {/* Property Preview Card */}
      {selectedProperty && (
        <TouchableOpacity 
          style={styles.previewCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('PropertyDetails', { property: selectedProperty })}
        >
          <Image source={{ uri: selectedProperty.images?.[0] || 'https://via.placeholder.com/400' }} style={styles.previewImage} />
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle} numberOfLines={1}>{selectedProperty.title}</Text>
            <View style={styles.previewMeta}>
              <View style={styles.ratingRow}>
                <Star color={GOLD} fill={GOLD} size={12} />
                <Text style={styles.ratingText}>4.9</Text>
              </View>
              <Text style={styles.previewPrice}>${Number(selectedProperty.price).toLocaleString()}</Text>
            </View>
            <Text style={styles.tapText}>Tap to view full details</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#1e293b" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#94a3b8" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#1e293b" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#334155" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#0f172a" }]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 15,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchBox: {
    flex: 1,
    height: 48,
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchBoxText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  marker: {
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: GOLD,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedMarker: {
    backgroundColor: GOLD,
    borderColor: 'white',
    transform: [{ scale: 1.15 }],
  },
  markerText: {
    color: GOLD,
    fontWeight: '900',
    fontSize: 13,
  },
  selectedMarkerText: {
    color: 'black',
  },
  tapText: {
    color: GOLD,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 5,
    textTransform: 'uppercase',
  },
  previewCard: {
    position: 'absolute',
    bottom: 40,
    width: width > 540 ? 500 : width - 40,
    left: width > 540 ? (width - 500) / 2 : 20,
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    flexDirection: 'row',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 15,
  },
  previewInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  previewTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  previewPrice: {
    color: Theme.colors.secondary,
    fontSize: 18,
    fontWeight: 'bold',
  }
});
