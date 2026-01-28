import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

export const ScanScreen = ({ navigation }: Props) => {
    const [scannedImage, setScannedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const scanDocument = async () => {
        setLoading(true);
        try {
            const { scannedImages, status } = await DocumentScanner.scanDocument({
                maxNumDocuments: 1,
            });

            if (status === 'cancel' || !scannedImages || scannedImages.length === 0) {
                navigation.goBack();
                return;
            }

            setScannedImage(scannedImages[0]);
            navigation.replace('Edit', { imageUri: scannedImages[0] });
        } catch (error) {
            console.error('Error scanning document:', error);
            Alert.alert('Error', 'Failed to scan document. Make sure you are using a Development Build.');
            navigation.goBack();
        } finally {
            setLoading(false);
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

    useEffect(() => {
        scanDocument();
    }, []);

    return (
        <View style={styles.container}>
            <Ionicons name="camera" size={64} color="#007AFF" />
            <Text style={styles.title}>Membuka kamera...</Text>
            <Text style={styles.subtitle}>Auto-start scan. Tekan Batal untuk kembali.</Text>
            {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 16 }} />}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={26} color="#fff" />
                    <Text style={styles.buttonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage}>
                    <Ionicons name="images" size={24} color="#007AFF" />
                    <Text style={styles.secondaryText}>Pilih dari Galeri</Text>
                </TouchableOpacity>
            </View>
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
        marginTop: 24,
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: '#ff4d4d',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    secondaryBtn: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    secondaryText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
