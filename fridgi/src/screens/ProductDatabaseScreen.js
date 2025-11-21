import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  IconButton,
  Searchbar,
  ActivityIndicator,
  Chip,
  Modal,
  TextInput,
  Snackbar,
  Text
} from 'react-native-paper';
import {
  getProductDatabase,
  deleteProductFromDatabase,
  updateProductInDatabase,
  addToFridge
} from '../services/productsServices';

const ProductDatabaseScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    barcode: '',
    typicalShelfLife: ''
  });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productList = await getProductDatabase();
        setProducts(productList);
        setFilteredProducts(productList);
      } catch (error) {
        showSnackbar('Błąd ładowania produktów');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.barcode && p.barcode.includes(searchQuery))
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleDelete = async (productId) => {
    try {
      await deleteProductFromDatabase(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      showSnackbar('Produkt usunięty');
    } catch (error) {
      showSnackbar('Błąd podczas usuwania produktu');
    }
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      barcode: product.barcode || '',
      typicalShelfLife: product.typicalShelfLife?.toString() || ''
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const updatedProduct = await updateProductInDatabase(currentProduct.id, {
        ...editForm,
        typicalShelfLife: parseInt(editForm.typicalShelfLife) || 0
      });

      setProducts(prev =>
        prev.map(p => (p.id === currentProduct.id ? updatedProduct : p))
      );

      setEditModalVisible(false);
      showSnackbar('Produkt zaktualizowany');
    } catch (error) {
      showSnackbar('Błąd podczas aktualizacji produktu');
    }
  };

  const handleAddToFridge = async (product) => {
    try {
      await addToFridge({
        ...product,
        addedDate: new Date().toISOString(),
        quantity: 1,
        fridgeId: Date.now().toString()
      });
      showSnackbar('Dodano do lodówki');
    } catch (error) {
      showSnackbar('Błąd podczas dodawania do lodówki');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Szukaj produktów..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Title style={styles.emptyText}>Brak produktów</Title>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ProductAdd')}
            >
              Dodaj pierwszy produkt
            </Button>
          </View>
        ) : (
          filteredProducts.map(product => (
            <Card key={product.id} style={styles.productCard}>
                {product.imageUri && (
                    <Card.Cover 
                    source={{ uri: product.imageUri }} 
                    style={styles.productImage}
                    />
                )}
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Title style={styles.productName}>{product.name}</Title>
                  <View style={styles.actions}>
                    <IconButton
                      icon="fridge-outline"
                      size={20}
                      onPress={() => handleAddToFridge(product)}
                    />
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => openEditModal(product)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleDelete(product.id)}
                    />
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <Paragraph style={styles.detailText}>
                    <Text style={styles.detailLabel}>Kategoria: </Text>
                    {product.category}
                  </Paragraph>
                  <Chip style={styles.categoryChip}>{product.category}</Chip>
                </View>

                {product.barcode && (
                  <Paragraph style={styles.detailText}>
                    <Text style={styles.detailLabel}>Kod kreskowy: </Text>
                    {product.barcode}
                  </Paragraph>
                )}

                {product.typicalShelfLife > 0 && (
                  <Paragraph style={styles.detailText}>
                    <Text style={styles.detailLabel}>Typowy okres przydatności: </Text>
                    {product.typicalShelfLife} dni
                  </Paragraph>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal
        visible={editModalVisible}
        onDismiss={() => setEditModalVisible(false)}
        contentContainerStyle={styles.modal}
      >
        <Card>
          <Card.Content>
            <Title style={styles.modalTitle}>Edytuj produkt</Title>
            
            <TextInput
              label="Nazwa produktu"
              value={editForm.name}
              onChangeText={(text) => setEditForm({...editForm, name: text})}
              style={styles.input}
            />

            <TextInput
              label="Kategoria"
              value={editForm.category}
              onChangeText={(text) => setEditForm({...editForm, category: text})}
              style={styles.input}
            />

            <TextInput
              label="Kod kreskowy"
              value={editForm.barcode}
              onChangeText={(text) => setEditForm({...editForm, barcode: text})}
              style={styles.input}
              keyboardType="numeric"
            />

            <TextInput
              label="Typowy okres przydatności (dni)"
              value={editForm.typicalShelfLife}
              onChangeText={(text) => setEditForm({...editForm, typicalShelfLife: text})}
              style={styles.input}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setEditModalVisible(false)}
                style={styles.modalButton}
              >
                Anuluj
              </Button>
              <Button
                mode="contained"
                onPress={handleEditSubmit}
                style={styles.modalButton}
              >
                Zapisz
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>

      <IconButton
        icon="plus"
        size={30}
        onPress={() => navigation.navigate('ProductAdd')}
        style={styles.addButton}
        mode="contained"
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    marginBottom: 10,
    borderRadius: 8,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
  productCard: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  detailText: {
    fontSize: 14,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginLeft: 5,
  },
  modal: {
    padding: 20,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
    backgroundColor: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#6200ee',
  },
});

export default ProductDatabaseScreen;