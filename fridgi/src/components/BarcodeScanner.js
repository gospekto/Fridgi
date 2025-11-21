import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Image, Alert } from 'react-native';
import { getProductByBarcode, addToFridge, getProductsInFridgeByBarcode, removeFromFridge, addToShoppingList } from '../services/productsServices';
import { ActivityIndicator, Text, Button, SegmentedButtons, IconButton } from 'react-native-paper';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import CameraScanner from './CameraScanner';

const ModalProduct = ({ visible, product, onClose, onAction, actionType }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {product.image && (
            <Image 
              source={{ uri: product.image }} 
              style={styles.productImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.productName}>{product.name}</Text>
          
          <Button 
            mode="contained" 
            onPress={onAction}
            style={[
              styles.actionButton,
              actionType === 'remove' && styles.removeButton
            ]}
            labelStyle={styles.actionButtonText}
          >
            {actionType === 'add' ? 'Dodaj produkt' : 'Usuń produkt'}
          </Button>
          
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Anuluj</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const LoadingOverlay = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator animating={true} size="large" />
      <Text style={styles.loadingText}>Przetwarzanie...</Text>
    </View>
  );
};

export default function BarcodeScanner() {
  const [isLoading, setIsLoading] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('add');
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const handleBarcodeScanned = async ({ type, data }) => {
    if (scannedBarcode === data || isLoading) return;
    
    setScannedBarcode(data);
    setIsLoading(true);
    
    try {
      if (actionType === 'add') {
        const products = await getProductByBarcode(data);
        
        if (products.length === 0) {
          navigation.navigate('ProductAdd', { 
            barcodeData: data,
            barcodeType: type 
          });
          return;
        }

        // Zawsze przekierowuj do ProductSelection, nawet gdy jest tylko jeden produkt
        navigation.navigate('ProductSelection', { 
          products,
          barcodeData: data,
          actionType: 'add'
        });
      } else {
        // Dla usuwania sprawdzamy produkty w lodówce
        const productsInFridge = await getProductsInFridgeByBarcode(data);
        
        if (productsInFridge.length === 0) {
          Alert.alert('Błąd', 'Nie znaleziono produktu o podanym kodzie w lodówce');
          return;
        }

        if (productsInFridge.length === 1) {
          const removedItem = productsInFridge[0];
          await removeFromFridge(removedItem.fridgeId);
          Alert.alert('Sukces', 'Produkt został usunięty z lodówki');
          Alert.alert(
            'Dodaj do zakupów',
            'Czy chcesz dodać ten produkt do listy zakupów?',
            [
              { text: 'Nie', style: 'cancel' },
              {
                text: 'Tak',
                onPress: async () => {
                  try {
                    await addToShoppingList({
                      name: removedItem.name,
                      quantity: removedItem.quantity,
                      unit: removedItem.unit,
                      category: removedItem.category,
                    });
                    Alert.alert('Sukces', 'Dodano do listy zakupów');
                  } catch (error) {
                    Alert.alert('Błąd', 'Nie udało się dodać do listy zakupów');
                  }
                },
              },
            ]
          );
        } else {
          navigation.navigate('ProductSelection', {
            products: productsInFridge,
            barcodeData: data,
            actionType: 'remove'
          });
        }
      }
    } catch (error) {
      console.error('Błąd skanowania:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas przetwarzania produktu');
    } finally {
      setIsLoading(false);
      setScannedBarcode(null);
    }
  };

  const handleAction = async () => {
    try {
      if (actionType === 'add') {
        await addToFridge({
          ...selectedProduct,
          addedDate: new Date().toISOString(),
          quantity: 1,
          fridgeId: Date.now().toString()
        });
        Alert.alert('Sukces', 'Produkt został dodany do lodówki');
      }
      closeModal();
    } catch (error) {
      console.error('Błąd:', error);
      Alert.alert('Błąd', `Wystąpił błąd podczas ${actionType === 'add' ? 'dodawania' : 'usuwania'} produktu`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setScannedBarcode(null);
    setSelectedProduct(null);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {isFocused && (
        <>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleBack}
            style={styles.backButton}
            iconColor="#fff"
          />
          
          <CameraScanner 
            onBarcodeScanned={handleBarcodeScanned} 
            isActive={isFocused && !scannedBarcode && !isLoading}
          />
          
          <View style={styles.bottomPanel}>
            <SegmentedButtons
              value={actionType}
              onValueChange={setActionType}
              buttons={[
                {
                  value: 'add',
                  label: 'Dodaj',
                  icon: 'plus',
                  style: actionType === 'add' ? styles.activeSegment : styles.inactiveSegment
                },
                {
                  value: 'remove',
                  label: 'Usuń',
                  icon: 'minus',
                  style: actionType === 'remove' ? styles.activeSegment : styles.inactiveSegment
                },
              ]}
              style={styles.segmentedButtons}
            />
          </View>
        </>
      )}
      
      <LoadingOverlay visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  segmentedButtons: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  activeSegment: {
    backgroundColor: '#6200ee',
  },
  inactiveSegment: {
    backgroundColor: 'white',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 3,
  },
  loadingText: {
    marginTop: 16,
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 4,
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  productImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionButton: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#6200ee',
  },
  removeButton: {
    backgroundColor: '#d32f2f',
  },
  actionButtonText: {
    color: 'white',
  },
  cancelText: {
    color: '#0066cc',
    textDecorationLine: 'underline',
    marginTop: 10,
  },
});