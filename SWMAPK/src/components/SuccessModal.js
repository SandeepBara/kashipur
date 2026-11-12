import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

const SuccessModal = ({
  isOpen,
  onClose,
  title = "Success",
  message = "Operation completed successfully.",
  buttonText = "OK",
  onConfirm,
  showSecondaryButton = false,
  secondaryButtonText = "Upload Documents",
  onSecondaryAction,
}) => {
  return (
    <Modal
      transparent={true}
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <Text style={styles.title}>{title}</Text>
          
          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Footer / Buttons */}
          <View style={styles.footer}>
            {showSecondaryButton && (
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={() => {
                  if (onSecondaryAction) onSecondaryAction();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={() => {
                onClose();
                if (onConfirm) onConfirm();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>{buttonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // backdrop="opaque"
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  body: {
    marginBottom: 20,
  },
  message: {
    fontSize: 14,
    color: '#374151', // text-gray-700
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#006FEE', // NextUI Primary Blue
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#F5A524', // NextUI Warning Orange
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default SuccessModal;