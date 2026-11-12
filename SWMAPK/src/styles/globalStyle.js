import { Platform, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

export const globalStyle = StyleSheet.create({
    // Layout Containers
    container: { flex: 1, backgroundColor: '#F4F7F5' },
    scrollContent: { flex: 1 },

    // Header & Navigation
    header: {
        backgroundColor: '#FFFFFF',
        paddingBottom: 12,
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#E7ECE8',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 2,
    },
    headerTitleContainer: { flex: 1, alignItems: 'center' },
    headerTitle: { color: '#1D2922', fontSize: 15, fontWeight: '700', textAlign: 'center' },
    menuButtonContainer: { width: 44, height: 42, justifyContent: 'center' },
    menuButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#EAF3ED', alignItems: 'center', justifyContent: 'center' },
    hamburgerIcon: { width: 17 },
    hamburgerLine: { height: 2, backgroundColor: '#176A43', marginVertical: 2, borderRadius: 2 },
    rightButtonContainer: { width: 44, alignItems: 'flex-end', justifyContent: 'center' },
    headerBackButtonText: { color: '#176A43', fontSize: 13, fontWeight: '700' },

    // Sidebar
    menuOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 27, 20, 0.42)', zIndex: 1500 },
    sidebarMenu: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 280, backgroundColor: COLORS.white, elevation: 15 },
    sidebarHeader: { backgroundColor: '#176A43', paddingVertical: 25, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between' },
    sidebarTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
    sidebarMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#EEF2EF' },
    menuItemText: { fontSize: 14, color: '#334139', marginLeft: 15 },

    // Dashboard Components
    bannerSection: { backgroundColor: '#E7F1EA', marginHorizontal: 20, marginTop: 20, borderRadius: 22, padding: 18 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { width: '48%', backgroundColor: COLORS.white, padding: 15, borderRadius: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E8EEEA' },

    // Footer Navigation
    bottomNav: {
        backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-around',
        paddingTop: 10, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#E8EEEA',
    },
    navItem: { alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 48, gap: 4 },
    navIcon: { fontSize: 24, marginBottom: 4, opacity: 0.6 },
    navIconActive: { opacity: 1 },
    navLabel: { fontSize: 10, color: '#849087', fontWeight: '600' },
    navLabelActive: { color: '#176A43', fontWeight: '800' },

    // Search Section
    seacrhCont: {
        paddingVertical: responsiveHeight(2),
        paddingHorizontal: responsiveWidth(4),
        marginVertical: responsiveHeight(2),
        marginHorizontal: responsiveWidth(3),
        borderColor: COLORS.borderColor,
        borderWidth: 1,
        borderRadius: 16,
        elevation: 1,
        backgroundColor: COLORS.background,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    searchhead: {
        backgroundColor: COLORS.primary,
        paddingVertical: responsiveHeight(1),
        paddingHorizontal: responsiveWidth(1),
        marginBottom: responsiveHeight(1),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        elevation: 1,
    },
    filterSection: { padding: 16, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#E8EEEA' },
    filterGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    inputGroup: { width: '48%' },
    miniLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 4, textTransform: 'uppercase' },
    dropdown: {
        height: responsiveHeight(5), width: '100%',
        borderColor: '#DCE5DE', borderWidth: 1, borderRadius: 12, paddingHorizontal: 11, backgroundColor: '#FBFCFB',
    },
    input: {
        width: '100%', height: responsiveHeight(5),
        borderColor: '#DCE5DE', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#FBFCFB',
    },

    // Result Cards
    resultCard: {
        backgroundColor: COLORS.white,
        marginHorizontal: 10,
        marginVertical: 6,
        borderRadius: 17,
        padding: 15,
        borderWidth: 1,
        borderColor: '#E8EEEA',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E9EEEA',
    },
    ownerName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
    wardBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    wardBadgeText: { color: '#2563EB', fontSize: 11, fontWeight: '800' },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 0.2,
        borderBottomColor: '#E8EEEA',
    },
    cardLabel: { fontSize: 12, color: COLORS.textGrey, width: 90 },
    cardValue: { fontSize: 12, color: COLORS.textDark, fontWeight: '500' },

    // Status Badges
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
    statusActive: { backgroundColor: '#d4edda' },
    statusPending: { backgroundColor: '#fff3cd' },
    statusInactive: { backgroundColor: '#f8d7da' },
    statusText: { fontSize: 11, fontWeight: '500' },

    // Buttons
    searchBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 13, alignItems: 'center' },
    searchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    viewButton: { backgroundColor: COLORS.textPrimary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    viewButtonText: { color: COLORS.textWhite, fontSize: 13, fontWeight: '600' },

    // Pagination
    paginationContainer: { paddingVertical: 15, alignItems: 'center' },
    paginationButtons: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    pageButton: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4 },
    pageButtonDisabled: { backgroundColor: COLORS.greyLight },
    pageButtonText: { color: COLORS.textWhite, fontSize: 13, fontWeight: '500' },

    // Illustration/Graphics Section
    illustrationSection: { backgroundColor: '#E8F5F0', paddingHorizontal: 20, paddingVertical: 25 },
    illustrationPlaceholder: { backgroundColor: '#D4EDE4', borderRadius: 20, padding: 20, minHeight: 200 },
    chartBar: { width: 60, backgroundColor: '#8FBC8F', borderTopLeftRadius: 8, borderTopRightRadius: 8 },

    mainContent: { padding: 10 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#64748B' },
    infoCardHeader: { backgroundColor: '#1e293b', padding: 12,borderTopStartRadius: 8, borderTopEndRadius:8 },
    card: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 2, marginBottom: 15, borderWeight: 1, borderColor: '#e2e8f0' },
    cardHeaderText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    infoGrid: { padding: 10 },
    infoCell: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
    infoLabel: { fontSize: 12, color: '#64748B' },
    infoValue: { fontSize: 12, fontWeight: '600', color: '#1e293b' },
    actionContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
    primaryBtn: { margin: 5, backgroundColor: '#3b82f6', paddingHorizontal: 15, paddingVertical: 15, borderRadius: 6, flex: 0.45, alignItems: 'center' },
    successBtn: { margin: 5, backgroundColor: '#10b981', paddingHorizontal: 15, paddingVertical: 15, borderRadius: 6, flex: 0.45, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold',fontSize: 10 },

    // container: {
    //     backgroundColor: '#fff',
    //     borderRadius: 10,
    //     borderWidth: 1,
    //     borderColor: '#e2e8f0',
    //     margin: 10,
    //     overflow: 'hidden',
    //     elevation: 3,
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.1,
    //     shadowRadius: 4,
    // },
    titleBar: { padding: 15 },
    titleText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    exportRow: {
        padding: 10,
        alignItems: 'flex-end',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    exportBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    exportBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderBottomWidth: 2,
        borderColor: '#cbd5e1',
    },
    headerCell: {
        padding: 12,
        borderRightWidth: 1,
        borderColor: '#e2e8f0',
        justifyContent: 'center',
    },
    headerText: {
        fontWeight: '800',
        color: '#334155',
        fontSize: 11,
        textTransform: 'uppercase',
    },
    // paginationContainer: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     alignItems: 'center',
    //     padding: 12,
    //     backgroundColor: '#f8fafc',
    //     borderTopWidth: 1,
    //     borderColor: '#e2e8f0',
    // },
    statsText: { fontSize: 12, color: '#64748b' },
    pageActions: { flexDirection: 'row', alignItems: 'center' },
    pageBtn: { padding: 8 },
    pageBtnText: { color: '#2563eb', fontWeight: 'bold', fontSize: 14 },
    pageIndicator: { marginHorizontal: 10, fontSize: 13, fontWeight: '600', color: '#1e293b' },
    emptyContainer: { padding: 1, alignItems: 'center' },
    emptyText: { color: '#94a3b8', fontStyle: 'italic' },
    footer: { borderTopWidth: 2, borderColor: '#e2e8f0' },
    
    row: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    cell: { padding: 12, fontSize: 12, color: '#475569',borderRightWidth: 1,borderColor: '#e2e8f0', },
    actionBtn: { backgroundColor: '#2563eb', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
    actionBtnText: { color: '#fff', fontSize: 11, fontWeight: '600' },

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '95%',
        height: '80%', // Use height instead of maxHeight for consistent table rendering
        backgroundColor: COLORS.white,
        borderRadius: 12,
        elevation: 5,
        overflow: 'hidden',
    },
    modelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modelHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    closeBtnText: {
        fontSize: 32,
        color: COLORS.textGrey,
    },
    content: {
        flex: 1, // Allow content to fill the modalContainer
        padding: 10,
    },
    loaderContainer: {
        flex: 1, // Center the loader in the available space
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 10,
        color: COLORS.textGrey,
        fontSize: 14,
    },

    demandSummaryRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    justifyContent: 'center',
    marginBottom: 10 
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
    borderColor: COLORS.border,
  },
  summaryLabel: { fontSize: 11 },
  summaryValue: { fontSize: 12, fontWeight: '700' },
  textRed: { color: COLORS.error },
  textOrange: { color: COLORS.orange },
  textGreen: { color: COLORS.success },
  totalPayableBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFACD',
    borderRadius: 6,
    marginTop: 'auto' // Pushes to the bottom of the 30% section
  },
  totalPayableLabel: { fontSize: 14, fontWeight: '600' },
  totalPayableValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  payNowBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 6,
  },
  payNowBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },

//   overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '92%', maxHeight: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 10 },
//   header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10, marginBottom: 15 },
//   headerText: { fontSize: 18, color: COLORS.primary, fontWeight: 'bold' },
  closeBtn: { fontSize: 28, color: '#b02828', marginTop: -5 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textDark, marginBottom: 6, marginTop: 5 },
// Recommended Section
  recommendedSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recommendedCards: {
    paddingRight: 20,
    gap: 15,
  },
  recommendedCard: {
    width: 120,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  datePickerTrigger: { 
    borderWidth: 1.5, 
    borderColor: '#e2e8f0', 
    borderRadius: 6, 
    paddingHorizontal: 12, 
    paddingVertical: Platform.OS === 'ios' ? 12 : 11, // Balanced for Android/iOS
    backgroundColor: '#f8fafc' 
  },
  dateText: { fontSize: 14, color: '#1e293b' },
  placeholderText: { fontSize: 14, color: '#94a3b8' },
  amountSection: { marginTop: 10, backgroundColor: '#f0f9ff', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#bae6fd' },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  rupee: { fontSize: 22, fontWeight: 'bold', color: '#0369a1', marginRight: 4 },
  amountInput: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, flex: 1, padding: 0 },
  amountValue: { fontSize: 22, fontWeight: 'bold', color: '#0369a1' },
  payBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  




  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#c8e6c9',
    textAlign: 'center',
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  modeTag: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  modeText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
  },
  hintText: {
    color: '#888',
    marginTop: 8,
    fontSize: 12,
  },
  otgButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  otgButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  logCount: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  logItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  consumerText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  backText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '500',
    paddingTop: 20,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  loaderBox: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 12,
    elevation: 5,
  },
});
