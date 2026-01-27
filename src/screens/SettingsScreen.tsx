import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
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
    backButton: {
        padding: 8,
        backgroundColor: '#eee',
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    backText: {
        color: '#007AFF',
        fontWeight: '700',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});
