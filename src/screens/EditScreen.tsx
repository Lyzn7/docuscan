import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Image, ActivityIndicator, Alert, Platform, ToastAndroid, TouchableOpacity, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { useStore } from '../store/useStore';
import { getDatabase } from '../services/DatabaseService';
import { CropView } from '../components/CropView';
import { OpenCVProcessor } from '../components/OpenCVProcessor';
import * as Print from 'expo-print';

type Props = NativeStackScreenProps<RootStackParamList, 'Edit'>;

export const EditScreen = ({ navigation, route }: Props) => {
    const { imageUri } = route.params;
    const [currentUri, setCurrentUri] = useState(imageUri);
    const [loading, setLoading] = useState(false);
    const [isCropping, setIsCropping] = useState(false);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [showProcessor, setShowProcessor] = useState(false);
    const [processorInput, setProcessorInput] = useState<string | null>(null);
    const [docTitle, setDocTitle] = useState(`Scan ${new Date().toLocaleDateString()}`);
    const addDocument = useStore((state) => state.addDocument);

    useEffect(() => {
        Image.getSize(currentUri, (width, height) => {
            setImageSize({ width, height });
        });
    }, [currentUri]);

    const rotateImage = async () => {
        setLoading(true);
        try {
            const result = await ImageManipulator.manipulateAsync(
                currentUri,
                [{ rotate: 90 }],
                { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
            );
            setCurrentUri(result.uri);
        } catch (error) {
            Alert.alert('Error', 'Failed to rotate image');
        } finally {
            setLoading(false);
        }
    };

    const handleCrop = async (cropData: { originX: number; originY: number; width: number; height: number }) => {
        setIsCropping(false);
        setLoading(true);
        try {
            const result = await ImageManipulator.manipulateAsync(
                currentUri,
                [{ crop: cropData }],
                { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
            );
            setCurrentUri(result.uri);
        } catch (error) {
            Alert.alert('Error', 'Failed to crop image');
        } finally {
            setLoading(false);
        }
    };

    const preprocessWithOpenCV = async () => {
        try {
            setLoading(true);
            const base64 = await FileSystem.readAsStringAsync(currentUri, { encoding: 'base64' });
            setProcessorInput(base64);
            setShowProcessor(true);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal menyiapkan gambar untuk diproses');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessed = async (dataUrl: string) => {
        try {
            const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
            const cacheDir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || '';
            const newPath = `${cacheDir}processed-${Date.now()}.jpg`;
            await FileSystem.writeAsStringAsync(newPath, base64, { encoding: 'base64' });
            setCurrentUri(newPath);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal menyimpan hasil pemrosesan');
        } finally {
            setShowProcessor(false);
        }
    };

    const handleProcessError = (message: string) => {
        setShowProcessor(false);
        Alert.alert('Error', message);
    };

    const toast = (msg: string) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(msg, ToastAndroid.SHORT);
        } else {
            Alert.alert(msg);
        }
    };

    const handlePersistSave = async () => {
        setLoading(true);
        try {
            const fileName = currentUri.split('/').pop() || `scan-${Date.now()}.jpg`;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fs = FileSystem as any;
            if (!fs.documentDirectory) {
                throw new Error('Document directory is not available');
            }
            const targetRoot = fs.documentDirectory + 'DocuScan/';
            await FileSystem.makeDirectoryAsync(targetRoot, { intermediates: true });
            const newPath = targetRoot + fileName;
            await FileSystem.copyAsync({ from: currentUri, to: newPath });

            const docId = Date.now().toString();
            const db = getDatabase();
            await db.runAsync(
                'INSERT INTO documents (id, name, createdAt, updatedAt, thumbnailUri, pageCount) VALUES (?, ?, ?, ?, ?, ?)',
                [docId, `Scan ${new Date().toLocaleDateString()}`, Date.now(), Date.now(), newPath, 1]
            );

            await db.runAsync(
                'INSERT INTO pages (id, documentId, imageUri, "order", width, height) VALUES (?, ?, ?, ?, ?, ?)',
                [Date.now().toString(), docId, newPath, 0, imageSize.width, imageSize.height]
            );

            addDocument({
                id: docId,
                name: `Scan ${new Date().toLocaleDateString()}`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                thumbnailUri: newPath,
                pageCount: 1,
            });

            toast('Dokumen disimpan di penyimpanan aplikasi');
            navigation.navigate('Preview', { documentId: docId });
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Gagal menyimpan dokumen');
        } finally {
            setLoading(false);
        }
    };

    const saveDocument = async () => {
        await handlePersistSave();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            {isCropping ? (
                <CropView
                    imageUri={currentUri}
                    imageWidth={imageSize.width}
                    imageHeight={imageSize.height}
                    onCrop={handleCrop}
                    onCancel={() => setIsCropping(false)}
                />
            ) : (
                <>
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: currentUri }} style={styles.image} resizeMode="contain" />
                        {loading && <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />}
                    </View>
                    <View style={styles.controls}>
                        <Button title="Rotate" onPress={rotateImage} />
                        <Button title="Crop" onPress={() => setIsCropping(true)} />
                        <Button title="Auto Crop" onPress={preprocessWithOpenCV} />
                        <Button title="Save" onPress={saveDocument} />
                    </View>
                </>
            )}
            {showProcessor && processorInput && (
                <OpenCVProcessor
                    base64Image={processorInput}
                    onSuccess={handleProcessed}
                    onError={handleProcessError}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 15,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 6,
    },
    backText: {
        color: '#fff',
        fontWeight: '700',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    loader: {
        position: 'absolute',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: '#fff',
    },
});
