/**
 * Waste Management App
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Login from './src/module/Auth/Login';
import DashboardScreen from './src/screen/DashboardScreen';
import AddConsumer from './src/module/Waste/AddConsumer';
import Search from './src/module/Waste/Search';
import ConsumerDetails from './src/module/Waste/ConsumerDetails';
import ScanRFID from './src/module/Waste/ScanRFID';
import InstallRFID from './src/module/Waste/InstallRFID';
import Collection from './src/module/Reports/Collection';
import PrinterTestScreen from './src/screen/PrinterTestScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ unmountOnBlur: true }}
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ unmountOnBlur: true }}
          />

          <Stack.Screen
            name="AddConsumer"
            component={AddConsumer}
            options={{ title: 'Add Consumer', unmountOnBlur: true }}
          />
          <Stack.Screen
            name="Search"
            component={Search}
            options={{ title: 'Search Consumer', unmountOnBlur: true }}
          />
          <Stack.Screen
            name="ConsumerDetails"
            component={ConsumerDetails}
            options={{ title: 'Detail', unmountOnBlur: true }}
          />

          <Stack.Screen
            name="ScanRFID"
            component={ScanRFID}
            options={{ title: 'Collection Summary', unmountOnBlur: true }}
          />

          <Stack.Screen
            name="InstallRFID"
            component={InstallRFID}
            options={{ title: 'Collection Summary', unmountOnBlur: true }}
          />
          <Stack.Screen
            name="Collection"
            component={Collection}
            options={{ title: 'Collection Summary', unmountOnBlur: true }}
          />
          <Stack.Screen name="PrinterTest" component={PrinterTestScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
