import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { LOGIN_API } from '../../api/endpoints';
import { setAuthToken } from '../../util/auth';
import COLORS from '../../constants/colors';

function Login({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState('email');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (selected === 'email' && (!email.trim() || !password)) {
      Alert.alert('Missing details', 'Enter your email and password to continue.');
      return;
    }
    if (selected === 'userName' && (!userName.trim() || !password)) {
      Alert.alert('Missing details', 'Enter your username and password to continue.');
      return;
    }

    setLoading(true);
    try {
      const loginPayload = selected === 'email'
        ? { email: email.trim(), password, type: 'mobile' }
        : { userName: userName.trim(), password, type: 'mobile' };
      const response = await axios.post(LOGIN_API, loginPayload);

      if (response.data?.status === true) {
        await setAuthToken(
          response.data.data.token,
          response.data.data.userDetails,
        );
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Sign in failed', response.data?.message || 'Check your details and try again.');
      }
    } catch (error) {
      Alert.alert(
        'Sign in failed',
        error.response?.data?.message || 'We could not reach the server. Check your connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 18, paddingBottom: Math.max(insets.bottom, 18) + 18 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>SW</Text></View>
          <View>
            <Text style={styles.brandName}>Civic Services</Text>
            <Text style={styles.brandCaption}>FIELD OPERATIONS</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>WELCOME BACK</Text>
            <Text style={styles.title}>Waste{ '\n' }Management</Text>
            <Text style={styles.subtitle}>Sign in to manage your daily collections.</Text>
          </View>
          <Image
            source={require('../../assets/images/waste2.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign in to your account</Text>
          <Text style={styles.formHint}>Use your registered staff credentials.</Text>

          <View style={styles.toggle}>
            {[
              { key: 'email', label: 'Email' },
              { key: 'userName', label: 'Username' },
            ].map(option => (
              <TouchableOpacity
                key={option.key}
                style={[styles.toggleOption, selected === option.key && styles.toggleOptionActive]}
                onPress={() => setSelected(option.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: selected === option.key }}
              >
                <Text style={[styles.toggleLabel, selected === option.key && styles.toggleLabelActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{selected === 'email' ? 'Email address' : 'Username'}</Text>
          <TextInput
            style={styles.input}
            placeholder={selected === 'email' ? 'name@municipality.gov.in' : 'Enter your username'}
            placeholderTextColor={COLORS.textGrey}
            value={selected === 'email' ? email : userName}
            onChangeText={selected === 'email' ? setEmail : setUserName}
            keyboardType={selected === 'email' ? 'email-address' : 'default'}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={[styles.label, styles.passwordLabel]}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.textGrey}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.loginButtonText}>Sign in</Text>}
          </TouchableOpacity>
          <Text style={styles.secureNote}>Authorized municipal staff only</Text>
        </View>
      </ScrollView>

      {loading && (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <View style={styles.loadingPill}>
            <ActivityIndicator color={COLORS.primary} size="small" />
            <Text style={styles.loadingText}>Connecting securely…</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F7F5' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 22 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 26 },
  brandMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: COLORS.white, fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
  brandName: { color: '#18241D', fontSize: 15, fontWeight: '700' },
  brandCaption: { color: '#74837A', fontSize: 9, fontWeight: '700', letterSpacing: 1.3, marginTop: 2 },
  hero: { minHeight: 190, borderRadius: 26, backgroundColor: '#E4F2EA', padding: 21, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  heroCopy: { flex: 1, zIndex: 1 },
  eyebrow: { color: COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 8 },
  title: { color: '#17241C', fontSize: 29, lineHeight: 34, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: '#5D6D63', fontSize: 13, lineHeight: 19, marginTop: 9, maxWidth: 210 },
  heroImage: { width: 118, height: 128, marginRight: -18, marginLeft: -8 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, borderWidth: 1, borderColor: '#E7ECE8', shadowColor: '#173B27', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 18, elevation: 3 },
  formTitle: { color: '#1D2922', fontSize: 20, fontWeight: '700' },
  formHint: { color: '#7C8981', fontSize: 13, marginTop: 5, marginBottom: 20 },
  toggle: { flexDirection: 'row', backgroundColor: '#F2F5F3', padding: 4, borderRadius: 13, marginBottom: 20 },
  toggleOption: { flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggleOptionActive: { backgroundColor: '#FFFFFF', shadowColor: '#102417', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5, elevation: 1 },
  toggleLabel: { color: '#77847C', fontSize: 13, fontWeight: '600' },
  toggleLabelActive: { color: COLORS.primary, fontWeight: '700' },
  label: { color: '#38463D', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  passwordLabel: { marginTop: 17 },
  input: { height: 52, borderWidth: 1, borderColor: '#DFE7E1', borderRadius: 13, paddingHorizontal: 15, backgroundColor: '#FBFCFB', color: '#1D2922', fontSize: 14 },
  loginButton: { minHeight: 54, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: 24, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 3 },
  loginButtonDisabled: { opacity: 0.78 },
  loginButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  secureNote: { color: '#87938B', fontSize: 11, textAlign: 'center', marginTop: 16 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(244,247,245,0.38)' },
  loadingPill: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 30, paddingHorizontal: 18, paddingVertical: 13, elevation: 4 },
  loadingText: { color: '#334239', fontSize: 13, fontWeight: '600' },
});

export default Login;
