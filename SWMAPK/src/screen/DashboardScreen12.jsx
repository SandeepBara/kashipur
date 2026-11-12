import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { getUserDetails } from '../util/auth';
import axios from 'axios';
import { UlbInfoApi } from '../api/endpoints';

function DashboardScreen1({ navigation }) {
  const safeAreaInsets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Home');
  const [menuVisible, setMenuVisible] = useState(false);
  const [ulbData, setUlbData] = useState({});

  const fetchUlbDetails = async () => {
    try {
      const user = await getUserDetails();
      const ulbId = user?.ulbId;
      console.log('user', user);

      if (!ulbId) return;

      const response = await axios.post(UlbInfoApi(ulbId));
      setUlbData(response?.data?.data);
    } catch (error) {
      console.log('❌ ULB API Error:', error?.response || error);
    }
  };

  useEffect(() => {
    fetchUlbDetails();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Decorative Icons */}
        <View style={[styles.header, { paddingTop: safeAreaInsets.top + 15 }]}>
          <View style={styles.headerContent}>
            <Text style={styles.phoenixIcon}></Text>
            <Text style={styles.headerTitle}>{ulbData?.ulbName ||"BIHAR NAGAR NIGAM"}</Text>
            <Text style={styles.phoenixIcon}></Text>
          </View>

          {/* Menu Button */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(!menuVisible)}
          >
            <View style={styles.hamburgerIcon}>
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sidebar Menu Dropdown */}
        {menuVisible && (
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.sidebarMenu}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>{ulbData?.ulbName ||"BIHAR NAGAR NIGAM"}</Text>
                <TouchableOpacity onPress={() => setMenuVisible(false)}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.sidebarMenuItem}
                onPress={() => {
                  setMenuVisible(false);
                  // Navigate to home or dashboard
                }}
              >
                <Text style={styles.menuItemIcon}>🏠</Text>
                <Text style={styles.menuItemText}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarMenuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('Search');
                }}
              >
                <Text style={styles.menuItemIcon}>🔍</Text>
                <Text style={styles.menuItemText}>Search Consumer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarMenuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('AddConsumer');
                }}
              >
                <Text style={styles.menuItemIcon}>➕</Text>
                <Text style={styles.menuItemText}>Add Consumer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarMenuItem}
                onPress={() => {
                  setMenuVisible(false);
                  // Navigate to change password screen
                }}
              >
                <Text style={styles.menuItemIcon}>🔒</Text>
                <Text style={styles.menuItemText}>Change Password</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarMenuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.replace('Login');
                }}
              >
                <Text style={styles.menuItemIcon}>⏻</Text>
                <Text style={styles.menuItemText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Dark Banner with Grid Items */}
        <View style={styles.bannerSection}>
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigation.navigate('AddConsumer')}
            >
              <Text style={styles.gridItemText}>Add Consumer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.gridItemText}>Search Consumer</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigation.navigate('PayUsageCharge')}
            >
              <Text style={styles.gridItemText}>Pay Usage Charge</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigation.navigate('RePrintReceipt')}
            >
              <Text style={styles.gridItemText}>Re Print Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigation.navigate('PrintDemand')}
            >
              <Text style={styles.gridItemText}>Print Demand</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigation.navigate('CollectionSummary')}
            >
              <Text style={styles.gridItemText}>Collection Summary</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigation.navigate('ScanRFID')}
            >
              <Text style={styles.gridItemText}>Scan RFID</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Illustration Section */}
        <View style={styles.illustrationSection}>
          <View style={styles.illustrationPlaceholder}>
            {/* Business People Illustration */}
            <View style={styles.businessPeopleContainer}>
              <View style={styles.personBlock}>
                <Text style={styles.personIcon}>👨‍💼</Text>
                <View style={[styles.chartBar, { height: 80 }]} />
              </View>
              <View style={styles.personBlock}>
                <Text style={styles.personIcon}>👩‍💼</Text>
                <View style={[styles.chartBar, { height: 100 }]} />
              </View>
              <View style={styles.personBlock}>
                <Text style={styles.personIcon}>👨‍💻</Text>
                <View style={[styles.chartBar, { height: 70 }]} />
              </View>
              <View style={styles.personBlock}>
                <Text style={styles.personIcon}>👥</Text>
                <View style={[styles.chartBar, { height: 90 }]} />
              </View>
            </View>
            {/* Gears/Settings Icons */}
            <View style={styles.gearsContainer}>
              <Text style={styles.gearIcon}>⚙️</Text>
              <Text style={[styles.gearIcon, styles.gearIconSmall]}>⚙️</Text>
              <Text style={styles.gearIcon}>⚙️</Text>
            </View>
          </View>
        </View>

        {/* Recommended Section */}
        <View style={styles.recommendedSection}>
          <View style={styles.recommendedHeader}>
            <Text style={styles.recommendedTitle}>Recommended</Text>
            <TouchableOpacity>
              <Text style={styles.menuDotsIcon}>☰</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedCards}
          >
            <View style={styles.recommendedCard}>
              <View style={styles.cardImagePlaceholder}>
                <Text style={styles.cardEmoji}>♻️</Text>
              </View>
              <Text style={styles.cardTitle}>Waste Collection</Text>
            </View>

            <View style={styles.recommendedCard}>
              <View style={styles.cardImagePlaceholder}>
                <Text style={styles.cardEmoji}>📝</Text>
              </View>
              <Text style={styles.cardTitle}>Reports</Text>
            </View>
          </ScrollView>
        </View>

        {/* Bottom Spacing for Navigation */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View
        style={[styles.bottomNav, { paddingBottom: safeAreaInsets.bottom }]}
      >
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('Home')}
        >
          <Text
            style={[
              styles.navIcon,
              activeTab === 'Home' && styles.navIconActive,
            ]}
          >
            🏠
          </Text>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'Home' && styles.navLabelActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            setActiveTab('Explore');
            navigation.navigate('Search');
          }}
        >
          <Text
            style={[
              styles.navIcon,
              activeTab === 'Explore' && styles.navIconActive,
            ]}
          >
            🔍
          </Text>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'Explore' && styles.navLabelActive,
            ]}
          >
            Search
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            setActiveTab('Profile');
            navigation.replace('Profile');
          }}
        >
          <Text
            style={[
              styles.navIcon,
              activeTab === 'Profile' && styles.navIconActive,
            ]}
          >
            👤
          </Text>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'Profile' && styles.navLabelActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: '#E8F5F0',
  },
  scrollContent: {
    flex: 1,
  },

  // Header Styles
  header: {
    backgroundColor: COLORS.success,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  phoenixIcon: {
    fontSize: 32,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Menu Button Styles
  menuButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 8,
    zIndex: 10,
    marginTop: 30,
    marginRight: 20,
    paddingRight: 5,
  },
  hamburgerIcon: {
    width: 28,
  },
  hamburgerLine: {
    height: 3,
    backgroundColor: COLORS.white,
    marginVertical: 3,
    borderRadius: 2,
  },

  // Sidebar Menu Styles
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1500,
  },
  sidebarMenu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 15,
  },
  sidebarHeader: {
    backgroundColor: '#22A45D',
    paddingVertical: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeIcon: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '300',
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuItemIcon: {
    fontSize: 22,
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
  },

  // Dark Banner Section
  bannerSection: {
    backgroundColor: '#291503ff',
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  gridItemText: {
    color: '#4A3F35',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Illustration Section
  illustrationSection: {
    backgroundColor: '#E8F5F0',
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  illustrationPlaceholder: {
    backgroundColor: '#D4EDE4',
    borderRadius: 20,
    padding: 20,
    minHeight: 200,
    position: 'relative',
  },
  businessPeopleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  personBlock: {
    alignItems: 'center',
  },
  personIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  chartBar: {
    width: 60,
    backgroundColor: '#8FBC8F',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  gearsContainer: {
    position: 'absolute',
    right: 20,
    top: 20,
    flexDirection: 'row',
    gap: 8,
  },
  gearIcon: {
    fontSize: 40,
    opacity: 0.6,
  },
  gearIconSmall: {
    fontSize: 28,
  },

  // Recommended Section
  recommendedSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  menuDotsIcon: {
    fontSize: 24,
    color: COLORS.textDark,
  },
  recommendedCards: {
    paddingRight: 20,
    gap: 15,
  },
  recommendedCard: {
    width: 120,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImagePlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardEmoji: {
    fontSize: 40,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
  },

  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#291503ff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '500',
    opacity: 0.6,
  },
  navLabelActive: {
    opacity: 1,
    fontWeight: '700',
  },
});

export default DashboardScreen1;
