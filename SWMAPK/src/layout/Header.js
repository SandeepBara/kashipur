import { Text, TouchableOpacity, View } from "react-native";
import { globalStyle } from "../styles/globalStyle";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const Header = ({ title, onMenuPress, safeAreaTop, isBack = false }) => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const handleBack = () => navigation.canGoBack() && navigation.goBack();

    return (
        <View style={[globalStyle.header, { paddingTop: Math.max(insets.top, safeAreaTop || 0) + 8 }]}>
            <View style={globalStyle.headerRow}>
                
                {/* LEFT: Hamburger */}
                <TouchableOpacity 
                    style={globalStyle.menuButtonContainer} 
                    onPress={onMenuPress}
                >
                    <View style={globalStyle.menuButton}>
                      <View style={globalStyle.hamburgerIcon}>
                          <View style={globalStyle.hamburgerLine} />
                          <View style={globalStyle.hamburgerLine} />
                          <View style={globalStyle.hamburgerLine} />
                      </View>
                    </View>
                </TouchableOpacity>

                {/* CENTER: Title */}
                <View style={globalStyle.headerTitleContainer}>
                    <Text style={globalStyle.headerTitle} numberOfLines={1}>
                        {title || "BIHAR NAGAR NIGAM"}
                    </Text>
                </View>

                {/* RIGHT: Back Button (Full Right) */}
                <View style={globalStyle.rightButtonContainer}>
                    {isBack && (
                        <TouchableOpacity onPress={handleBack}>
                            <Text style={globalStyle.headerBackButtonText}>Back</Text>
                        </TouchableOpacity>
                    )}
                </View>

            </View>
        </View>
    );
}
