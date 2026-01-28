import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking } from 'react-native';

export const DonationScreen = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Dukung Pengembangan</Text>
            <Text style={styles.body}>
                Hai! Kalau aplikasi ini membantu, boleh banget traktir saya lewat donasi. Biar makin semangat nambahin
                fitur-fitur baru. Makasih banyak!
            </Text>

            

            <View style={styles.qrCard}>
                <Text style={styles.qrLabel}>Scan QRIS</Text>
                <Image source={require('../asset/image.png')} style={styles.qrImage} resizeMode="contain" />
            </View>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Saran / Permintaan Fitur</Text>
                <Text style={styles.body}>
                    Nemu bug yang ganggu atau punya ide fitur biar aplikasi ini makin keren? 🚀 Jangan dipendem sendiri, mending curhatin aja langsung ke saya via WhatsApp! Masukan dari kamu berharga banget buat perkembangan aplikasi ini. ☕✨
                </Text>
                <TouchableOpacity
                    style={styles.waButton}
                    onPress={() => Linking.openURL('https://wa.me/6281227610384')}
                >
                    <Text style={styles.waText}>Chat via WhatsApp</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.thanks}>Terima kasih 🙏</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#222',
    },
    body: {
        fontSize: 15,
        color: '#444',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 22,
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'flex-start',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
        color: '#222',
    },
    qrCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        marginBottom: 16,
    },
    qrLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    qrImage: {
        width: 260,
        height: 260,
    },
    waButton: {
        marginTop: 10,
        backgroundColor: '#25D366',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
    },
    waText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    thanks: {
        fontSize: 16,
        fontWeight: '700',
        color: '#007AFF',
        marginTop: 8,
    },
});
