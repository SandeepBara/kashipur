// export default LocationManager;
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  authorizationLevel: 'whenInUse',
  locationProvider: 'playServices',
});

let LocationEnabler = null;
try {
  const mod = require('react-native-android-location-enabler');
  LocationEnabler = mod.default || mod.RNAndroidLocationEnabler || mod;
} catch (e) {
  console.warn('[LocationManager] enabler not found:', e.message);
}

const LocationManager = ({ onLocationSelect }) => {
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [accuracy, setAccuracy] = useState('precise');
  const [showAccuracy, setShowAccuracy] = useState(false);

  // ── Track mounted state to avoid setState-after-unmount crashes ───────────
  const isMounted = useRef(true);
  // ── Guard against double-invocation (e.g. Android back button + button tap) ─
  const isProcessingAccuracy = useRef(false);
  // ── Keep references to pending timers so we can clear them on unmount ─────
  const retryTimerRef = useRef(null);
  const accuracyTimerRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (accuracyTimerRef.current) clearTimeout(accuracyTimerRef.current);
    };
  }, []);

  // ── Auto-trigger permission modal on mount ────────────────────────────────
  useEffect(() => {
    setStatus('permission');
  }, []);

  // ── Delay AccuracyModal so PermissionModal fully closes first ─────────────
  useEffect(() => {
    if (status === 'accuracy') {
      accuracyTimerRef.current = setTimeout(() => {
        if (isMounted.current) setShowAccuracy(true);
      }, 300);
      return () => clearTimeout(accuracyTimerRef.current);
    } else {
      setShowAccuracy(false);
    }
  }, [status]);

  const openSettings = () => {
    try {
      Linking.openSettings();
    } catch (err) {
      console.warn('[LocationManager] openSettings failed:', err);
    }
  };

  const safeSetStatus = newStatus => {
    if (isMounted.current) setStatus(newStatus);
  };
  const safeSetCoords = c => {
    if (isMounted.current) setCoords(c);
  };
  const safeSetErrorMsg = msg => {
    if (isMounted.current) setErrorMsg(msg);
  };

  const handleRetry = () => {
    safeSetCoords(null);
    safeSetErrorMsg('');
    safeSetStatus('permission');
  };

  const handleAllowLocation = () => safeSetStatus('accuracy');
  const handleDontAllow = () => safeSetStatus('denied');

  const handleAccuracyDecision = async () => {
    // Prevent double firing (button tap + back-button onRequestClose racing)
    if (isProcessingAccuracy.current) return;
    isProcessingAccuracy.current = true;

    setShowAccuracy(false);
    safeSetStatus('checking');

    try {
      await requestPermission();
    } finally {
      isProcessingAccuracy.current = false;
    }
  };

  // ── Step 1: Runtime permission ────────────────────────────────────────────
  const requestPermission = async () => {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : accuracy === 'precise'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;

      const result = await request(permission);

      if (!isMounted.current) return;

      if (result !== RESULTS.GRANTED) {
        safeSetStatus('denied');
        return;
      }
      await enableGPSThenFetch();
    } catch (err) {
      console.warn('[LocationManager] permission request failed:', err);
      safeSetErrorMsg(
        'Could not request location permission. Please try again.',
      );
      safeSetStatus('error');
    }
  };

  // ── Step 2: GPS enable dialog ─────────────────────────────────────────────
  const enableGPSThenFetch = async () => {
    if (Platform.OS !== 'android') {
      fetchLocation(1);
      return;
    }
    if (
      !LocationEnabler ||
      typeof LocationEnabler.promptForEnableLocationIfNeeded !== 'function'
    ) {
      fetchLocation(1);
      return;
    }

    try {
      await LocationEnabler.promptForEnableLocationIfNeeded({
        interval: 10000,
        fastInterval: 5000,
      });
      if (!isMounted.current) return;
      await new Promise(res => setTimeout(res, 1500));
      if (!isMounted.current) return;
      fetchLocation(1);
    } catch (err) {
      if (!isMounted.current) return;

      if (err?.code === 'ERR_SWIPE_DISMISSED' || err?.code === 'ERR_DENIED') {
        safeSetErrorMsg(
          'Location (GPS) is turned off on your device.\n\n' +
            'Tap "Open Settings" → enable Location, then come back.',
        );
        safeSetStatus('locationOff');
      } else if (err?.code === 'SETTINGS_CHANGE_UNAVAILABLE') {
        safeSetErrorMsg('Please turn on Location manually in device Settings.');
        safeSetStatus('locationOff');
      } else {
        // Unexpected error shape — don't let it silently crash, fall back to fetch
        console.warn(
          '[LocationManager] enableGPSThenFetch unexpected error:',
          err,
        );
        fetchLocation(1);
      }
    }
  };

  // ── Step 3: 3-strategy fetch cascade ─────────────────────────────────────
  const fetchLocation = strategy => {
    if (!isMounted.current) return;

    if (strategy === 1) {
      safeSetStatus('fetching');
      safeSetErrorMsg('');
    }

    const configs = {
      1: { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
      2: { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 },
      3: { enableHighAccuracy: false, timeout: 20000, maximumAge: 600000 },
    };

    try {
      Geolocation.getCurrentPosition(
        position => {
          if (!isMounted.current) return;

          const c = {
            latitude: position?.coords?.latitude,
            longitude: position?.coords?.longitude,
            accuracy: position?.coords?.accuracy,
          };

          // Guard against malformed native responses
          if (
            typeof c.latitude !== 'number' ||
            typeof c.longitude !== 'number'
          ) {
            safeSetErrorMsg('Received invalid location data. Please retry.');
            safeSetStatus('error');
            return;
          }

          safeSetCoords(c);
          safeSetStatus('fetched');

          // Never let a parent-supplied callback crash this component
          try {
            onLocationSelect && onLocationSelect(c.latitude, c.longitude);
          } catch (err) {
            console.warn(
              '[LocationManager] onLocationSelect handler threw:',
              err,
            );
          }
        },
        error => {
          if (!isMounted.current) return;

          if ((error?.code === 2 || error?.code === 3) && strategy < 3) {
            retryTimerRef.current = setTimeout(() => {
              if (isMounted.current) fetchLocation(strategy + 1);
            }, 600);
            return;
          }
          if (error?.code === 2) {
            safeSetErrorMsg(
              'Location provider unavailable. Make sure GPS is on.',
            );
            safeSetStatus('locationOff');
          } else if (error?.code === 3) {
            safeSetErrorMsg(
              'Location timed out. Move to an open area and retry.',
            );
            safeSetStatus('error');
          } else {
            safeSetErrorMsg(error?.message || 'Unknown location error.');
            safeSetStatus('error');
          }
        },
        configs[strategy],
      );
    } catch (err) {
      // Catches cases where the native module itself throws synchronously
      console.warn(
        '[LocationManager] getCurrentPosition threw synchronously:',
        err,
      );
      safeSetErrorMsg('Something went wrong while getting your location.');
      safeSetStatus('error');
    }
  };

  // ── Permission Modal ──────────────────────────────────────────────────────
  const PermissionModal = () => (
    <Modal
      visible={status === 'permission'}
      transparent
      animationType="slide"
      onRequestClose={handleDontAllow}
    >
      <View style={styles.overlay}>
        <View style={styles.permCard}>
          <Text style={styles.pinIcon}>📍</Text>
          <Text style={styles.permTitle}>
            Allow <Text style={{ fontWeight: '800' }}>YourApp</Text> to access
            {'\n'}this device's location?
          </Text>

          <View style={styles.dataNotice}>
            <Text style={styles.dataNoticeIcon}>🛡️</Text>
            <Text style={styles.dataNoticeText}>
              This app stated it may share location data with third parties
            </Text>
            <Text style={styles.dataNoticeArrow}>›</Text>
          </View>

          <View style={styles.accuracyRow}>
            {['precise', 'approximate'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.accuracyCard,
                  accuracy === type && styles.accuracyCardActive,
                ]}
                onPress={() => setAccuracy(type)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.mapCircle,
                    type === 'approximate' && styles.mapCircleApprox,
                  ]}
                >
                  <Text style={styles.mapEmoji}>🗺️</Text>
                  {type === 'precise' && <View style={styles.precisePin} />}
                </View>
                <Text
                  style={[
                    styles.accuracyLabel,
                    accuracy === type && styles.accuracyLabelActive,
                  ]}
                >
                  {type === 'precise' ? 'Precise' : 'Approximate'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.permOptionBtn}
            onPress={handleAllowLocation}
          >
            <Text style={styles.permOptionText}>While using the app</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.permOptionBtn}
            onPress={handleAllowLocation}
          >
            <Text style={styles.permOptionText}>Only this time</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.permOptionBtn}
            onPress={handleDontAllow}
          >
            <Text style={styles.permOptionText}>Don't allow</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ── Accuracy Modal ────────────────────────────────────────────────────────
  const AccuracyModal = () => (
    <Modal
      visible={showAccuracy}
      transparent
      animationType="fade"
      onRequestClose={handleAccuracyDecision}
    >
      <View style={styles.overlayCenter}>
        <View style={styles.accuracyDialog}>
          <Text style={styles.accuracyDialogTitle}>
            For a better experience, your device will need to use Location
            Accuracy
          </Text>
          <Text style={styles.accuracyDialogSub}>
            The following settings should be on:
          </Text>
          <View style={styles.accuracyItem}>
            <Text style={styles.accuracyItemIcon}>📍</Text>
            <Text style={styles.accuracyItemText}>Device location</Text>
          </View>
          <View style={styles.accuracyItem}>
            <Text style={styles.accuracyItemIcon}>🎯</Text>
            <Text style={styles.accuracyItemTextBlock}>
              Location Accuracy provides more accurate location for apps and
              services. Google periodically processes information about device
              sensors and wireless signals to improve location accuracy.
            </Text>
          </View>
          <Text style={styles.accuracyFooter}>
            You can change this at any time in location settings.{' '}
            <Text style={styles.accuracyLink} onPress={openSettings}>
              Manage settings
            </Text>
          </Text>
          <View style={styles.accuracyBtnRow}>
            <TouchableOpacity
              style={styles.btnNoThanks}
              onPress={handleAccuracyDecision}
            >
              <Text style={styles.btnNoThanksText}>No thanks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnTurnOn}
              onPress={handleAccuracyDecision}
            >
              <Text style={styles.btnTurnOnText}>Turn on</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ── Main Render ───────────────────────────────────────────────────────────
  return (
    <View style={styles.card}>
      <PermissionModal />
      <AccuracyModal />

      {/* IDLE */}
      {status === 'idle' && (
        <TouchableOpacity
          style={styles.btnAllow}
          onPress={() => safeSetStatus('permission')}
        >
          <Text style={styles.btnAllowText}>📍 Get Current Location</Text>
        </TouchableOpacity>
      )}

      {/* LOADING */}
      {(status === 'checking' || status === 'fetching') && (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" color="#4F8EF7" />
          <Text style={styles.subText}>
            {status === 'fetching'
              ? 'Getting your location…'
              : 'Checking permissions…'}
          </Text>
        </View>
      )}

      {/* SUCCESS */}
      {status === 'fetched' && coords && (
        <View style={styles.centerBlock}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.title}>Location Captured</Text>
          <View style={styles.coordRow}>
            <Text style={styles.label}>Latitude</Text>
            <Text style={styles.coordValue}>{coords.latitude.toFixed(6)}°</Text>
          </View>
          <View style={styles.coordRow}>
            <Text style={styles.label}>Longitude</Text>
            <Text style={styles.coordValue}>
              {coords.longitude.toFixed(6)}°
            </Text>
          </View>
          {coords.accuracy != null && (
            <View style={styles.coordRow}>
              <Text style={styles.label}>Accuracy</Text>
              <Text style={styles.coordValue}>
                ±{Math.round(coords.accuracy)} m
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.btnRefresh} onPress={handleRetry}>
            <Text style={styles.btnRefreshText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* DENIED */}
      {status === 'denied' && (
        <View style={styles.centerBlock}>
          <Text style={styles.errorIcon}>⛔</Text>
          <Text style={styles.title}>Permission Denied</Text>
          <Text style={styles.subText}>Location access is required.</Text>
          <TouchableOpacity style={styles.btnAllow} onPress={handleRetry}>
            <Text style={styles.btnAllowText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnRefresh} onPress={openSettings}>
            <Text style={styles.btnRefreshText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* GPS OFF */}
      {status === 'locationOff' && (
        <View style={styles.centerBlock}>
          <Text style={styles.errorIcon}>📡</Text>
          <Text style={styles.title}>Location is Off</Text>
          <Text style={styles.subText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.btnAllow} onPress={openSettings}>
            <Text style={styles.btnAllowText}>Open Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnRefresh} onPress={handleRetry}>
            <Text style={styles.btnRefreshText}>I've Turned It On →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ERROR */}
      {status === 'error' && (
        <View style={styles.centerBlock}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.title}>Location Error</Text>
          <Text style={styles.subText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.btnAllow} onPress={handleRetry}>
            <Text style={styles.btnAllowText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnRefresh} onPress={openSettings}>
            <Text style={styles.btnRefreshText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  centerBlock: { alignItems: 'center', gap: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  subText: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
  successIcon: { fontSize: 44 },
  errorIcon: { fontSize: 44 },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#F7F9FF',
    borderRadius: 10,
    padding: 14,
  },
  label: { fontSize: 13, color: '#888', fontWeight: '600' },
  coordValue: { fontSize: 15, fontWeight: '700', color: '#4F8EF7' },
  btnAllow: {
    backgroundColor: '#4F8EF7',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  btnAllowText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  btnRefresh: {
    borderWidth: 1.5,
    borderColor: '#4F8EF7',
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  btnRefreshText: { color: '#4F8EF7', fontWeight: '600', fontSize: 14 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  overlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permCard: {
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pinIcon: { fontSize: 36, marginBottom: 12 },
  permTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 26,
  },
  dataNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    width: '100%',
  },
  dataNoticeIcon: { fontSize: 18, marginRight: 10 },
  dataNoticeText: { flex: 1, fontSize: 13, color: '#CCC', lineHeight: 18 },
  dataNoticeArrow: { color: '#AAA', fontSize: 20, marginLeft: 8 },
  accuracyRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  accuracyCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#3A3A3A',
  },
  accuracyCardActive: { borderColor: '#5B9BFF', backgroundColor: '#2E3E55' },
  mapCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1E3A5F',
    borderWidth: 2,
    borderColor: '#5B9BFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  mapCircleApprox: { borderColor: '#555', backgroundColor: '#2A2A2A' },
  mapEmoji: { fontSize: 40 },
  precisePin: {
    position: 'absolute',
    bottom: 18,
    left: '50%',
    marginLeft: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  accuracyLabel: { color: '#AAA', fontWeight: '600', fontSize: 14 },
  accuracyLabelActive: { color: '#FFF' },
  permOptionBtn: { width: '100%', paddingVertical: 14, alignItems: 'center' },
  permOptionText: { color: '#5B9BFF', fontSize: 16, fontWeight: '500' },
  accuracyDialog: {
    width: '100%',
    backgroundColor: '#2C2C2C',
    borderRadius: 20,
    padding: 22,
  },
  accuracyDialogTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 14,
    lineHeight: 24,
  },
  accuracyDialogSub: { fontSize: 14, color: '#AAA', marginBottom: 12 },
  accuracyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  accuracyItemIcon: { fontSize: 18, marginTop: 1 },
  accuracyItemText: { fontSize: 15, color: '#DDD', fontWeight: '500' },
  accuracyItemTextBlock: {
    flex: 1,
    fontSize: 13,
    color: '#CCC',
    lineHeight: 19,
  },
  accuracyFooter: {
    fontSize: 13,
    color: '#AAA',
    marginTop: 10,
    marginBottom: 18,
    lineHeight: 19,
  },
  accuracyLink: { color: '#5B9BFF' },
  accuracyBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  btnNoThanks: {
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#555',
  },
  btnNoThanksText: { color: '#DDD', fontWeight: '600', fontSize: 14 },
  btnTurnOn: {
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#5B9BFF',
  },
  btnTurnOnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});

export default LocationManager;
