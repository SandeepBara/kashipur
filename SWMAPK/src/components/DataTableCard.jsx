import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import COLORS from '../constants/colors';
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions';

const DataTableCard = ({
  title = "",
  filterRender,
  headerRender,
  data = [],
  renderItem,
  loading,
  totalPages = 1,
  currentPage = 1,
  totalItem = 1,
  setPageNo = () => { },
  emptyMessage = "No results found."
}) => {

  const getPageNumbers = () => {
    const pages = [];
    const visiblePages = 3;
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > visiblePages) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - visiblePages + 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const PaginationUI = () => (
    !loading && data?.length > 0 && (
      <View style={styles.stickyPaginationContainer}>
        <View style={styles.paginationWrapper}>
          <TouchableOpacity
            style={[styles.arrowBtn, currentPage === 1 && styles.disabledBtn]}
            onPress={() => currentPage > 1 && setPageNo(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Text style={styles.arrowText}>{'<'}</Text>
          </TouchableOpacity>

          <View style={styles.pageNumbersContainer}>
            {getPageNumbers().map((num, index) => (
              <TouchableOpacity
                key={index}
                disabled={num === '...'}
                onPress={() => num !== '...' && setPageNo(num)}
                style={[
                  styles.pageBtn,
                  num === currentPage && styles.activeBtn,
                  num === '...' && styles.dotBtn,
                ]}
              >
                <Text style={[styles.pageNumberText, num === currentPage && styles.activeText]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.arrowBtn, currentPage === totalPages && styles.disabledBtn]}
            onPress={() => currentPage < totalPages && setPageNo(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <Text style={styles.arrowText}>{'>'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.pageInfo}>Page {currentPage} of {totalPages} ({totalItem} items)</Text>
      </View>
    )
  );

  return (
    <View style={styles.mainWrapper}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
        // STICKY LOGIC: The first element of ListHeaderComponent pins here.
        stickyHeaderIndices={[0]} 
        ListHeaderComponent={
          <View style={styles.listHeaderWrapper}>
            <View style={styles.stickySection}>
              {headerRender && headerRender()}
              {title ? (
                <View style={styles.topHeader}>
                  <Text style={styles.titleText}>{title}</Text>
                </View>
              ) : null}
              {filterRender && filterRender()}
              <PaginationUI />
            </View>
          </View>
        }
        // Important for performance and scrolling
        removeClippedSubviews={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyCont}>
              <Text style={styles.emptyTxt}>{emptyMessage}</Text>
            </View>
          )
        }
        ListFooterComponent={
          loading && (
            <ActivityIndicator size="large" color={COLORS.primary || '#3B82F6'} style={{ marginVertical: 20 }} />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, height: '100%', backgroundColor: '#F8FAFC' },
  listHeaderWrapper: { backgroundColor: '#F8FAFC' },
  topHeader: {
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  titleText: { fontSize: responsiveFontSize(2), fontWeight: '700', color: '#1E293B' },
  stickySection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 5,
    elevation: 5, 
    zIndex: 10,
  },
  stickyPaginationContainer: {
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#F1F5F9', 
  },
  paginationWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '100%',
    justifyContent: 'center',
  },
  pageNumbersContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center',
    maxWidth: '70%',
  },
  arrowBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff',
    elevation: 2, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5,
  },
  disabledBtn: { opacity: 0.3 },
  arrowText: { fontSize: 16, color: '#333' },
  pageBtn: {
    minWidth: 26, height: 26, borderRadius: 4, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', margin: 2,
  },
  activeBtn: { backgroundColor: COLORS.primary || '#3B82F6', borderColor: COLORS.primary || '#3B82F6' },
  pageNumberText: { fontSize: 11, color: '#333' },
  activeText: { color: '#fff' },
  dotBtn: { borderWidth: 0, backgroundColor: 'transparent' },
  pageInfo: { fontSize: 10, color: '#64748B' },
  emptyCont: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyTxt: { color: '#94A3B8', fontSize: 16 }
});

export default DataTableCard;