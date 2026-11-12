import AsyncStorage from '@react-native-async-storage/async-storage';

export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem('token');
  return !!token;
};

export const setAuthToken = async (token, userDetails) => {
  try {
    await AsyncStorage.setItem('token', token); // token is plain string
    await AsyncStorage.setItem('userDetails', JSON.stringify(userDetails));
  } catch (error) {
    console.error('Error saving auth data', error);
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userDetails');
  } catch (error) {
    console.error('Error removing auth data', error);
  }
};

export const getToken = async () => {
  const token = await AsyncStorage.getItem('token');
  return token;
};

export const getUserDetails = async () => {
  const details = await AsyncStorage.getItem('userDetails');
  return details ? JSON.parse(details) : null;
};

export const getLoginType = async () => {
  const details = await getUserDetails();
  return details?.loginType;
};
