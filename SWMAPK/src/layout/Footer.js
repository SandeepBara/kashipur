import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { globalStyle } from '../styles/globalStyle';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useState } from 'react';
import ProfileModal from '../module/Auth/Components/ProfileModal';

export const Footer = ({ safeAreaBottom = 0 }) => {
  const navigation = useNavigation();
  const routeName = useNavigationState(state => state.routes[state.index]?.name);
  const [modal, setModal] = useState('');
  const tabs = [
    { name: 'Home', screen: 'Dashboard', icon: 'home' },
    { name: 'Search', screen: 'Search', icon: 'search' },
    { name: 'Profile', isModel: true, icon: 'user' },
  ];

  return (
    <View style={[globalStyle.bottomNav, { paddingBottom: Math.max(safeAreaBottom, 10) }]}>
      {tabs.map(item => {
        const active = item.isModel
          ? modal === 'Profile'
          : (item.name === 'Home' && routeName === 'Dashboard') || (item.name === 'Search' && routeName === 'Search');
        return (
          <TouchableOpacity
            key={item.name}
            style={globalStyle.navItem}
            onPress={() => {
              if (item.screen) navigation.navigate(item.screen);
              if (item.isModel) setModal(item.name);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Icon name={item.icon} size={19} color={active ? '#176A43' : '#849087'} />
            <Text style={[globalStyle.navLabel, active && globalStyle.navLabelActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
      {modal === 'Profile' && <ProfileModal onClose={() => setModal('')} />}
    </View>
  );
};
