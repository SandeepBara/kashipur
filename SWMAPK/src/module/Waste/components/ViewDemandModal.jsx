import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Text,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { demand_history_api} from '../../../api/endpoints';
import { COLORS } from '../../../constants/colors';
import { getToken } from '../../../util/auth';
import { globalStyle } from '../../../styles/globalStyle';
import { formatLocalDate, handleDemandReceipt } from '../../../util/commonFunction';
import DataTable from "../../../components/DataTable";

const ViewDemandModal = ({ visible, onClose, consumerId }) => {
  const [demandData, setDemandData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalPage, setTotalPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItem, setTotalItem] = useState(0);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    if (!visible || !consumerId) return;

    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.post(
        demand_history_api,
        { id: consumerId, page: page, perPage: itemsPerPage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.status) {
        const list = response.data?.data;
        setDemandData(list?.data || []);
        setSummary(list?.summary || {});
        setTotalPage(list?.lastPage || 1);
        setTotalItem(list?.total || 0);
      }
    } catch (error) {
      console.error('❌ Demand Fetch Error:', error.message);
    } finally {
      setLoading(false);
    }
  }, [visible, consumerId, page, itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!visible) {
      setPage(1);
      setDemandData([]);
    }
  }, [visible]);

  const headers = useMemo(() => [
    { label: "SL", width: 45 },
    { label: "Demand From", width: 110 },
    { label: "Demand Upto", width: 110 },
    { label: "Amount", width: 90 },
    { label: "Balance", width: 90 },
  ], []);

  // Corrected Conditional Styling Logic
  const renderRow = useCallback((item, index, currentPage, perPage) => {
    let rowBgColor = 'transparent';
    let textColor = '#000';

    if (item?.isFullPaid) {
      rowBgColor = '#16a34a'; // Green 600
      textColor = '#fff';
    } else if (item?.paidStatus) {
      rowBgColor = '#facc15'; // Yellow 400
      textColor = '#fff';
    }

    return (
      <View key={item.id || index} style={[globalStyle.row, { backgroundColor: rowBgColor }]}>
        <Text style={[globalStyle.cell, { width: 45, color: textColor }]}>
          {(currentPage - 1) * perPage + index + 1}
        </Text>
        <Text style={[globalStyle.cell, { width: 110, color: textColor }]}>
          {formatLocalDate(item?.demandFrom)}
        </Text>
        <Text style={[globalStyle.cell, { width: 110, color: textColor }]}>
          {formatLocalDate(item?.demandUpto)}
        </Text>
        <Text style={[globalStyle.cell, { width: 90, color: textColor }]}>
          {item?.amount || 0}
        </Text>
        <Text style={[globalStyle.cell, { width: 90, fontWeight: '700', color: textColor }]}>
          {item?.balance || 0}
        </Text>
      </View>
    );
  }, []);

  const renderFooter = useCallback(() => (
    <View style={[globalStyle.row, { backgroundColor: '#f3f4f6' }]}>
      <Text style={[globalStyle.cell, { width: 355, textAlign: 'right', fontWeight: 'bold' }]}>
        Total Due:
      </Text>
      <Text style={[globalStyle.cell, { width: 90, fontWeight: 'bold', color: COLORS.primary }]}>
        {summary?.totalDue || 0}
      </Text>
    </View>
  ), [summary]);

  const printButton = (
    <TouchableOpacity 
      onPress={() => handleDemandReceipt(consumerId)} 
      style={{ backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 }}
    >
      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Print Receipt</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={globalStyle.overlay}>
        <View style={globalStyle.modalContainer}>
          <View style={globalStyle.modelHeader}>
            <Text style={globalStyle.modelHeaderTitle}>Demand History</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={globalStyle.closeBtn}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={globalStyle.content}>
            {loading && page === 1 ? (
              <View style={globalStyle.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={globalStyle.loaderText}>Fetching details...</Text>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <DataTable
                  title="Consumer Demand List"
                  data={demandData}
                  headers={headers}
                  renderRow={renderRow}
                  footerRow={renderFooter()}
                  itemsPerPage={itemsPerPage}
                  totalPages={totalPage}
                  currentPage={page}
                  totalItem={totalItem}
                  setPageNo={setPage}
                  setItemsPerPage={setItemsPerPage}
                  onSearch={fetchData}
                  links={summary?.totalDue>0 ? printButton:""}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ViewDemandModal;