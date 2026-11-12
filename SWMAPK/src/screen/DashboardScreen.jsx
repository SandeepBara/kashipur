import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import Layout from '../layout/Layout';
import { UlbInfoApi } from '../api/endpoints';
import { getToken, getUserDetails } from '../util/auth';
import { requestBluetoothPermissions } from '../util/permissions';
import {
  initPrinter,
  scanForDevices,
  connectToPrinter,
  printLine,
  disconnectPrinter,
} from '../util/printer';
import COLORS from '../constants/colors';

const quickActions = [
  { title: 'Add consumer', caption: 'Register a service address', icon: 'user-plus', route: 'AddConsumer', tone: '#E9F4EC', color: '#21824E' },
  { title: 'Find consumer', caption: 'Search by name or number', icon: 'search', route: 'Search', tone: '#EAF1FC', color: '#3E70B5' },
  { title: 'Collect waste', caption: 'Scan an RFID tag', icon: 'refresh-cw', route: 'ScanRFID', tone: '#FFF3E2', color: '#BB7416' },
  { title: 'Install RFID', caption: 'Link a tag to a consumer', icon: 'radio', route: 'InstallRFID', tone: '#F3ECFA', color: '#8557A7' },
];

function DashboardScreen({ navigation }) {
  const [ulbData, setUlbData] = useState(null);
  const [testingPrinter, setTestingPrinter] = useState(false);

  const fetchUlbInfo = useCallback(async () => {
    try {
      const [token, user] = await Promise.all([getToken(), getUserDetails()]);
      if (!token || !user?.ulbId) return;
      const response = await axios.post(UlbInfoApi(user.ulbId), {}, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      setUlbData(response.data?.data || null);
    } catch {
      // The dashboard remains usable if organization details are temporarily unavailable.
    }
  }, []);

  useEffect(() => { fetchUlbInfo(); }, [fetchUlbInfo]);

  const handleTestPrinter = async () => {
    setTestingPrinter(true);
    try {
      const hasPermission = await requestBluetoothPermissions();
      if (!hasPermission) {
        Alert.alert('Permission required', 'Bluetooth and location permissions are needed to test the printer.');
        return;
      }
      try { await disconnectPrinter(); } catch { /* No existing connection. */ }
      await initPrinter();
      const devices = await scanForDevices();
      if (!devices?.length) {
        Alert.alert('No printer found', 'Turn on the printer, keep it nearby, and try again.');
        return;
      }

      const printer = devices[0];
      let lastError;
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          await initPrinter();
          await connectToPrinter(printer.inner_mac_address);
          await new Promise(resolve => setTimeout(resolve, 1500));
          await printLine('<C>Printer Test - OK</C>');
          await disconnectPrinter();
          Alert.alert('Test print sent', `Check the paper output from ${printer.device_name || 'your printer'}.`);
          return;
        } catch (error) {
          lastError = error;
          try { await disconnectPrinter(); } catch { /* Ignore cleanup errors. */ }
          if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1500));
        }
      }
      throw lastError;
    } catch (error) {
      Alert.alert('Printer test failed', error?.message || 'Check the printer connection and try again.');
      try { await disconnectPrinter(); } catch { /* Ignore cleanup errors. */ }
    } finally {
      setTestingPrinter(false);
    }
  };

  return (
    <Layout title={ulbData?.ulbName || 'Field operations'} isBack={false}>
      <View style={styles.content}>
        <View style={styles.introRow}>
          <View style={styles.introCopy}>
            <Text style={styles.kicker}>SOLID WASTE MANAGEMENT</Text>
            <Text style={styles.greeting}>Ready for today?</Text>
            <Text style={styles.introText}>Choose a field task to get started.</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>FIELD APP</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryCard}
          onPress={() => navigation.navigate('ScanRFID')}
          activeOpacity={0.88}
        >
          <View style={styles.primaryIcon}><Icon name="truck" size={23} color="#FFFFFF" /></View>
          <View style={styles.primaryCopy}>
            <Text style={styles.primaryEyebrow}>DAILY COLLECTION</Text>
            <Text style={styles.primaryTitle}>Start a collection</Text>
            <Text style={styles.primaryCaption}>Scan a consumer tag and record service</Text>
          </View>
          <View style={styles.arrowCircle}><Icon name="arrow-up-right" size={18} color="#155D3B" /></View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <Text style={styles.sectionMeta}>FIELD TOOLS</Text>
        </View>

        <View style={styles.actionGrid}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.route}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.route)}
              activeOpacity={0.82}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.tone }]}>
                <Icon name={action.icon} size={19} color={action.color} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionCaption}>{action.caption}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.reportCard}
          onPress={() => navigation.navigate('Collection')}
          activeOpacity={0.82}
        >
          <View style={styles.reportIcon}><Icon name="bar-chart-2" size={19} color={COLORS.primary} /></View>
          <View style={styles.reportCopy}>
            <Text style={styles.reportTitle}>Collection reports</Text>
            <Text style={styles.reportCaption}>Review payments and field activity</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#829087" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.printerButton}
          onPress={handleTestPrinter}
          disabled={testingPrinter}
          activeOpacity={0.8}
        >
          {testingPrinter ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Icon name="printer" size={16} color={COLORS.primary} />}
          <Text style={styles.printerText}>{testingPrinter ? 'Checking printer…' : 'Test receipt printer'}</Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 24 },
  introRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  introCopy: { flex: 1, paddingRight: 8 },
  kicker: { color: COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.25, marginBottom: 7 },
  greeting: { color: '#18251D', fontSize: 25, lineHeight: 31, fontWeight: '800', letterSpacing: -0.5 },
  introText: { color: '#718077', fontSize: 13, marginTop: 5 },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F3EC', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7, marginTop: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#34A66A', marginRight: 6 },
  statusText: { color: '#34724D', fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  primaryCard: { minHeight: 132, backgroundColor: '#165F3D', borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', marginBottom: 26 },
  primaryIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  primaryCopy: { flex: 1 },
  primaryEyebrow: { color: '#B8D9C5', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  primaryTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 5 },
  primaryCaption: { color: '#D0E5D7', fontSize: 11, lineHeight: 16, marginTop: 4, maxWidth: 220 },
  arrowCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#D8EFE0', alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: '#202C24', fontSize: 17, fontWeight: '700' },
  sectionMeta: { color: '#8A968E', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48.2%', minHeight: 132, borderRadius: 18, backgroundColor: '#FFFFFF', padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E9EEEA' },
  actionIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  actionTitle: { color: '#243129', fontSize: 13, fontWeight: '700' },
  actionCaption: { color: '#849087', fontSize: 10, lineHeight: 15, marginTop: 4 },
  reportCard: { minHeight: 70, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9EEEA', borderRadius: 17, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  reportIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#E8F2EC', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  reportCopy: { flex: 1 },
  reportTitle: { color: '#26332A', fontSize: 13, fontWeight: '700' },
  reportCaption: { color: '#87928A', fontSize: 10, marginTop: 4 },
  printerButton: { minHeight: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 11, borderRadius: 13, backgroundColor: '#E9F2EC' },
  printerText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
});

export default DashboardScreen;
