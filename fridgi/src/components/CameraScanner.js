import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { CameraView, Camera } from 'expo-camera';

const CameraScanner = ({ onBarcodeScanned, isActive }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  useEffect(() => {
    // Reset camera when component becomes active
    if (isActive && cameraRef) {
      cameraRef.resumePreview();
    }
  }, [isActive, cameraRef]);

  if (hasPermission === null) {
    return <View style={styles.centerContainer}><Text>Requesting permissions...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.centerContainer}><Text>No access to camera</Text></View>;
  }

  return (
    <CameraView
      ref={ref => setCameraRef(ref)}
      onBarcodeScanned={isActive ? onBarcodeScanned : undefined}
      barcodeScannerSettings={{
        barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e']
      }}
      style={StyleSheet.absoluteFillObject}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraScanner;