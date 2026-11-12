import React, { useState } from 'react';
import { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import COLORS from '../../constants/colors';
import { getToken } from '../../util/auth';
import { feedback_api, feedbackMasterListApi } from '../../api/endpoints';

const FEEDBACK_REASONS = [
  'Billing Issue',
  'Payment Not Reflecting',
  'Wrong Consumer Details',
  'Service Delay',
  'App/Technical Issue',
  'Other',
];

const FeedbackModal = ({ visible, onClose, consumerId, onSuccess }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (visible) {
      getFeedbackList();
    }
  }, [visible]);

  const getFeedbackList = async () => {
    try {
      const token = await getToken();

      const response = await axios.post(
        feedbackMasterListApi,
        {
          all: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('Feedback List Response:', response.data);

      if (response.data.status) {
        setFeedbackList(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const resetAndClose = () => {
    setSelectedFeedback(null);
    setDescription('');
    setDropdownOpen(false);
    setSubmitting(false);
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!selectedFeedback) {
      Alert.alert('Select Reason', 'Please select a reason for your feedback.');
      return;
    }
    if (selectedFeedback.id === 1 && !description.trim()) {
      Alert.alert('Remarks Required', 'Please enter remarks.');
      return;
    }

    try {
      setSubmitting(true);
      const token = await getToken();

      const payload = {
        consumerId,
        feedbackId: selectedFeedback?.id,
        remarks: selectedFeedback?.id === 1 ? description.trim() : '',
      };

      const response = await axios.post(feedback_api, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Feedback Submit Response:', response.data);
      Alert.alert('Success', 'Your feedback has been submitted.');
      onSuccess?.();
      resetAndClose();
    } catch (error) {
      console.error('Feedback submit error:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={resetAndClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Feedback</Text>

          {/* Reason Dropdown */}
          <Text style={styles.label}>Reason</Text>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setDropdownOpen(prev => !prev)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.dropdownHeaderText, !reason && { color: '#999' }]}
            >
              {selectedFeedback?.feedback || 'Select Feedback'}
            </Text>
            <Text style={styles.dropdownArrow}>{dropdownOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdownList}>
              {feedbackList.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dropdownItem,
                    selectedFeedback?.id === item.id &&
                      styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedFeedback(item);
                    setDescription('');
                    setDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedFeedback?.id === item.id &&
                        styles.dropdownItemTextSelected,
                    ]}
                  >
                    {item.feedback}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Description */}
          {selectedFeedback?.id === 1 && (
            <>
              <Text style={[styles.label, { marginTop: 14 }]}>Remarks</Text>

              <TextInput
                style={styles.textArea}
                placeholder="Enter remarks..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </>
          )}

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={resetAndClose}
              disabled={submitting}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FeedbackModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2A',
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5F5E5A',
    marginBottom: 6,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D3D1C7',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dropdownHeaderText: {
    fontSize: 14,
    color: '#2C2C2A',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#888780',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#D3D1C7',
    borderRadius: 8,
    marginTop: 6,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EDEBE3',
  },
  dropdownItemSelected: {
    backgroundColor: COLORS?.primary ? `${COLORS.primary}1A` : '#EAF3DE',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#2C2C2A',
  },
  dropdownItemTextSelected: {
    fontWeight: '700',
    color: COLORS?.primary || '#3B6D11',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D3D1C7',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2C2C2A',
    minHeight: 100,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D3D1C7',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#5F5E5A',
    fontWeight: '600',
    fontSize: 14,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: COLORS?.primary || '#3B6D11',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
