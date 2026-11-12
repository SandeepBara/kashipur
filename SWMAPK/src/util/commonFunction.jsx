import { Alert, Linking } from 'react-native';
import { webDemandReceiptUrl, webPaymentUrl } from '../api/endpoints';

export const handleViewReceipt = async tranId => {
  if (!tranId) return;
  const url = webPaymentUrl(tranId);

  try {
    // We skip canOpenURL because it often incorrectly returns false on Android 11+
    await Linking.openURL(url);
  } catch (err) {
    Alert.alert('Error', 'No browser found to open the receipt.');
  }
};

export const handleDemandReceipt = async consumerId => {
  if (!consumerId) return;
  const url = webDemandReceiptUrl(consumerId);

  try {
    // We skip canOpenURL because it often incorrectly returns false on Android 11+
    await Linking.openURL(url);
  } catch (err) {
    Alert.alert('Error', 'No browser found to open the receipt.');
  }
};

export const formatLocalDate = (dateStr, separator = '-') => {
  if (!dateStr) return 'N/A';

  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${separator}${month}${separator}${year}`;
};

export const formatDateYearMonth = (dateStr, separator = '-') => {
  if (!dateStr) return 'N/A';

  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}${separator}${month}`;
};
export const formatCustomMonthYear = (dateStr, separator = '-') => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${month}${separator}${year}`;
};

export const toTitleCase = str => {
  return str.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
};
