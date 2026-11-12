import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

import AppHeader from '../../components/AppHeader';
import {
  responsiveHeight as rh,
  responsiveWidth as rw,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
import { getToken } from '../../util/auth';
import { collection_report_api } from '../../api/endpoints';
import { fetchMasterData } from '../../service/masterDataService';
import Layout from '../../layout/Layout';

const Collection = () => {
  // --- State Management ---
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [wardList, setWardList] = useState([]); // Fixed: Added missing state
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedCollector, setSelectedCollector] = useState(null);

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // --- Master Data ---
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const res = await fetchMasterData();
        const wardDropdownData = res.data.wardList.map(item => ({
          label: `Ward ${item.wardNo}`,
          value: item.id,
        }));

        setWardList(wardDropdownData);
      } catch (error) {
        console.log('Error loading master data:', error);
      }
    };
    loadMasterData();
  }, []);

  const collectorOptions = [
    { label: 'Mithlesh Patel', value: '62' },
    { label: 'Jubali Kumari', value: '63' },
  ];

  // --- API Call ---
  const fetchCollectionReport = async (pageNo = 1) => {
    console.log('Fetching collection report for page:', pageNo);
    if (loading) return;

    try {
      setLoading(true);
      const token = await getToken();

      const payload = {
        page: pageNo,
        perPage: 15,
        fromDate: fromDate.toISOString().split('T')[0],
        uptoDate: toDate.toISOString().split('T')[0],
        wardId: selectedWard ? Number(selectedWard) : null,
        userId: selectedCollector || null,
      };

      const response = await axios.post(collection_report_api, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Collection Report Response:', response);
      const result = response.data?.data;
      if (result) {
        setReportData(prev =>
          pageNo === 1 ? result.data : [...prev, ...result.data],
        );
        setLastPage(result.last_page || 1);
        setPage(pageNo);
      }
    } catch (error) {
      console.log('Collection Report Error:', error);
      console.log('Response:', error?.response?.data);
      console.log('Status:', error?.response?.status);

      Alert.alert('Error', error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionReport(1);
  }, []);

  const handleSearch = () => {
    fetchCollectionReport(1);
  };

  // --- Table Components ---
  const TableHeader = () => (
    <View style={styles.tableHeader}>
      {[
        'Ward',
        'Consumer No',
        'Owner',
        'Mobile',
        'Date',
        'Mode',
        'Amount',
        'Action',
      ].map(h => (
        <Text key={h} style={styles.headerCell}>
          {h}
        </Text>
      ))}
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.cell}>{item.wardNo || 'N/A'}</Text>
      <Text style={styles.cell}>{item.safNo || item.consumerNo || 'N/A'}</Text>
      <Text style={styles.cell}>{item.ownerName}</Text>
      <Text style={styles.cell}>{item.mobileNo}</Text>
      <Text style={styles.cell}>{item.tranDate}</Text>
      <Text style={styles.cell}>{item.paymentMode}</Text>
      <Text style={styles.cell}>₹{item.payableAmt}</Text>
      <TouchableOpacity style={styles.actionCell}>
        <Icon name="eye" size={18} color="#2563eb" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Layout title="Collection Report" isBack={true} scrollable={false}>
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={styles.container}>
        {/* We use a simple View here so FlatList can handle the vertical scroll */}
        <FlatList
          data={reportData}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={
            <>
              <Text style={styles.title}>Filter Records</Text>
              <View style={styles.searchCard}>
                <View style={styles.row}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>From Date</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setShowFromPicker(true)}
                    >
                      <Text style={styles.inputText}>
                        {fromDate.toLocaleDateString()}
                      </Text>
                      <Icon name="calendar" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>To Date</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setShowToPicker(true)}
                    >
                      <Text style={styles.inputText}>
                        {toDate.toLocaleDateString()}
                      </Text>
                      <Icon name="calendar" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.row}>
                  {/* <View style={styles.inputContainer}>
                    <Text style={styles.label}>Collector</Text>
                    <Dropdown
                      data={collectorOptions}
                      labelField="label"
                      valueField="value"
                      value={selectedCollector}
                      onChange={item => setSelectedCollector(item.value)}
                      style={styles.dropdown}
                    />
                  </View> */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Ward</Text>
                    <Dropdown
                      data={wardList}
                      labelField="label"
                      valueField="value"
                      value={selectedWard}
                      onChange={item => setSelectedWard(item.value)}
                      style={styles.dropdown}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.cardSearchButton}
                  onPress={handleSearch}
                >
                  {loading && page === 1 ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.cardSearchText}>Search Records</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={[styles.title, { marginTop: rh(2) }]}>Results</Text>

              {/* This is the key change: wrapping the table content in a horizontal scroll */}
              <ScrollView horizontal>
                <View>
                  <TableHeader />
                  {reportData.length === 0 && !loading && (
                    <Text style={styles.emptyText}>No records found.</Text>
                  )}
                  {reportData.map((item, index) => (
                    <View key={index}>{renderItem({ item })}</View>
                  ))}
                  {loading && page > 1 && (
                    <ActivityIndicator
                      size="small"
                      color="#2563eb"
                      style={{ marginVertical: 10 }}
                    />
                  )}
                </View>
              </ScrollView>
            </>
          }
          // Note: Removing the data/renderItem from the main FlatList to prevent the
          // "ScrollView inside ScrollView" header sync issue.
          // If the list is huge, we would use a different approach.
          renderItem={null}
          onEndReached={() => {
            if (page < lastPage) fetchCollectionReport(page + 1);
          }}
          onEndReachedThreshold={0.5}
        />
      </View>

      {/* Date Pickers */}
      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          onChange={(e, d) => {
            setShowFromPicker(false);
            if (d) setFromDate(d);
          }}
        />
      )}
      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          onChange={(e, d) => {
            setShowToPicker(false);
            if (d) setToDate(d);
          }}
        />
      )}
    </View>

    </Layout>
  );
};

export default Collection;

const styles = StyleSheet.create({
  container: {
    padding: rw(3),
  },
  title: {
    fontSize: rf(2.2),
    fontWeight: 'bold',
    marginBottom: rh(1),
    color: '#333',
  },
  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: rw(4),
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: rh(1.5),
  },
  inputContainer: {
    width: '48%',
  },
  label: {
    fontSize: rf(1.7),
    marginBottom: rh(0.5),
    color: '#555',
    fontWeight: '600',
  },
  input: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: rh(1.2),
    paddingHorizontal: rw(3),
    backgroundColor: '#f9f9f9',
  },
  inputText: {
    fontSize: rf(1.7),
    color: '#333',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: rh(5.5),
    paddingHorizontal: rw(3),
    backgroundColor: '#f9f9f9',
  },
  placeholderStyle: { fontSize: rf(1.7), color: '#999' },
  selectedTextStyle: { fontSize: rf(1.7), color: '#333' },
  cardSearchButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: rh(1.5),
    marginTop: rh(1),
  },
  cardSearchText: {
    color: '#fff',
    fontSize: rf(2),
    fontWeight: 'bold',
  },
  table: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: rh(1.5),
  },
  headerCell: {
    width: rw(30),
    fontWeight: 'bold',
    paddingHorizontal: rw(2),
    fontSize: rf(1.7),
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: rh(1.5),
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  cell: {
    width: rw(30),
    paddingHorizontal: rw(2),
    fontSize: rf(1.6),
    color: '#444',
  },
  actionCell: {
    width: rw(30),
    alignItems: 'center',
  },
});
