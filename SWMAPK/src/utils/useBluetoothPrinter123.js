import { useState, useEffect, useRef } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import BluetoothPrinter from '@linvix-sistemas/react-native-bluetooth-printer';

/**
 * Custom hook for managing Bluetooth printer functionality
 * Provides device scanning, connection, and printing capabilities
 */
export const useBluetoothPrinter = () => {
  console.log('BluetoothPrinter Methods:', Object.keys(BluetoothPrinter));
console.log(BluetoothPrinter);
  // Bluetooth states
  const [bluetoothDevices, setBluetoothDevices] = useState([]);
  const [pairedDevices, setPairedDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [printing, setPrinting] = useState(false);

  // Ref to store callback for when scan completes
  const scanCompleteCallbackRef = useRef(null);

  
  // Set up Bluetooth event listeners once when hook is initialized
  useEffect(() => {
    // Handler for paired devices - receives an array of devices
    // const handlePairedDevice = devices => {
    //   console.log('Paired devices found:', devices);
    //   // The callback sends an array of devices, so we handle it accordingly
    //   if (Array.isArray(devices)) {
    //     setPairedDevices(prev => {
    //       const newDevices = [...prev];
    //       devices.forEach(device => {
    //         // Avoid duplicates
    //         const exists = newDevices.some(
    //           d => d.address === device.address || d.id === device.id,
    //         );
    //         if (!exists) {
    //           newDevices.push(device);
    //         }
    //       });
    //       return newDevices;
    //     });
    //   }
    // };
    const handlePairedDevice = devices => {
  console.log(
    'Paired devices found:',
    JSON.stringify(devices, null, 2),
  );

  if (Array.isArray(devices)) {
    setPairedDevices([...devices]);
  } else {
    setPairedDevices([]);
  }
};

    // Handler for newly found devices - receives a single device
    // const handleDeviceFound = device => {
    //   console.log('New device found:', device);
    //   setBluetoothDevices(prev => {
    //     // Avoid duplicates
    //     const exists = prev.some(
    //       d => d.address === device.address || d.id === device.id,
    //     );
    //     return exists ? prev : [...prev, device];
    //   });
    // };
    const handleDeviceFound = device => {
  console.log('Found device:', device);

  setBluetoothDevices(prev => {
    const exists = prev.some(d => d.address === device.address);

    if (exists) {
      return prev;
    }

    return [...prev, device];
  });
};

    // Handler for scan completion
    const handleScanDone = () => {
      console.log('Scan completed');
      setScanning(false);

      // Call the callback if one was provided
      if (scanCompleteCallbackRef.current) {
        scanCompleteCallbackRef.current();
        scanCompleteCallbackRef.current = null; // Clear after calling
      }
    };

    // Register event listeners
    BluetoothPrinter.onDeviceAlreadyPaired(handlePairedDevice);
    BluetoothPrinter.onDeviceFound(handleDeviceFound);
    BluetoothPrinter.onScanDone(handleScanDone);

    // Cleanup function
    return () => {
      console.log('Cleaning up Bluetooth event listeners');
    };
  }, []);

  // Request Bluetooth permissions for Android
  const requestBluetoothPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Scan for Bluetooth devices
  const scanForDevices = async onScanComplete => {
    const hasPermission = await requestBluetoothPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Bluetooth and Location permissions are required to scan for devices.',
      );
      return;
    }

    // Store the callback if provided
    if (onScanComplete && typeof onScanComplete === 'function') {
      scanCompleteCallbackRef.current = onScanComplete;
    }

    // Clear previous scan results
    setPairedDevices([]);
    setBluetoothDevices([]);
    setScanning(true);

    try {
      // Start scanning - event listeners are already set up in useEffect
      await BluetoothPrinter.scanDevices();
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Scan Failed', 'Failed to scan for Bluetooth devices.');
      setScanning(false);
      scanCompleteCallbackRef.current = null; // Clear callback on error
    }
  };

  // Connect to a Bluetooth printer
  // const connectToPrinter = async device => {
  //   setConnecting(true);
  //   try {
  //     await BluetoothPrinter.connect(device.address || device.id);
  //     setConnectedDevice(device);
  //     Alert.alert('Success', `Connected to ${device.name}`);
  //     return true;
  //   } catch (error) {
  //     console.error('Connection error:', error);
  //     Alert.alert('Connection Failed', `Failed to connect to ${device.name}`);
  //     return false;
  //   } finally {
  //     setConnecting(false);
  //   }
  // };

  const connectToPrinter = async device => {
  console.log("Selected Device:", device);

  setConnecting(true);

  try {
    const result = await BluetoothPrinter.connect(device.address);

    console.log("Connect Result:", result);

    setConnectedDevice(device);

    Alert.alert("Success", `Connected to ${device.name}`);
    return true;
  } catch (error) {
    console.log("Connection Error:", error);
    console.log("Connection Error JSON:", JSON.stringify(error));

    Alert.alert(
      "Connection Failed",
      JSON.stringify(error) || error?.message || "Unknown Error",
    );

    return false;
  } finally {
    setConnecting(false);
  }
};

  // Disconnect from the current printer
  const disconnectPrinter = async () => {
    try {
      await BluetoothPrinter.disconnect();
      setConnectedDevice(null);
      Alert.alert('Success', 'Disconnected from printer');
      return true;
    } catch (error) {
      console.error('Disconnect error:', error);
      Alert.alert('Disconnect Failed', 'Failed to disconnect from printer');
      return false;
    }
  };

  // Helper function to convert buffer to bytes
  const convertBufferToBytes = buffer => {
    const bytes = [];
    Array.from(buffer).map(byte => {
      bytes.push(byte);
    });
    return bytes;
  };

  // Print raw buffer data (buffer should be ESC/POS formatted)
  const printBuffer = async (buffer, options = {}) => {
    const { checkConnection = true } = options;

    if (checkConnection && !connectedDevice) {
      Alert.alert('No Printer', 'Please connect to a Bluetooth printer first.');
      return false;
    }

    setPrinting(true);
    try {
      const bytes = convertBufferToBytes(buffer);
      await BluetoothPrinter.printRaw(bytes);

      if (options.successMessage !== false) {
        Alert.alert(
          'Success',
          options.successMessage || 'Printed successfully!',
        );
      }
      return true;
    } catch (error) {
      console.error('Print error:', error);
      if (options.errorMessage !== false) {
        Alert.alert(
          'Print Failed',
          options.errorMessage || 'Failed to print. Please try again.',
        );
      }
      return false;
    } finally {
      setPrinting(false);
    }
  };

  // Check if currently connected to a printer
  const isConnected = () => {
    return connectedDevice !== null;
  };

  return {
    // States
    bluetoothDevices,
    pairedDevices,
    scanning,
    connecting,
    connectedDevice,
    printing,

    // Functions
    scanForDevices,
    connectToPrinter,
    disconnectPrinter,
    printBuffer,
    isConnected,
    convertBufferToBytes,
  };
};

// Export as default as well for convenience
export default useBluetoothPrinter;
