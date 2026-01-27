import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { HomeScreen } from '../screens/HomeScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { EditScreen } from '../screens/EditScreen';
import { PreviewScreen } from '../screens/PreviewScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'DocuScan' }} />
                <Stack.Screen name="Scan" component={ScanScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Edit" component={EditScreen} />
                <Stack.Screen name="Preview" component={PreviewScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
