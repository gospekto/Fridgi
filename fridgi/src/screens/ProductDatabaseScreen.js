import React, { useState, useEffect, useCallback } from 'react';
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
  Text,
} from 'react-native-paper';
import {
  getProductDatabase,
  deleteProductFromDatabase,
  updateProductInDatabase,
} from '../services/productServices/productsServices';
import { addToFridge } from '../services/fridgeItemsServices';

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
    typicalShelfLife: '',
  });

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await getProductDatabase();
      setProducts(list);
      setFilteredProducts(list);
    } catch {
      showSnackbar('Błąd ładowania produktów');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();

    setFilteredProducts(
      products.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.barcode?.includes(q)
      )
    );
  }, [searchQuery, products]);

  const showSnackbar = (msg) => {
    setSnackbarMessage(msg);
    setSnackbarVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteProductFromDatabase(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showSnackbar('Produkt usunięty');
    } catch {
      showSnackbar('Błąd podczas usuwania');
    }
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setEditForm({
      name: product.name ?? '',
      category: product.category ?? '',
      barcode: product.barcode ?? '',
      typicalShelfLife:
        product.typicalShelfLife?.toString() ?? '',
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!currentProduct) return;

    try {
      await updateProductInDatabase(currentProduct.id, {
        name: editForm.name.trim(),
        category: editForm.category.trim(),
        barcode: editForm.barcode || null,
        typicalShelfLife: Number(editForm.typicalShelfLife) || null,
      });

      await loadProducts();
      setEditModalVisible(false);
      showSnackbar('Produkt zaktualizowany');
    } catch {
      showSnackbar('Błąd aktualizacji produktu');
    }
  };

  const handleAddToFridge = async (product) => {
    try {

      await addToFridge(product.id);

      showSnackbar('Dodano do lodówki');
    } catch {
      showSnackbar('Błąd dodawania do lodówki');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Szukaj produktów..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {filteredProducts.length === 0 ? (
          <View style={styles.empty}>
            <Title>Brak produktów</Title>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ProductAdd')}
            >
              Dodaj produkt
            </Button>
          </View>
        ) : (
          filteredProducts.map(product => (
            <Card key={product.id} style={styles.card}>
              {product.imageUri && (
                <Card.Cover source={{ uri: product.imageUri }} />
              )}

              <Card.Content>
                <View style={styles.header}>
                  <Title style={{ flex: 1 }}>{product.name}</Title>

                  <IconButton
                    icon="fridge-outline"
                    onPress={() => handleAddToFridge(product)}
                  />
                  <IconButton
                    icon="pencil"
                    onPress={() => openEditModal(product)}
                  />
                  <IconButton
                    icon="delete"
                    onPress={() => handleDelete(product.id)}
                  />
                </View>

                {product.category && (
                  <Chip style={{ alignSelf: 'flex-start' }}>
                    {product.category}
                  </Chip>
                )}

                {product.barcode && (
                  <Paragraph>
                    <Text style={styles.label}>Kod: </Text>
                    {product.barcode}
                  </Paragraph>
                )}

                {product.typicalShelfLife && (
                  <Paragraph>
                    <Text style={styles.label}>Przydatność: </Text>
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
            <Title>Edytuj produkt</Title>

            {['name', 'category', 'barcode', 'typicalShelfLife'].map(
              field => (
                <TextInput
                  key={field}
                  label={field}
                  value={editForm[field]}
                  onChangeText={v =>
                    setEditForm(prev => ({ ...prev, [field]: v }))
                  }
                  keyboardType={
                    field === 'typicalShelfLife' ? 'numeric' : 'default'
                  }
                  style={{ marginBottom: 10 }}
                />
              )
            )}

            <Button mode="contained" onPress={handleEditSubmit}>
              Zapisz
            </Button>
          </Card.Content>
        </Card>
      </Modal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  loading: { flex: 1, justifyContent: 'center' },
  searchBar: { marginBottom: 10 },
  empty: { alignItems: 'center', marginTop: 40 },
  card: { marginBottom: 15 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: { fontWeight: 'bold' },
  modal: { padding: 20 },
});

export default ProductDatabaseScreen;
