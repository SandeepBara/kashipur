import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { search_consumer_api, wardListApi } from '../../api/endpoints';
import { getToken } from '../../util/auth';
import DataTableCard from '../../components/DataTableCard';
import COLORS from '../../constants/colors';
import Layout from '../../layout/Layout';
import { useNavigation } from '@react-navigation/native';
import { globalStyle } from '../../styles/globalStyle';
import Clipboard from '@react-native-clipboard/clipboard';
import { ToastAndroid, Platform } from 'react-native';

const Search = () => {
  const navigation = useNavigation();
  const [value, setValue] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [wardList, setWardList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const copyToClipboard = (value, label) => {
    if (!value || value === 'N/A') return;

    Clipboard.setString(String(value));

    if (Platform.OS === 'android') {
      ToastAndroid.show(`${label} copied!`, ToastAndroid.SHORT);
    }
  };
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(wardListApi, {
          headers: { Authorization: `Bearer ${token}` },
          params: { all: 'all' },
        });
        setWardList(response.data.data || []);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    fetchWards();
  }, []);

  const wardDropdownOptions = (wardList || []).map(item => ({
    label: item.wardNo,
    value: item.id,
  }));

  const handleViewPress = item => {
    navigation.navigate('ConsumerDetails', { id: item.id, data: item });
  };

  const handleSearch = async (pageNo = 1, limit = itemsPerPage) => {
    try {
      setLoadingSearch(true);
      const token = await getToken();
      const body = {
        perPage: limit,
        page: pageNo,
        keyWord: keyword?.trim() || '',
        wardId: value ? [value] : [],
      };

      const response = await axios.post(search_consumer_api, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.status) {
        setSearchResults(response.data.data?.data ?? []);
        setPage(pageNo);
        setLastPage(response.data.data?.lastPage || 1);
        setTotal(response.data.data?.total || 0);
      } else {
        setSearchResults([]);
        setTotal(0);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch results.');
    } finally {
      setLoadingSearch(false);
    }
  };

  const renderFilters = () => (
    <View style={globalStyle.filterSection}>
      <View style={globalStyle.filterGrid}>
        <View style={globalStyle.inputGroup}>
          <Text style={globalStyle.miniLabel}>Ward Number</Text>
          <Dropdown
            style={globalStyle.dropdown}
            placeholderStyle={globalStyle.placeholderStyle}
            selectedTextStyle={globalStyle.selectedTextStyle}
            data={[{ label: 'Select', value: '' }, ...wardDropdownOptions]}
            labelField="label"
            valueField="value"
            placeholder="Select"
            value={value}
            onChange={item => setValue(item.value)}
          />
        </View>

        <View style={globalStyle.inputGroup}>
          <Text style={globalStyle.miniLabel}>Search Keyword</Text>
          <TextInput
            style={globalStyle.input}
            placeholder="Name or ID..."
            placeholderTextColor="#94A3B8"
            value={keyword}
            onChangeText={setKeyword}
          />
        </View>
      </View>

      <TouchableOpacity
        style={globalStyle.searchBtn}
        onPress={() => handleSearch(1)}
      >
        <Text style={globalStyle.searchBtnText}>Apply Filters</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <View style={globalStyle.resultCard}>
      <View style={globalStyle.cardHeader}>
        <Text style={globalStyle.cardTitle}>
          Consumer #{index + 1 + (page - 1) * itemsPerPage}
        </Text>
          <Text selectable={true} style={globalStyle.statusText}>{item.consumerNo || 'N/A'}</Text>

      </View>

      <View style={globalStyle.cardRow}>
        <Text style={globalStyle.cardLabel}>Ward No:</Text>
        <Text selectable={true} style={globalStyle.cardValue}>{item.wardNo || 'N/A'}</Text>
      </View>

      <View style={globalStyle.cardRow}>
        <Text style={globalStyle.cardLabel}>Holding No:</Text>
        <Text selectable={true} style={globalStyle.cardValue}>{item.holdingNo || 'N/A'}</Text>
      </View>

      <View style={globalStyle.cardRow}>
        <Text style={globalStyle.cardLabel}>Owner Name:</Text>
          <Text selectable={true} style={globalStyle.cardValue} numberOfLines={1}>
            {item.ownerName || 'N/A'}
          </Text>
      </View>

      <View style={globalStyle.cardRow}>
        <Text style={globalStyle.cardLabel}>Category:</Text>
        <Text selectable={true} style={globalStyle.cardValue}>
          {item.consumerCategory || 'N/A'}
        </Text>
      </View>

      <View style={globalStyle.cardRow}>
        <Text style={globalStyle.cardLabel}>Address:</Text>
        <Text selectable={true} style={globalStyle.cardValue} numberOfLines={2}>
          {item.address || 'N/A'}
        </Text>
      </View>

      <View style={globalStyle.cardRow}>
        <Text style={globalStyle.cardLabel}>Mobile:</Text>
          <Text selectable={true} style={globalStyle.cardValue}>{item.mobileNo || 'N/A'}</Text>
      </View>

      <TouchableOpacity
        style={globalStyle.viewButton}
        onPress={() => handleViewPress(item)}
      >
        <Text style={globalStyle.viewButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Layout title="Search Consumer" isBack={true} scrollable={false}>
      <DataTableCard
        totalItem={total}
        data={searchResults}
        loading={loadingSearch}
        currentPage={page}
        totalPages={lastPage}
        itemsPerPage={itemsPerPage}
        renderItem={renderItem}
        filterRender={renderFilters}
        setPageNo={p => handleSearch(p)}
        setItemsPerPage={val => {
          setItemsPerPage(val);
          handleSearch(1, val);
        }}
        emptyMessage={
          total === 0 && !loadingSearch
            ? 'No records found matching filters.'
            : ''
        }
      />
    </Layout>
  );
};

// const styles = StyleSheet.create({

// });

export default Search;
