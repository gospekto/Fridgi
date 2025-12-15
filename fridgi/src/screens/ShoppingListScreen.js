import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';
import {
  Checkbox,
  List,
  Text,
  Snackbar,
  IconButton,
  Button,
  Card,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import {
  getShoppingListItems,
  updateShoppingItem,
  removeFromShoppingList,
} from '../services/shoppingListServices';

const ShoppingListScreen = () => {
  const [items, setItems] = useState([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const loadItems = async () => {
    try {
      const list = await getShoppingListItems();
      setItems(list);
    } catch {
      showSnackbar('Błąd ładowania listy zakupów');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  const toggleItem = async (item) => {
    try {
      await updateShoppingItem(item.shoppingId, {
        checked: !item.checked,
      });
      loadItems();
    } catch {
      showSnackbar('Błąd aktualizacji listy zakupów');
    }
  };

  const removeItem = async (shoppingId) => {
    try {
      await removeFromShoppingList(shoppingId);
      loadItems();
      showSnackbar('Usunięto z listy zakupów');
    } catch {
      showSnackbar('Błąd usuwania z listy zakupów');
    }
  };

  const renderItem = ({ item }) => {
    const { product } = item;

    return (
      <List.Item
        style={styles.listItem}
        title={() => (
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.titleText,
                item.checked && styles.checkedText,
              ]}
              onPress={() => setSelectedProduct(product)}
            >
              {product.name}
            </Text>

            <IconButton
              icon="information-outline"
              size={18}
              onPress={() => setSelectedProduct(product)}
            />
          </View>
        )}
        description={`${item.quantity} ${product.unit || ''}`}
        onPress={() => toggleItem(item)}
        left={() => (
          <Checkbox
            status={item.checked ? 'checked' : 'unchecked'}
            onPress={() => toggleItem(item)}
          />
        )}
        right={() => (
          <IconButton
            icon="delete"
            onPress={() => removeItem(item.shoppingId)}
          />
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>
          Lista zakupów jest pusta
        </Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.shoppingId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
        />
      )}

      {/* MODAL – szczegóły produktu */}
      <Modal visible={!!selectedProduct} animationType="slide">
        {selectedProduct && (
          <View style={styles.modalContainer}>
            <Card>
              {selectedProduct.imageUri && (
                <Card.Cover
                  source={{ uri: selectedProduct.imageUri }}
                />
              )}
              <Card.Content>
                <Text variant="titleLarge">
                  {selectedProduct.name}
                </Text>
                <Text>Marka: {selectedProduct.brand || '—'}</Text>
                <Text>Kategoria: {selectedProduct.category || '—'}</Text>
                <Text>Jednostka: {selectedProduct.unit || '—'}</Text>
                <Text>Kod kreskowy: {selectedProduct.barcode || '—'}</Text>
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              style={{ marginTop: 16 }}
              onPress={() => setSelectedProduct(null)}
            >
              Zamknij
            </Button>
          </View>
        )}
      </Modal>

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
  },
  list: {
    padding: 8,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  separator: {
    height: 8,
  },
  emptyText: {
    margin: 20,
    textAlign: 'center',
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#777',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
});

export default ShoppingListScreen;
