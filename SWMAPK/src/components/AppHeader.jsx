// AppHeader.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { COLORS } from '../constants/theme'; // <-- change path if needed
import COLORS from '../constants/colors';

export default function AppHeader({ title, onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <Text style={styles.headerTitle}>{title}</Text>

      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = {
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 13,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E7ECE8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#1D2922',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
};
