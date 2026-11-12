import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';

const DataTable = ({
  title = "List",
  data = [],
  headers = [],
  renderRow,
  footerRow = null,
  actionButton,
  itemsPerPage = 10,
  totalPages = 1,
  currentPage = 1,
  totalItem = 1,
  setPageNo = () => { },
  setItemsPerPage = () => { },
  isSearchInput = true,
  search = "",
  setSearch = () => { },
  onSearch = () => { },
  filterComponent = null,
  pageLimits = [5, 10, 50, 100],
  links = null,
  isPaginator = true,
}) => {
  const [searchInput, setSearchInput] = useState(search);
  const [filteredData, setFilteredData] = useState(data);
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);

  useEffect(() => {
    const keyword = searchInput.toLowerCase();
    const filtered = data.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === "string" && value.toLowerCase().includes(keyword)
      )
    );
    setFilteredData(filtered);
  }, [searchInput, data]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setPageNo(page);
    }
  };

  const handleSearchClick = () => {
    setSearch(searchInput);
    setPageNo(1);
    onSearch();
  };

  const renderPaginationButtons = () => {
    const pages = [];
    const visiblePages = 1;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - visiblePages);
      const end = Math.min(totalPages - 1, currentPage + visiblePages);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages.map((page, idx) => (
      <View key={idx}>
        {page === "..." ? (
          <Text style={styles.dataTableEllipsis}>...</Text>
        ) : (
          <TouchableOpacity
            onPress={() => handlePageChange(page)}
            style={[
              styles.dataTablePageBtn,
              currentPage === page ? styles.dataTablePageBtnActive : styles.dataTablePageBtnInactive
            ]}
          >
            <Text style={[styles.dataTablePageBtnText, currentPage === page && styles.dataTableTextWhite]}>
              {page}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    ));
  };

  return (
    <View style={styles.dataTableContainer}>
      {/* Header Section */}
      <View style={styles.dataTableHeaderRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={styles.dataTableTitle}>{title}</Text>
          {links}
        </View>
        {actionButton}
      </View>

      {filterComponent && <View style={styles.dataTableFilterContainer}>{filterComponent}</View>}

      {/* Toolbar */}
      <View style={styles.dataTableToolbarContainer}>
        {isSearchInput && (
          <View style={styles.dataTableSearchGroup}>
            <TextInput
              style={styles.dataTableInput}
              placeholder="Search..."
              value={searchInput}
              onChangeText={setSearchInput}
            />
            <TouchableOpacity style={styles.dataTableSearchBtn} onPress={handleSearchClick}>
              <Text style={styles.dataTableSearchBtnText}>Go</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.dataTableLimitGroup}>
          <Text style={styles.dataTableLimitLabel}>Show:</Text>
          <TouchableOpacity
            style={styles.dataTableDropdownTrigger}
            onPress={() => setShowLimitDropdown(true)}
          >
            <Text style={styles.dataTableDropdownTriggerText}>{itemsPerPage}</Text>
            <Text style={styles.dataTableDropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Modal */}
      <Modal visible={showLimitDropdown} transparent animationType="fade">
        <TouchableOpacity
          style={styles.dataTableModalOverlay}
          activeOpacity={1}
          onPress={() => setShowLimitDropdown(false)}
        >
          <View style={styles.dataTableDropdownMenu}>
            {pageLimits.map((limit) => (
              <TouchableOpacity
                key={limit}
                style={[
                  styles.dataTableDropdownItem,
                  itemsPerPage === limit && styles.dataTableDropdownItemActive
                ]}
                onPress={() => {
                  setItemsPerPage(limit);
                  setPageNo(1);
                  setShowLimitDropdown(false);
                }}
              >
                <Text style={[
                  styles.dataTableDropdownItemText,
                  itemsPerPage === limit && styles.dataTableTextWhite
                ]}>
                  {limit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Table Area with Sticky Footer Implementation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.dataTableHorizontalScroll}>
        <View>
          {/* Header */}
          <View style={styles.dataTableTableHeader}>
            {headers.map((header, i) => (
              <View key={i} style={[styles.dataTableHeaderCell, { width: header.width || 100 }]}>
                <Text style={styles.dataTableHeaderCellText}>{header.label}</Text>
              </View>
            ))}
          </View>

          {/* Body (Scrollable) */}
          <ScrollView style={styles.dataTableTableBody} nestedScrollEnabled={true}>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => renderRow(item, index, currentPage, itemsPerPage))
            ) : (
              <View style={styles.dataTableNoData}>
                <Text>No records found.</Text>
              </View>
            )}
          </ScrollView>

          {/* Sticky Footer Row (Aligned with columns) */}
          {footerRow && (
            <View style={styles.dataTableStickyFooterRow}>
              {footerRow}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Pagination Footer */}
      <View style={styles.dataTableFooter}>
        <Text style={styles.dataTablePageInfoText}>
          Showing {filteredData.length} records • Page {currentPage} of {totalPages}
        </Text>

        <View style={styles.dataTablePaginationControls}>
          <TouchableOpacity
            style={[styles.dataTablePageBtn, currentPage === 1 && styles.dataTableDisabledBtn]}
            onPress={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Text style={styles.dataTablePageBtnText}>Prev</Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dataTablePageNumbers}>
            {renderPaginationButtons()}
          </ScrollView>

          <TouchableOpacity
            style={[styles.dataTablePageBtn, currentPage === totalPages && styles.dataTableDisabledBtn]}
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <Text style={styles.dataTablePageBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (keeping your previous styles)
  dataTableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexShrink: 1,
  },
  dataTableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dataTableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  dataTableToolbarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10
  },
  dataTableSearchGroup: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
  },
  dataTableInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 35,
    fontSize: 13,
  },
  dataTableSearchBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
  },
  dataTableSearchBtnText: {
    color: '#fff',
    fontSize: 12,
  },
  dataTableLimitGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataTableLimitLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 5,
  },
  dataTableDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    minWidth: 50,
    justifyContent: 'space-between'
  },
  dataTableDropdownTriggerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151'
  },
  dataTableDropdownArrow: {
    fontSize: 8,
    marginLeft: 5,
    color: '#6b7280'
  },
  dataTableModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dataTableDropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 150,
    padding: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dataTableDropdownItem: {
    padding: 12,
    borderRadius: 4,
  },
  dataTableDropdownItemActive: {
    backgroundColor: '#3b82f6',
  },
  dataTableDropdownItemText: {
    fontSize: 14,
    color: '#374151',
  },
  dataTableHorizontalScroll: {
    flexGrow: 0,
  },
  dataTableTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dataTableHeaderCell: {
    padding: 10,
    borderRightWidth: 0.5,
    borderRightColor: '#e5e7eb',
  },
  dataTableHeaderCellText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#374151',
  },
  dataTableTableBody: {
    maxHeight: 280,
  },
  dataTableNoData: {
    padding: 20,
    alignItems: 'center',
  },
  dataTableStickyFooterRow: {
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  dataTableFooter: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  dataTablePageInfoText: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 8,
  },
  dataTablePaginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dataTablePageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataTablePageBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 2,
    minWidth: 32,
    alignItems: 'center',
  },
  dataTablePageBtnActive: {
    backgroundColor: '#3b82f6',
  },
  dataTablePageBtnText: {
    fontSize: 11,
    color: '#374151',
  },
  dataTableTextWhite: {
    color: '#fff',
  },
  dataTableDisabledBtn: {
    opacity: 0.4,
  },
  dataTableEllipsis: {
    paddingHorizontal: 5,
    color: '#9ca3af',
  },
});

export default DataTable;