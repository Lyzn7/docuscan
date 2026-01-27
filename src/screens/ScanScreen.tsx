import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

export const ScanScreen = ({ navigation }: Props) => {
    const [scannedImage, setScannedImage] = useState<string | null>(null);

    const scanDocument = async () => {
        // DocumentScanner requires a development build or standalone build.
        // It will not work in Expo Go.
        try {
            const { scannedImages } = await DocumentScanner.scanDocument({
                maxNumDocuments: 1,
            });

            if (scannedImages && scannedImages.length > 0) {
                setScannedImage(scannedImages[0]);
                navigation.navigate('Edit', { imageUri: scannedImages[0] });
            }
        } catch (error) {
            console.error('Error scanning document:', error);
            Alert.alert('Error', 'Failed to scan document. Make sure you are using a Development Build.');
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                navigation.navigate('Edit', { imageUri: result.assets[0].uri });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color="#007AFF" />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Scan Document</Text>
            <Text style={styles.subtitle}>
                Use the camera to scan a document with auto-edge detection.
            </Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={scanDocument}>
                    <Ionicons name="camera" size={30} color="#fff" />
                    <Text style={styles.buttonText}>Scan with Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={pickImage}>
                    <Ionicons name="images" size={30} color="#fff" />
                    <Text style={styles.buttonText}>Import from Gallery</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.note}>
                Note: Camera scanning requires a Development Build.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    backText: {
        color: '#007AFF',
        marginLeft: 6,
        fontWeight: '600',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    buttonContainer: {
        width: '100%',
        gap: 20,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    note: {
        marginTop: 40,
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
});
