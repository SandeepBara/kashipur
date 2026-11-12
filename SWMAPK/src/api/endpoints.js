import { WASTE_MANAGEMENT_BACKEND_API,WEB_URL } from '@env';


export const BASE_URL = WASTE_MANAGEMENT_BACKEND_API.replace(/\/$/, '');

export const LOGIN_API = `${BASE_URL}/api/login`;
export const logoutApi = `${BASE_URL}/api/logout`;
export const changePassApi = `${BASE_URL}/api/login-user-change-pass`;
export const FORGOT_PASSWORD_API = `${BASE_URL}/api/forgot-password`;
export const heartBeatApi = `${BASE_URL}/api/heartbeat`;
export const UlbInfoApi = (id) => `${BASE_URL}/api/ulb/show/${id}`; 



export const wardListApi = `${BASE_URL}/api/ward`;

export const swmMasterDataApi = `${BASE_URL}/api/swm/get-master-data`;
export const swmSubCategoryListApi = `${BASE_URL}/api/swm/master/sub-category-list`;
export const swmReviewTaxApi = `${BASE_URL}/api/swm/review-tax`;
export const validateHoldingNoApi = `${BASE_URL}/api/swm/validate-holding`;
export const swmAddConsumerApi = `${BASE_URL}/api/swm/consumer-add`;
export const search_consumer_api = `${BASE_URL}/api/swm/consumer-search`;
export const details_consumer_api = `${BASE_URL}/api/swm/consumer-dtl`;
export const demand_history_api = `${BASE_URL}/api/swm/demand-history`;
export const consumer_due_api = `${BASE_URL}/api/swm/consumer-due`;
export const pay_due_api = `${BASE_URL}/api/swm/pay-due`;
export const receipt_api = `${BASE_URL}/api/swm/payment-receipt`;
export const user_profile_api = `${BASE_URL}/api/user-profile`;
export const rfid_scan_api = `${BASE_URL}/api/swm/daily-rfid-scan`;
export const validateConsumerApi = `${BASE_URL}/api/swm/validate-consumer`;
export const rfid_install_api = `${BASE_URL}/api/swm/install-rfid`;
export const paymentReceiptUrl =
  `${BASE_URL}/api/swm/payment-receipt`;

export const webPaymentUrl =(id) => `${WEB_URL}/swm/payment-receipt/${id}`;
export const webDemandReceiptUrl=(id)=>`${WEB_URL}/swm/demand-receipt/${id}`;

export const check_holding_no_api = `${BASE_URL}/api/swm/validate-holding`;

export const collection_report_api = `${BASE_URL}/api/swm/report/collection`;

export const feedback_api = `${BASE_URL}/api/swm/feedback/consumer-add`;
export const feedbackMasterListApi = `${BASE_URL}/api/swm/feedback/mstr-list`;
















