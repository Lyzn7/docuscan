import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Image, Alert, Modal, TextInput, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Page } from '../types';
import { getDatabase } from '../services/DatabaseService';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

export const PreviewScreen = ({ navigation, route }: Props) => {
    const { documentId } = route.params;
    const [pages, setPages] = useState<Page[]>([]);
    const [docName, setDocName] = useState<string>('Document');
    const [exportVisible, setExportVisible] = useState(false);
    const [exportFileName, setExportFileName] = useState<string>('document');

    useEffect(() => {
        loadPages();
        loadDocumentName();
    }, []);

    const loadPages = async () => {
        const db = getDatabase();
        const result = await db.getAllAsync<Page>(
            'SELECT * FROM pages WHERE documentId = ? ORDER BY "order" ASC',
            [documentId]
        );
        setPages(result);
    };

    const loadDocumentName = async () => {
        const db = getDatabase();
        const docRow = await db.getFirstAsync<{ name: string }>('SELECT name FROM documents WHERE id = ?', [documentId]);
        const name = docRow?.name || 'Document';
        setDocName(name);
        setExportFileName(name.replace(/[^a-zA-Z0-9-_]+/g, '_'));
    };

    const sanitizeName = (name: string) => {
        const trimmed = name.trim();
        return trimmed.length > 0 ? trimmed.replace(/[^a-zA-Z0-9-_]+/g, '_') : 'document';
    };

    const exportPdf = async () => {
        try {
            const htmlContent = `
        <html>
          <body style="margin: 0; padding: 0;">
            ${pages
                    .map(
                        (page) =>
                            `<img src="${page.imageUri}" style="width: 100%; height: auto; page-break-after: always;" />`
                    )
                    .join('')}
          </body>
        </html>
      `;

            const { uri } = await Print.printToFileAsync({ html: htmlContent });

            const safeName = sanitizeName(exportFileName || docName);
            const targetUri = `${FileSystem.cacheDirectory}${safeName}.pdf`;
            try {
                await FileSystem.moveAsync({ from: uri, to: targetUri });
                await Sharing.shareAsync(targetUri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: `${safeName}.pdf` });
            } catch {
                // fallback share original if move fails
                await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: `${safeName}.pdf` });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to export PDF');
        }
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>Back</Text>
            </Pressable>
            <FlatList
                data={pages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Image source={{ uri: item.imageUri }} style={styles.pageImage} resizeMode="contain" />
                )}
                contentContainerStyle={styles.listContent}
            />
            <View style={styles.footer}>
                <Button title="Export PDF" onPress={() => setExportVisible(true)} />
                <Button title="Done" onPress={() => navigation.popToTop()} />
            </View>

            <Modal visible={exportVisible} transparent animationType="fade" onRequestClose={() => setExportVisible(false)}>
                <Pressable style={styles.backdrop} onPress={() => setExportVisible(false)} />
                <View style={styles.modal}>
                    <Text style={styles.modalTitle}>Nama file PDF</Text>
                    <TextInput
                        value={exportFileName}
                        onChangeText={setExportFileName}
                        placeholder="Nama file"
                        style={styles.input}
                    />
                    <View style={styles.modalActions}>
                        <Button title="Cancel" onPress={() => setExportVisible(false)} />
                        <Button
                            title="Export"
                            onPress={async () => {
                                setExportVisible(false);
                                await exportPdf();
                            }}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    listContent: {
        padding: 10,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 6,
    },
    backText: {
        color: '#fff',
        fontWeight: '700',
    },
    pageImage: {
        width: '100%',
        height: 400,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modal: {
        position: 'absolute',
        left: 20,
        right: 20,
        top: '35%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
});
