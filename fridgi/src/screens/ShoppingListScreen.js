import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Checkbox, List, Text, Snackbar, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import {
  getShoppingList,
  updateShoppingItem,
  removeFromShoppingList
} from '../services/productsServices';

const ShoppingListScreen = () => {
  const [items, setItems] = useState([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const loadItems = async () => {
    try {
      const list = await getShoppingList();
      setItems(list);
    } catch (error) {
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
      await updateShoppingItem(item.shoppingId, { checked: !item.checked });
      await loadItems();
    } catch (error) {
      showSnackbar('Błąd aktualizacji listy zakupów');
    }
  };

  const removeItem = async (shoppingId) => {
    try {
      await removeFromShoppingList(shoppingId);
      await loadItems();
      showSnackbar('Usunięto z listy zakupów');
    } catch (error) {
      showSnackbar('Błąd usuwania z listy zakupów');
    }
  };

  const renderItem = ({ item }) => (
    <List.Item
      style={styles.listItem}
      title={`${item.name}${item.quantity ? ` (${item.quantity} ${item.unit || ''})` : ''}`}
      titleStyle={item.checked ? styles.checkedText : undefined}
      onPress={() => toggleItem(item)}
      left={() => (
        <Checkbox
          status={item.checked ? 'checked' : 'unchecked'}
          onPress={() => toggleItem(item)}
        />
      )}
      right={() => (
        <IconButton icon="delete" onPress={() => removeItem(item.shoppingId)} />
      )}
    />
  );

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>Lista zakupów jest pusta</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.shoppingId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
    paddingRight: 8,
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
});

export default ShoppingListScreen;
