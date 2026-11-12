// src/styles/ConsumerFormStyles.js
import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

export const ConsumerFormStyles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 10,
    margin: 10,
    borderRadius: 12,
  },
  errorTitle: {
    color: '#cc0000',
    fontWeight: '600',
    marginBottom: 5,
  },
  errorItem: {
    color: '#cc0000',
    fontSize: 13,
  },
  section: {
    marginHorizontal: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 18,
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: '#EAF3ED',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  sectionArea: {
    marginHorizontal: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 18,
    overflow: 'hidden',
  },
  sectionHeaderArea: {
    backgroundColor: '#EAF3ED',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  column: {
    flex: 1,
    minWidth: 150,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#526158',
    marginBottom: 5,
    marginTop:5,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
    backgroundColor: '#FBFCFB',
    color: COLORS.textDark,
  },
  smallInput: {
    width: 150,
  },
  textArea: {
    height: 60,
    paddingTop: 8,
  },
  fieldError: {
    color: '#cc0000',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 5,
  },
  inputError: {
    borderColor: '#cc0000',
    borderWidth: 1,
  },
  radioGroup: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  radioItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20, marginBottom: 10 },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterActive: { borderColor: COLORS.primary },
  radioInner: { height: 10, width: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  radioLabel: { fontSize: 14, color: '#374151' },
  // Owner Card styles
  ownerCard: {
    backgroundColor: '#F7F9F7',
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  ownerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  ownerCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  addOwnerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 11,
    alignItems: 'center',
  },
  addOwnerButtonText: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  removeOwnerButton: {
    backgroundColor: COLORS.error,
    width: 28,
    height: 28,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeOwnerButtonText: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: '600',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  radioSelected: {
    borderColor: '#3366cc',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48, // Equivalent to h-12
  },
  loadingText: {
    marginLeft: 8,
    color: COLORS.primary, // text-green-700
    fontSize: 14,    // text-sm
  },
  amountText: {
    color: '#16a34a', // text-green-600
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  monthlyAmountText: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 10,
    textAlign: 'right',
  },
  amountValue: {
    fontWeight: '600',
  },
  // Location section
  locationSection: {
    margin: 10,
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationSearchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 13,
    marginRight: 10,
  },
  locationInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 13,
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  searchButtonText: {
    color: COLORS.textWhite,
    fontSize: 13,
    fontWeight: '500',
  },
  // Map styles
  mapContainer: {
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  // Location details
  locationDetails: {
    backgroundColor: '#F7F9F7',
    borderRadius: 13,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  locationDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  coordRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  coordItem: {
    flex: 1,
  },
  coordLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  coordValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  addressContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 10,
  },
  addressLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  addressValue: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '600',
  },
  // No location hint
  noLocationHint: {
    backgroundColor: '#FFF5DE',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  noLocationHintText: {
    fontSize: 13,
    color: '#856404',
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#EEF2EF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  mapText: {
    color: '#666',
    fontSize: 14,
  },
  // Submit button
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    marginHorizontal: 10,
    borderRadius: 13,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '600',
  },
  
});
