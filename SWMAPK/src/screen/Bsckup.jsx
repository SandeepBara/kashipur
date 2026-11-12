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

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { PNG } from 'pngjs/browser'; // pure-JS PNG decoder, no native deps
import { Buffer } from 'buffer';
import axios from 'axios';

import useBluetoothPrinter from '../utils/useBluetoothPrinter';
import { paymentReceiptUrl } from '../api/endpoints';
import { getToken, getUserDetails } from '../util/auth';

// Printer paper width in dots. 80mm printers are typically 576 dots wide.
const PRINTER_WIDTH_PX = 576;

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

  const { id: initialReceiptId } = route.params || {};

  const [receiptId, setReceiptId] = useState(initialReceiptId);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  const shotRef = useRef(null);
  const [captureProps, setCaptureProps] = useState({ logoUri: null, text: '' });

  // Track when the off-screen content is actually ready to be captured
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);

  // TEMP DEBUG: holds the last captured PNG so we can render it on-screen
  // and actually see what ViewShot produced. Remove once things work.
  const [debugPreviewUri, setDebugPreviewUri] = useState(null);

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
`;

  // ---- Pure-JS image pipeline: PNG -> resize -> dither -> ESC/POS ----

  /**
   * Nearest-neighbor resize of an RGBA buffer to targetWidth,
   * preserving aspect ratio.
   */
  const resizeRgba = (srcData, srcWidth, srcHeight, targetWidth) => {
    const scale = targetWidth / srcWidth;
    const targetHeight = Math.max(1, Math.round(srcHeight * scale));
    const out = new Uint8ClampedArray(targetWidth * targetHeight * 4);

    for (let y = 0; y < targetHeight; y++) {
      const srcY = Math.min(srcHeight - 1, Math.floor(y / scale));
      for (let x = 0; x < targetWidth; x++) {
        const srcX = Math.min(srcWidth - 1, Math.floor(x / scale));
        const srcIdx = (srcY * srcWidth + srcX) * 4;
        const dstIdx = (y * targetWidth + x) * 4;
        out[dstIdx] = srcData[srcIdx];
        out[dstIdx + 1] = srcData[srcIdx + 1];
        out[dstIdx + 2] = srcData[srcIdx + 2];
        out[dstIdx + 3] = srcData[srcIdx + 3];
      }
    }
    return { data: out, width: targetWidth, height: targetHeight };
  };

  /**
   * RGBA -> grayscale -> Floyd-Steinberg dithered 1-bit -> packed ESC/POS
   * "GS v 0" raster bitmap command bytes.
   */
  const rgbaToEscPos = (rgba, width, height) => {
    const gray = new Float32Array(width * height);
    for (let i = 0, p = 0; i < rgba.length; i += 4, p++) {
      const r = rgba[i];
      const g = rgba[i + 1];
      const b = rgba[i + 2];
      const a = rgba[i + 3];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      gray[p] = a < 255 ? lum * (a / 255) + 255 * (1 - a / 255) : lum;
    }

    const bitmap = new Uint8Array(width * height);
    const threshold = 128;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const old = gray[idx];
        const newVal = old < threshold ? 0 : 255;
        bitmap[idx] = newVal === 0 ? 1 : 0;
        const err = old - newVal;

        if (x + 1 < width) gray[idx + 1] += (err * 7) / 16;
        if (y + 1 < height) {
          if (x > 0) gray[idx + width - 1] += (err * 3) / 16;
          gray[idx + width] += (err * 5) / 16;
          if (x + 1 < width) gray[idx + width + 1] += (err * 1) / 16;
        }
      }
    }

    const widthBytes = Math.ceil(width / 8);
    const packed = new Uint8Array(widthBytes * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (bitmap[y * width + x]) {
          const byteIndex = y * widthBytes + (x >> 3);
          const bitIndex = 7 - (x & 7);
          packed[byteIndex] |= 1 << bitIndex;
        }
      }
    }

    const bytes = [];
    bytes.push(0x1b, 0x40); // ESC @  init
    bytes.push(0x1d, 0x76, 0x30, 0x00); // GS v 0
    bytes.push(widthBytes & 0xff, (widthBytes >> 8) & 0xff);
    bytes.push(height & 0xff, (height >> 8) & 0xff);
    for (let i = 0; i < packed.length; i++) bytes.push(packed[i]);
    bytes.push(0x1b, 0x64, 0x03); // feed 3 lines
    bytes.push(0x1d, 0x56, 0x00); // full cut - remove if printer has no cutter
    return bytes;
  };

  const pngBase64ToEscPos = (base64Png, targetWidth) => {
    const pngBuffer = Buffer.from(base64Png, 'base64');
    const png = PNG.sync.read(pngBuffer); // { width, height, data: Buffer(RGBA) }
    const resized = resizeRgba(png.data, png.width, png.height, targetWidth);
    return rgbaToEscPos(resized.data, resized.width, resized.height);
  };

  /**
   * Waits until both the off-screen layout has fired onLayout AND the logo
   * image (if any) has finished loading/erroring, instead of relying on a
   * blind timeout. Bails out after maxWaitMs so a slow/broken logo URL can
   * never hang printing forever.
   */
  const waitUntilCaptureReady = async hasLogo => {
    const maxWaitMs = 4000;
    const pollMs = 50;
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      if (layoutReady && (!hasLogo || logoLoaded)) return;
      await new Promise(res => setTimeout(res, pollMs));
    }
    console.log('waitUntilCaptureReady: timed out, capturing anyway');
  };

  // ---- Main print handler ----

  const fetchAndPrintReceipt = async () => {
    try {
      setLoading(true);

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

      const r = res.data.data;
      const receiptText = buildReceiptText(r);
      const hasLogo = !!r.ulbDtl.logoImg;

      // Reset readiness flags BEFORE mounting new content, then mount it
      setLogoLoaded(false);
      setLayoutReady(false);
      setCaptureProps({ logoUri: r.ulbDtl.logoImg, text: receiptText });

      // Wait for the off-screen view to actually finish laying out and
      // (if present) the logo to finish loading, instead of a fixed delay
      await waitUntilCaptureReady(hasLogo);

      const base64Png = await shotRef.current.capture();
      console.log('captured base64 length:', base64Png?.length); // sanity check - should be several KB, not near-zero
      setDebugPreviewUri(`data:image/png;base64,${base64Png}`); // TEMP DEBUG - view it below the button

      const escposBytes = pngBase64ToEscPos(base64Png, PRINTER_WIDTH_PX);
      console.log('escpos byte count:', escposBytes.length);
      await printBuffer(escposBytes, { checkConnection: true });

      console.log('Printed receipt with watermark for id:', receiptId);
    } catch (error) {
      console.log('========== PRINT ERROR ==========');
      console.log('Message:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', JSON.stringify(error.response.data, null, 2));
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const allDevices = React.useMemo(() => {
    const map = new Map();
    [...pairedDevices, ...bluetoothDevices].forEach(device => {
      map.set(device.address || device.id, device);
    });
    return [...map.values()];
  }, [pairedDevices, bluetoothDevices]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth Printer Test</Text>

      {userDetails && (
        <Text style={styles.count}>
          Logged in as: {userDetails.name ?? userDetails.id}
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Receipt ID"
        value={receiptId}
        onChangeText={setReceiptId}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => scanForDevices()}
      >
        <Text style={styles.buttonText}>
          {scanning ? 'Scanning...' : 'Scan Printers'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.count}>Paired: {pairedDevices.length}</Text>
      <Text style={styles.count}>Found: {bluetoothDevices.length}</Text>
      <Text style={styles.count}>Total: {allDevices.length}</Text>

      <ScrollView style={{ flex: 1 }}>
        {allDevices.map((item, index) => (
          <TouchableOpacity
            key={item.address || item.id || index}
            style={styles.deviceCard}
            onPress={() => connectToPrinter(item)}
          >
            <Text style={styles.deviceName}>
              {item.name || 'Unknown Printer'}
            </Text>
            <Text style={styles.deviceAddress}>{item.address || item.id}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {connectedDevice && (
        <View>
          <Text style={styles.connected}>Connected:</Text>
          <Text style={styles.deviceName}>{connectedDevice.name}</Text>

          <TouchableOpacity
            style={styles.printButton}
            onPress={fetchAndPrintReceipt}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Print Receipt</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={disconnectPrinter}
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TEMP DEBUG: shows exactly what ViewShot captured, on-screen, so you can
          visually confirm whether the capture itself is blank or populated.
          Remove this block once printing works correctly. */}
      {debugPreviewUri && (
        <View style={styles.debugBox}>
          <Text style={styles.count}>Debug: last capture</Text>
          <Image
            source={{ uri: debugPreviewUri }}
            style={styles.debugImage}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Off-screen: composes logo (faint watermark) + receipt text, not visible to the user.
          collapsable={false} on both views is required on Android - without it, RN's view
          flattening optimization can strip these views out of the native tree entirely,
          which makes ViewShot capture a blank image. Positioned near (0,0) with tiny opacity
          instead of far off-screen, since extreme offsets can also get culled/not rasterized. */}
      <View style={styles.offscreen} pointerEvents="none">
        <ViewShot
          ref={shotRef}
          collapsable={false}
          options={{ format: 'png', result: 'base64' }}
        >
          <View
            collapsable={false}
            style={[styles.receipt, { width: PRINTER_WIDTH_PX }]}
            onLayout={() => setLayoutReady(true)}
          >
            {captureProps.logoUri ? (
              <Image
                source={{ uri: captureProps.logoUri }}
                style={styles.watermark}
                resizeMode="contain"
                onLoad={() => setLogoLoaded(true)}
                onError={() => setLogoLoaded(true)} // don't hang forever if the logo URL fails
              />
            ) : null}
            <Text style={styles.receiptText}>{captureProps.text}</Text>
          </View>
        </ViewShot>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  count: { fontSize: 16, marginBottom: 5 },
  scanButton: {
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  deviceCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  deviceName: { fontSize: 16, fontWeight: 'bold' },
  deviceAddress: { color: '#666', marginTop: 5 },
  connected: {
    color: 'green',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  printButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disconnectButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },

  // Kept close to the visible surface instead of a huge negative offset -
  // extreme off-screen coordinates can get culled/not rasterized on Android,
  // producing a blank ViewShot capture.
  offscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.01,
    zIndex: -1,
  },
  receipt: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  watermark: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '80%',
    height: '60%',
    opacity: 0.15,
  },
  receiptText: {
    fontFamily: 'monospace',
    fontSize: 22,
    lineHeight: 26,
    color: '#000000',
  },

  // TEMP DEBUG styles - remove along with debugPreviewUri once fixed
  debugBox: {
    borderWidth: 1,
    borderColor: '#f00',
    marginTop: 10,
    padding: 5,
    maxHeight: 250,
  },
  debugImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
  },
});
