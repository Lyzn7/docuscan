import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SettingsScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            <Text>Version 1.0.0</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});
