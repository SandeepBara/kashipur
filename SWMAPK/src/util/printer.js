// import BluetoothManager from 'react-native-bluetooth-escpos-printer';

// /**
//  * Checks and enables Bluetooth if it's off.
//  */
// export async function ensureBluetoothEnabled() {
//   const enabled = await BluetoothManager.isBluetoothEnabled();
//   if (!enabled) {
//     await BluetoothManager.enableBluetooth();
//   }
//   return true;
// }

// /**
//  * Scans for paired and nearby Bluetooth devices.
//  * Returns { paired: [], found: [] }
//  */
// export async function scanForDevices() {
//   const result = await BluetoothManager.scanDevices();
//   const parsed = typeof result === 'string' ? JSON.parse(result) : result;
//   return {
//     paired: parsed.paired || [],
//     found: parsed.found || [],
//   };
// }

// /**
//  * Connects to a specific device by its Bluetooth address.
//  */
// export async function connectToPrinter(address) {
//   return BluetoothManager.connect(address);
// }

// /**
//  * Disconnects the currently connected printer.
//  */
// export async function disconnectPrinter() {
//   return BluetoothManager.unpair ? BluetoothManager.unpair() : Promise.resolve();
// }

// /**
//  * Prints a simple line of text.
//  */
// export async function printLine(text, options = {}) {
//   return BluetoothManager.printText(`${text}\n`, options);
// }

// /**
//  * Prints a formatted receipt given a store name, list of items, and total.
//  * items: [{ name, qty, price }]
//  */
// export async function printReceipt({ storeName, items, total, footerNote }) {
//   const LINE_WIDTH = 32; // typical 58mm printer character width

//   const padRight = (str, len) => {
//     str = String(str);
//     return str.length >= len ? str.slice(0, len) : str + ' '.repeat(len - str.length);
//   };

//   const padLeft = (str, len) => {
//     str = String(str);
//     return str.length >= len ? str.slice(0, len) : ' '.repeat(len - str.length) + str;
//   };

//   // Header - centered store name, bold, double size
//   await BluetoothManager.printText(`${storeName}\n`, {
//     encoding: 'GBK',
//     codepage: 0,
//     widthtimes: 1,
//     heigthtimes: 1,
//     fonttype: 1,
//   });

//   await printLine('-'.repeat(LINE_WIDTH));

//   // Items
//   for (const item of items) {
//     const namePart = padRight(item.name, 16);
//     const qtyPart = padRight(`x${item.qty}`, 6);
//     const pricePart = padLeft(`$${item.price.toFixed(2)}`, 10);
//     await printLine(`${namePart}${qtyPart}${pricePart}`);
//   }

//   await printLine('-'.repeat(LINE_WIDTH));

//   // Total
//   const totalLabel = padRight('Total:', LINE_WIDTH - 10);
//   const totalValue = padLeft(`$${total.toFixed(2)}`, 10);
//   await printLine(`${totalLabel}${totalValue}`);

//   if (footerNote) {
//     await printLine('');
//     await printLine(footerNote);
//   }

//   // Feed paper for tear-off
//   await printLine('\n\n');
// }

// /**
//  * Prints a QR code.
//  */
// export async function printQRCode(content, size = 200) {
//   return BluetoothManager.printQRCode(content, size, 0);
// }
import { BLEPrinter } from 'react-native-earl-thermal-printer';

/**
 * Initializes the BLE printer module. Call once before scanning/connecting.
 */
export async function initPrinter() {
  return BLEPrinter.init();
}

/**
 * Scans for nearby / paired BLE printers.
 * Returns an array of { device_name, inner_mac_address }
 */
export async function scanForDevices() {
  const devices = await BLEPrinter.getDeviceList();
  return devices || [];
}

/**
 * Connects to a specific printer by its BLE MAC address.
 */
export async function connectToPrinter(innerMacAddress) {
  return BLEPrinter.connectPrinter(innerMacAddress);
}

/**
 * Closes the current BLE connection.
 */
export async function disconnectPrinter() {
  return BLEPrinter.closeConn();
}

/**
 * Prints a simple line of text. Supports inline formatting tags, e.g.
 * <C>centered</C>, <B>bold</B>, <FS:2,2>2x size</FS>
 */
export async function printLine(text, options = {}) {
  return BLEPrinter.printText(`${text}\n`, options);
}

/**
 * Prints a formatted receipt given a store name, list of items, and total.
 * items: [{ name, qty, price }]
 */
export async function printReceipt({ storeName, items, total, footerNote }) {
  const LINE_WIDTH = 32;

  const padRight = (str, len) => {
    str = String(str);
    return str.length >= len ? str.slice(0, len) : str + ' '.repeat(len - str.length);
  };

  const padLeft = (str, len) => {
    str = String(str);
    return str.length >= len ? str.slice(0, len) : ' '.repeat(len - str.length) + str;
  };

  let bill = `<C><B><FS:2,2>${storeName}</FS></B></C>\n`;
  bill += '-'.repeat(LINE_WIDTH) + '\n';

  for (const item of items) {
    const namePart = padRight(item.name, 16);
    const qtyPart = padRight(`x${item.qty}`, 6);
    const pricePart = padLeft(`$${item.price.toFixed(2)}`, 10);
    bill += `${namePart}${qtyPart}${pricePart}\n`;
  }

  bill += '-'.repeat(LINE_WIDTH) + '\n';

  const totalLabel = padRight('Total:', LINE_WIDTH - 10);
  const totalValue = padLeft(`$${total.toFixed(2)}`, 10);
  bill += `<B>${totalLabel}${totalValue}</B>\n`;

  if (footerNote) {
    bill += `\n<C>${footerNote}</C>\n`;
  }

  return BLEPrinter.printBill(bill, { tailingLine: true });
}

/**
 * Prints a QR code.
 */
export async function printQRCode(content, size = 200) {
  return BLEPrinter.printQrCode(content, size);
}