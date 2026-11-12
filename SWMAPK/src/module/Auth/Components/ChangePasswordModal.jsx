import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, ScrollView } from "react-native";
import { getToken } from '../../../util/auth';
import { globalStyle } from '../../../styles/globalStyle';
import COLORS from '../../../constants/colors';
import axios from "axios";
import { changePassApi } from "../../../api/endpoints";
import { useNavigation } from "@react-navigation/native";

function ChangePasswordModal({ onClose }) {
    const navigation = useNavigation();
    const [token, setToken] = useState();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [secure, setSecure] = useState(true);
    const [loading, setLoading] = useState(true);

    // Password Requirement States for UI feedback
    const requirements = [
        { label: '6+ Chars', met: newPassword.length >= 6 },
        { label: 'A-Z', met: /[A-Z]/.test(newPassword) },
        { label: 'a-z', met: /[a-z]/.test(newPassword) },
        { label: '0-9', met: /\d/.test(newPassword) },
        { label: '!@#$', met: /[!@#$]/.test(newPassword) },
    ];

    const strength = requirements.filter(r => r.met).length;
    const strengthColor = strength <= 2 ? '#FF4D4D' : strength <= 4 ? '#FFD700' : '#4CAF50';

    useEffect(() => {
        const fetchToken = async () => {
            const data = await getToken();
            setToken(data);
            setLoading(false); // Ensure loading stops so modal content shows
        };
        fetchToken();
    }, []);

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (strength < 5) {
            Alert.alert('Weak Password', 'Please fulfill all security requirements');
            return;
        }

        try {
            const payload = {
                oldPassword: currentPassword,
                newPassword: newPassword,
                conformPassword: confirmPassword,
            };

            const response = await axios.post(changePassApi, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data?.status) {
                Alert.alert('Success', 'Password updated successfully', [{ text: 'OK', onPress: onClose }]);
                navigation.navigate("Login");
            } else {
                Alert.alert('Error', response.data?.message || 'Update failed');
            }
        } catch (error) {
            Alert.alert('Error', error?.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <Modal transparent animationType="slide" onRequestClose={onClose}>
            <View style={globalStyle.overlay}>
                <View style={[globalStyle.modalContainer, { maxHeight: '90%' }]}>
                    
                    {/* Header */}
                    <View style={globalStyle.modelHeader}>
                        <Text style={globalStyle.modelHeaderTitle}>Security Settings</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {loading ? (
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        ) : (
                            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                                
                                <Text style={styles.title}>Change Password</Text>
                                <Text style={styles.subtitle}>Keep your account secure with a strong password.</Text>

                                {/* 🔐 Password Strength Progress Bar */}
                                <View style={styles.strengthWrapper}>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${(strength / 5) * 100}%`, backgroundColor: strengthColor }]} />
                                    </View>
                                    <View style={styles.requirementRow}>
                                        {requirements.map((req, i) => (
                                            <Text key={i} style={[styles.reqTag, req.met && styles.reqMet]}>
                                                {req.met ? '✓ ' : '○ '}{req.label}
                                            </Text>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Current Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        secureTextEntry={secure}
                                        placeholder="••••••••"
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                    />

                                    <Text style={styles.label}>New Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        secureTextEntry={secure}
                                        placeholder="Enter strong password"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                    />

                                    <Text style={styles.label}>Confirm New Password</Text>
                                    <TextInput
                                        style={[styles.input, confirmPassword && newPassword !== confirmPassword ? styles.inputError : null]}
                                        secureTextEntry={secure}
                                        placeholder="Repeat new password"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                </View>

                                <TouchableOpacity onPress={() => setSecure(!secure)}>
                                    <Text style={styles.toggleText}>{secure ? '👁 Show Passwords' : '🙈 Hide Passwords'}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, (strength < 5 || !confirmPassword) && styles.disabled]}
                                    disabled={strength < 5 || !confirmPassword}
                                    onPress={handleChangePassword}
                                >
                                    <Text style={styles.buttonText}>Update Password</Text>
                                </TouchableOpacity>
                            </KeyboardAvoidingView>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    scrollContent: { padding: 20 },
    closeCircle: { backgroundColor: '#F0F0F0', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    closeBtnText: { color: '#666', fontWeight: 'bold' },
    title: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 5 },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 25 },
    
    // Progress Bar Styling
    strengthWrapper: { marginBottom: 25, backgroundColor: '#FFF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
    progressBarBg: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
    progressBarFill: { height: '100%', transition: 'width 0.3s' },
    requirementRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    reqTag: { fontSize: 10, color: '#999', fontWeight: '600' },
    reqMet: { color: '#4CAF50' },

    inputGroup: { gap: 15 },
    label: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: -10 },
    input: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#DDE1E6',
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
        color: '#1A1A1A'
    },
    inputError: { borderColor: '#FF4D4D' },
    button: {
        backgroundColor: COLORS.primary || '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        elevation: 2,
    },
    disabled: { backgroundColor: '#D1D1D1', elevation: 0 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    toggleText: { textAlign: 'center', marginTop: 15, color: '#666', fontSize: 13, fontWeight: '600' },
});

export default ChangePasswordModal;