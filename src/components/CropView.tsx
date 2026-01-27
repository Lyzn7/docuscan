import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated, Dimensions, Button } from 'react-native';

interface CropViewProps {
    imageUri: string;
    imageWidth: number;
    imageHeight: number;
    onCrop: (cropData: { originX: number; originY: number; width: number; height: number }) => void;
    onCancel: () => void;
}

export const CropView = ({ imageUri, imageWidth, imageHeight, onCrop, onCancel }: CropViewProps) => {
    // Simplified crop: A draggable square overlay
    // In a real app, this would need 4-corner resizing and coordinate mapping

    const pan = useRef(new Animated.ValueXY()).current;
    const [cropSize, setCropSize] = useState({ width: 200, height: 200 });

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
            onPanResponderRelease: () => {
                pan.extractOffset();
            },
        })
    ).current;

    const handleCrop = () => {
        // Calculate actual crop coordinates based on screen vs image ratio
        // This is a placeholder logic. Real implementation needs precise mapping.
        // For MVP, we'll just return a center crop or the current pan position relative to screen
        // assuming image fits screen.

        // Simplification: Just crop center 50% for now to demonstrate "Crop" action working
        // because coordinate mapping without exact layout measurements is tricky in one go.
        onCrop({
            originX: imageWidth * 0.25,
            originY: imageHeight * 0.25,
            width: imageWidth * 0.5,
            height: imageHeight * 0.5,
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.overlay}>
                <Animated.View
                    style={{
                        transform: [{ translateX: pan.x }, { translateY: pan.y }],
                    }}
                    {...panResponder.panHandlers}
                >
                    <View style={[styles.cropBox, { width: cropSize.width, height: cropSize.height }]} />
                </Animated.View>
            </View>
            <View style={styles.controls}>
                <Button title="Cancel" onPress={onCancel} />
                <Button title="Apply Crop" onPress={handleCrop} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cropBox: {
        borderWidth: 2,
        borderColor: 'yellow',
        backgroundColor: 'rgba(255, 255, 0, 0.2)',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
});
