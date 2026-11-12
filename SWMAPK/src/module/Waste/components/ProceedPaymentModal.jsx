import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { consumer_due_api } from '../../../api/endpoints';
import { getToken } from '../../../util/auth';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { globalStyle } from '../../../styles/globalStyle';
import COLORS from '../../../constants/colors';
import DataTableFullData from '../../../components/DataTableFullData';
import PaymentOptionModal from "./PaymentOptionModal";
import { formatLocalDate } from '../../../util/commonFunction';

function ProceedPaymentModal({ visible, onClose, onSuccess = () => { }, consumerId }) {
  const [demandData, setDemandData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState('');
  const [showPaymentOption, setShowPaymentOption] = useState(false);

  // Fetch data when modal becomes visible
  useEffect(() => {
    if (visible && consumerId) {
      fetchConsumerDue();
    }
  }, [visible, consumerId]);

  const fetchConsumerDue = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.post(
        consumer_due_api,
        { id: consumerId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response?.data?.status) {
        setDemandData(response?.data?.data?.demandList || []);
        setData(response?.data?.data || {});
      }
    } catch (error) {
      console.error('Error fetching consumer due:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = () => {
    setShowPaymentOption(true);
  };

  const headers = useMemo(() => [
    { label: "SL", width: 45 },
    { label: "Demand From", width: 110 },
    { label: "Demand Upto", width: 110 },
    { label: "Amount", width: 90 },
    { label: "Balance", width: 90 },
  ], []);

  const renderRow = useCallback((item, index) => {
    let rowBgColor = 'transparent';
    let textColor = '#000';

    if (item?.isFullPaid) {
      rowBgColor = '#dcfce7'; 
      textColor = '#166534';
    } else if (item?.paidStatus) {
      rowBgColor = '#fef9c3'; 
      textColor = '#854d0e';
    }

    return (
      <View key={item.id || index} style={[globalStyle.row, { backgroundColor: rowBgColor }]}>
        <Text style={[globalStyle.cell, { width: 45, color: textColor }]}>{index + 1}</Text>
        <Text style={[globalStyle.cell, { width: 110, color: textColor }]}>{formatLocalDate(item?.demandFrom)}</Text>
        <Text style={[globalStyle.cell, { width: 110, color: textColor }]}>{formatLocalDate(item?.demandUpto)}</Text>
        <Text style={[globalStyle.cell, { width: 90, color: textColor }]}>{item?.amount || 0}</Text>
        <Text style={[globalStyle.cell, { width: 90, fontWeight: '700', color: textColor }]}>{item?.balance || 0}</Text>
      </View>
    );
  }, []);

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={globalStyle.overlay}>
          <View style={[globalStyle.modalContainer, { height: '85%' }]}>
            {/* Header */}
            <View style={globalStyle.modelHeader}>
              <Text style={globalStyle.modelHeaderTitle}>Proceed Payment</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={globalStyle.closeBtn}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={globalStyle.content}>
              {loading ? (
                <View style={globalStyle.loaderContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={globalStyle.loaderText}>Fetching details...</Text>
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  
                  {/* 70% Upper Section: Data Table */}
                  <View style={{ flex: 0.6, marginBottom: 10 }}>
                    <DataTableFullData
                      data={demandData}
                      headers={headers}
                      renderRow={renderRow}
                      startingItemsPerPage={5}
                    />
                  </View>

                  {/* 30% Lower Section: Summary & Payment */}
                  <View style={{ flex: 0.4, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 }}>
                    <View style={globalStyle.demandSummaryRow}>
                      <SummaryItem label="Demand" value={data.demandAmount} />
                      <SummaryItem label="Penalty" value={data.penalty} color={globalStyle.textRed} />
                      <SummaryItem label="Other" value={data.otherPenalty} color={globalStyle.textOrange} />
                      <SummaryItem label="Advance" value={data.advanceAmount} color={globalStyle.textGreen} />
                    </View>

                    <View style={globalStyle.totalPayableBox}>
                      <Text style={globalStyle.totalPayableLabel}>Total Payable:</Text>
                      <Text style={globalStyle.totalPayableValue}>{data.payableAmount}</Text>
                      <TouchableOpacity style={globalStyle.payNowBtn} onPress={handlePayNow}>
                        <Text style={globalStyle.payNowBtnText}>Pay Now</Text>
                      </TouchableOpacity>
                      
                    </View>
                  </View>

                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
      <PaymentOptionModal
        visible={showPaymentOption}
        amount={data?.payableAmount}
        onClose={() => {
          setShowPaymentOption(false);
          onClose(); // close the ProceedPaymentModal
        }}
        onSuccess={onSuccess}
        id={consumerId}
      />
    </>
  );
}

// Helper component for summary items to keep code clean
const SummaryItem = ({ label, value, color = {} }) => (
  <View style={globalStyle.summaryItem}>
    <Text style={[globalStyle.summaryLabel, color]}>{label}:</Text>
    <Text style={[globalStyle.summaryValue, color]}>{value || 0}</Text>
  </View>
);

export default ProceedPaymentModal;
