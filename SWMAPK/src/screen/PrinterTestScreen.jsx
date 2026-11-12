// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   TextInput,
//   ActivityIndicator,
// } from 'react-native';
// import { useState, useEffect } from 'react';

// import useBluetoothPrinter from '../utils/useBluetoothPrinter';
// import { paymentReceiptUrl } from '../api/endpoints';
// import { getToken, getUserDetails } from '../util/auth';
// import axios from 'axios';

// export default function PrinterTestScreen({ route }) {
//   const {
//     pairedDevices,
//     bluetoothDevices,
//     scanning,
//     connectedDevice,
//     scanForDevices,
//     connectToPrinter,
//     disconnectPrinter,
//     printBuffer,
//   } = useBluetoothPrinter();

//   const { id: initialReceiptId } = route.params || {};
//   console.log('PrinterTestScreen initialReceiptId:', initialReceiptId);

//   const [receiptId, setReceiptId] = useState(initialReceiptId);
//   const [loading, setLoading] = useState(false);
//   const [userDetails, setUserDetails] = useState(null);

//   // Load logged-in user's info once when screen mounts
//   useEffect(() => {
//     (async () => {
//       try {
//         const user = await getUserDetails();
//         setUserDetails(user);
//       } catch (e) {
//         console.log('getUserDetails error:', e);
//       }
//     })();
//   }, []);

//   const fetchAndPrintReceipt = async () => {
//     try {
//       console.log('fetchAndPrintReceipt called with receiptId:', receiptId);

//       const token = await getToken();
//       console.log('Token:', token);

//       const payload = {
//         id: receiptId,
//       };

//       const res = await axios.post(paymentReceiptUrl, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       const r = res.data.data;

//       const receipt = `
//       ${r.ulbDtl.ulbName.toUpperCase()}
//              Citizen Copy
// ${r.description}

// --------------------------------
// Consumer No.   : ${r.consumerNo}
// Payment Date   : ${r.tranDate}
// Transaction No.: ${r.tranNo}
// Ward No.       : ${r.wardNo}
// Holding No.    : ${r.holdingNo || '-'}
// Name           : ${r.ownerName}
// Mobile No.     : ${r.mobileNo}
// Address        : ${r.address}

// Monthly Charge : ${r.monthlyDemandAmount}
// Payment From   : ${r.fromDate}
// Payment Upto   : ${r.uptoDate}
// Payment Mode   : ${r.paymentMode}

// --------------------------------
// Amount Paid    : Rs. ${r.amount}
// --------------------------------

// TC Name        : ${r.userDtl.name}

// Complaint No.  : ${r.ulbDtl.tollFreeNo}

// Please keep this bill for future
// reference.

// \n\n\n
// `;

//       const bytes = Array.from(receipt).map(ch => ch.charCodeAt(0));

//       await printBuffer(bytes, {
//         checkConnection: true,
//       });

//       console.log('API Response:', JSON.stringify(res.data, null, 2));

//       // Print here...
//     } catch (error) {
//       console.log('========== API ERROR ==========');

//       console.log('Message:', error.message);

//       if (error.response) {
//         console.log('Status:', error.response.status);
//         console.log('Data:', JSON.stringify(error.response.data, null, 2));
//       }

//       if (error.request) {
//         console.log('Request:', error.request);
//       }

//       console.log(error);
//     }
//   };
//   const allDevices = React.useMemo(() => {
//     const map = new Map();
//     [...pairedDevices, ...bluetoothDevices].forEach(device => {
//       map.set(device.address || device.id, device);
//     });
//     return [...map.values()];
//   }, [pairedDevices, bluetoothDevices]);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Bluetooth Printer Test</Text>

//       {userDetails && (
//         <Text style={styles.count}>
//           Logged in as: {userDetails.name ?? userDetails.id}
//         </Text>
//       )}

//       <TextInput
//         style={styles.input}
//         placeholder="Receipt ID"
//         value={receiptId}
//         onChangeText={setReceiptId}
//         keyboardType="numeric"
//       />

//       <TouchableOpacity
//         style={styles.scanButton}
//         onPress={() => scanForDevices()}
//       >
//         <Text style={styles.buttonText}>
//           {scanning ? 'Scanning...' : 'Scan Printers'}
//         </Text>
//       </TouchableOpacity>

//       <Text style={styles.count}>Paired: {pairedDevices.length}</Text>
//       <Text style={styles.count}>Found: {bluetoothDevices.length}</Text>
//       <Text style={styles.count}>Total: {allDevices.length}</Text>

//       <ScrollView style={{ flex: 1 }}>
//         {allDevices.map((item, index) => (
//           <TouchableOpacity
//             key={item.address || item.id || index}
//             style={styles.deviceCard}
//             onPress={() => connectToPrinter(item)}
//           >
//             <Text style={styles.deviceName}>
//               {item.name || 'Unknown Printer'}
//             </Text>
//             <Text style={styles.deviceAddress}>{item.address || item.id}</Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {connectedDevice && (
//         <View>
//           <Text style={styles.connected}>Connected:</Text>
//           <Text style={styles.deviceName}>{connectedDevice.name}</Text>

//           <TouchableOpacity
//             style={styles.printButton}
//             onPress={fetchAndPrintReceipt}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.buttonText}>Print Receipt</Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.disconnectButton}
//             onPress={disconnectPrinter}
//           >
//             <Text style={styles.buttonText}>Disconnect</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff', padding: 15 },
//   title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//   },
//   count: { fontSize: 16, marginBottom: 5 },
//   scanButton: {
//     backgroundColor: '#1976D2',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   deviceCard: {
//     backgroundColor: '#f5f5f5',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   deviceName: { fontSize: 16, fontWeight: 'bold' },
//   deviceAddress: { color: '#666', marginTop: 5 },
//   connected: {
//     color: 'green',
//     fontWeight: 'bold',
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   printButton: {
//     backgroundColor: 'green',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   disconnectButton: {
//     backgroundColor: 'red',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   buttonText: { color: '#fff', fontWeight: 'bold' },
// });

// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   TextInput,
//   ActivityIndicator,
// } from 'react-native';
// import { useState, useEffect } from 'react';

// import useBluetoothPrinter from '../utils/useBluetoothPrinter';
// import { paymentReceiptUrl } from '../api/endpoints';
// import { getToken, getUserDetails } from '../util/auth';
// import axios from 'axios';
// import { Header } from '../layout/Header';
// import { Footer } from '../layout/Footer';

// export default function PrinterTestScreen({ route }) {
//   const {
//     pairedDevices,
//     bluetoothDevices,
//     scanning,
//     connectedDevice,
//     scanForDevices,
//     connectToPrinter,
//     disconnectPrinter,
//     printBuffer,
//   } = useBluetoothPrinter();

//   const { id: initialReceiptId } = route.params || {};

//   const [receiptId, setReceiptId] = useState(initialReceiptId);
//   const [loading, setLoading] = useState(false);
//   const [userDetails, setUserDetails] = useState(null);
//   const [lastReceiptPreview, setLastReceiptPreview] = useState(null);

//   // Load logged-in user's info once when screen mounts
//   useEffect(() => {
//     (async () => {
//       try {
//         const user = await getUserDetails();
//         setUserDetails(user);
//       } catch (e) {
//         console.log('getUserDetails error:', e);
//       }
//     })();
//   }, []);

//   const fetchAndPrintReceipt = async () => {
//     try {
//       setLoading(true);

//       const token = await getToken();

//       const payload = {
//         id: receiptId,
//       };

//       const res = await axios.post(paymentReceiptUrl, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       const r = res.data.data;

//       const receipt = `
//       ${r.ulbDtl.ulbName.toUpperCase()}
//              Citizen Copy
// ${r.description}

// --------------------------------
// Consumer No.   : ${r.consumerNo}
// Payment Date   : ${r.tranDate}
// Transaction No.: ${r.tranNo}
// Ward No.       : ${r.wardNo}
// Holding No.    : ${r.holdingNo || '-'}
// Name           : ${r.ownerName}
// Mobile No.     : ${r.mobileNo}
// Address        : ${r.address}

// Monthly Charge : ${r.monthlyDemandAmount}
// Payment From   : ${r.fromDate}
// Payment Upto   : ${r.uptoDate}
// Payment Mode   : ${r.paymentMode}

// --------------------------------
// Amount Paid    : Rs. ${r.amount}
// --------------------------------

// TC Name        : ${r.userDtl.name}

// Complaint No.  : ${r.ulbDtl.tollFreeNo}

// Please keep this bill for future
// reference.

// \n\n\n
// `;

//       const bytes = Array.from(receipt).map(ch => ch.charCodeAt(0));

//       await printBuffer(bytes, {
//         checkConnection: true,
//       });

//       setLastReceiptPreview({
//         ulbName: r.ulbDtl.ulbName,
//         description: r.description,
//         consumerNo: r.consumerNo,
//         amount: r.amount,
//       });
//     } catch (error) {
//       console.log('========== API ERROR ==========');
//       console.log('Message:', error.message);

//       if (error.response) {
//         console.log('Status:', error.response.status);
//         console.log('Data:', JSON.stringify(error.response.data, null, 2));
//       }

//       if (error.request) {
//         console.log('Request:', error.request);
//       }

//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const allDevices = React.useMemo(() => {
//     const map = new Map();
//     [...pairedDevices, ...bluetoothDevices].forEach(device => {
//       map.set(device.address || device.id, device);
//     });
//     return [...map.values()];
//   }, [pairedDevices, bluetoothDevices]);

//   const isConnected = device => {
//     if (!connectedDevice) return false;
//     const a = device.address || device.id;
//     const b = connectedDevice.address || connectedDevice.id;
//     return a === b;
//   };

//   return (
//     <>
//       <Header />
//       <View style={styles.container}>
//         {/* Header */}

//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={{ paddingBottom: 24 }}
//           keyboardShouldPersistTaps="handled"
//         >
//           {/* <View style={styles.section}>
//             <Text style={styles.label}>Receipt ID</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter receipt ID"
//               placeholderTextColor="#B4B2A9"
//               value={receiptId}
//               onChangeText={setReceiptId}
//               keyboardType="numeric"
//             />
//           </View> */}

//           <View style={styles.section}>
//             <View style={styles.rowBetween}>
//               <Text style={styles.sectionTitle}>Nearby printers</Text>
//               <TouchableOpacity
//                 style={styles.scanButton}
//                 onPress={() => scanForDevices()}
//                 disabled={scanning}
//               >
//                 {scanning ? (
//                   <ActivityIndicator size="small" color="#185FA5" />
//                 ) : (
//                   <Text style={styles.scanButtonText}>Scan</Text>
//                 )}
//               </TouchableOpacity>
//             </View>

//             <View style={styles.chipRow}>
//               <View style={styles.chip}>
//                 <Text style={styles.chipText}>
//                   Paired {pairedDevices.length}
//                 </Text>
//               </View>
//               <View style={styles.chip}>
//                 <Text style={styles.chipText}>
//                   Found {bluetoothDevices.length}
//                 </Text>
//               </View>
//               <View style={styles.chip}>
//                 <Text style={styles.chipText}>Total {allDevices.length}</Text>
//               </View>
//             </View>

//             {allDevices.length === 0 ? (
//               <Text style={styles.emptyText}>
//                 No printers found yet. Tap Scan to search nearby.
//               </Text>
//             ) : (
//               allDevices.map((item, index) => {
//                 const connected = isConnected(item);
//                 return (
//                   <TouchableOpacity
//                     key={item.address || item.id || index}
//                     style={[
//                       styles.deviceCard,
//                       connected && styles.deviceCardConnected,
//                     ]}
//                     onPress={() => connectToPrinter(item)}
//                   >
//                     <View style={{ flex: 1 }}>
//                       <Text
//                         style={[
//                           styles.deviceName,
//                           connected && styles.deviceNameConnected,
//                         ]}
//                       >
//                         {item.name || 'Unknown Printer'}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.deviceAddress,
//                           connected && styles.deviceAddressConnected,
//                         ]}
//                       >
//                         {item.address || item.id}
//                       </Text>
//                     </View>
//                     {connected && <Text style={styles.checkMark}>✓</Text>}
//                   </TouchableOpacity>
//                 );
//               })
//             )}
//           </View>

//           {lastReceiptPreview && (
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Last receipt captured</Text>
//               <View style={styles.receiptPreview}>
//                 <Text style={styles.receiptText}>
//                   {lastReceiptPreview.ulbName?.toUpperCase()}
//                   {'\n'}
//                   Citizen copy · {lastReceiptPreview.description}
//                   {'\n'}
//                   Consumer no. {lastReceiptPreview.consumerNo}
//                   {'\n'}
//                   Amount paid Rs. {lastReceiptPreview.amount}
//                 </Text>
//               </View>
//             </View>
//           )}
//         </ScrollView>

//         {connectedDevice && (
//           <View style={styles.actionBar}>
//             <TouchableOpacity
//               style={[styles.printButton, loading && styles.buttonDisabled]}
//               onPress={fetchAndPrintReceipt}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.printButtonText}>Print receipt</Text>
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.disconnectButton}
//               onPress={disconnectPrinter}
//             >
//               <Text style={styles.disconnectButtonText}>Disconnect</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//       <Footer />
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F1EFE8' },

//   header: {
//     backgroundColor: '#185FA5',
//     paddingTop: 18,
//     paddingBottom: 14,
//     paddingHorizontal: 16,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   title: { fontSize: 20, fontWeight: '700', color: '#fff' },
//   headerSubtitle: { fontSize: 12, color: '#E6F1FB', marginTop: 4 },

//   statusPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 999,
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//   },
//   statusPillConnected: { backgroundColor: '#EAF3DE' },
//   statusPillIdle: { backgroundColor: '#F1EFE8' },
//   statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
//   statusPillText: { fontSize: 12, fontWeight: '600' },

//   section: {
//     backgroundColor: '#fff',
//     marginHorizontal: 12,
//     marginTop: 12,
//     borderRadius: 12,
//     padding: 14,
//     borderWidth: 0.5,
//     borderColor: '#D3D1C7',
//   },

//   label: { fontSize: 12, color: '#5F5E5A', marginBottom: 6 },
//   input: {
//     borderWidth: 1,
//     borderColor: '#D3D1C7',
//     borderRadius: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     fontSize: 15,
//     color: '#2C2C2A',
//   },

//   rowBetween: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   sectionTitle: { fontSize: 14, fontWeight: '600', color: '#2C2C2A' },

//   scanButton: {
//     borderWidth: 1,
//     borderColor: '#185FA5',
//     borderRadius: 8,
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     minWidth: 64,
//     alignItems: 'center',
//   },
//   scanButtonText: { color: '#185FA5', fontWeight: '600', fontSize: 13 },

//   chipRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
//   chip: {
//     backgroundColor: '#F1EFE8',
//     borderRadius: 8,
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//   },
//   chipText: { fontSize: 12, color: '#5F5E5A' },

//   emptyText: { fontSize: 13, color: '#888780', paddingVertical: 8 },

//   deviceCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F1EFE8',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 8,
//     borderWidth: 0.5,
//     borderColor: '#D3D1C7',
//   },
//   deviceCardConnected: {
//     backgroundColor: '#EAF3DE',
//     borderWidth: 2,
//     borderColor: '#639922',
//   },
//   deviceName: { fontSize: 14, fontWeight: '600', color: '#2C2C2A' },
//   deviceNameConnected: { color: '#27500A' },
//   deviceAddress: { fontSize: 12, color: '#888780', marginTop: 2 },
//   deviceAddressConnected: { color: '#3B6D11' },
//   checkMark: {
//     color: '#27500A',
//     fontSize: 16,
//     fontWeight: '700',
//     marginLeft: 8,
//   },

//   receiptPreview: {
//     backgroundColor: '#F1EFE8',
//     borderRadius: 8,
//     padding: 12,
//     marginTop: 8,
//   },
//   receiptText: {
//     fontFamily: 'monospace',
//     fontSize: 11,
//     lineHeight: 17,
//     color: '#5F5E5A',
//   },

//   actionBar: {
//     flexDirection: 'row',
//     gap: 8,
//     padding: 25,
//     marginBottom: 12,
//     backgroundColor: '#fff',
//     borderTopWidth: 0.5,
//     borderTopColor: '#D3D1C7',
//   },
//   printButton: {
//     flex: 2,
//     backgroundColor: '#3B6D11',
//     borderRadius: 8,
//     paddingVertical: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   printButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
//   disconnectButton: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#A32D2D',
//     borderRadius: 8,
//     paddingVertical: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   disconnectButtonText: { color: '#A32D2D', fontWeight: '700', fontSize: 15 },
//   buttonDisabled: { opacity: 0.6 },
// });

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';

import useBluetoothPrinter from '../utils/useBluetoothPrinter';
import { paymentReceiptUrl } from '../api/endpoints';
import { getToken, getUserDetails } from '../util/auth';
import axios from 'axios';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

export default function PrinterTestScreen({ route }) {
  const {
    pairedDevices,
    bluetoothDevices,
    scanning,
    connectedDevice,
    scanForDevices,
    connectToPrinter,
    disconnectPrinter,
    printBuffer,
  } = useBluetoothPrinter();

  const { id: receiptId } = route.params || {};

  const [userDetails, setUserDetails] = useState(null);

  // Raw receipt data fetched from the API, shown in the UI
  const [receiptData, setReceiptData] = useState(null);
  const [fetchingReceipt, setFetchingReceipt] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Printing state, separate from fetching
  const [printing, setPrinting] = useState(false);

  // Load logged-in user's info once when screen mounts
  useEffect(() => {
    (async () => {
      try {
        const user = await getUserDetails();
        setUserDetails(user);
      } catch (e) {
        console.log('getUserDetails error:', e);
      }
    })();
  }, []);

  // Fetch and display the receipt as soon as we land on this screen
  useEffect(() => {
    if (receiptId) {
      fetchReceiptDetails();
    }
  }, [receiptId]);

  const fetchReceiptDetails = async () => {
    try {
      setFetchingReceipt(true);
      setFetchError(null);

      const token = await getToken();

      const res = await axios.post(
        paymentReceiptUrl,
        { id: receiptId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setReceiptData(res.data.data);
    } catch (error) {
      console.log('========== FETCH RECEIPT ERROR ==========');
      console.log('Message:', error.message);

      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', JSON.stringify(error.response.data, null, 2));
      }

      setFetchError('Failed to load receipt. Pull to retry.');
    } finally {
      setFetchingReceipt(false);
    }
  };

  // Build the ESC/POS-ready text block from already-fetched receipt data
  const buildReceiptText = r => `
      ${r.ulbDtl.ulbName.toUpperCase()}
             Citizen Copy
${r.description}

--------------------------------
Consumer No.   : ${r.consumerNo}
Payment Date   : ${r.tranDate}
Transaction No.: ${r.tranNo}
Ward No.       : ${r.wardNo}
Holding No.    : ${r.holdingNo || '-'}
Name           : ${r.ownerName}
Mobile No.     : ${r.mobileNo}
Address        : ${r.address}

Monthly Charge : ${r.monthlyDemandAmount}
Payment From   : ${r.fromDate}
Payment Upto   : ${r.uptoDate}
Payment Mode   : ${r.paymentMode}

--------------------------------
Amount Paid    : Rs. ${r.amount}
--------------------------------

TC Name        : ${r.userDtl.name}

Complaint No.  : ${r.ulbDtl.tollFreeNo}

Please keep this bill for future
reference.

\n\n\n
`;

  // Print the receipt that's already loaded in state — no re-fetch
  const handlePrintReceipt = async () => {
    if (!receiptData) {
      fetchReceiptDetails();
      return;
    }

    try {
      setPrinting(true);

      const receiptText = buildReceiptText(receiptData);
      const bytes = Array.from(receiptText).map(ch => ch.charCodeAt(0));

      await printBuffer(bytes, {
        checkConnection: true,
      });
    } catch (error) {
      console.log('========== PRINT ERROR ==========');
      console.log(error);
    } finally {
      setPrinting(false);
    }
  };

  const allDevices = React.useMemo(() => {
    const map = new Map();
    [...pairedDevices, ...bluetoothDevices].forEach(device => {
      map.set(device.address || device.id, device);
    });
    return [...map.values()];
  }, [pairedDevices, bluetoothDevices]);

  const isConnected = device => {
    if (!connectedDevice) return false;
    const a = device.address || device.id;
    const b = connectedDevice.address || connectedDevice.id;
    return a === b;
  };

  return (
    <>
      <Header />
      <View style={styles.container}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Receipt preview — auto-loaded on entering this screen */}
          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Receipt</Text>
              {fetchingReceipt && (
                <ActivityIndicator size="small" color="#185FA5" />
              )}
            </View>

            {fetchError && (
              <View>
                <Text style={styles.errorText}>{fetchError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchReceiptDetails}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {!fetchError && !receiptData && !fetchingReceipt && (
              <Text style={styles.emptyText}>No receipt loaded.</Text>
            )}

            {receiptData && (
              <View style={styles.receiptPreview}>
                <Text style={styles.receiptUlb}>
                  {receiptData.ulbDtl?.ulbName?.toUpperCase()}
                </Text>
                <Text style={styles.receiptSubtitle}>
                  Citizen Copy · {receiptData.description}
                </Text>

                <View style={styles.receiptDivider} />

                <ReceiptRow
                  label="Consumer No."
                  value={receiptData.consumerNo}
                />
                <ReceiptRow label="Payment Date" value={receiptData.tranDate} />
                <ReceiptRow
                  label="Transaction No."
                  value={receiptData.tranNo}
                />
                <ReceiptRow label="Ward No." value={receiptData.wardNo} />
                <ReceiptRow
                  label="Holding No."
                  value={receiptData.holdingNo || '-'}
                />
                <ReceiptRow label="Name" value={receiptData.ownerName} />
                <ReceiptRow label="Mobile No." value={receiptData.mobileNo} />
                <ReceiptRow label="Address" value={receiptData.address} />

                <View style={styles.receiptDivider} />

                <ReceiptRow
                  label="Monthly Charge"
                  value={receiptData.monthlyDemandAmount}
                />
                <ReceiptRow label="Payment From" value={receiptData.fromDate} />
                <ReceiptRow label="Payment Upto" value={receiptData.uptoDate} />
                <ReceiptRow
                  label="Payment Mode"
                  value={receiptData.paymentMode}
                />

                <View style={styles.receiptDivider} />

                <View style={styles.rowBetween}>
                  <Text style={styles.amountLabel}>Amount Paid</Text>
                  <Text style={styles.amountValue}>
                    Rs. {receiptData.amount}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Printer connection */}
          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Nearby printers</Text>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => scanForDevices()}
                disabled={scanning}
              >
                {scanning ? (
                  <ActivityIndicator size="small" color="#185FA5" />
                ) : (
                  <Text style={styles.scanButtonText}>Scan</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.chipRow}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  Paired {pairedDevices.length}
                </Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  Found {bluetoothDevices.length}
                </Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Total {allDevices.length}</Text>
              </View>
            </View>

            {allDevices.length === 0 ? (
              <Text style={styles.emptyText}>
                No printers found yet. Tap Scan to search nearby.
              </Text>
            ) : (
              allDevices.map((item, index) => {
                const connected = isConnected(item);
                return (
                  <TouchableOpacity
                    key={item.address || item.id || index}
                    style={[
                      styles.deviceCard,
                      connected && styles.deviceCardConnected,
                    ]}
                    onPress={() => connectToPrinter(item)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.deviceName,
                          connected && styles.deviceNameConnected,
                        ]}
                      >
                        {item.name || 'Unknown Printer'}
                      </Text>
                      <Text
                        style={[
                          styles.deviceAddress,
                          connected && styles.deviceAddressConnected,
                        ]}
                      >
                        {item.address || item.id}
                      </Text>
                    </View>
                    {connected && <Text style={styles.checkMark}>✓</Text>}
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {connectedDevice && (
            <View style={styles.actionBar}>
              <TouchableOpacity
                style={[
                  styles.printButton,
                  (printing || !receiptData) && styles.buttonDisabled,
                ]}
                onPress={handlePrintReceipt}
                disabled={printing || !receiptData}
              >
                {printing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.printButtonText}>Print receipt</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={disconnectPrinter}
              >
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      <Footer />
    </>
  );
}

// Small helper for label/value rows inside the receipt preview
function ReceiptRow({ label, value }) {
  return (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptRowLabel}>{label}</Text>
      <Text style={styles.receiptRowValue}>{value ?? '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1EFE8' },

  section: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
  },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#2C2C2A' },

  scanButton: {
    borderWidth: 1,
    borderColor: '#185FA5',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    minWidth: 64,
    alignItems: 'center',
  },
  scanButtonText: { color: '#185FA5', fontWeight: '600', fontSize: 13 },

  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: {
    backgroundColor: '#F1EFE8',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  chipText: { fontSize: 12, color: '#5F5E5A' },

  emptyText: { fontSize: 13, color: '#888780', paddingVertical: 8 },

  errorText: { fontSize: 13, color: '#A32D2D', marginBottom: 8 },
  retryButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#A32D2D',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  retryButtonText: { color: '#A32D2D', fontWeight: '600', fontSize: 13 },

  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1EFE8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
  },
  deviceCardConnected: {
    backgroundColor: '#EAF3DE',
    borderWidth: 2,
    borderColor: '#639922',
  },
  deviceName: { fontSize: 14, fontWeight: '600', color: '#2C2C2A' },
  deviceNameConnected: { color: '#27500A' },
  deviceAddress: { fontSize: 12, color: '#888780', marginTop: 2 },
  deviceAddressConnected: { color: '#3B6D11' },
  checkMark: {
    color: '#27500A',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },

  receiptPreview: {
    backgroundColor: '#F9F8F4',
    borderRadius: 8,
    padding: 14,
  },
  receiptUlb: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C2C2A',
    textAlign: 'center',
  },
  receiptSubtitle: {
    fontSize: 12,
    color: '#5F5E5A',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  receiptDivider: {
    borderTopWidth: 1,
    borderTopColor: '#D3D1C7',
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  receiptRowLabel: { fontSize: 12, color: '#5F5E5A', flex: 1 },
  receiptRowValue: {
    fontSize: 12,
    color: '#2C2C2A',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  amountLabel: { fontSize: 14, fontWeight: '700', color: '#2C2C2A' },
  amountValue: { fontSize: 16, fontWeight: '700', color: '#3B6D11' },

  actionBar: {
    flexDirection: 'row',
    gap: 8,
    padding: 25,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#D3D1C7',
    marginBottom: 120,
  },
  printButton: {
    flex: 2,
    backgroundColor: '#3B6D11',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  printButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  disconnectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#A32D2D',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disconnectButtonText: { color: '#A32D2D', fontWeight: '700', fontSize: 15 },
  buttonDisabled: { opacity: 0.6 },
});
