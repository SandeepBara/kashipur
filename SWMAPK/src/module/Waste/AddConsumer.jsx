import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Layout from '../../layout/Layout'; // Your newly created Layout
import { ConsumerFormStyles as styles } from '../../styles/ConsumerFormStyles';
import {
  swmAddConsumerApi,
  swmMasterDataApi,
  swmReviewTaxApi,
  swmSubCategoryListApi,
  validateHoldingNoApi,
} from '../../api/endpoints';
import { getToken } from '../../util/auth';
import AppHeader from '../../components/AppHeader';

// Sub-components
import ConnectionDetailSection from './components/ConnectionDetailSection';
import OwnerDetailsSection from './components/OwnerDetailsSection';
import FormCard from '../../components/FormCard';
import SuccessModal from '../../components/SuccessModal';

import LocationManager from '../../components/LocationManager';

const AddConsumer = () => {
  const navigation = useNavigation();
  const [token, setToken] = useState(null);

  // Optimized grouped state
  const [formData, setFormData] = useState({
    wardMstrId: '',
    holdingNo: '',
    houseNo: '',
    address: '',
    pinCode: '',
    landmark: '',
    categoryTypeMasterId: '',
    subCategoryTypeMasterId: '',
    dateOfEffective: '',
    hasCompostingMachineProvision: false,
    ownerDtl: [
      {
        index: 1,
        ownerName: '',
        guardianName: '',
        relationType: '',
        mobileNo: '',
        email: '',
      },
    ],
  });

  const [ui, setUi] = useState({
    masterData: null,
    subCategoryList: [],
    rates: { ratePerMonth: 0 },
    loading: { master: true, rate: false, subCat: false, submit: false },
    errors: {},
    isSuccessModal: false,
    submitRes: null,
  });

  // Fetch Master Data on Mount
  useEffect(() => {
    (async () => {
      const userToken = await getToken();
      setToken(userToken);
      try {
        const res = await axios.post(
          swmMasterDataApi,
          {},
          {
            headers: { Authorization: `Bearer ${userToken}` },
          },
        );
        if (res.data?.status)
          setUi(prev => ({ ...prev, masterData: res.data.data }));
      } finally {
        setUi(prev => ({
          ...prev,
          loading: { ...prev.loading, master: false },
        }));
      }
    })();
  }, []);

  // Debounced Rate Calculation
  useEffect(() => {
    if (
      formData.categoryTypeMasterId &&
      formData.subCategoryTypeMasterId &&
      token
    ) {
      const timer = setTimeout(async () => {
        setUi(p => ({ ...p, loading: { ...p.loading, rate: true } }));
        try {
          const res = await axios.post(swmReviewTaxApi, formData, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?.status) setUi(p => ({ ...p, rates: res.data.data }));
        } finally {
          setUi(p => ({ ...p, loading: { ...p.loading, rate: false } }));
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [
    formData.categoryTypeMasterId,
    formData.subCategoryTypeMasterId,
    formData.hasCompostingMachineProvision,
  ]);

  const handleLocationSelect = location => {
    setFormData(prev => ({
      ...prev,
      ...location,
    }));
  };

  const handleMainChange = useCallback(
    (name, value) => {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...(name === 'categoryTypeMasterId'
          ? { subCategoryTypeMasterId: '' }
          : {}),
      }));

      if (name === 'categoryTypeMasterId') {
        fetchSubCats(value);
      }
    },
    [token],
  );
  const fetchSubCats = async catId => {
    setUi(p => ({ ...p, loading: { ...p.loading, subCat: true } }));
    try {
      const res = await axios.post(
        swmSubCategoryListApi,
        { categoryTypeMasterId: catId, all: 'all' },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUi(p => ({ ...p, subCategoryList: res.data.data || [] }));
    } finally {
      setUi(p => ({ ...p, loading: { ...p.loading, subCat: false } }));
    }
  };

  // Memoized Field Config

  const submitForm = async () => {
    // ── Validation ────────────────────────────────────────────────────────────
    const validationErrors = {};

    if (!formData.latitude || !formData.longitude) {
      validationErrors.location = 'Please capture your location first.';
    }
    if (!formData.categoryTypeMasterId) {
      validationErrors.categoryTypeMasterId = 'Consumer Category is required.';
    }
    if (!formData.subCategoryTypeMasterId) {
      validationErrors.subCategoryTypeMasterId = 'Range Type is required.';
    }
    if (!formData.dateOfEffective) {
      validationErrors.dateOfEffective = 'Date of Effect is required.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setUi(p => ({ ...p, errors: validationErrors }));
      Alert.alert('Required Fields', 'Please fill all mandatory fields.');
      return; // ← stop submit
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    setUi(p => ({ ...p, loading: { ...p.loading, submit: true } }));
    try {
      const res = await axios.post(swmAddConsumerApi, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Submit Response:', res);
      if (res.data?.status) {
        setUi(p => ({ ...p, submitRes: res.data.data, isSuccessModal: true }));
      } else {
        setUi(p => ({ ...p, errors: res.data?.errors || {} }));
        Alert.alert('Form Error', 'Please verify your entries.');
      }
    } finally {
      setUi(p => ({ ...p, loading: { ...p.loading, submit: false } }));
    }
  };

  const areaFields = useMemo(
    () => [
      {
        name: 'categoryTypeMasterId',
        label: 'Consumer Category',
        required: true,
        type: 'select',
        value: formData.categoryTypeMasterId,
        error: ui.errors.categoryTypeMasterId,
        options: ui.masterData?.categoryType?.map(i => ({
          label: i.categoryType,
          value: i.id,
        })),
      },
      {
        name: 'subCategoryTypeMasterId',
        label: 'Range Type',
        required: true,
        type: 'select',
        value: formData.subCategoryTypeMasterId,
        error: ui.errors.subCategoryTypeMasterId,
        options: ui.subCategoryList?.map(i => ({
          label: i.subCategoryType,
          value: i.id,
        })),
      },
      {
        name: 'dateOfEffective',
        label: 'Date Of Effect',
        required: true,
        type: 'month',
        value: formData.dateOfEffective,
        error: ui.errors.dateOfEffective,
      },
      {
        name: 'hasCompostingMachineProvision',
        label: 'Own Composting?',
        type: 'radio',
        value: formData.hasCompostingMachineProvision,
        error: ui.errors.hasCompostingMachineProvision,
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
      },
    ],
    [ui.masterData, ui.subCategoryList, formData, ui.errors],
  );

  if (ui.loading.master)
    return (
      <ActivityIndicator
        size="large"
        style={{ marginTop: 50 }}
        color="#22A45D"
      />
    );console.log("fordata",formData);

  return (
    <Layout title="Add Consumer" isBack={true}>
      <View>
        {/* ====================== LOCATION ====================== */}
        <LocationManager
          onLocationSelect={handleLocationSelect}
          isShow={true}
        />

        {ui.errors.location && (
          <Text
            style={{
              color: '#e74c3c',
              fontSize: 13,
              marginBottom: 10,
              marginLeft: 4,
            }}
          >
            ⚠️ {ui.errors.location}
          </Text>
        )}

        <ConnectionDetailSection
          formData={formData}
          handelChange={handleMainChange}
          masterData={ui.masterData}
          errors={ui.errors}
        />

        <OwnerDetailsSection
          owners={formData.ownerDtl}
          handelChange={(idx, fld, val) =>
            setFormData(p => ({
              ...p,
              ownerDtl: p.ownerDtl.map(item =>
                item.index === idx ? { ...item, [fld]: val } : item,
              ),
            }))
          }
          addOwner={() =>
            setFormData(p => ({
              ...p,
              ownerDtl: [...p.ownerDtl, { index: Date.now(), ownerName: '' }],
            }))
          }
          removeOwner={idx =>
            setFormData(p => ({
              ...p,
              ownerDtl: p.ownerDtl.filter(i => i.index !== idx),
            }))
          }
          errors={ui.errors}
        />

        <FormCard
          title="Area Details"
          formFields={areaFields}
          onChange={handleMainChange}
        />

        {/* Rate Section */}

        {/* Rate Display */}
        <View style={{ padding: 15, alignItems: 'center' }}>
          {ui.loading.rate ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={{ marginLeft: 8, color: '#2563eb' }}>
                Calculating rate...
              </Text>
            </View>
          ) : (
            <Text
              style={{ color: '#16a34a', fontWeight: 'bold', fontSize: 16 }}
            >
              {/* comment this temporary */}
              {/* Monthly Amount: ₹{ui.rates?.ratePerMonth || 0} */}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, ui.loading.submit && { opacity: 0.7 }]}
          onPress={submitForm}
          disabled={ui.loading.submit}
        >
          {ui.loading.submit ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Application</Text>
          )}
        </TouchableOpacity>
      </View>

      <SuccessModal
        isOpen={ui.isSuccessModal}
        onClose={() => setUi(p => ({ ...p, isSuccessModal: false }))}
        title="Application Submitted"
        message={`Application No: ${ui.submitRes?.consumerNo}`}
        onConfirm={() =>
          navigation.navigate('InstallRFID', {
            id: ui.submitRes?.consumerId,
            consumerNo: ui.submitRes?.consumerNo,
          })
        }
      />
    </Layout>
  );
};

export default AddConsumer;
