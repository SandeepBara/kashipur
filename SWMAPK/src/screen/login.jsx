/**
 * Login Screen Component
 * @format
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { LOGIN_API } from '../api/endpoints';
import axios from 'axios';
import { setAuthToken } from '../util/auth';
import { BlurView } from '@react-native-community/blur';
function LoginScreen({ navigation }) {
  const safeAreaInsets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log('LOGIN_API ---->', LOGIN_API);

    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(LOGIN_API, {
        email: email,
        password: password,
      });

      console.log(`Login Response:${LOGIN_API}`, response.data);

      // Check backend status
      if (response.data.status === true) {
        // Save token and user details
        await setAuthToken(
          response.data.data.token,
          response.data.data.userDetails,
        );

        Alert.alert('Success', 'Login successful!');
        navigation.replace('Dashboard');
      } else {
        Alert.alert(
          'Login Failed',
          response.data.message || 'Invalid credentials',
        );
      }
    } catch (error) {
      console.log('Login Error:', error.response?.data || error.message);

      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Something went wrong',
      );
    }finally{
      setLoading(false);
    }
  };

  const backgroundColor = '#ffffff';
  const textColor = COLORS.textDark;
  const placeholderColor = COLORS.textGrey;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor }]}
    >
      <View style={[styles.content, { paddingTop: safeAreaInsets.top + 20 }]}>
        {/* Image at Top */}

        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>
            Waste Management
          </Text>
          {/* <Text style={[styles.subtitle, { color: placeholderColor }]}>
            Sign in to continue
          </Text> */}
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/waste2.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Spacer to push login form to bottom */}
        <View style={styles.spacer} />

        {/* Header */}

        {/* Login Form */}
        <View style={[styles.card]}>
          <Text style={[styles.label, { color: textColor }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: '#f9f9f9',
                color: textColor,
                borderColor: '#dddddd',
              },
            ]}
            placeholder="Enter your email"
            placeholderTextColor={placeholderColor}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: textColor, marginTop: 20 }]}>
            Password
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: '#f9f9f9',
                color: textColor,
                borderColor: '#dddddd',
              },
            ]}
            placeholder="Enter your password"
            placeholderTextColor={placeholderColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text
              style={[styles.forgotPasswordText, { color: COLORS.success }]}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: placeholderColor }]}>
            Don't have an account?{' '}
            <Text style={{ color: COLORS.success, fontWeight: '600' }}>
              Sign Up
            </Text>
          </Text>
        </View>
      </View>
      {loading && (
        <BlurView
          style={styles.blurOverlay}
          blurType="light"
          blurAmount={12}
          reducedTransparencyFallbackColor="white"
        >
          <View style={styles.loaderBox}>
            <Text style={styles.loaderText}>Processing...</Text>
          </View>
        </BlurView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  /* ================= IMAGE SECTION ================= */
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logoImage: {
    width: 300,
    height: 200,
  },

  spacer: {
    flex: 0.5, // brings card slightly upward for better design
  },

  /* ================= HEADER TEXT ================= */
  header: {
    marginBottom: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 30,
    fontFamily: 'sans-serif',
    fontWeight: '700',
    color: COLORS.success,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
  },

  /* ================= LOGIN CARD ================= */
  card: {
    backgroundColor: '#ffffff',
    borderBottomRightRadius: 20,
    borderTopStartRadius: 20,
    borderColor: COLORS.success,
    borderWidth: 1,
    padding: 24,
    marginTop: 10,
    marginBottom: 20,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },

  /* ================= INPUT FIELDS ================= */
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },

  /* ================= LOGIN BUTTON ================= */
  loginButton: {
    backgroundColor: COLORS.success,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,

    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  loginButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },

  /* ================= FORGOT PASSWORD ================= */
  forgotPassword: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },

  /* ================= FOOTER ================= */
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  loaderBox: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 12,
    elevation: 5,
  },

  loaderText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});

export default LoginScreen;
