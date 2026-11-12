import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useState } from 'react';

import { user_profile_api } from '../../../api/endpoints';
import { getToken } from '../../../util/auth';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { globalStyle } from '../../../styles/globalStyle';
import COLORS from '../../../constants/colors';

function ProfileModal({ onClose }) {
    const navigation = useNavigation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState();


    useEffect(() => {
        const fetchToken = async () => {
            const data = await getToken();
            setToken(data);
        };
        fetchToken();
    }, []);

    useEffect(() => {
        if (token)
            fetchProfile();
    }, [token]);


    const fetchProfile = async () => {
        try {
            const response = await axios.post(
                user_profile_api,
                {},
                { headers: { Authorization: `Bearer ${token}` } },
            );
            console.log("response", response);
            if (response?.data?.status)
                setProfile(response.data?.data);
        } catch (error) {
            console.log('PROFILE API ERROR:', error);
        } finally {
            setLoading(false);
        }
    };

    const InfoRow = ({ label, value, icon }) => (
        <View style={styles.infoRow}>
            {/* We keep the icon at a fixed width so the text has a consistent center */}
            <Text style={styles.infoIcon}>{icon}</Text>

            <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || 'N/A'}</Text>
            </View>

            {/* Optional: Add an empty View with same width as icon to keep text perfectly centered in the card */}
            <View style={{ width: 32 }} />
        </View>
    );

    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <View style={globalStyle.overlay}>
                <View style={globalStyle.modalContainer}>

                    {/* Header */}
                    <View style={globalStyle.modelHeader}>
                        <Text style={globalStyle.modelHeaderTitle}>My Profile</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <View style={styles.closeCircle}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={globalStyle.content}>
                        {loading ? (
                            <View style={globalStyle.loaderContainer}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                                <Text style={globalStyle.loaderText}>Fetching details...</Text>
                            </View>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                                {/* Profile Hero Section */}
                                <View style={styles.heroSection}>
                                    <View style={styles.avatarWrapper}>
                                        <Image
                                            source={{ uri: profile?.userImg || 'https://via.placeholder.com/150' }}
                                            style={styles.avatar}
                                        />
                                    </View>
                                    <Text style={styles.userName}>{profile?.name}</Text>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{profile?.roles?.[0]?.roleName || 'User'}</Text>
                                    </View>
                                </View>

                                <View style={styles.bodyContent}>
                                    {/* Personal Information */}
                                    <View style={styles.sectionCard}>
                                        <Text style={styles.sectionTitle}>Personal Details</Text>
                                        <InfoRow icon="✉️" label="Email Address" value={profile?.email} />
                                        <InfoRow icon="📞" label="Phone Number" value={profile?.phoneNo} />
                                        <InfoRow icon="👤" label="Username" value={profile?.userName} />
                                        <InfoRow icon="🛡️" label="Guardian" value={profile?.guardianName} />
                                    </View>

                                    {/* Work Information */}
                                    <View style={styles.sectionCard}>
                                        <Text style={styles.sectionTitle}>Employment Info</Text>
                                        <InfoRow icon="🆔" label="Employee Code" value={profile?.employeeCode} />
                                        <InfoRow icon="🌐" label="User Type" value={profile?.userFor} />

                                        <View style={styles.wardContainer}>
                                            <Text style={styles.wardHeader}>📍 Ward Permissions</Text>
                                            <View style={styles.chipGroup}>
                                                {profile?.wardPermission?.map((item, index) => (
                                                    <View key={index} style={styles.chip}>
                                                        <Text style={styles.chipText}>Ward {item?.wardNo}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>

                                    {/* Account Status Card */}
                                    <View style={styles.sectionCard}>
                                        <View style={styles.statusRow}>
                                            <View>
                                                <Text style={styles.infoLabel}>Account Status</Text>
                                                <Text style={[styles.infoValue, { color: profile?.lockStatus ? '#E53935' : '#43A047' }]}>
                                                    ● {profile?.lockStatus ? 'Locked' : 'Active'}
                                                </Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={styles.infoLabel}>Member Since</Text>
                                                <Text style={styles.infoValue}>{profile?.createdAt?.split('T')[0]}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}




const styles = StyleSheet.create({
    // Header 
    closeCircle: {
        backgroundColor: '#F0F0F0',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },

    // Hero Section
    heroSection: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#fff',
    },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 3,
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    badge: {
        backgroundColor: COLORS.success + '15',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 6,
    },
    badgeText: {
        color: COLORS.success,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },

    // Body Content
    bodyContent: {
        paddingHorizontal: 16,
    },
    sectionCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#999',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center', // Vertically centers icon with text block
        justifyContent: 'center', // Horizontally centers the items in the row
        marginBottom: 16,
    },
    infoTextContainer: {
        flex: 1, // Takes up remaining space
        alignItems: 'center', // Centers text horizontally
        justifyContent: 'center', // Centers text vertically
    },
    infoIcon: {
        fontSize: 20,
        width: 32, // Fixed width helps in calculating the center
        textAlign: 'center',
    },
    infoLabel: {
        fontSize: 11,
        color: '#AAA',
        textTransform: 'uppercase',
        fontWeight: '600',
        textAlign: 'center', // Ensures text itself is centered
    },
    infoValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
        marginTop: 1,
        textAlign: 'center', // Ensures value itself is centered
    },

    // Wards
    wardContainer: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    wardHeader: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
        marginBottom: 8,
    },
    chipGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginRight: 6,
        marginBottom: 6,
    },
    chipText: {
        color: '#555',
        fontSize: 12,
        fontWeight: '600',
    },

    // Account Status Row
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
});

export default ProfileModal
