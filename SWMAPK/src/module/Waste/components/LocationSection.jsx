import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { ConsumerFormStyles as styles } from '../../../styles/ConsumerFormStyles';

const LocationSection = ({
  mapRef,
  mapRegion,
  selectedLocation,
  setSelectedLocation,
  locationAddress,
  latitude,
  longitude,
  markerPosition,
  handleSearch,
  handleMapPress,
}) => {
  return (
    <View style={styles.locationSection}>
      <Text style={styles.locationTitle}>Select Location</Text>
      <Text style={styles.locationSubtitle}>
        Search for a location or tap on the map to select
      </Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.locationSearchInput}
          value={selectedLocation}
          onChangeText={setSelectedLocation}
          placeholder="Search location..."
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={mapRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {markerPosition && (
            <Marker
              coordinate={markerPosition}
              title="Selected Location"
              description={locationAddress}
              draggable
              onDragEnd={handleMapPress}
            />
          )}
        </MapView>
      </View>

      {/* Selected Location Details */}
      {markerPosition && (
        <View style={styles.locationDetails}>
          <Text style={styles.locationDetailsTitle}>
            Selected Location Details
          </Text>

          <View style={styles.coordRow}>
            <View style={styles.coordItem}>
              <Text style={styles.coordLabel}>Latitude</Text>
              <Text style={styles.coordValue}>{latitude}</Text>
            </View>
            <View style={styles.coordItem}>
              <Text style={styles.coordLabel}>Longitude</Text>
              <Text style={styles.coordValue}>{longitude}</Text>
            </View>
          </View>

          {locationAddress ? (
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Address</Text>
              <Text style={styles.addressValue}>{locationAddress}</Text>
            </View>
          ) : null}
        </View>
      )}

      {!markerPosition && (
        <View style={styles.noLocationHint}>
          <Text style={styles.noLocationHintText}>
            Tap on the map to select a location
          </Text>
        </View>
      )}
    </View>
  );
};

export default LocationSection;
