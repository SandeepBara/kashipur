import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from '@react-native-community/blur';

import { rfid_scan_api } from '../../api/endpoints';
import COLORS from '../../constants/colors';
import Layout from '../../layout/Layout';
import { globalStyle } from '../../styles/globalStyle';

const ScanRFID = () => {
  const [logs, setLogs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef(null);
  const navigation = useNavigation();
  const isProcessing = useRef(false); // Prevent race conditions

  // 1. Auto-focus and Keep-focus logic for HID Scanners
  useEffect(() => {
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 500);
    return () => clearTimeout(focusTimer);
  }, []);

  const handleBlur = () => {
    // Small delay to ensure refocus doesn't block other UI interactions
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // 2. Optimized API call
  const sendToServer = async (tag) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setLoading(true);

    const payload = {
      rfId: tag,
      device: 'android_otg_1',
      visitingDateTime: new Date().toISOString(),
    };

    try {
      const { data } = await axios.post(rfid_scan_api, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000, // 10s timeout
      });

      if (data?.status) {
        const consumerNo = data?.data?.consumerNo || 'N/A';
        const recordId = data?.data?.id;

        // Update logs with real data from server
        setLogs(prev => prev.map(log => 
          log.tag === tag ? { ...log, consumerNo, status: 'VERIFIED' } : log
        ));

        if (recordId) {
          navigation.navigate('ConsumerDetails', { id: recordId });
        }
      } else {
        Alert.alert('Scan Error', data?.message || 'Invalid RFID Tag');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Check your connection and try again.');
      console.error('RFID_API_ERROR:', error);
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  };

  // 3. Handle Submit (Triggered by hardware Enter key)
  const onSubmit = () => {
    const tag = input.trim();
    if (!tag) return;

    // Local log entry for immediate UI feedback
    const newLog = {
      id: Date.now().toString(),
      tag,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING',
    };

    setLogs(prev => [newLog, ...prev]);
    setInput('');
    sendToServer(tag);
  };

  // 4. Optimized List Item
  const renderLogItem = useCallback(({ item }) => (
    <View style={styles.logItem}>
      <View style={styles.logItemHeader}>
        <Text style={styles.tagText}>{item.tag}</Text>
        <View style={[styles.statusBadge, item.status === 'VERIFIED' && styles.statusBadgeSuccess]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      {item.consumerNo && (
        <Text style={styles.consumerText}>Consumer: {item.consumerNo}</Text>
      )}
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  ), []);

  return (
    <Layout title="RFID Scanner" isBack={true} scrollable={false}>
      <View style={globalStyle.mainContent}>
        <View style={styles.content}>
          
          <View style={styles.card}>
            <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>Ready to Scan</Text>
                <View style={styles.modeTag}><Text style={styles.modeText}>HID MODE</Text></View>
            </View>

            <TextInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={onSubmit}
              onBlur={handleBlur} // Keep focus for hardware reader
              blurOnSubmit={false}
              placeholder="Scan RFID Tag..."
              placeholderTextColor="#aaa"
              style={styles.input}
            //   showSoftInputOnFocus={false} // Prevents keyboard from popping up
              caretHidden={true}
            />
            <Text style={styles.hintText}>Reader will auto-submit on scan</Text>
          </View>

          <View style={styles.logsHeader}>
            <Text style={styles.logsTitle}>Recent History</Text>
            <View style={styles.logCount}>
              <Text style={styles.logCountText}>{logs.length}</Text>
            </View>
          </View>

          <FlatList
            data={logs}
            keyExtractor={item => item.id}
            renderItem={renderLogItem}
            initialNumToRender={10}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tags scanned yet.</Text>
              </View>
            }
          />
        </View>

        {loading && (
          <BlurView style={styles.blurOverlay} blurType="light" blurAmount={6}>
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loaderText}>Validating...</Text>
            </View>
          </BlurView>
        )}
      </View>
    </Layout>
  );
};

export default ScanRFID;

const styles = StyleSheet.create({
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8EEEA',
    elevation: 1,
    shadowColor: '#173B27',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#253229' },
  modeTag: { backgroundColor: '#EAF3ED', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  modeText: { fontSize: 9, color: COLORS.primary, fontWeight: '800', letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderColor: '#DCE5DE',
    backgroundColor: '#FBFCFB',
    padding: 15,
    borderRadius: 13,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 2,
    color: COLORS.primary
  },
  hintText: { color: '#849087', marginTop: 9, fontSize: 12, textAlign: 'center' },
  logsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  logsTitle: { fontSize: 17, fontWeight: '700', color: '#26332A' },
  logCount: { backgroundColor: '#EAF3ED', paddingHorizontal: 10, borderRadius: 10, justifyContent: 'center' },
  logCountText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  logItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8EEEA',
    elevation: 1
  },
  logItemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  tagText: { fontSize: 14, fontWeight: '700', color: '#29362D' },
  statusBadge: { backgroundColor: '#F1F4F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9 },
  statusBadgeSuccess: { backgroundColor: '#E2F2E8' },
  statusText: { fontSize: 9, color: '#5F6D64', fontWeight: '800' },
  consumerText: { fontSize: 14, color: COLORS.primary, marginBottom: 4, fontWeight: '600' },
  timeText: { fontSize: 11, color: '#87938B' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#bbb' },
  blurOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loaderBox: { backgroundColor: '#fff', padding: 30, borderRadius: 20, alignItems: 'center', elevation: 10 },
  loaderText: { marginTop: 10, fontWeight: '600', color: '#333' }
});
