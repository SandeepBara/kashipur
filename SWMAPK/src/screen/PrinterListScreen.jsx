import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { requestBluetoothPermissions } from '../utils/permissions';
import {
  ensureBluetoothEnabled,
  scanForDevices,
  connectToPrinter,
} from '../utils/printer';

export default function PrinterListScreen({ navigation }) {
  const [pairedDevices, setPairedDevices] = useState([]);
  const [foundDevices, setFoundDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [connectingAddress, setConnectingAddress] = useState(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const hasPermission = await requestBluetoothPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission required',
        'Bluetooth and location permissions are needed to scan for printers.',
      );
      return;
    }
    await ensureBluetoothEnabled();
    handleScan();
  };

  const handleScan = useCallback(async () => {
    setScanning(true);
    try {
      const { paired, found } = await scanForDevices();
      console.log('Paired Devices:', paired);
      console.log('Found Devices:', found);
      setPairedDevices(paired);
      setFoundDevices(found);
    } catch (err) {
      Alert.alert('Scan failed', String(err));
    } finally {
      setScanning(false);
    }
  }, []);

  const handleConnect = async device => {
    setConnectingAddress(device.address);
    try {
      await connectToPrinter(device.address);
      navigation.navigate('Print', { printer: device });
    } catch (err) {
      Alert.alert('Connection failed', String(err));
    } finally {
      setConnectingAddress(null);
    }
  };

  const renderDevice = ({ item }) => {
    const isConnecting = connectingAddress === item.address;
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => handleConnect(item)}
        disabled={isConnecting}
      >
        <View>
          <Text style={styles.name}>{item.name || 'Unknown Device'}</Text>
          <Text style={styles.address}>{item.address}</Text>
        </View>
        {isConnecting && <ActivityIndicator size="small" />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScan}
          disabled={scanning}
        >
          {scanning ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.scanText}>Rescan for Printers</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.header}>Paired Devices</Text>
        <FlatList
          data={pairedDevices}
          keyExtractor={item => item.address}
          renderItem={renderDevice}
          ListEmptyComponent={
            <Text style={styles.empty}>No paired devices</Text>
          }
        />

        <Text style={styles.header}>Available Devices</Text>
        <FlatList
          data={foundDevices}
          keyExtractor={item => item.address}
          renderItem={renderDevice}
          ListEmptyComponent={
            <Text style={styles.empty}>No nearby devices found</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 16 },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  scanText: { color: '#fff', fontWeight: '600' },
  header: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 15, fontWeight: '500' },
  address: { fontSize: 12, color: '#888' },
  empty: { fontSize: 13, color: '#aaa', paddingVertical: 8 },
});
