import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Dropdown from '../../../components/Dropdown';
import { ConsumerFormStyles as styles } from '../../../styles/ConsumerFormStyles';

const relationOptions = ['S/O', 'D/O', 'W/O', 'C/O'].map(r => ({
  label: r,
  value: r,
}));

const OwnerDetailsSection = ({
  owners,
  addOwner,
  removeOwner,
  handelChange,
  errors,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>OWNER DETAILS</Text>
      </View>

      <View style={styles.sectionContent}>
        {owners.map((owner, index) => (
          <View key={owner.index} style={styles.ownerCard}>
            <View style={styles.ownerCardHeader}>
              <Text style={styles.ownerCardTitle}>SL {index + 1}</Text>
              {owners.length > 1 && (
                <TouchableOpacity
                  style={styles.removeOwnerButton}
                  onPress={() => removeOwner(owner.index)}
                >
                  <Text style={styles.removeOwnerButtonText}>-</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>
              Owner Name<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors[`ownerDtl.${index}.ownerName`] && styles.inputError,
              ]}
              value={owner.ownerName}
              onChangeText={(value) =>handelChange(owner.index, 'ownerName', value)}
              placeholder=""
            />
            {errors[`ownerDtl.${index}.ownerName`] && (
              <Text style={styles.fieldError}>
                {errors[`ownerDtl.${index}.ownerName`]}
              </Text>
            )}

            <Text style={styles.label}>Guardian Name</Text>
            <TextInput
              style={[
                styles.input,
                errors[`ownerDtl.${index}.guardianName`] && styles.inputError,
              ]}
              value={owner.guardianName}
              onChangeText={(value) =>handelChange(owner.index, 'guardianName', value)}
              placeholder=""
            />
            {errors[`ownerDtl.${index}.guardianName`] && (
              <Text style={styles.fieldError}>
                {errors[`ownerDtl.${index}.guardianName`]}
              </Text>
            )}
            <Dropdown
              label="Relation"
              placeholder="--Select--"
              value={owner.relationType}
              onValueChange={(value) =>handelChange(owner.index, 'relationType', value)}
              options={relationOptions}
              error={errors[`ownerDtl.${index}.relationType`]}
            />

            <Text style={styles.label}>
              Mobile No.<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors[`ownerDtl.${index}.mobileNo`] && styles.inputError,
              ]}
              value={owner.mobileNo}
              onChangeText={(value) =>handelChange(owner.index, 'mobileNo', value)}
              placeholder=""
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors[`ownerDtl.${index}.mobileNo`] && (
              <Text style={styles.fieldError}>
                {errors[`ownerDtl.${index}.mobileNo`]}
              </Text>
            )}

            <Text style={styles.label}>Email ID</Text>
            <TextInput
              style={[
                styles.input,
                errors[`ownerDtl.${index}.email`] && styles.inputError,
              ]}
              value={owner.email}
              onChangeText={(value) =>handelChange(owner.index, 'email', value)}
              placeholder=""
              keyboardType="email-address"
            />
            {errors[`ownerDtl.${index}.email`] && (
              <Text style={styles.fieldError}>
                {errors[`ownerDtl.${index}.email`]}
              </Text>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addOwnerButton} onPress={addOwner}>
          <Text style={styles.addOwnerButtonText}>+ Add Owner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OwnerDetailsSection;
