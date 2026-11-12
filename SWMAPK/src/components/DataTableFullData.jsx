import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { globalStyle } from '../styles/globalStyle';

const DataTableFullData = ({
  color = '#1e3a8a',
  title,
  data = [],
  headers = [],
  renderRow,
  footerRow = null,
  startingItemsPerPage = 10,
  isPaginate = true
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalDataCount = data.length;
  const totalPages = Math.ceil(totalDataCount / startingItemsPerPage);
  const startIndex = (currentPage - 1) * startingItemsPerPage;
  const endIndex = Math.min(startIndex + startingItemsPerPage, totalDataCount);

  const paginatedData = useMemo(() => {
    if (!isPaginate) return data;
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, startingItemsPerPage, isPaginate]);

  return (
    /* Removed flex: 1 from here to prevent forced stretching */
    <View style={[globalStyle.container, { marginBottom: 15 }]}>
      {/* Title Header */}
      {title && (
        <View style={[globalStyle.infoCardHeader]}>
          <Text style={globalStyle.titleText}>{title}</Text>
        </View>
      )}

      {/* Main Table Scroll (Horizontal) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        {/* Removed flex: 1 from this View so it wraps content height */}
        <View>
          
          {/* Table Head */}
          <View style={globalStyle.tableHeader}>
            {headers.map((h, i) => (
              <View key={i} style={[globalStyle.headerCell, { width: h.width || 100 }]}>
                <Text style={globalStyle.headerText}>{h.label}</Text>
              </View>
            ))}
          </View>

          {/* Table Body (Vertical Scroll) */}
          {/* flexGrow: 0 is correct, removed unnecessary outer heights */}
          <ScrollView style={{ flexGrow: 0 }}>
            <View>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => renderRow(item, startIndex + index))
              ) : (
                <View style={globalStyle.emptyContainer}>
                  <Text style={globalStyle.emptyText}>No transactions found.</Text>
                </View>
              )}
            </View>

            {footerRow && <View style={globalStyle.footer}>{footerRow}</View>}
          </ScrollView>

          {/* Pagination Footer */}
          {isPaginate && paginatedData.length >0 && (
            /* Removed marginTop: 'auto' so it sits directly under the rows */
            <View style={[globalStyle.paginationContainer, globalStyle.tableHeader, { marginTop: 0 }]}>
              <Text style={globalStyle.statsText}>
                {totalDataCount > 0 ? startIndex + 1 : 0}-{endIndex} of {totalDataCount}
              </Text>
              <View style={globalStyle.pageActions}>
                <TouchableOpacity
                  disabled={currentPage === 1}
                  onPress={() => setCurrentPage((p) => p - 1)}
                  style={[globalStyle.pageBtn, currentPage === 1 && { opacity: 0.3 }]}
                >
                  <Text style={globalStyle.pageBtnText}>Prev</Text>
                </TouchableOpacity>

                <Text style={globalStyle.pageIndicator}>
                  {currentPage} / {totalPages || 1}
                </Text>

                <TouchableOpacity
                  disabled={currentPage === totalPages || totalPages === 0}
                  onPress={() => setCurrentPage((p) => p + 1)}
                  style={[globalStyle.pageBtn, (currentPage === totalPages || totalPages === 0) && { opacity: 0.3 }]}
                >
                  <Text style={globalStyle.pageBtnText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default DataTableFullData;