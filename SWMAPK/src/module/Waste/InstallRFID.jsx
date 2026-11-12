import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import { BlurView } from '@react-native-community/blur';

import { validateConsumerApi, rfid_install_api } from '../../api/endpoints';
import COLORS from '../../constants/colors';
import Layout from '../../layout/Layout';
import { globalStyle } from '../../styles/globalStyle';
import { getToken } from '../../util/auth';

const InstallRFID = ({ route }) => {
  const [token, setToken] = useState();
  const [consumerNo, setConsumerNo] = useState('');
  const [consumerData, setConsumerData] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const [rfidInput, setRfidInput] = useState('');
  const [loading, setLoading] = useState(false);

  const rfidInputRef = useRef(null);
  const isProcessing = useRef(false);
  const scanTimerRef = useRef(null); // Buffer timer for fast hardware scanning
  const rawScanBuffer = useRef(''); // Ref buffer to prevent keystroke loss during React state lag

  const passedParams = route.params || {};

  useEffect(() => {
    const init = async () => {
      const data = await getToken();
      setToken(data);

      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        Geolocation.setRNConfiguration({
          skipPermissionRequests: false,
          authorizationLevel: 'whenInUse',
        });
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (passedParams?.consumerNo && token) {
      setConsumerNo(passedParams?.consumerNo);
      validateConsumer(passedParams?.consumerNo);
    }
  }, [passedParams, token]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs location to verify installation spot.',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const getCurrentLocation = async () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => resolve(position.coords),
        error => reject(error),
        {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 60000,
        },
      );
    });
  };

  const validateConsumer = async (valueToValidate = null) => {
    const cleanValue = (
      valueToValidate != null && typeof valueToValidate === 'string'
        ? valueToValidate
        : consumerNo
    ).trim();

    if (!cleanValue) return Alert.alert('Error', 'Please enter Consumer No');

    setLoading(true);
    try {
      const response = await axios.post(
        validateConsumerApi,
        { consumerNo: cleanValue },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        },
      );
      console.log('validateConsumer response', response);

      if (response?.data?.status) {
        setConsumerData(response?.data?.data);
        setIsValidated(true);
        Keyboard.dismiss();
      } else {
        const errorMsg =
          response?.data?.errors?.consumerNo?.[0] ||
          response?.data?.message ||
          'Consumer not found';
        Alert.alert('Validation Failed', errorMsg);
      }
    } catch (error) {
      Alert.alert('Network Error', 'Check connection.');
    } finally {
      setLoading(false);
    }
  };

  const onRfidScanSubmit = async (passedTag = null) => {
    // Priority: Explicit passed parameter > Raw Buffer > Component State
    const rawTag = passedTag || rawScanBuffer.current || rfidInput;
    const tag = rawTag.replace(/[\r\n]+/g, '').trim();

    if (!tag || tag.length !== 24) {
      Alert.alert('Error', 'Please enter or scan a valid 24-character RFID tag.');
      return;
    }

    if (isProcessing.current) return;

    isProcessing.current = true;
    setLoading(true);

    try {
      let location = { latitude: null, longitude: null };
      try {
        const coords = await getCurrentLocation();
        location = { latitude: coords.latitude, longitude: coords.longitude };
      } catch (locError) {
        console.log('GPS Error:', locError);
        Alert.alert(
          'GPS Error',
          'Could not retrieve location. Ensure GPS is enabled.',
        );
        setLoading(false);
        isProcessing.current = false;
        return;
      }

      const payload = {
        rfId: tag,
        id: consumerData?.id,
        latitude: location.latitude,
        longitude: location.longitude,
      };
      console.log('payload', payload);
      const response = await axios.post(rfid_install_api, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data?.status) {
        Alert.alert('Success', `Installation Complete!`, [
          { text: 'OK', onPress: resetForm },
        ]);
      } else {
        Alert.alert('Failed', response?.data?.errors?.rfId?.[0] || 'Error linking tag');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Failed to save installation data.');
    } finally {
      setLoading(false);
      isProcessing.current = false;
      setRfidInput('');
      rawScanBuffer.current = '';
    }
  };

  const resetForm = () => {
    setConsumerNo('');
    setConsumerData(null);
    setIsValidated(false);
    setRfidInput('');
    rawScanBuffer.current = '';
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
  };

  // Handles fast typing from hardware RFID devices without losing trailing digits
  const handelChange = text => {
    console.log('RAW TEXT:', JSON.stringify(text));
    const fullTag = text.replace(/[\r\n]+/g, '').trim();
    rawScanBuffer.current = fullTag;
    setRfidInput(fullTag);
  };

  return (
    <Layout title="Install RFID" isBack={true}>
      <View style={globalStyle.mainContent}>
        <View style={styles.container}>
          <View style={[styles.card, isValidated && styles.disabledCard]}>
            <Text style={styles.label}>Step 1: Enter Consumer Number</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={consumerNo}
                onChangeText={setConsumerNo}
                placeholder="e.g. CON123456"
                style={[styles.input, isValidated && styles.readOnlyInput]}
                editable={!isValidated}
                onSubmitEditing={() => validateConsumer()}
              />
              {!isValidated ? (
                <TouchableOpacity
                  style={styles.btnValidate}
                  onPress={() => validateConsumer()}
                >
                  <Text style={styles.btnText}>Verify</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={resetForm} style={styles.btnReset}>
                  <Text style={styles.btnResetText}>Change</Text>
                </TouchableOpacity>
              )}
            </View>

            {consumerData && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Name: <Text style={styles.bold}>{consumerData.name}</Text>
                </Text>
                <Text style={styles.infoText}>
                  Address:{' '}
                  <Text style={styles.bold}>{consumerData.address}</Text>
                </Text>
              </View>
            )}
          </View>

          {isValidated && (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Step 2: Scan RFID Tag</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>GPS READY</Text>
                </View>
              </View>

              <TextInput
                ref={rfidInputRef}
                value={rfidInput}
                maxLength={24}
                onChangeText={handelChange}
                multiline={true}
                autoFocus={false}
                blurOnSubmit={false}
                placeholder="Scan now..."
                style={styles.rfidInput}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="default"
                importantForAutofill="no"
                autoComplete="off"
                contextMenuHidden={true}
              />
              <Text style={styles.hint}>RFID length {rfidInput.length}</Text>

              <TouchableOpacity
                style={[
                  styles.btnSubmit,
                  (!rfidInput.trim() || loading || rfidInput.length !== 24) &&
                    styles.btnDisabled,
                ]}
                onPress={() => onRfidScanSubmit()}
                disabled={!rfidInput.trim() || loading || rfidInput.length !== 24}
              >
                <Text style={styles.btnSubmitText}>
                  {loading ? 'Submitting...' : 'Installation'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {loading && (
          <BlurView style={styles.blurOverlay} blurType="light" blurAmount={6}>
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loaderText}>Processing...</Text>
            </View>
          </BlurView>
        )}
      </View>
    </Layout>
  );
};

export default InstallRFID;

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8EEEA',
    elevation: 1,
    shadowColor: '#173B27',
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  disabledCard: { backgroundColor: '#F8FAF8' },
  label: { fontSize: 14, fontWeight: '700', color: '#39473E', marginBottom: 10 },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DCE5DE',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    backgroundColor: '#fff',
    color: '#333',
  },
  readOnlyInput: { backgroundColor: '#F1F4F2', borderColor: '#E0E7E2' },
  rfidInput: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 13,
    height: 60,
    textAlign: 'center',
    fontWeight: 'bold',
    color: COLORS.primary,
    backgroundColor: '#F1F7F3',
  },
  btnValidate: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  btnReset: { justifyContent: 'center' },
  btnResetText: { color: '#dc3545', fontWeight: 'bold' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  infoBox: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#EEF5F0',
    borderRadius: 12,
  },
  infoText: { fontSize: 13, color: '#0056b3', marginBottom: 2 },
  bold: { fontWeight: 'bold' },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  activeBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  hint: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 10, marginBottom: 15 },
  btnSubmit: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  btnDisabled: {
    backgroundColor: '#A9C9B4',
  },
  btnSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  loaderBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  loaderText: { marginTop: 10, fontWeight: '600' },
});
