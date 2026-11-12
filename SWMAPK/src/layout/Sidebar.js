import { Alert, Text, TouchableOpacity, View } from "react-native";
import { globalStyle } from "../styles/globalStyle";
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from "react";
import ProfileModal from "../module/Auth/Components/ProfileModal";
import ChangePasswordModal from"../module/Auth/Components/ChangePasswordModal";
import axios from "axios";
import { logoutApi } from "../api/endpoints";
import { getToken, removeAuthToken } from "../util/auth";

export const Sidebar = ({ visible, onClose, title }) => {
    const navigation = useNavigation();
    const [token, setToken] = useState();
    const [OpenProfileModal,setOpenProfileModal] = useState(false);
    const [openChangePassword,setOpenChangePassword] = useState(false);
    const [loading,setLoading] = useState(false);

    useEffect(() => {
        const fetchToken = async () => {
            const data = await getToken();
            setToken(data);
        };
        fetchToken();
    }, []);
    const handelLogOut = async()=>{
        setLoading(true);
        try{
            const response = await axios.post(logoutApi,{},{
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (response?.data?.status) {                
                onClose();
                removeAuthToken();
                navigation.replace('Login');
                Alert.alert('Success', 'User Logout Successfully!');
            }
        }catch(error){
            console.error("Logout error:", error);
            Alert.alert("Error","Error logging out");
        }finally{
            setLoading(true);
        }
    }
  if (!visible) return null;
  return (
    <>
        <TouchableOpacity
            style={globalStyle.menuOverlay}
            activeOpacity={1}
            onPress={onClose}
            >
            <View style={globalStyle.sidebarMenu}>
                <View style={globalStyle.sidebarHeader}>
                <Text style={globalStyle.sidebarTitle}>{title||"BIHAR NAGAR NIGAM"}</Text>
                <TouchableOpacity onPress={onClose}>
                    <Text style={globalStyle.closeIcon}>✕</Text>
                </TouchableOpacity>
                </View>

                <View style={globalStyle.menuDivider} />

                <TouchableOpacity
                style={globalStyle.sidebarMenuItem}
                onPress={() => {
                    onClose();
                    navigation.navigate('Dashboard');
                }}
                >
                <Text style={globalStyle.menuItemIcon}>🏠</Text>
                <Text style={globalStyle.menuItemText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={globalStyle.sidebarMenuItem}
                onPress={() => {
                    onClose();
                    navigation.navigate('Search');
                }}
                >
                <Text style={globalStyle.menuItemIcon}>🔍</Text>
                <Text style={globalStyle.menuItemText}>Search Consumer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={globalStyle.sidebarMenuItem}
                onPress={() => {
                    onClose();
                    navigation.navigate('AddConsumer');
                }}
                >
                <Text style={globalStyle.menuItemIcon}>➕</Text>
                <Text style={globalStyle.menuItemText}>Add Consumer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={globalStyle.sidebarMenuItem}
                onPress={() => {
                    setOpenProfileModal(true);
                    // Navigate to change password screen
                }}
                >
                <Text style={globalStyle.menuItemIcon}>👤</Text>
                <Text style={globalStyle.menuItemText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={globalStyle.sidebarMenuItem}
                onPress={() => {
                    setOpenChangePassword(true);
                }}
                >
                <Text style={globalStyle.menuItemIcon}>🔒</Text>
                <Text style={globalStyle.menuItemText}>Change Password</Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={globalStyle.sidebarMenuItem}
                onPress={() => {
                    handelLogOut();
                }}
                >
                <Text style={globalStyle.menuItemIcon}>⏻</Text>
                <Text style={globalStyle.menuItemText}>Logout</Text>
                </TouchableOpacity>
            </View>
            {OpenProfileModal &&(
                <ProfileModal 
                onClose={()=>{
                    setOpenProfileModal(false)
                }} 
                />
            )}
            {openChangePassword && (
                <ChangePasswordModal onClose={()=>{
                    onClose();
                    setOpenChangePassword(false);
                }} />
            )}
        </TouchableOpacity>
    </>
  );
};