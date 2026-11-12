import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

/*
|--------------------------------------------------------------------------
| Android Location Enabler
|--------------------------------------------------------------------------
*/

let LocationEnabler = null;

if (Platform.OS === 'android') {
  try {
    const mod = require('react-native-android-location-enabler');

    LocationEnabler = mod?.default || mod?.RNAndroidLocationEnabler || mod;
  } catch (error) {
    console.warn(
      '[LocationManager] Location enabler not available:',
      error?.message,
    );
  }
}

const LocationManager = ({
  onLocationSelect = () => {},
  reference = () => {},
  refreshTrigger,
  processing,
  isShow=true,
  ...rest
}) => {
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Custom explanation modal.
  // This is NOT the Android permission dialog.
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  const isMounted = useRef(false);

  // Prevent multiple location requests at the same time.
  const locationRequestInProgress = useRef(false);

  // Tracks whether refreshTrigger's initial value has already been seen,
  // so mounting the component doesn't itself count as a "refresh".
  const hasSeenInitialTrigger = useRef(false);

  /*
  |--------------------------------------------------------------------------
  | Get platform location permission
  |--------------------------------------------------------------------------
  */

  const getLocationPermission = useCallback(() => {
    if (Platform.OS === 'android') {
      return PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    }

    return PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Safe state setters
  |--------------------------------------------------------------------------
  */

  const safeSetStatus = useCallback(value => {
    if (isMounted.current) {
      setStatus(value);
    }
  }, []);

  const safeSetCoords = useCallback(value => {
    if (isMounted.current) {
      setCoords(value);
    }
  }, []);

  const safeSetError = useCallback(value => {
    if (isMounted.current) {
      setErrorMsg(value);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Component Mount
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Check permission on first screen load
  |
  | If already granted:
  |      -> directly get location
  |
  | If not granted:
  |      -> show our explanation modal
  |
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const permission = getLocationPermission();

        const result = await check(permission);

        console.log('[LocationManager] Initial permission:', result);

        if (!isMounted.current) {
          return;
        }

        /*
        |--------------------------------------------------------------------------
        | Permission already granted
        |--------------------------------------------------------------------------
        */

        if (result === RESULTS.GRANTED) {
          console.log('[LocationManager] Permission already granted');

          await startLocationFlow();
          return;
        }

        /*
        |--------------------------------------------------------------------------
        | Permission not granted
        |--------------------------------------------------------------------------
        */

        safeSetStatus('permission');
        setShowPermissionModal(true);
      } catch (error) {
        console.warn(
          '[LocationManager] Initial permission check error:',
          error,
        );

        safeSetError('Unable to check location permission.');

        safeSetStatus('error');
      }
    };

    const timer = setTimeout(() => {
      initializeLocation();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getLocationPermission, safeSetError, safeSetStatus]);

  /*
  |--------------------------------------------------------------------------
  | Open App Settings
  |--------------------------------------------------------------------------
  */

  const openSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.warn('[LocationManager] Unable to open settings:', error);
    }
  }, []);

  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve(position);
        },
        error => {
          reject(error);
        },
        {
          /*
          | false = better compatibility / faster result
          | true  = GPS/high accuracy
          |
          | Start with false because previous code was
          | getting timeout errors.
          */
          enableHighAccuracy: false,

          // Give Android enough time to obtain location.
          timeout: 30000,

          // Accept location cached within 60 seconds.
          maximumAge: 60000,
        },
      );
    });
  }, []);

  const fetchLocation = useCallback(async () => {
    if (!isMounted.current) {
      return;
    }

    if (locationRequestInProgress.current) {
      console.log('[LocationManager] Location request already running.');

      return;
    }

    locationRequestInProgress.current = true;

    safeSetStatus('fetching');
    safeSetError('');

    console.log('====================================');
    console.log('[LocationManager] GETTING GPS LOCATION...');
    console.log('====================================');

    try {
      const position = await getCurrentLocation();

      if (!isMounted.current) {
        return;
      }

      console.log('[LocationManager] GPS RESPONSE:', position);

      const latitude = position?.coords?.latitude;
      const longitude = position?.coords?.longitude;
      const accuracy = position?.coords?.accuracy;

      /*
      |--------------------------------------------------------------------------
      | Validate coordinates
      |--------------------------------------------------------------------------
      */

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        console.warn('[LocationManager] Invalid GPS coordinates:', position);

        safeSetError('Invalid location data received from GPS.');

        safeSetStatus('error');

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Location object
      |--------------------------------------------------------------------------
      */

      const location = {
        latitude,
        longitude,
        accuracy: typeof accuracy === 'number' ? accuracy : null,
      };

      /*
      |--------------------------------------------------------------------------
      | Save location
      |--------------------------------------------------------------------------
      */

      safeSetCoords(location);
      safeSetStatus('fetched');
      setShowPermissionModal(false);

      /*
      |--------------------------------------------------------------------------
      | Send location object to parent
      |--------------------------------------------------------------------------
      */

      if (typeof onLocationSelect === 'function') {
        try {
          onLocationSelect(location);
        } catch (callbackError) {
          console.warn(
            '[LocationManager] onLocationSelect error:',
            callbackError,
          );
        }
      }
    } catch (error) {
      if (!isMounted.current) {
        return;
      }

      console.log('====================================');
      console.log('[LocationManager] GPS ERROR');
      console.log('Code:', error?.code);
      console.log('Message:', error?.message);
      console.log('====================================');

      let errorMessage = 'Unable to get your current location.';

      /*
      |--------------------------------------------------------------------------
      | Geolocation error codes
      |
      | 1 = Permission denied
      | 2 = Position unavailable
      | 3 = Timeout
      |--------------------------------------------------------------------------
      */

      switch (error?.code) {
        case 1:
          errorMessage =
            'Location permission is denied. Please allow location access from Settings.';

          safeSetStatus('denied');
          break;

        case 2:
          errorMessage =
            'Location is unavailable. Please make sure GPS/Location is turned on.';

          safeSetStatus('locationOff');
          break;

        case 3:
          errorMessage =
            'GPS location timed out. Please move to an open area and try again.';

          safeSetStatus('error');
          break;

        default:
          errorMessage =
            error?.message || 'Unable to get your current location.';

          safeSetStatus('error');
          break;
      }

      safeSetError(errorMessage);
    } finally {
      locationRequestInProgress.current = false;
    }
  }, [
    getCurrentLocation,
    onLocationSelect,
    safeSetCoords,
    safeSetError,
    safeSetStatus,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Enable Android GPS + Fetch Location
  |--------------------------------------------------------------------------
  */

  const enableGPSAndFetchLocation = useCallback(async () => {
    if (!isMounted.current) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | iOS
    |--------------------------------------------------------------------------
    */

    if (Platform.OS !== 'android') {
      await fetchLocation();
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Android Location Enabler unavailable
    |--------------------------------------------------------------------------
    */

    if (
      !LocationEnabler ||
      typeof LocationEnabler.promptForEnableLocationIfNeeded !== 'function'
    ) {
      console.warn('[LocationManager] LocationEnabler unavailable.');

      /*
      | Try GPS directly.
      */

      await fetchLocation();
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Android - Ask user to enable GPS if necessary
    |--------------------------------------------------------------------------
    */

    try {
      console.log('[LocationManager] Checking Android GPS...');

      safeSetStatus('checking');

      await LocationEnabler.promptForEnableLocationIfNeeded({
        interval: 10000,
        fastInterval: 5000,
      });

      if (!isMounted.current) {
        return;
      }

      console.log('[LocationManager] Android GPS enabled.');

      /*
      |--------------------------------------------------------------------------
      | Small delay for Android GPS initialization
      |--------------------------------------------------------------------------
      */

      await new Promise(resolve => {
        setTimeout(resolve, 1000);
      });

      if (!isMounted.current) {
        return;
      }

      await fetchLocation();
    } catch (error) {
      if (!isMounted.current) {
        return;
      }

      console.warn('[LocationManager] GPS enable error:', error);

      if (
        error?.code === 'ERR_DENIED' ||
        error?.code === 'ERR_SWIPE_DISMISSED'
      ) {
        safeSetError(
          'Location is turned off. Please turn on Location to continue.',
        );

        safeSetStatus('locationOff');

        return;
      }

      if (error?.code === 'SETTINGS_CHANGE_UNAVAILABLE') {
        safeSetError(
          'Please turn on Location manually from your device Settings.',
        );

        safeSetStatus('locationOff');

        return;
      }

      safeSetError(error?.message || 'Unable to enable device location.');

      safeSetStatus('error');
    }
  }, [fetchLocation, safeSetError, safeSetStatus]);

  const startLocationFlow = useCallback(async () => {
    if (!isMounted.current) {
      return false;
    }

    if (isProcessing) {
      console.log('[LocationManager] Location flow already running.');

      return false;
    }

    try {
      setIsProcessing(true);

      safeSetError('');
      safeSetStatus('checking');

      const permission = getLocationPermission();

      /*
      |--------------------------------------------------------------------------
      | Check permission first
      |--------------------------------------------------------------------------
      */

      const currentPermission = await check(permission);

      console.log('[LocationManager] Current permission:', currentPermission);

      if (!isMounted.current) {
        return false;
      }

      /*
      |--------------------------------------------------------------------------
      | Already granted
      |--------------------------------------------------------------------------
      */

      if (currentPermission === RESULTS.GRANTED) {
        console.log('[LocationManager] Permission already granted.');

        setShowPermissionModal(false);

        await enableGPSAndFetchLocation();

        return true;
      }

      /*
      |--------------------------------------------------------------------------
      | Permission is blocked
      |
      | User selected "Don't ask again" / permanently denied.
      |--------------------------------------------------------------------------
      */

      if (currentPermission === RESULTS.BLOCKED) {
        console.log('[LocationManager] Permission is blocked.');

        safeSetError(
          'Location permission is blocked. Please enable it from Settings.',
        );

        safeSetStatus('denied');

        setShowPermissionModal(false);

        return false;
      }

      /*
      |--------------------------------------------------------------------------
      | Request Android/iOS system permission
      |--------------------------------------------------------------------------
      */

      console.log('[LocationManager] Requesting location permission...');

      const requestResult = await request(permission);

      console.log(
        '[LocationManager] Permission request result:',
        requestResult,
      );

      if (!isMounted.current) {
        return false;
      }

      /*
      |--------------------------------------------------------------------------
      | Permission granted
      |--------------------------------------------------------------------------
      */

      if (requestResult === RESULTS.GRANTED) {
        console.log('[LocationManager] Permission granted.');

        setShowPermissionModal(false);

        await enableGPSAndFetchLocation();

        return true;
      }

      /*
      |--------------------------------------------------------------------------
      | Permission denied
      |--------------------------------------------------------------------------
      */

      if (requestResult === RESULTS.DENIED) {
        console.log('[LocationManager] Permission denied.');

        safeSetError(
          'Location permission was denied. You can allow it later from Settings.',
        );

        safeSetStatus('denied');

        return false;
      }

      /*
      |--------------------------------------------------------------------------
      | Permission blocked
      |--------------------------------------------------------------------------
      */

      if (requestResult === RESULTS.BLOCKED) {
        console.log('[LocationManager] Permission blocked.');

        safeSetError(
          'Location permission is blocked. Please enable it from Settings.',
        );

        safeSetStatus('denied');

        return false;
      }

      /*
      |--------------------------------------------------------------------------
      | Other status
      |--------------------------------------------------------------------------
      */

      safeSetError('Location permission was not granted.');

      safeSetStatus('denied');

      return false;
    } catch (error) {
      console.warn('[LocationManager] Location flow error:', error);

      if (isMounted.current) {
        safeSetError(error?.message || 'Unable to access your location.');

        safeSetStatus('error');
      }

      return false;
    } finally {
      if (isMounted.current) {
        setIsProcessing(false);
      }
    }
  }, [
    enableGPSAndFetchLocation,
    getLocationPermission,
    isProcessing,
    safeSetError,
    safeSetStatus,
  ]);

  const handleAllowLocation = useCallback(async () => {
    if (isProcessing) {
      return;
    }

    setShowPermissionModal(false);

    await startLocationFlow();
  }, [isProcessing, startLocationFlow]);

  const handleDontAllow = useCallback(() => {
    setShowPermissionModal(false);

    safeSetError(
      'Location permission is required to get your current location.',
    );

    safeSetStatus('denied');
  }, [safeSetError, safeSetStatus]);

  const handleRetry = useCallback(async () => {
    if (isProcessing) {
      console.log('[LocationManager] Refresh skipped, already processing.');
      return;
    }

    safeSetCoords(null);
    safeSetError('');

    /*
    | Check permission again.
    */

    try {
      const permission = getLocationPermission();

      const result = await check(permission);

      console.log('[LocationManager] Retry permission:', result);

      /*
      |--------------------------------------------------------------------------
      | Already granted
      |--------------------------------------------------------------------------
      */

      if (result === RESULTS.GRANTED) {
        await enableGPSAndFetchLocation();
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Blocked
      |--------------------------------------------------------------------------
      */

      if (result === RESULTS.BLOCKED) {
        safeSetStatus('denied');

        safeSetError(
          'Location permission is blocked. Please enable it from Settings.',
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Not granted
      |--------------------------------------------------------------------------
      |
      | Show explanation modal.
      |--------------------------------------------------------------------------
      */

      safeSetStatus('permission');
      setShowPermissionModal(true);
    } catch (error) {
      console.warn('[LocationManager] Retry error:', error);

      safeSetError(error?.message || 'Unable to check location permission.');

      safeSetStatus('error');
    }
  }, [
    enableGPSAndFetchLocation,
    getLocationPermission,
    isProcessing,
    safeSetCoords,
    safeSetError,
    safeSetStatus,
  ]);

  useEffect(() => {
    if (refreshTrigger === undefined) {
      return;
    }

    if (!hasSeenInitialTrigger.current) {
      // Skip the very first value — that's just the initial prop, not
      // an actual refresh request.
      hasSeenInitialTrigger.current = true;
      return;
    }

    console.log('[LocationManager] refreshTrigger changed, refreshing...');

    handleRetry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  useEffect(() => {
    if (processing === 'function') {
      processing(isProcessing);
    }
  }, [isProcessing]);

  /*
  |--------------------------------------------------------------------------
  | Imperative handle via the `reference` callback prop
  |
  | `reference` is a plain function prop here (not React.forwardRef), so
  | we call it ourselves once the handle's methods are stable. The
  | parent typically does:
  |
  |   const locationRef = useRef(null);
  |   <LocationManager reference={h => (locationRef.current = h)} />
  |   ...
  |   locationRef.current?.refresh();
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (typeof reference === 'function') {
      reference({
        refresh: handleRetry,
      });
    }

    return () => {
      if (typeof reference === 'function') {
        reference(null);
      }
    };
  }, [reference, handleRetry]);

  /*
  |--------------------------------------------------------------------------
  | Permission Modal
  |--------------------------------------------------------------------------
  */

  const PermissionModal = () => {
    return (
      <Modal
        visible={showPermissionModal}
        transparent
        animationType="slide"
        onRequestClose={handleDontAllow}
      >
        <View style={styles.overlay}>
          <View style={styles.permissionCard}>
            <Text style={styles.pinIcon}>📍</Text>

            <Text style={styles.permissionTitle}>
              Allow <Text style={styles.bold}>YourApp</Text> to access
              {'\n'}
              this device's location?
            </Text>

            <View style={styles.dataNotice}>
              <Text style={styles.noticeIcon}>🛡️</Text>

              <Text style={styles.noticeText}>
                Your location is used to provide location-based services.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.permissionButton}
              activeOpacity={0.8}
              disabled={isProcessing}
              onPress={handleAllowLocation}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#5B9BFF" />
              ) : (
                <Text style={styles.permissionButtonText}>Allow Location</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.permissionButton}
              activeOpacity={0.8}
              disabled={isProcessing}
              onPress={handleDontAllow}
            >
              <Text style={styles.permissionButtonText}>Don't allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Main UI
  |--------------------------------------------------------------------------
  */

  return (
    <View style={status === 'fetched' && !isShow ?{}: styles.card}>
      <PermissionModal />

      {/* ------------------------------------------------------------- */}
      {/* IDLE                                                         */}
      {/* ------------------------------------------------------------- */}

      {status === 'idle' && (
        <View style={styles.centerBlock}>
          <TouchableOpacity
            style={styles.primaryButton}
            disabled={isProcessing}
            onPress={() => {
              setShowPermissionModal(true);
              safeSetStatus('permission');
            }}
          >
            <Text style={styles.primaryButtonText}>
              📍 Get Current Location
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PERMISSION                                                   */}
      {/* ------------------------------------------------------------- */}

      {status === 'permission' && !showPermissionModal && (
        <View style={styles.centerBlock}>
          <Text style={styles.errorIcon}>📍</Text>

          <Text style={styles.title}>Location Permission</Text>

          <Text style={styles.subText}>Allow location access to continue.</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            disabled={isProcessing}
            onPress={() => setShowPermissionModal(true)}
          >
            <Text style={styles.primaryButtonText}>Allow Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CHECKING / FETCHING                                           */}
      {/* ------------------------------------------------------------- */}

      {(status === 'checking' || status === 'fetching') && (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" color="#4F8EF7" />

          <Text style={styles.title}>
            {status === 'checking'
              ? 'Checking Location...'
              : 'Getting Your Location...'}
          </Text>

          <Text style={styles.subText}>
            Please wait while we get your current location.
          </Text>
        </View>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUCCESS                                                       */}
      {/* ------------------------------------------------------------- */}

      {status === 'fetched' && coords && isShow && (
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

          {coords.accuracy !== null && (
            <View style={styles.coordRow}>
              <Text style={styles.label}>Accuracy</Text>

              <Text style={styles.coordValue}>
                ±{Math.round(coords.accuracy)} m
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            disabled={isProcessing}
            onPress={handleRetry}
          >
            <Text style={styles.secondaryButtonText}>🔄 Refresh Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PERMISSION DENIED                                             */}
      {/* ------------------------------------------------------------- */}

      {status === 'denied' && (
        <View style={styles.centerBlock}>
          <Text style={styles.errorIcon}>⛔</Text>

          <Text style={styles.title}>Location Permission Denied</Text>

          <Text style={styles.subText}>
            {errorMsg || 'Location access is required.'}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            disabled={isProcessing}
            onPress={handleRetry}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={openSettings}
          >
            <Text style={styles.secondaryButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ------------------------------------------------------------- */}
      {/* GPS OFF                                                       */}
      {/* ------------------------------------------------------------- */}

      {status === 'locationOff' && (
        <View style={styles.centerBlock}>
          <Text style={styles.errorIcon}>📡</Text>

          <Text style={styles.title}>Location is Off</Text>

          <Text style={styles.subText}>
            {errorMsg || 'Please turn on Location to continue.'}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            disabled={isProcessing}
            onPress={async () => {
              await enableGPSAndFetchLocation();
            }}
          >
            <Text style={styles.primaryButtonText}>📍 Turn On Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={openSettings}
          >
            <Text style={styles.secondaryButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ERROR                                                         */}
      {/* ------------------------------------------------------------- */}

      {status === 'error' && (
        <View style={styles.centerBlock}>
          <Text style={styles.errorIcon}>❌</Text>

          <Text style={styles.title}>Location Error</Text>

          <Text style={styles.subText}>
            {errorMsg || 'Unable to get your location.'}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            disabled={isProcessing}
            onPress={handleRetry}
          >
            <Text style={styles.primaryButtonText}>Retry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={openSettings}
          >
            <Text style={styles.secondaryButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,

    elevation: 4,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,

    shadowRadius: 8,
  },

  centerBlock: {
    alignItems: 'center',
    gap: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
  },

  subText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },

  successIcon: {
    fontSize: 44,
  },

  errorIcon: {
    fontSize: 44,
  },

  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    width: '100%',

    backgroundColor: '#F7F9FF',

    borderRadius: 10,

    padding: 14,
  },

  label: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '600',
  },

  coordValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4F8EF7',
  },

  primaryButton: {
    backgroundColor: '#4F8EF7',

    paddingVertical: 14,
    paddingHorizontal: 20,

    borderRadius: 12,

    width: '100%',

    alignItems: 'center',

    marginTop: 4,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  secondaryButton: {
    borderWidth: 1.5,
    borderColor: '#4F8EF7',

    paddingVertical: 12,
    paddingHorizontal: 20,

    borderRadius: 12,

    width: '100%',

    alignItems: 'center',

    marginTop: 4,
  },

  secondaryButtonText: {
    color: '#4F8EF7',
    fontWeight: '600',
    fontSize: 14,
  },

  /*
  |--------------------------------------------------------------------------
  | Permission Modal
  |--------------------------------------------------------------------------
  */

  overlay: {
    flex: 1,

    backgroundColor: 'rgba(0,0,0,0.55)',

    justifyContent: 'flex-end',
  },

  permissionCard: {
    backgroundColor: '#2A2A2A',

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    padding: 24,
    paddingBottom: 40,

    alignItems: 'center',
  },

  pinIcon: {
    fontSize: 40,
    marginBottom: 14,
  },

  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',

    color: '#FFFFFF',

    textAlign: 'center',

    marginBottom: 18,

    lineHeight: 26,
  },

  bold: {
    fontWeight: '800',
  },

  dataNotice: {
    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#444444',

    borderRadius: 10,

    padding: 14,

    marginBottom: 20,

    width: '100%',
  },

  noticeIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  noticeText: {
    flex: 1,

    fontSize: 13,

    color: '#CCCCCC',

    lineHeight: 18,
  },

  permissionButton: {
    width: '100%',

    paddingVertical: 14,

    alignItems: 'center',
  },

  permissionButtonText: {
    color: '#5B9BFF',

    fontSize: 16,

    fontWeight: '500',
  },
});

export default LocationManager;
