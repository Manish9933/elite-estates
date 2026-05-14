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

const { width, height } = Dimensions.get('window');

const PROPERTIES = [
  {
    id: '1',
    title: 'Skyline Penthouse',
    price: '$2.5M',
    location: { latitude: 40.7128, longitude: -74.0060 },
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
    rating: 4.9
  },
  {
    id: '2',
    title: 'Emerald Valley Villa',
    price: '$1.8M',
    location: { latitude: 40.7300, longitude: -73.9950 },
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=80',
    rating: 4.8
  },
  {
    id: '3',
    title: 'Modern Loft',
    price: '$950K',
    location: { latitude: 40.7200, longitude: -74.0100 },
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80',
    rating: 4.7
  }
];

export default function MapScreen({ navigation }: any) {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 40.7128,
            longitude: -74.0060,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          customMapStyle={mapStyle}
        >
          {PROPERTIES.map((prop) => (
            <Marker
              key={prop.id}
              coordinate={prop.location}
              onPress={() => setSelectedProperty(prop)}
            >
              <View style={[
                styles.marker, 
                selectedProperty?.id === prop.id && styles.selectedMarker
              ]}>
                <Text style={[
                  styles.markerText,
                  selectedProperty?.id === prop.id && styles.selectedMarkerText
                ]}>{prop.price}</Text>
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
          <ChevronLeft color={Theme.colors.text} size={24} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Text style={styles.searchBoxText}>Manhattan, NY</Text>
        </View>
      </View>

      {/* Property Preview Card */}
      {selectedProperty && (
        <TouchableOpacity 
          style={styles.previewCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('PropertyDetails', { property: selectedProperty })}
        >
          <Image source={{ uri: selectedProperty.image }} style={styles.previewImage} />
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle}>{selectedProperty.title}</Text>
            <View style={styles.previewMeta}>
              <View style={styles.ratingRow}>
                <Star color="#F59E0B" fill="#F59E0B" size={12} />
                <Text style={styles.ratingText}>{selectedProperty.rating}</Text>
              </View>
              <Text style={styles.previewPrice}>{selectedProperty.price}</Text>
            </View>
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
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  selectedMarker: {
    backgroundColor: Theme.colors.primary,
  },
  markerText: {
    color: Theme.colors.text,
    fontWeight: 'bold',
    fontSize: 12,
  },
  selectedMarkerText: {
    color: 'white',
  },
  previewCard: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
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
