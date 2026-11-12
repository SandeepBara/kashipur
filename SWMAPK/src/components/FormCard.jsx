import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MonthPicker from 'react-native-month-year-picker'; // New Import
import { ConsumerFormStyles as styles } from '../styles/ConsumerFormStyles';
import Dropdown from './Dropdown';

const FormCard = ({
  title,
  formFields,
  error = {},
  onChange,
  loading = false,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(null);

  // --- Handle Standard Date (YYYY-MM-DD) ---
  const handleDateChange = (event, selectedDate, fieldName) => {
    if (Platform.OS === 'android') setShowDatePicker(null);

    if (selectedDate && event.type !== 'dismissed') {
      const formattedValue = selectedDate.toISOString().split('T')[0];
      onChange(fieldName, formattedValue);
    } else {
      setShowDatePicker(null);
    }
  };

  // --- Handle Month Only (YYYY-MM) ---
  const handleMonthChange = useCallback((event, selectedDate, fieldName) => {
    // Hide picker
    setShowMonthPicker(null);

    if (event === 'dateSetAction' && selectedDate) {
      const formattedValue = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
      onChange(fieldName, formattedValue);
    }
  }, [onChange]);

  return (
    <View style={styles.section}>
      {title && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      )}

      <View style={styles.sectionContent}>
        {formFields.map((field) => {
          const {
            name, label, subOnChange, value, required,
            type = "text", options = [], isDisabled, placeholder,
            onBlur, isHidden = false,
          } = field;

          if (isHidden) return null;
          const fieldError = field.error || error[name];

          return (
            <View key={name} style={{ marginBottom: 15 }}>
              {type !== "select" && (
                <Text style={styles.label}>
                  {label} {required && <Text style={styles.required}>*</Text>}
                </Text>
              )}

              {/* SELECT TYPE */}
              {type === "select" ? (
                <View>
                  {loading || field?.loading ? (
                    <View style={styles.loaderRow}>
                      <ActivityIndicator size="small" color="#2563eb" />
                      <Text style={styles.loadingText}>Loading options...</Text>
                    </View>
                  ) : (
                    <Dropdown
                      label={label}
                      placeholder="--Select--"
                      value={value}
                      onValueChange={(val) => onChange(name, val)}
                      subOnChange={subOnChange}
                      options={options}
                      required={required}
                    />
                  )}
                </View>
              ) : 

              /* MONTH TYPE ONLY (Year and Month strictly) */
              type === "month" ? (
                <View>
                  <TouchableOpacity
                    style={[styles.input, fieldError && styles.inputError, isDisabled && styles.disabledInput]}
                    onPress={() => !isDisabled && setShowMonthPicker(name)}
                  >
                    <Text style={{ color: value ? '#000' : '#94a3b8' }}>
                      {value || "YYYY-MM"}
                    </Text>
                  </TouchableOpacity>

                  {showMonthPicker === name && (
                    <MonthPicker
                      onChange={(ev, date) => handleMonthChange(ev, date, name)}
                      value={value ? new Date(value + "-01") : new Date()}
                      // Adjust min/max dates as per your requirements
                      minimumDate={new Date(2000, 0)}
                      maximumDate={new Date(2030, 11)}
                    />
                  )}
                </View>
              ) :

              /* DATE TYPE (Full Calendar) */
              type === "date" ? (
                <View>
                  <TouchableOpacity
                    style={[styles.input, fieldError && styles.inputError, isDisabled && styles.disabledInput]}
                    onPress={() => !isDisabled && setShowDatePicker(name)}
                  >
                    <Text style={{ color: value ? '#000' : '#94a3b8' }}>
                      {value || "YYYY-MM-DD"}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker === name && (
                    <DateTimePicker
                      value={value ? new Date(value) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(ev, date) => handleDateChange(ev, date, name)}
                    />
                  )}
                </View>
              ) :

              /* RADIO & STANDARD TEXT INPUT (Unchanged) */
              type === "radio" ? (
                <View style={styles.radioGroup}>
                  {options.map((opt, i) => (
                    <TouchableOpacity
                      key={i}
                      disabled={isDisabled}
                      onPress={() => {
                        onChange(name, opt.value);
                        if (subOnChange) subOnChange(opt.value);
                      }}
                      style={styles.radioItem}
                    >
                      <View style={[styles.radioOuter, value == opt.value && styles.radioOuterActive]}>
                        {value == opt.value && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.radioLabel}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={[
                    styles.input,
                    type === "textarea" && styles.textarea,
                    fieldError && styles.inputError,
                    isDisabled && styles.disabledInput
                  ]}
                  multiline={type === "textarea"}
                  numberOfLines={type === "textarea" ? 4 : 1}
                  placeholder={placeholder || `Enter ${label}`}
                  placeholderTextColor="#94a3b8"
                  value={String(value || "")}
                  editable={!isDisabled}
                  onBlur={onBlur}
                  keyboardType={type === "number" ? "numeric" : "default"}
                  onChangeText={(text) => {
                    if (field.charRegex && text.length > (value?.length || 0)) {
                      if (!field.charRegex.test(text.slice(-1))) return;
                    }
                    if (field.regex && text !== "" && !field.regex.test(text)) return;
                    onChange(name, text);
                    if (subOnChange) subOnChange(text);
                  }}
                />
              )}

              {fieldError && <Text style={styles.fieldError}>{fieldError}</Text>}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default FormCard;