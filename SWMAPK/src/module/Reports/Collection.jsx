import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { getToken } from '../../util/auth';
import { collection_report_api } from '../../api/endpoints';
import { fetchMasterData } from '../../service/masterDataService';
import { formatLocalDate, handleViewReceipt } from '../../util/commonFunction';
import Layout from '../../layout/Layout';
import COLORS from '../../constants/colors';

const PAGE_SIZE = 10;

const formatApiDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTime = value => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Collection = () => {
  const today = new Date();
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [wardList, setWardList] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: formatApiDate(today),
    uptoDate: formatApiDate(today),
    wardId: null,
  });
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({ totalCount: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const loadWards = async () => {
      try {
        const response = await fetchMasterData();
        const wards = response?.data?.data?.wardList || [];
        if (isMounted) {
          setWardList(wards.map(item => ({
            label: `Ward ${item.wardNo}`,
            value: item.id,
          })));
        }
      } catch {
        if (isMounted) Alert.alert('Could not load wards', 'Check your connection and reopen the report.');
      }
    };
    loadWards();
    return () => { isMounted = false; };
  }, []);

  const fetchCollectionReport = useCallback(async (pageNo = 1) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.post(collection_report_api, {
        page: pageNo,
        perPage: PAGE_SIZE,
        fromDate: appliedFilters.fromDate,
        uptoDate: appliedFilters.uptoDate,
        wardId: appliedFilters.wardId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (currentRequest !== requestId.current) return;
      if (!response.data?.status) {
        throw new Error(response.data?.message || 'Could not load collection records.');
      }

      const result = response.data?.data || {};
      const rows = Array.isArray(result.data) ? result.data : [];
      setReportData(previous => pageNo === 1 ? rows : [...previous, ...rows]);
      setSummary(result.summary || { totalCount: 0, totalAmount: 0 });
      setPage(pageNo);
      setLastPage(Number(result.lastPage || 1));
      setTotalItems(Number(result.total || 0));
    } catch (error) {
      if (currentRequest === requestId.current) {
        if (pageNo === 1) setReportData([]);
        setSummary({ totalCount: 0, totalAmount: 0 });
        setTotalItems(0);
        Alert.alert('Collection report failed', error.response?.data?.message || error.message || 'Check your connection and try again.');
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchCollectionReport(1);
  }, [fetchCollectionReport]);

  const handleSearch = () => {
    if (fromDate > toDate) {
      Alert.alert('Invalid date range', 'The start date must be on or before the end date.');
      return;
    }
    setAppliedFilters({
      fromDate: formatApiDate(fromDate),
      uptoDate: formatApiDate(toDate),
      wardId: selectedWard || null,
    });
    setPage(1);
  };

  const renderDateField = (label, date, onPress) => (
    <View style={styles.dateField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.dateInput} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.dateValue}>{formatLocalDate(formatApiDate(date), '/')}</Text>
        <Icon name="calendar" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const serial = (page - 1) * PAGE_SIZE + index + 1;
    const period = [item.fromDate, item.uptoDate]
      .filter(Boolean)
      .map(value => formatLocalDate(value, '/'))
      .join(' – ');

    return (
      <View style={styles.transactionCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.transactionIdentity}>
            <Text style={styles.serialLabel}>RECEIPT {serial}</Text>
            <Text style={styles.consumerNumber}>{item.consumerNo || 'Consumer —'}</Text>
          </View>
          <View style={styles.amountPill}>
            <Text style={styles.amountText}>₹ {Number(item.payableAmt || 0).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />
        <View style={styles.detailLine}>
          <Icon name="user" size={14} color="#829087" />
          <Text style={styles.detailText} numberOfLines={1}>{item.ownerName || 'Owner not available'}</Text>
        </View>
        <View style={styles.detailLine}>
          <Icon name="map-pin" size={14} color="#829087" />
          <Text style={styles.detailText} numberOfLines={2}>
            {[item.wardNo ? `Ward ${item.wardNo}` : null, item.holdingNo ? `Holding ${item.holdingNo}` : null, item.address]
              .filter(Boolean).join(' · ') || 'Address not available'}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>PAID ON</Text>
            <Text style={styles.metaValue}>{formatLocalDate(item.tranDate, '/')}</Text>
            <Text style={styles.metaHint}>{formatTime(item.createdAt)}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>PAYMENT</Text>
            <Text style={styles.metaValue}>{item.paymentMode || '—'}</Text>
            <Text style={styles.metaHint}>{item.userName || 'Field collection'}</Text>
          </View>
        </View>

        {period ? <Text style={styles.periodText}>Service period: {period}</Text> : null}

        <TouchableOpacity
          style={styles.receiptButton}
          onPress={() => handleViewReceipt(item.id)}
          activeOpacity={0.8}
        >
          <Icon name="file-text" size={15} color={COLORS.primary} />
          <Text style={styles.receiptButtonText}>View receipt</Text>
          <Icon name="arrow-up-right" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const totalAmount = Number(summary?.totalAmount || 0);
  const totalCount = Number(summary?.totalCount || 0);

  const listHeader = (
    <View style={styles.content}>
      <Text style={styles.heading}>Collection report</Text>
      <Text style={styles.subheading}>Review receipts for your selected dates and ward.</Text>

      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>Filters</Text>
        <View style={styles.dateRow}>
          {renderDateField('FROM DATE', fromDate, () => setShowFromPicker(true))}
          {renderDateField('TO DATE', toDate, () => setShowToPicker(true))}
        </View>
        <Text style={[styles.fieldLabel, styles.wardLabel]}>WARD</Text>
        <Dropdown
          style={styles.wardDropdown}
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownSelected}
          data={wardList}
          labelField="label"
          valueField="value"
          value={selectedWard}
          placeholder="All wards"
          onChange={item => setSelectedWard(item.value)}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading} activeOpacity={0.85}>
          {loading && page === 1 ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Icon name="search" size={17} color="#FFFFFF" />}
          <Text style={styles.searchButtonText}>Search records</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsHeader}>
        <View>
          <Text style={styles.resultsTitle}>Transactions</Text>
          <Text style={styles.resultsCount}>{totalItems.toLocaleString('en-IN')} records</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={() => fetchCollectionReport(1)} disabled={loading}>
          <Icon name="refresh-cw" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL COLLECTION</Text>
          <Text style={styles.summaryAmount}>₹ {totalAmount.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>PAYMENTS</Text>
          <Text style={styles.summaryCount}>{totalCount.toLocaleString('en-IN')}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Layout title="Collection Report" isBack scrollable={false}>
      <View style={styles.screen}>
        <FlatList
          data={reportData}
          keyExtractor={(item, index) => String(item.id || item.tranNo || `payment-${index}`)}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            loading ? null : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}><Icon name="inbox" size={22} color="#76917E" /></View>
                <Text style={styles.emptyTitle}>No collection records</Text>
                <Text style={styles.emptyText}>Try another date range or select a different ward.</Text>
              </View>
            )
          }
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator color={COLORS.primary} style={styles.loadMore} />
            ) : page < lastPage ? (
              <TouchableOpacity style={styles.loadMoreButton} onPress={() => fetchCollectionReport(page + 1)} disabled={loading}>
                <Text style={styles.loadMoreText}>Load more transactions</Text>
                <Icon name="chevron-down" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            ) : <View style={styles.listBottomSpace} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {showFromPicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            maximumDate={toDate}
            onChange={(event, date) => {
              setShowFromPicker(false);
              if (date) setFromDate(date);
            }}
          />
        )}
        {showToPicker && (
          <DateTimePicker
            value={toDate}
            mode="date"
            minimumDate={fromDate}
            maximumDate={new Date()}
            onChange={(event, date) => {
              setShowToPicker(false);
              if (date) setToDate(date);
            }}
          />
        )}
      </View>
    </Layout>
  );
};

export default Collection;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F7F5' },
  listContent: { paddingBottom: 10 },
  content: { paddingHorizontal: 18, paddingTop: 18 },
  heading: { color: '#1C2921', fontSize: 23, fontWeight: '800', letterSpacing: -0.4 },
  subheading: { color: '#79867E', fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 17 },
  filterCard: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 18, borderWidth: 1, borderColor: '#E7ECE8' },
  filterTitle: { color: '#28352C', fontSize: 14, fontWeight: '700', marginBottom: 13 },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateField: { flex: 1 },
  fieldLabel: { color: '#829087', fontSize: 9, fontWeight: '800', letterSpacing: 0.7, marginBottom: 7 },
  dateInput: { minHeight: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 11, borderWidth: 1, borderColor: '#DFE7E1', borderRadius: 11, backgroundColor: '#FBFCFB' },
  dateValue: { color: '#334139', fontSize: 12, fontWeight: '600' },
  wardLabel: { marginTop: 13 },
  wardDropdown: { height: 46, borderWidth: 1, borderColor: '#DFE7E1', borderRadius: 11, paddingHorizontal: 12, backgroundColor: '#FBFCFB' },
  dropdownPlaceholder: { color: '#88948C', fontSize: 13 },
  dropdownSelected: { color: '#334139', fontSize: 13, fontWeight: '600' },
  searchButton: { minHeight: 47, marginTop: 14, borderRadius: 12, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  searchButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 11 },
  resultsTitle: { color: '#243129', fontSize: 17, fontWeight: '700' },
  resultsCount: { color: '#87938B', fontSize: 11, marginTop: 3 },
  refreshButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#E8F2EC', alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 13 },
  summaryCard: { flex: 1, minHeight: 69, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#EAF3ED', borderRadius: 14 },
  summaryLabel: { color: '#64816D', fontSize: 8, fontWeight: '800', letterSpacing: 0.7 },
  summaryAmount: { color: '#176A43', fontSize: 16, fontWeight: '800', marginTop: 7 },
  summaryCount: { color: '#176A43', fontSize: 18, fontWeight: '800', marginTop: 5 },
  transactionCard: { marginHorizontal: 18, marginBottom: 11, padding: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7ECE8', borderRadius: 17 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  transactionIdentity: { flex: 1, paddingRight: 8 },
  serialLabel: { color: '#859188', fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  consumerNumber: { color: '#26332A', fontSize: 14, fontWeight: '700', marginTop: 4 },
  amountPill: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 11, backgroundColor: '#EAF3ED' },
  amountText: { color: '#176A43', fontSize: 13, fontWeight: '800' },
  cardDivider: { height: 1, backgroundColor: '#EEF2EF', marginVertical: 11 },
  detailLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { flex: 1, color: '#5C6A61', fontSize: 11, lineHeight: 16, marginLeft: 8 },
  metaRow: { flexDirection: 'row', gap: 10, paddingTop: 7 },
  metaBlock: { flex: 1 },
  metaLabel: { color: '#89958D', fontSize: 8, fontWeight: '800', letterSpacing: 0.7 },
  metaValue: { color: '#344239', fontSize: 11, fontWeight: '700', marginTop: 4 },
  metaHint: { color: '#87938B', fontSize: 10, marginTop: 3 },
  periodText: { color: '#77847B', fontSize: 10, marginTop: 10 },
  receiptButton: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 11, borderRadius: 11, backgroundColor: '#F2F7F3' },
  receiptButtonText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingHorizontal: 30, paddingVertical: 30 },
  emptyIcon: { width: 50, height: 50, borderRadius: 17, backgroundColor: '#EAF3ED', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { color: '#334139', fontSize: 14, fontWeight: '700' },
  emptyText: { color: '#87938B', fontSize: 11, textAlign: 'center', lineHeight: 17, marginTop: 5 },
  loadMore: { marginVertical: 16 },
  loadMoreButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginHorizontal: 18, marginVertical: 12, borderWidth: 1, borderColor: '#DCE9DF', borderRadius: 12, backgroundColor: '#FFFFFF' },
  loadMoreText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  listBottomSpace: { height: 16 },
});
