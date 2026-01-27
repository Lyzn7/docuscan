import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, Image, Alert, Modal, TextInput, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Document } from '../types';
import { useStore } from '../store/useStore';
import { getDatabase } from '../services/DatabaseService';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
    const { documents, setDocuments } = useStore();
    const [renameVisible, setRenameVisible] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const [renameId, setRenameId] = useState<string | null>(null);

    const loadDocuments = async () => {
        try {
            const db = getDatabase();
            const result = await db.getAllAsync<Document>('SELECT * FROM documents ORDER BY createdAt DESC');
            setDocuments(result);
        } catch (error) {
            console.error('Failed to load documents', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadDocuments();
        }, [])
    );

    const confirmDelete = (id: string, name: string) => {
        Alert.alert(
            'Hapus dokumen',
            `Yakin ingin menghapus "${name}"?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const db = getDatabase();
                            await db.runAsync('DELETE FROM documents WHERE id = ?', [id]);
                            setDocuments(documents.filter((d) => d.id !== id));
                        } catch (error) {
                            console.error('Failed to delete document', error);
                            Alert.alert('Error', 'Failed to delete document');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const startRename = (id: string, name: string) => {
        setRenameId(id);
        setRenameValue(name);
        setRenameVisible(true);
    };

    const submitRename = async () => {
        if (!renameId) return;
        const newName = renameValue.trim();
        if (!newName) {
            Alert.alert('Nama tidak boleh kosong');
            return;
        }
        try {
            const db = getDatabase();
            await db.runAsync('UPDATE documents SET name = ?, updatedAt = ? WHERE id = ?', [newName, Date.now(), renameId]);
            setDocuments(
                documents.map((d) => (d.id === renameId ? { ...d, name: newName, updatedAt: Date.now() } : d))
            );
            setRenameVisible(false);
            setRenameId(null);
        } catch (error) {
            console.error('Failed to rename document', error);
            Alert.alert('Error', 'Failed to rename document');
        }
    };

    const renderItem = ({ item }: { item: Document }) => (
        <View style={styles.item}>
            <TouchableOpacity
                style={styles.itemTouchable}
                onPress={() => navigation.navigate('Preview', { documentId: item.id })}
            >
                {item.thumbnailUri ? (
                    <Image source={{ uri: item.thumbnailUri }} style={styles.thumbnail} />
                ) : (
                    <View style={styles.thumbnailPlaceholder} />
                )}
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    <Text style={styles.itemCount}>{item.pageCount} pages</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item.id, item.name)}>
                <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.renameBtn} onPress={() => startRename(item.id, item.name)}>
                <Text style={styles.renameText}>Rename</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={documents}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No documents yet</Text>
                        <Text style={styles.emptySubText}>Tap the button below to scan</Text>
                    </View>
                }
            />
            <View style={styles.fabContainer}>
                <Button title="Scan New Document" onPress={() => navigation.navigate('Scan', {})} />
            </View>

            <Modal visible={renameVisible} transparent animationType="fade" onRequestClose={() => setRenameVisible(false)}>
                <Pressable style={styles.backdrop} onPress={() => setRenameVisible(false)} />
                <View style={styles.modal}>
                    <Text style={styles.modalTitle}>Ubah nama dokumen</Text>
                    <TextInput
                        value={renameValue}
                        onChangeText={setRenameValue}
                        placeholder="Nama dokumen"
                        style={styles.input}
                        autoFocus
                    />
                    <View style={styles.modalActions}>
                        <Button title="Batal" onPress={() => setRenameVisible(false)} />
                        <Button title="Simpan" onPress={submitRename} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        padding: 10,
    },
    item: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        alignItems: 'center',
    },
    itemTouchable: {
        flexDirection: 'row',
        flex: 1,
    },
    thumbnail: {
        width: 60,
        height: 80,
        borderRadius: 4,
        backgroundColor: '#eee',
    },
    thumbnailPlaceholder: {
        width: 60,
        height: 80,
        borderRadius: 4,
        backgroundColor: '#ccc',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    itemDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    itemCount: {
        fontSize: 12,
        color: '#888',
    },
    deleteBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#ff4d4d',
        borderRadius: 6,
        marginLeft: 10,
    },
    deleteText: {
        color: '#fff',
        fontWeight: '700',
    },
    renameBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#007AFF',
        borderRadius: 6,
        marginLeft: 8,
    },
    renameText: {
        color: '#fff',
        fontWeight: '700',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modal: {
        position: 'absolute',
        left: 24,
        right: 24,
        top: '35%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
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
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    emptySubText: {
        marginTop: 10,
        color: '#666',
    },
    fabContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
});
