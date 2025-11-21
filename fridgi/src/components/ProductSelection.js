import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addToFridge, removeFromFridge, addToShoppingList } from '../services/productsServices';
import { MaterialIcons } from '@expo/vector-icons';

const ProductSelection = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { products, barcodeData, actionType } = route.params;

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
        await addToFridge({
          ...product,
          addedDate: new Date().toISOString(),
          quantity: 1,
          fridgeId: Date.now().toString()
        });
        Alert.alert('Sukces', 'Produkt został dodany do lodówki');
      } else {
        await removeFromFridge(product.fridgeId);
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
                    name: product.name,
                    quantity: product.quantity,
                    unit: product.unit,
                    category: product.category,
                  });
                  Alert.alert('Sukces', 'Dodano do listy zakupów');
                } catch (error) {
                  Alert.alert('Błąd', 'Nie udało się dodać do listy zakupów');
                }
              },
            },
          ]
        );
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Błąd', `Nie udało się ${actionType === 'add' ? 'dodać' : 'usunąć'} produktu`);
      console.error('Błąd:', error);
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
            source={{ uri: item.imageUri || item.image || 'https://via.placeholder.com/150' }} 
            style={styles.productImage}
            resizeMode="contain"
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productDetails}>{item.brand || 'Brak danych'}</Text>
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
        keyExtractor={(item) => (item.fridgeId || item.id).toString()}
        contentContainerStyle={styles.listContent}
      />
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
});

export default ProductSelection;