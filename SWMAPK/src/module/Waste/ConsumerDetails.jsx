import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import COLORS from '../../constants/colors';
import axios from 'axios';
import { getToken } from '../../util/auth';
import { details_consumer_api } from '../../api/endpoints';
import DataTableFullData from '../../components/DataTableFullData';
import Layout from '../../layout/Layout'; // Imported your custom layout
import { formatLocalDate, handleViewReceipt } from '../../util/commonFunction';
import { useNavigation } from '@react-navigation/native';
import DetailCard from '../../components/DetailCard';
import ViewDemandModal from './components/ViewDemandModal';
import ProceedPaymentModal from './components/ProceedPaymentModal';
import { globalStyle } from '../../styles/globalStyle';
import FeedbackModal from '../models/FeedbackModal';

const ConsumerDetails = ({ route }) => {
  const navigation = useNavigation();
  const { id, data: initialData } = route.params || {};

  // State Management
  const [loading, setLoading] = useState(false);
  const [consumerData, setConsumerData] = useState(initialData || null);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

  // Modal visibility
  const [viewDemandModalVisible, setViewDemandModalVisible] = useState(false);
  const [proceedPaymentModalVisible, setProceedPaymentModalVisible] =
    useState(false);

  useEffect(() => {
    if (id) fetchConsumerDetails();
  }, [id]);

  const fetchConsumerDetails = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.post(
        details_consumer_api,
        { id },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data?.status) {console.log("data",response?.rfId)
        setConsumerData(response.data.data);
      }
    } catch (error) {
      console.error('Fetch consumer details error:', error);
      Alert.alert('Error', 'Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  const infoFields = [
    { label: 'Consumer No', value: consumerData?.consumerNo },
    { label: 'RFID No', value: consumerData?.rfId },
    { label: 'Ward No', value: consumerData?.wardNo },
    { label: 'Holding No', value: consumerData?.holdingNo },
    { label: 'Address', value: consumerData?.address },
    { label: 'Category', value: consumerData?.categoryType },
    { label: 'Range Type', value: consumerData?.subCategoryType },
    {
      label: 'Effective Date',
      value: formatLocalDate(consumerData?.dateOfEffective),
    },
    {
      label: 'Own Composting',
      value: consumerData?.hasCompostingMachineProvision ? 'Yes' : 'No',
    },
  ];

  if (loading) {
    return (
      <Layout title="Details" isBack={true} scrollable={false}>
        <View style={globalStyle.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={globalStyle.loadingText}>Fetching Details...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout title="Consumer Details" isBack={true}>
      <View style={globalStyle.mainContent}>
        {/* Basic Details Card */}
        <DetailCard title={'Basic Info'} infoFields={infoFields} />

        {/* Owner Details Table */}
        <DataTableFullData
          title="Owner Details"
          isPaginate={false}
          headers={[
            { label: 'SL', width: 40, key: 'serial' },
            { label: 'Owner Name', width: 140, key: 'ownerName' },
            { label: 'Guardian Name', width: 100, key: 'guardianName' },
            { label: 'Mobile', width: 90, key: 'mobileNo' },
            { label: 'Email', width: 70, key: 'email' },
            { label: 'Dob', width: 70, key: 'dob' },
          ]}
          data={consumerData?.owners || []}
          renderRow={(trans, idx) => (
            <View key={idx} style={globalStyle.row}>
              <Text style={[globalStyle.cell, { width: 40 }]}>{idx + 1}</Text>
              <Text selectable={true} style={[globalStyle.cell, { width: 140 }]}>
                {trans?.ownerName}
              </Text>
              <Text selectable={true} style={[globalStyle.cell, { width: 100 }]}>
                {trans?.guardianName}
              </Text>
              <Text selectable={true} style={[globalStyle.cell, { width: 90 }]}>
                {trans?.mobileNo}
              </Text>
              <Text selectable={true} style={[globalStyle.cell, { width: 70 }]}>
                {trans?.email}
              </Text>
              <Text style={[globalStyle.cell, { width: 70 }]}>
                {formatLocalDate(trans?.dob)}
              </Text>
            </View>
          )}
        />

        {/* Payment Details Table */}
        <DataTableFullData
          title="Payment History"
          headers={[
            { label: 'SL', width: 40, key: 'serial' },
            { label: 'Transaction No', width: 140, key: 'tranNo' },
            { label: 'Date', width: 100, key: 'tranDate' },
            { label: 'Total Paid', width: 90, key: 'payableAmt' },
            { label: 'Action', width: 70 },
          ]}
          data={consumerData?.tranDtls || []}
          startingItemsPerPage={5}
          renderRow={(trans, idx) => (
            <View key={idx} style={globalStyle.row}>
              <Text style={[globalStyle.cell, { width: 40 }]}>{idx + 1}</Text>
              <Text selectable={true} style={[globalStyle.cell, { width: 140 }]}>
                {trans?.tranNo || 'NA'}
              </Text>
              <Text style={[globalStyle.cell, { width: 100 }]}>
                {formatLocalDate(trans?.tranDate)}
              </Text>
              <Text
                style={[
                  globalStyle.cell,
                  { width: 90, fontWeight: '700', color: COLORS.success },
                ]}
              >
                {trans?.payableAmt || '0'}
              </Text>
              <View
                style={[globalStyle.cell, { width: 70, alignItems: 'center' }]}
              >
                <TouchableOpacity
                  onPress={() => handleViewReceipt(trans.id)}
                  style={globalStyle.actionBtn}
                >
                  <Text style={globalStyle.actionBtnText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('PrinterTest', { id: trans.id })
                  }
                  style={globalStyle.actionBtn}
                >
                  <Text style={globalStyle.actionBtnText}>Print</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* Action Buttons */}
        <View style={globalStyle.actionContainer}>
          <TouchableOpacity
            style={globalStyle.primaryBtn}
            onPress={() => setViewDemandModalVisible(true)}
          >
            <Text style={globalStyle.btnText}>View Demand</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyle.successBtn}
            onPress={() => setProceedPaymentModalVisible(true)}
          >
            <Text style={globalStyle.btnText}>Proceed Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyle.primaryBtn}
            onPress={() => setFeedbackModalVisible(true)}
          >
            <Text style={globalStyle.btnText}>Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        consumerId={id}
        onSuccess={fetchConsumerDetails}
      />
      {/* Modals */}
      <ViewDemandModal
        visible={viewDemandModalVisible}
        onClose={() => setViewDemandModalVisible(false)}
        consumerId={id}
      />
      <ProceedPaymentModal
        visible={proceedPaymentModalVisible}
        onClose={() => setProceedPaymentModalVisible(false)}
        consumerId={id}
        navigation={navigation}
        onSuccess={fetchConsumerDetails}
      />
    </Layout>
  );
};
export default ConsumerDetails;
