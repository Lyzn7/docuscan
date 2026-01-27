import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, TextInput, ActivityIndicator } from 'react-native';

type SaveFormat = 'pdf' | 'image' | 'both';
interface SaveModalProps {
    visible: boolean;
    onClose: () => void;
    format: SaveFormat;
    onFormatChange: (value: SaveFormat) => void;
    title: string;
    onTitleChange: (value: string) => void;
    onConfirm: () => void;
    loading: boolean;
    folderLabel: string;
    onPickFolder: () => void;
    isAndroid: boolean;
}

const Radio = ({
    label,
    selected,
    onPress,
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) => (
    <Pressable style={styles.radioRow} onPress={onPress}>
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
            {selected && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
);

export const SaveModal = ({
    visible,
    onClose,
    format,
    onFormatChange,
    title,
    onTitleChange,
    onConfirm,
    loading,
    folderLabel,
    onPickFolder,
    isAndroid,
}: SaveModalProps) => {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose} />
            <View style={styles.sheet}>
                <Text style={styles.title}>Simpan Dokumen</Text>

                <Text style={styles.sectionLabel}>Nama Dokumen</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={onTitleChange}
                    placeholder="Nama dokumen"
                />

                <Text style={styles.sectionLabel}>Format</Text>
                <Radio label="PDF" selected={format === 'pdf'} onPress={() => onFormatChange('pdf')} />
                <Radio label="Gambar" selected={format === 'image'} onPress={() => onFormatChange('image')} />
                <Radio label="Keduanya (PDF + Gambar)" selected={format === 'both'} onPress={() => onFormatChange('both')} />

                <Text style={styles.sectionLabel}>Lokasi Simpan</Text>
                <View style={styles.folderRow}>
                    <Text style={styles.folderText}>{folderLabel || 'Belum dipilih'}</Text>
                    <Pressable style={styles.folderBtn} onPress={onPickFolder} disabled={!isAndroid || loading}>
                        <Text style={styles.folderBtnText}>{isAndroid ? 'Pilih Folder' : 'Android only'}</Text>
                    </Pressable>
                </View>

                <View style={styles.actions}>
                    <Pressable style={[styles.button, styles.cancel]} onPress={onClose} disabled={loading}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={[styles.button, styles.save]} onPress={onConfirm} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    sectionLabel: {
        marginTop: 8,
        fontWeight: '600',
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#999',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioOuterSelected: {
        borderColor: '#007AFF',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#007AFF',
    },
    radioLabel: {
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 12,
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    cancel: {
        backgroundColor: '#ccc',
    },
    save: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    folderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginTop: 4,
    },
    folderText: {
        flex: 1,
        marginRight: 8,
        color: '#333',
    },
    folderBtn: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    folderBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
});
