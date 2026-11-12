import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AppHeader from '../../components/AppHeader';

const AddRfidPage = ({ navigation }) => {
  const [consumerId, setConsumerId] = useState('');
  const [rfid, setRfid] = useState('');
  const handleBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };
  // Ref to jump focus to RFID box after Consumer ID is entered
  const rfidInputRef = useRef(null);

  const handleLinkTag = () => {
    if (!consumerId || !rfid) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }

    // Logic to send data to your backend
    console.log(`Linking Consumer: ${consumerId} with RFID: ${rfid}`);
    Alert.alert('Success', 'RFID Tag linked successfully!');

    // Clear fields for next scan
    setConsumerId('');
    setRfid('');
  };

  return (
    <>
      <AppHeader title="Add Consumer" onBack={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Assign RFID Tag</Text>

          <Text style={styles.label}>Consumer ID</Text>
          <TextInput
            style={styles.input}
            value={consumerId}
            onChangeText={setConsumerId}
            placeholder="e.g. 102938"
            returnKeyType="next"
            onSubmitEditing={() => rfidInputRef.current.focus()} // Jumps to RFID box
            blurOnSubmit={false}
          />

          <Text style={styles.label}>RFID Tag</Text>
          <TextInput
            ref={rfidInputRef}
            style={styles.input}
            value={rfid}
            onChangeText={setRfid}
            placeholder="Scan tag or enter ID"
            autoCapitalize="characters"
          />

          <TouchableOpacity style={styles.button} onPress={handleLinkTag}>
            <Text style={styles.buttonText}>Add Rfid</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  label: { fontSize: 14, color: '#666', marginBottom: 5, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AddRfidPage;
