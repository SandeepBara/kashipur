const env = import.meta.env;

export const BASE_URL = `${import.meta.env.VITE_REACT_APP_BACKEND_API}`;
export const heartBeatApi = `${BASE_URL}/api/heartbeat`;
export const cacheClearApi = `${BASE_URL}/api/cache-clear`;
export const UlbApi = `${BASE_URL}/api/ulb/show/{id}`;
export const UlbSwitchApi = `${BASE_URL}/api/switch/ulb`;
export const loginApi = `${BASE_URL}/api/login`;
export const logoutApi = `${BASE_URL}/api/logout`;
export const loginChangePassApi = `${BASE_URL}/api/login-user-change-pass`;
export const userApi = `${BASE_URL}/api/user`;
export const userByIdApi = `${BASE_URL}/api/user`;
export const editLoginUserApi = `${BASE_URL}/api/edit-login-user`;
export const userLockUnlockByIdApi = `${BASE_URL}/api/user-lock-unlock`;
export const userResetPassword = `${BASE_URL}/api/user-reset-password`;
export const usrProfileApi = `${BASE_URL}/api/user-profile`;
export const tlListApi = `${BASE_URL}/api/get-tl-list`;
export const tlTcListApi = `${BASE_URL}/api/get-tl-tc-list`;
export const tcListApi = `${BASE_URL}/api/get-tc-list`;

export const roleApi = `${BASE_URL}/api/role`;
export const roleUserApi = `${BASE_URL}/api/role-user-list`;
export const getWardMapApi = `${BASE_URL}/api/get-user-ward-map`;
export const getUserWardMapApi = `${BASE_URL}/api/get-user-ward-map`;
export const getWardListApi = `${BASE_URL}/api/ward`;
export const getReportToApi = `${BASE_URL}/api/get-report-to`;
export const getFyearListApi = `${BASE_URL}/api/fyear/list`;

// CITIZEN
export const googleAuthApi = `${BASE_URL}/api/citizen/google-login`;
export const socialClientIdApi = `${BASE_URL}/api/citizen/get-client-id`;
export const registerCitizenApi = `${BASE_URL}/api/citizen/register`;
export const citizenRegisterVerifyOtpApi = `${BASE_URL}/api/citizen/verifyOtp-register`;
export const citizenLoginApi = `${BASE_URL}/api/citizen/login`;
export const citizenLogoutApi = `${BASE_URL}/api/citizen/logout`;
export const citizenLoginOtpApi = `${BASE_URL}/api/citizen/login-otp`;
export const citizenPropertySearchApi = `${BASE_URL}/api/citizen/property/search`;
export const citizenApplicationListApi = `${BASE_URL}/api/citizen/app-list`;

/**
 * ==============setting [WF]======================
 */
export const wfListApi = `${BASE_URL}/api/workflow-list`;
export const wfActivateDeactivateApi = `${BASE_URL}/api/workflow-lock-unlock`;
export const wfAddApi = `${BASE_URL}/api/workflow-add`;
export const wfEditApi = `${BASE_URL}/api/workflow-edit`;

export const dbListApi = `${BASE_URL}/api/editor/get-db`;
export const tableListApi = `${BASE_URL}/api/editor/get-table`;
export const executeQueryApi = `${BASE_URL}/api/editor/execute`;

/**
 * ==============setting [Vehicle Type]======================
 */
export const vehicleTypeListApi = `${BASE_URL}/api/assets/vehicle/type-list`;
export const vehicleTypeAddApi = `${BASE_URL}/api/assets/vehicle/type-add`;
export const vehicleTypeEditApi = `${BASE_URL}/api/assets/vehicle/type-edit`;
export const vehicleTypeDtlApi = `${BASE_URL}/api/assets/vehicle/type-dtl`;
export const vehicleTypeLockUnlockApi = `${BASE_URL}/api/assets/vehicle/type-lock-unlock`;

/**
 * ==============setting [Vehicle]======================
 */
export const vehicleListApi = `${BASE_URL}/api/assets/vehicle/list`;
export const vehicleAddApi = `${BASE_URL}/api/assets/vehicle/add`;
export const vehicleEditApi = `${BASE_URL}/api/assets/vehicle/edit`;
export const vehicleDtlApi = `${BASE_URL}/api/assets/vehicle/dtl`;
export const vehicleLockUnlockApi = `${BASE_URL}/api/assets/vehicle/lock-unlock`;
export const vehicleWardMappedApi = `${BASE_URL}/api/assets/vehicle/ward-maps`;
export const vehicleMovementLogApi = `${BASE_URL}/api/swm/report/vehicle-movement`;



/**
 * ==============setting [Driver]======================
 */
export const driverListApi = `${BASE_URL}/api/assets/driver/list`;
export const driverAddApi = `${BASE_URL}/api/assets/driver/add`;
export const driverEditApi = `${BASE_URL}/api/assets/driver/edit`;
export const driverDtlApi = `${BASE_URL}/api/assets/driver/dtl`;
export const driverLockUnlockApi = `${BASE_URL}/api/assets/driver/lock-unlock`;

export const driverVehicleMappedApi = `${BASE_URL}/api/assets/driver-vehicle/map`;

/**
 * ==============setting [Role Module Permission]======================
 */
export const ModuleListApi = `${BASE_URL}/api/module/list`;
export const RoleModuleListApi = `${BASE_URL}/api/role-permission/list`;
export const RoleModuleDtlApi = `${BASE_URL}/api/role-permission/dtl`;
export const RoleModuleAddApi = `${BASE_URL}/api/role-permission/add`;
export const RoleModuleEditApi = `${BASE_URL}/api/role-permission/edit`;
export const RoleModuleLockUnlockApi = `${BASE_URL}/api/role-permission/lock-unlock`;
export const RoleListApi = `${BASE_URL}/api/role`;
export const RoleDtlApi = `${BASE_URL}/api/role`;
export const RoleAddEditApi = `${BASE_URL}/api/role`;

export const wardListApi = `${BASE_URL}/api/ward`;
export const wardDtlApi = `${BASE_URL}/api/ward`;
export const wardAddEditApi = `${BASE_URL}/api/ward`;

export const wfPermissionApi = `${BASE_URL}/api/get-workflow-permission`;

export const getMenuListApi = `${BASE_URL}/api/menu-list`;
export const getSubMenuListApi = `${BASE_URL}/api/sub-menu-list`;
export const getMenuDtlByIdApi = `${BASE_URL}/api/menu-detail`;
export const menuAddApi = `${BASE_URL}/api/menu-add`;
export const menuEditApi = `${BASE_URL}/api/menu-edit`;
export const menuLockUnlockApi = `${BASE_URL}/api/menu-lock-unlock`;
export const menuUserExcludeIncludeListApi = `${BASE_URL}/api/menu-user-exclude-include-list`;
export const menuUserIncludeApi = `${BASE_URL}/api/menu-user-include-add`;
export const menuUserExcludeApi = `${BASE_URL}/api/menu-user-exclude-add`;

export const getMobileMenuListApi = `${BASE_URL}/api/menu-list-mobile`;
export const getMobileSubMenuListApi = `${BASE_URL}/api/sub-menu-list-mobile`;
export const getMobileMenuDtlByIdApi = `${BASE_URL}/api/menu-detail-mobile`;
export const menuMobileAddApi = `${BASE_URL}/api/menu-add-mobile`;
export const menuMobileEditApi = `${BASE_URL}/api/menu-edit-mobile`;
export const mobileMenuLockUnlockApi = `${BASE_URL}/api/menu-lock-unlock-mobile`;
export const menuMobileUserExcludeIncludeListApi = `${BASE_URL}/api/menu-user-exclude-include-list-mobile`;
export const menuMobileUserIncludeApi = `${BASE_URL}/api/menu-user-include-add-mobile`;
export const menuMobileUserExcludeApi = `${BASE_URL}/api/menu-user-exclude-add-mobile`;
export const modalLogListApi = `${BASE_URL}/api/log/list`;

/**
 * ==============Setting[UlbNotice]=================
 */

export const publicNoticeApi = `${BASE_URL}/api/published/notice`;
export const noticeListApi = `${BASE_URL}/api/list/notice`;
export const noticeAddApi = `${BASE_URL}/api/add/notice`;
export const noticeEditApi = `${BASE_URL}/api/edit/notice`;
export const noticeDtlApi = `${BASE_URL}/api/dtl/notice`;
export const noticeLockUnlockApi = `${BASE_URL}/api/lock-unlock/notice`;

/**
 * ==============Setting[UlbOfficer]=================
 */

export const publicOfficerApi = `${BASE_URL}/api/published/officer`;
export const officerListApi = `${BASE_URL}/api/officer/list`;
export const officerAddApi = `${BASE_URL}/api/officer/add`;
export const officerEditApi = `${BASE_URL}/api/officer/edit`;
export const officerDtlApi = `${BASE_URL}/api/officer/dtl`;
export const officerLockUnlockApi = `${BASE_URL}/api/officer/lock-unlock`;
/**
 * ====end hear setting api
 */

export const getUserProfileUpdateUrl = (id) => `${userApi}/${id}`;

// MainDashboard

export const holdingDemandCollectionDueApi = `${BASE_URL}/api/dashboard/property/demand-collection-due`;
export const appliedSafApi = `${BASE_URL}/api/dashboard/property/applied-saf`;
export const swmDemandCollectionDueApi = `${BASE_URL}/api/dashboard/swm/demand-collection-due`;
export const swmMonthlyCollectionApi = `${BASE_URL}/api/dashboard/swm/monthly-collection`;
export const swmRfIdMapNotMapApi = `${BASE_URL}/api/dashboard/swm/rfidmap-not-map`;

//swm master
export const swmCategoryListApi = `${BASE_URL}/api/swm/master/category-list`;
export const swmCategoryDtlApi = `${BASE_URL}/api/swm/master/category-dtl`;
export const swmCategoryAddApi = `${BASE_URL}/api/swm/master/category-add`;
export const swmCategoryEditApi = `${BASE_URL}/api/swm/master/category-edit`;
export const swmCategoryLockUnlockApi = `${BASE_URL}/api/swm/master/category-lock-unlock`;

export const swmSubCategoryListApi = `${BASE_URL}/api/swm/master/sub-category-list`;
export const swmSubCategoryDtlApi = `${BASE_URL}/api/swm/master/sub-category-dtl`;
export const swmSubCategoryAddApi = `${BASE_URL}/api/swm/master/sub-category-add`;
export const swmSubCategoryEditApi = `${BASE_URL}/api/swm/master/sub-category-edit`;
export const swmSubCategoryLockUnlockApi = `${BASE_URL}/api/swm/master/sub-category-lock-unlock`;

export const swmFeedbackListApi = `${BASE_URL}/api/swm/feedback/mstr-list`;
export const swmFeedbackDtlApi = `${BASE_URL}/api/swm/feedback/mstr-dtl`;
export const swmFeedbackAddApi = `${BASE_URL}/api/swm/feedback/mstr-add`;
export const swmFeedbackEditApi = `${BASE_URL}/api/swm/feedback/mstr-edit`;
export const swmFeedbackLockUnlockApi = `${BASE_URL}/api/swm/feedback/mstr-lock-unlock`;

// swm
export const swmMasterDataApi = `${BASE_URL}/api/swm/get-master-data`;
export const validateHoldingNoApi = `${BASE_URL}/api/swm/validate-holding`;
export const swmAddConsumerTestRequestApi=`${BASE_URL}/api/swm/test-request`;
export const swmAddConsumerApi=`${BASE_URL}/api/swm/consumer-add`;
export const swmEditBasicConsumerApi=`${BASE_URL}/api/swm/consumer-edit-basic`;
export const swmEditOwnerApi=`${BASE_URL}/api/swm/consumer-edit-owner`;
export const swmEditConsumerRangeApi=`${BASE_URL}/api/swm/consumer-edit-range`;
export const swmReviewTaxApi = `${BASE_URL}/api/swm/review-tax`;
export const swmSearchConsumerApi = `${BASE_URL}/api/swm/consumer-search`;
export const swmConsumerDtlApi = `${BASE_URL}/api/swm/consumer-dtl`;
export const swmConsumerDeactivateApi = `${BASE_URL}/api/swm/consumer-deactivate`;
export const swmConsumerDemandHistoryApi = `${BASE_URL}/api/swm/demand-history`;
export const swmConsumerDueApi = `${BASE_URL}/api/swm/consumer-due`;
export const swmConsumerDemandReceiptApi = `${BASE_URL}/api/swm/demand-receipt`;
export const swmConsumerPaymentApi = `${BASE_URL}/api/swm/pay-due`;
export const swmConsumerPaymentReceiptApi = `${BASE_URL}/api/swm/payment-receipt`;
export const swmConsumerBulkPaymentReceiptApi = `${BASE_URL}/api/swm/bulk-payment-receipt`;
export const swmConsumerDemandGenerateApi = `${BASE_URL}/api/swm/generate-demand`;
export const swmConsumerDailyVisitingLogApi = `${BASE_URL}/api/swm/daily-visiting-log`;

// swm report

export const swmPaymentModeListApi = `${BASE_URL}/api/swm/report/payment-mode`;
export const swmCollectionApi = `${BASE_URL}/api/swm/report/collection`;
export const swmDateWiseCollectionApi = `${BASE_URL}/api/swm/report/date-wise-collection`;
export const swmCollectionSummaryApi = `${BASE_URL}/api/swm/report/collection-summary`;
export const swmWardWiseConsumerApi = `${BASE_URL}/api/swm/report/ward-wise-consumer`;
export const swmWardWiseDCBApi = `${BASE_URL}/api/swm/report/ward-wise-dcb`;
export const swmConsumerWiseDCBApi = `${BASE_URL}/api/swm/report/consumer-dcb`;
export const swmTeamSummaryApi = `${BASE_URL}/api/swm/report/team-summary`;
export const swmDueConsumerApi = `${BASE_URL}/api/swm/report/due-consumer`;
export const swmConsumerCategoryTypeApi = `${BASE_URL}/api/swm/report/consumer-type-list`;
export const swmDateWiseVisitingApi = `${BASE_URL}/api/swm/report/date-wise-visiting`;
export const swmConsumerVisitingApi = `${BASE_URL}/api/swm/report/visiting`;
export const swmRfidListApi = `${BASE_URL}/api/swm/report/rfid-map-not-map`;
export const swmConsumerLocationListApi = `${BASE_URL}/api/swm/report/consumer-location`;
export const mapFeatureNameApi = `${BASE_URL}/api/swm/report/map-feature-name`;
export const swmCctvCameraListApi = `${BASE_URL}/api/swm/report/cctv-cameras`;
export const swmWastCollationApi = `${BASE_URL}/api/swm/report/consumer-wast-collection`;
export const swmWardWiseWastCollationApi = `${BASE_URL}/api/swm/report/ward-wise-wast-collection`;
export const swmTodayWastCollationApi = `${BASE_URL}/api/swm/report/today-wast-collection`;
export const swmDateWiseAddConsumersApi = `${BASE_URL}/api/swm/report/date-wise-consumer-add`;

// Accounts
export const cashUserListApi = `${BASE_URL}/api/account/cash-user/list`;
export const cashUserApi = `${BASE_URL}/api/account/user/cash`;
export const cashVerificationApi = `${BASE_URL}/api/account/cash/verification`;
export const chequeReconciliationListApi = `${BASE_URL}/api/account/bank/reconciliation/list`;
export const chequeReconciliationApi = `${BASE_URL}/api/account/bank/reconciliation`;
export const searchTransactionApi = `${BASE_URL}/api/account/search/transaction`;
export const updatePaymentModeApi = `${BASE_URL}/api/account/update/payment-mode`;
export const tranDeactivationApi = `${BASE_URL}/api/account/deactivate/transaction`;
export const tranDeactivationListApi = `${BASE_URL}/api/account/deactivate/transaction/list`;
export const collectionSummaryApi = `${BASE_URL}/api/account/collection/summary`;
