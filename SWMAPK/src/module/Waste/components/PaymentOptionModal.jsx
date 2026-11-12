import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert, ScrollView, Platform, Linking } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { pay_due_api } from '../../../api/endpoints';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Dropdown from '../../../components/Dropdown';
import DateTimePicker from "@react-native-community/datetimepicker";
import { getToken } from '../../../util/auth';
import {handleViewReceipt} from "../../../util/commonFunction"
import { globalStyle } from '../../../styles/globalStyle';

const PaymentOptionModal = ({ visible, onClose,onSuccess=()=>{}, amount, id }) => {
  const [form, setForm] = useState({ 
    paymentType: "FULL", 
    paymentMode: "CASH",
    amount: amount?.toString(),
    chequeNo: "",
    bankName: "",
    branchName: "",
    chequeDate: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (form.paymentType === "FULL") {
      setForm(prev => ({ ...prev, amount: amount?.toString() }));
    } else if (form.paymentType === "PART") {
       setForm(prev => ({ ...prev, amount: "" }));
    }
  }, [form.paymentType, amount]);

  const handelChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false); 
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; 
      handelChange('chequeDate', formattedDate);
    }
  };

  

  const handleFinalPay = async () => {
    if (form.paymentMode !== "CASH") {
      if (!form.chequeNo || !form.bankName || !form.chequeDate) {
        Alert.alert("Missing Details", "Please provide all banking/instrument details.");
        return;
      }
    }

    if (!form.amount || parseFloat(form.amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid payment amount.");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const payload = { 
        ...form, 
        id: id, 
        amount: parseFloat(form.amount) 
      };

      const response = await axios.post(pay_due_api, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.status) { 
        const transactionId = response.data?.data?.tranId;
        
        Alert.alert(
          'Payment Successful', 
          'The payment has been recorded successfully.',
          [
            { 
              text: "OK", 
              onPress: () => {
                onClose();
                onSuccess();
                if (transactionId) handleViewReceipt(transactionId);
              }
            }
          ]
        );
      } else {
        Alert.alert('Payment Failed', response.data?.message || "Server rejected the request.");
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to process payment. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={globalStyle.overlay}>
        <View style={globalStyle.modalBox}>
          <View style={[globalStyle.modelHeader,{paddingLeft:-1}]}>
            <Text style={globalStyle.modelHeaderTitle}>Collection Entry</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Text style={globalStyle.closeBtn}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Dropdown 
              label={"Payment Type"}
              value={form.paymentType}
              onValueChange={(v) => handelChange("paymentType", v)}
              options={[{ label: "Full Amount", value: "FULL" }, { label: "Partial Amount", value: "PART" }]}
            />

            <Dropdown 
              label={"Mode of Payment"}
              value={form.paymentMode}
              onValueChange={(v) => handelChange("paymentMode", v)}
              options={[
                { label: "Cash", value: "CASH" },
                { label: "Cheque", value: "CHEQUE" },
                { label: "DD", value: "DD" },
                { label: "NEFT / RTGS", value: "NEFT" }
              ]}
            />

            {form.paymentMode !== "CASH" && (
              <View style={globalStyle.bankFields}>
                <View style={globalStyle.inputGroup}>
                  <Text style={globalStyle.label}>{form.paymentMode} Number / Ref No.</Text>
                  <TextInput 
                    style={globalStyle.input} 
                    value={form.chequeNo} 
                    onChangeText={(v) => handelChange('chequeNo', v)}
                    placeholder="Enter reference number"
                    placeholderTextColor={COLORS.textGrey}
                  />
                </View>

                <View style={globalStyle.inputGroup}>
                  <Text style={globalStyle.label}>Bank Name</Text>
                  <TextInput 
                    style={globalStyle.input} 
                    value={form.bankName} 
                    onChangeText={(v) => handelChange('bankName', v)}
                    placeholder="e.g. State Bank of India"
                    placeholderTextColor={COLORS.textGrey}
                  />
                </View>

                <View style={globalStyle.inputGroup}>
                  <Text style={globalStyle.label}>Branch Name</Text>
                  <TextInput 
                    style={globalStyle.input} 
                    value={form.branchName} 
                    onChangeText={(v) => handelChange('branchName', v)}
                    placeholder="e.g. Main Branch"
                    placeholderTextColor={COLORS.textGrey}
                  />
                </View>

                <View style={globalStyle.inputGroup}>
                  <Text style={globalStyle.label}>Instrument Date</Text>
                  <TouchableOpacity 
                    style={globalStyle.datePickerTrigger} 
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={form.chequeDate ? globalStyle.dateText : globalStyle.placeholderText}>
                      {form.chequeDate || "YYYY-MM-DD"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={globalStyle.amountSection}>
              <Text style={[globalStyle.label, { color: COLORS.primary, marginTop: 0 }]}>Total Payable Amount</Text>
              <View style={globalStyle.amountRow}>
                <Text style={globalStyle.rupee}>₹</Text>
                {form.paymentType === "PART" ? (
                  <TextInput 
                    style={globalStyle.amountInput}
                    value={form.amount}
                    onChangeText={(v) => handelChange('amount', v)}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                ) : (
                  <Text style={globalStyle.amountValue}>{amount}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity 
              style={[globalStyle.payBtn, loading && { opacity: 0.7 }]} 
              onPress={handleFinalPay}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={globalStyle.payBtnText}>Submit Payment</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}
    </Modal>
  );
};

export default PaymentOptionModal;