import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { printReceipt, printQRCode } from '../utils/printer';

const SAMPLE_ITEMS = [
  { name: 'Coffee', qty: 2, price: 3.5 },
  { name: 'Sandwich', qty: 1, price: 6.0 },
  { name: 'Cookie', qty: 3, price: 1.25 },
];

export default function PrintScreen({ route, navigation }) {
  const { printer } = route.params;
  const [printing, setPrinting] = useState(false);

  const total = SAMPLE_ITEMS.reduce((sum, i) => sum + i.qty * i.price, 0);

  const handlePrintReceipt = async () => {
    setPrinting(true);
    try {
      await printReceipt({
        storeName: 'My Store',
        items: SAMPLE_ITEMS,
        total,
        footerNote: 'Thank you for your purchase!',
      });
      Alert.alert('Success', 'Receipt sent to printer.');
    } catch (err) {
      Alert.alert('Print failed', String(err));
    } finally {
      setPrinting(false);
    }
  };

  const handlePrintQRCode = async () => {
    setPrinting(true);
    try {
      await printQRCode('https://example.com');
      Alert.alert('Success', 'QR code sent to printer.');
    } catch (err) {
      Alert.alert('Print failed', String(err));
    } finally {
      setPrinting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.connectedLabel}>Connected to</Text>
        <Text style={styles.printerName}>{printer?.name || 'Unknown Printer'}</Text>
        <Text style={styles.printerAddress}>{printer?.address}</Text>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.button}
          onPress={handlePrintReceipt}
          disabled={printing}
        >
          {printing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Print Sample Receipt</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handlePrintQRCode}
          disabled={printing}
        >
          <Text style={styles.buttonText}>Print QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('PrinterList')}
        >
          <Text style={styles.linkText}>Switch Printer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  connectedLabel: { fontSize: 13, color: '#888' },
  printerName: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  printerAddress: { fontSize: 12, color: '#aaa', marginBottom: 24 },
  divider: { width: '100%', height: 1, backgroundColor: '#eee', marginBottom: 24 },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: { backgroundColor: '#4CAF50' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkButton: { marginTop: 8 },
  linkText: { color: '#2196F3', fontSize: 14 },
});
