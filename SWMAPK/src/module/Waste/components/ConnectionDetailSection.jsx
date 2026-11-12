import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput } from 'react-native';
import Dropdown from '../../../components/Dropdown';
import { ConsumerFormStyles as styles } from '../../../styles/ConsumerFormStyles';
import { getUserDetails, getToken } from '../../../util/auth';
import { UlbInfoApi } from '../../../api/endpoints';
import axios from 'axios';

const Label = ({ text, required }) => (
  <Text style={styles.label}>
    {text} {required && <Text style={{ color: 'red' }}>*</Text>}
  </Text>
);

const ConnectionDetailSection = ({
  masterData,
  formData,
  handelChange,
  errors,
  validateHolding = () => {},
}) => {
  const [pinCodeFetched, setPinCodeFetched] = useState(false);

  useEffect(() => {
    if (pinCodeFetched) return;

    const fetchPinCode = async () => {
      try {
        const user = await getUserDetails();
        const token = await getToken();

        const ulbId = user?.ulbId;
        if (!ulbId) return;

        const res = await axios.post(
          UlbInfoApi(ulbId),
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.data?.pinCode) {
          const fetchedPinCode = String(res.data.data.pinCode);
          handelChange('pinCode', fetchedPinCode);
          if (res.data.data.policeStation) {
            handelChange('ps', String(res.data.data.policeStation));
          }
        }
      } catch (err) {
        console.error('❌ Pin code fetch ERROR:', err);
      } finally {
        setPinCodeFetched(true);
      }
    };

    fetchPinCode();
  }, [pinCodeFetched]); // 👈 Removed handelChange from dependencies to stop re-render loops

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>CONNECTION DETAIL</Text>
      </View>

      <View style={styles.sectionContent}>
        <Dropdown
          label="Ward No"
          placeholder="--Select--"
          value={formData?.wardMstrId || ''}
          onValueChange={v => handelChange('wardMstrId', v)}
          options={masterData?.wardList?.map(item => ({
            label: item.wardNo,
            value: item.id,
          }))}
          required={true}
          error={errors?.wardMstrId}
        />

        <Label text="Holding No" />
        <TextInput
          style={[styles.input, errors?.holdingNo && styles.inputError]}
          value={formData?.holdingNo || ''}
          onChangeText={v => handelChange('holdingNo', v)}
          onBlur={validateHolding}
          placeholder=""
        />
        {errors?.holdingNo && (
          <Text style={styles.fieldError}>{errors.holdingNo}</Text>
        )}

        <Label text="House/Flat No" />
        <TextInput
          style={[styles.input, errors?.houseNo && styles.inputError]}
          value={formData?.houseNo || ''}
          onChangeText={v => handelChange('houseNo', v)}
          placeholder=""
        />
        {errors?.houseNo && (
          <Text style={styles.fieldError}>{errors.houseNo}</Text>
        )}

        <Label text="Address" required />
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            errors?.address && styles.inputError,
          ]}
          value={formData?.address || ''}
          onChangeText={v => handelChange('address', v)}
          placeholder=""
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        {errors?.address && (
          <Text style={styles.fieldError}>{errors.address}</Text>
        )}

        <Label text="Landmark" />
        <TextInput
          style={styles.input}
          value={formData?.landmark || ''}
          onChangeText={v => handelChange('landmark', v)}
          placeholder=""
        />
        {errors?.landmark && (
          <Text style={styles.fieldError}>{errors.landmark}</Text>
        )}

        <Label text="Police Station" />
        <TextInput
          style={styles.input}
          value={formData?.ps || ''}
          onChangeText={v => handelChange('ps', v)}
          placeholder=""
          // editable={false}
        />
        {errors?.ps && <Text style={styles.fieldError}>{errors.ps}</Text>}

        <Label text="Street Name" />
        <TextInput
          style={styles.input}
          value={formData?.streetName || ''}
          onChangeText={v => handelChange('streetName', v)}
          placeholder=""
        />
        {errors?.streetName && (
          <Text style={styles.fieldError}>{errors.streetName}</Text>
        )}

        <Label text="Locality" />
        <TextInput
          style={styles.input}
          value={formData?.locality || ''}
          onChangeText={v => handelChange('locality', v)}
          placeholder=""
        />
        {errors?.locality && (
          <Text style={styles.fieldError}>{errors.locality}</Text>
        )}

        <Label text="Pin Code" required />
        <TextInput
          style={[styles.input, errors?.pinCode && styles.inputError]}
          value={formData?.pinCode || ''}
          onChangeText={v => handelChange('pinCode', v)}
          placeholder=""
          keyboardType="number-pad"
          maxLength={6}
          // editable={false}
        />
        {errors?.pinCode && (
          <Text style={styles.fieldError}>{errors.pinCode}</Text>
        )}
      </View>
    </View>
  );
};

export default ConnectionDetailSection;