import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Requests all Bluetooth-related runtime permissions needed on Android.
 * iOS permissions are handled via Info.plist keys, so this just returns true there.
 */
export async function requestBluetoothPermissions() {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ]);

    return (
      granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (err) {
    console.log('Permission request error:', err);
    return false;
  }
}
