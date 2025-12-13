import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Image, Alert } from 'react-native';
import { getProductByBarcode, getProductsInFridgeByBarcode, removeFromFridge, addToShoppingList } from '../services/productsServices';
import { ActivityIndicator, Text, Button, SegmentedButtons, IconButton } from 'react-native-paper';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import CameraScanner from './CameraScanner';
import { hasProductReview, addProductReview } 
  from '../services/productReviewsServices';
import ProductReviewForm from './ProductReviewForm';

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
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);


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

        navigation.navigate('ProductSelection', { 
          products,
          barcodeData: data,
          actionType: 'add'
        });
      } else if (actionType === 'check') {
      const products = await getProductByBarcode(data);

      if (products.length === 0) {
        Alert.alert('Brak produktu', 'Nie znaleziono produktu o podanym kodzie');
        return;
      }

      const product = products[0];

      navigation.navigate('ProductReviewScreen', {
        product,
      });
    } else {
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

          
          const products = await getProductByBarcode(data);
          const product = products[0];

          const alreadyReviewed = await hasProductReview(product.id);

          if (!alreadyReviewed) {
            setReviewProduct(product);
            setShowReviewPrompt(true);
          }

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
                  value: 'check',
                  label: 'Sprawdź',
                  icon: 'minus',
                  style: actionType === 'check' ? styles.activeSegment : styles.inactiveSegment
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
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 12 }}>Przetwarzanie...</Text>
        </View>
      )}

      <Modal visible={showReviewPrompt} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text variant="titleMedium">Czy chcesz ocenić produkt?</Text>

            <Button
              mode="contained"
              style={{ marginTop: 12 }}
              onPress={() => {
                setShowReviewPrompt(false);
                setShowReviewForm(true);
              }}
            >
              Tak
            </Button>

            <Button onPress={() => setShowReviewPrompt(false)}>
              Nie
            </Button>
          </View>
        </View>
      </Modal>

      <Modal visible={showReviewForm} animationType="slide">
        <ProductReviewForm
          onCancel={() => setShowReviewForm(false)}
          onSubmit={async ({ rating, comment }) => {
            await addProductReview({
              productId: reviewProduct.id,
              rating,
              comment
            });
            Alert.alert('Dziękujemy!', 'Recenzja zapisana');
            setShowReviewForm(false);
          }}
        />
      </Modal>
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