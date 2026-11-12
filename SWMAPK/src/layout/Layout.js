import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  Alert, 
  PanResponder, 
  Modal, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  TouchableWithoutFeedback 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

import { globalStyle } from '../styles/globalStyle';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { getToken, removeAuthToken } from '../util/auth';
import { heartBeatApi } from '../api/endpoints';
import COLORS from '../constants/colors';

export default function Layout({ children, title, isBack = false, scrollable = true }) {
  const navigation = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  
  const [menuVisible, setMenuVisible] = useState(false);

  // --- Configuration ---
  const TOTAL_TIME = 300; 
  const WARNING_THRESHOLD = 10;
  const HEARTBEAT_INTERVAL = 300000; 
  
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_TIME);
  const [showWarning, setShowWarning] = useState(false);
  
  const countdownInterval = useRef(null);

  // --- 1. Timer Management ---
  const stopTimers = useCallback(() => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
  }, []);

  const handleSessionExpiry = async (reason = "Session Expired") => {
    stopTimers();
    setShowWarning(false);
    await removeAuthToken();
    Alert.alert(reason, "Your session has ended. Please login again.", [
      { text: "OK", onPress: () => navigation.replace('Login') }
    ]);
  };

  const resetInactivityTimer = useCallback(() => {
    stopTimers();
    setShowWarning(false);
    setSecondsLeft(TOTAL_TIME);

    countdownInterval.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const nextTime = prev - 1;
        console.log("test");
        if (nextTime <= WARNING_THRESHOLD && nextTime > 0) {
          setShowWarning(true);
        }

        if (nextTime <= 0) {
          handleSessionExpiry("Inactivity Logout");
          return 0;
        }

        return nextTime;
      });
    }, 1000);
  }, [stopTimers]);

  // --- 2. Screen Focus Management ---
  useFocusEffect(
    useCallback(() => {
      resetInactivityTimer();
      return () => stopTimers();
    }, [resetInactivityTimer, stopTimers])
  );

  // --- 3. Interaction Detection ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetInactivityTimer();
        return false; 
      },
      onMoveShouldSetPanResponderCapture: () => {
        resetInactivityTimer();
        return false;
      },
    })
  ).current;

  // --- 4. Heartbeat ---
  useEffect(() => {
    const checkTokenStatus = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const response = await axios.post(heartBeatApi, {}, { headers: { Authorization: `Bearer ${token}` } });
        if (!response?.data?.status || !response?.data?.authenticated) handleSessionExpiry("Unauthorized Access");
      } catch (error) {
        if (error.response?.status === 401) handleSessionExpiry("Token Expired");
      }
    };
    const heartId = setInterval(checkTokenStatus, HEARTBEAT_INTERVAL);
    return () => clearInterval(heartId);
  }, []);

  return (
    <View 
      style={globalStyle.container} 
      {...panResponder.panHandlers}
      collapsable={false}
    >
      <Sidebar visible={menuVisible} onClose={() => setMenuVisible(false)} title={title} />
      <Header title={title} onMenuPress={() => setMenuVisible(true)} isBack={isBack} />
      
      <View style={{ flex: 1 }}>
        {scrollable ? (
          <ScrollView
            style={{ flex: 1 }}
            onScrollBeginDrag={resetInactivityTimer}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>{children}</View>
        )}
      </View>

      <Footer safeAreaBottom={safeAreaInsets.bottom} />

      {/* --- Updated Modal Logic --- */}
      <Modal transparent visible={showWarning} animationType="fade">
        {/* Wrapping the whole screen in a button to reset on click anywhere */}
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={resetInactivityTimer}
        >
          {/* TouchableWithoutFeedback prevents the reset logic from firing twice when clicking the actual alert box */}
          <TouchableWithoutFeedback>
            <View style={styles.alertBox}>
              <View style={styles.iconCircle}>
                <Text style={styles.alertEmoji}>⏳</Text>
              </View>
              <Text style={styles.alertTitle}>Are you still there?</Text>
              <Text style={styles.alertText}>You will be logged out in:</Text>
              <Text style={styles.timerText}>{secondsLeft}s</Text>
              
              <TouchableOpacity style={styles.resumeBtn} onPress={resetInactivityTimer}>
                <Text style={styles.resumeBtnText}>STAY LOGGED IN</Text>
              </TouchableOpacity>
              
              <Text style={styles.subText}>Tap anywhere to dismiss</Text>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(13,26,18,0.48)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  alertBox: { 
    width: '85%', 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    padding: 26, 
    alignItems: 'center', 
    elevation: 20 
  },
  iconCircle: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    backgroundColor: '#F0F4FF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  alertEmoji: { fontSize: 35 },
  alertTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  alertText: { fontSize: 14, color: '#666', textAlign: 'center' },
  timerText: { color: COLORS.primary || '#007AFF', fontWeight: 'bold', fontSize: 54, marginVertical: 15 },
  resumeBtn: { 
    backgroundColor: COLORS.primary || '#007AFF', 
    paddingVertical: 15, 
    borderRadius: 12, 
    width: '100%', 
    alignItems: 'center' 
  },
  resumeBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  subText: { marginTop: 15, fontSize: 12, color: '#999' }
});
