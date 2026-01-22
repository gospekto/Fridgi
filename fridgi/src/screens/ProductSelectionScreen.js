import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, FlatList, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import ProductReviewForm from '../components/ProductReviewForm';

import { addToShoppingList } from '../services/shoppingListServices/shoppingListServices';
import { addToFridge, removeFromFridge } from '../services/fridgeItemsServices/fridgeItemsServices';
import { hasProductReview, addProductReview } from '../services/productReviewsServices/productReviewsServices';

const ProductSelection = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const { products, barcodeData, actionType } = route.params;
  const [shouldGoBack, setShouldGoBack] = useState(false);

  useEffect(() => {
    if (actionType === 'add' && productsWithOptions.length > 0) {
      handleSelectProduct(productsWithOptions[0]);
    }
  }, []);

  const productsWithOptions = [
    ...products,
    ...(actionType === 'add' ? [{
      id: 'add-new',
      name: 'Dodaj nowy produkt',
      isAddNew: true
    }] : [])
  ];

  const handleSelectProduct = async (product) => {
    if (product.isAddNew) {
      navigation.navigate('ProductAdd', { barcodeData });
      return;
    }

    try {
      if (actionType === 'add') {
        await addToFridge(product.remoteId ? product.remoteId : product.id);
        Alert.alert('Sukces', 'Produkt został dodany do lodówki');
        navigation.goBack();
        return;
      }

      await removeFromFridge(product.fridgeId);
      Alert.alert('Sukces', 'Produkt został usunięty z lodówki');

      Alert.alert(
        'Dodaj do zakupów',
        'Czy chcesz dodać ten produkt do listy zakupów?',
        [
          {
            text: 'Nie',
            style: 'cancel',
            onPress: async () => {
              const alreadyReviewed = await hasProductReview(product.id);
              if (!alreadyReviewed) {
                setReviewProduct(product);
                setShowReviewPrompt(true);
                setShouldGoBack(true);
              } else {
                navigation.goBack();
              }
            },
          },
          {
            text: 'Tak',
            onPress: async () => {
              try {
                await addToShoppingList(product.productId, product.quantity || 1);
                Alert.alert('Sukces', 'Dodano do listy zakupów');

                const alreadyReviewed = await hasProductReview(product.product.id);
                if (!alreadyReviewed) {
                  setReviewProduct(product);
                  setShowReviewPrompt(true);
                  setShouldGoBack(true);
                } else {
                  navigation.goBack();
                }
              } catch (error) {
                Alert.alert('Błąd', 'Nie udało się dodać do listy zakupów');
                navigation.goBack();
              }
            },
          },
        ]
      );

    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się usunąć produktu');
      console.error(error);
    }
  };


  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => handleSelectProduct(item)}
    >
      {item.isAddNew ? (
        <View style={styles.addNewContainer}>
          <MaterialIcons name="add-circle" size={40} color="#6200ee" />
          <Text style={styles.addNewText}>{item.name}</Text>
        </View>
      ) : (
        <>
          <Image 
            source={{ uri: item.imageUri || item.product?.imageUri || 'https://via.placeholder.com/150' }} 
            style={styles.productImage}
            resizeMode="contain"
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.product?.name || item.name }</Text>
            <Text style={styles.productDetails}>{item.expirationDate || 'Brak danych'}</Text>
            <Text style={styles.productDetails}>
              {item.addedDate ? `Dodano: ${new Date(item.addedDate).toLocaleDateString()}` : ''}
            </Text>
          </View>
          <Button 
            mode="contained"
            style={[
              styles.actionButton,
              actionType === 'remove' && styles.removeButton
            ]}
            onPress={() => handleSelectProduct(item)}
          >
            {actionType === 'add' ? 'Dodaj' : 'Usuń'}
          </Button>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {actionType === 'add' ? 'Wybierz produkt do dodania' : 'Wybierz produkt do usunięcia'}
      </Text>
      <Text style={styles.subHeader}>Znaleziono kilka produktów pasujących do kodu: {barcodeData}</Text>
      
      <FlatList
        data={productsWithOptions}
        renderItem={renderProductItem}
        keyExtractor={(item) => (item.fridgeId || item.id)?.toString()}
        contentContainerStyle={styles.listContent}
      />
      <Modal visible={showReviewPrompt} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContainer}>
            <Text variant="titleMedium" style={{ textAlign: 'center' }}>
              Czy chcesz ocenić produkt?
            </Text>

            <Button
              mode="contained"
              style={{ marginTop: 12, width: '100%' }}
              onPress={() => {
                setShowReviewPrompt(false);
                setShowReviewForm(true);
              }}
            >
              Tak
            </Button>

            <Button
              style={{ marginTop: 8, width: '100%' }}
              onPress={() => {
                setShowReviewPrompt(false);
                if (shouldGoBack) navigation.goBack();
              }}
            >
              Nie
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showReviewForm} animationType="slide">
        <ProductReviewForm
          onCancel={() => {
            setShowReviewForm(false);
            if (shouldGoBack) navigation.goBack();
          }}
          onSubmit={async ({ rating, comment }) => {
            await addProductReview({
              productId: reviewProduct.product.id,
              rating,
              comment,
            });

            Alert.alert('Dziękujemy!', 'Recenzja zapisana');
            setShowReviewForm(false);
            navigation.goBack();
          }}
        />
      </Modal>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  productImage: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    marginLeft: 12,
    minWidth: 80,
    backgroundColor: '#6200ee',
  },
  removeButton: {
    backgroundColor: '#d32f2f',
  },
  addNewContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  addNewText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 4,
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

});

export default ProductSelection;