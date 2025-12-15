import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import {
  Card,
  Title,
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
import { MaterialIcons } from '@expo/vector-icons';
import {
  getFridgeItems,
  deleteFromFridge,
  updateInFridge,
  getFridgeItem
} from '../services/fridgeItemsServices';
import { addToShoppingList } from '../services/shoppingListServices';

const FridgeScreen = ({ navigation }) => {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [processedItems, setProcessedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editForm, setEditForm] = useState({
    quantity: '',
    expiryDate: '',
    storageLocation: '',
    notes: ''
  });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFridgeItems();
    });
    return unsubscribe;
  }, [navigation]);

  const loadFridgeItems = async () => {
    setIsLoading(true);
    try {
      const items = await getFridgeItems();
      setFridgeItems(items);
      processItems(items);
    } catch {
      showSnackbar('Błąd ładowania zawartości lodówki');
    } finally {
      setIsLoading(false);
    }
  };

  const processItems = (items) => {
    const grouped = {};
    items.forEach(item => {
      const key = item.product.id;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    const result = Object.values(grouped).map(group => {
      if (group.length === 1) return { type: 'single', data: group[0] };
      return { type: 'group', product: group[0].product, items: group, expanded: false };
    });

    setProcessedItems(result);
  };

  useEffect(() => {
    if (searchQuery === '') {
      processItems(fridgeItems);
    } else {
      const filtered = fridgeItems.filter(item =>
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      processItems(filtered);
    }
  }, [searchQuery, fridgeItems]);

  const toggleGroup = (index) => {
    setProcessedItems(prev => {
      const newItems = [...prev];
      if (newItems[index].type === 'group') {
        newItems[index] = { ...newItems[index], expanded: !newItems[index].expanded };
      }
      return newItems;
    });
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleDelete = async (fridgeId) => {
    const itemToAdd = fridgeItems.find(item => item.fridgeId === fridgeId);
    Alert.alert(
      'Usuń produkt',
      'Czy na pewno chcesz usunąć ten produkt z lodówki?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          onPress: async () => {
            try {
              await deleteFromFridge(fridgeId);
              await loadFridgeItems();
              showSnackbar('Produkt usunięty z lodówki');

              if (itemToAdd) {
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
                            name: itemToAdd.product.name,
                            quantity: itemToAdd.product.quantity || 1,
                            unit: itemToAdd.product.unit,
                            category: itemToAdd.product.category
                          });
                          showSnackbar('Dodano do listy zakupów');
                        } catch {
                          showSnackbar('Błąd podczas dodawania do listy zakupów');
                        }
                      }
                    }
                  ]
                );
              }
            } catch {
              showSnackbar('Błąd podczas usuwania produktu');
            }
          }
        }
      ]
    );
  };

  const openEditModal = async (fridgeId) => {
    try {
      const item = await getFridgeItem(fridgeId);
      if (!item) return;
      setCurrentItem(item);
      setEditForm({
        quantity: item.product.quantity?.toString() || '',
        expiryDate: item.expirationDate || '',
        storageLocation: item.product.storageLocation || '',
        notes: item.product.notes || ''
      });
      setEditModalVisible(true);
    } catch {
      showSnackbar('Błąd podczas ładowania produktu');
    }
  };

  const handleEditSubmit = async () => {
    try {
      await updateInFridge(currentItem.fridgeId, {
        expirationDate: editForm.expiryDate,
        storageLocation: editForm.storageLocation,
        notes: editForm.notes
      });
      await loadFridgeItems();
      setEditModalVisible(false);
      showSnackbar('Produkt zaktualizowany');
    } catch {
      showSnackbar('Błąd podczas aktualizacji produktu');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nie ustawiono';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Szukaj w lodówce..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {processedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Title style={styles.emptyText}>Lodówka jest pusta</Title>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('BarcodeScanner')}
            >
              Dodaj produkty
            </Button>
          </View>
        ) : (
          processedItems.map((item, index) => {
            if (item.type === 'single') {
              const data = item.data;
              return (
                <Card key={data.fridgeId} style={styles.productCard}>
                  {data.product.imageUri && <Card.Cover source={{ uri: data.product.imageUri }} style={styles.productImage} />}
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <Title style={styles.productName}>{data.product.name}</Title>
                      <View style={styles.actions}>
                        <IconButton icon="pencil" size={20} onPress={() => openEditModal(data.fridgeId)} />
                        <IconButton icon="delete" size={20} onPress={() => handleDelete(data.fridgeId)} />
                      </View>
                    </View>

                    <Text variant="bodyMedium">
                      <Text style={styles.detailLabel}>Ilość: </Text>
                      {data.product.quantity} {data.product.unit}
                    </Text>
                    <Text variant="bodyMedium">
                      <Text style={styles.detailLabel}>Miejsce: </Text>
                      {data.product.storageLocation}
                    </Text>
                    <Text variant="bodyMedium">
                      <Text style={styles.detailLabel}>Data ważności: </Text>
                      {formatDate(data.expirationDate)}
                    </Text>
                    <Text variant="bodyMedium">
                      <Text style={styles.detailLabel}>Data dodania: </Text>
                      {formatDate(data.addedDate)}
                    </Text>
                    {data.product.notes ? (
                      <Text variant="bodyMedium">
                        <Text style={styles.detailLabel}>Notatki: </Text>
                        {data.product.notes}
                      </Text>
                    ) : null}
                    {data.product.category && <Chip style={styles.categoryChip}>{data.product.category}</Chip>}
                  </Card.Content>
                </Card>
              );
            } else {
              return (
                <Card key={index} style={styles.productCard}>
                  {item.items[0].product.imageUri && <Card.Cover source={{ uri: item.items[0].product.imageUri }} style={styles.productImage} />}
                  <TouchableOpacity onPress={() => toggleGroup(index)}>
                    <Card.Content>
                      <View style={styles.cardHeader}>
                        <Title style={styles.productName}>{item.product.name}</Title>
                        <MaterialIcons name={item.expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color="#666" />
                      </View>
                      {!item.expanded && (
                        <View style={styles.detailsRow}>
                          <Text variant="bodyMedium">
                            <Text style={styles.detailLabel}>Łączna ilość: </Text>
                            {item.items.reduce((sum, i) => sum + (i.product.quantity || 0), 0)} {item.items[0].product.unit}
                          </Text>
                          <Chip style={styles.categoryChip}>{item.items[0].product.category}</Chip>
                        </View>
                      )}
                    </Card.Content>
                  </TouchableOpacity>
                  {item.expanded && (
                    <Card.Content style={styles.groupContent}>
                      {item.items.map((groupItem) => (
                        <View key={groupItem.fridgeId} style={[styles.groupItem, styles.groupItemBorder]}>
                          <View style={styles.groupItemDetails}>
                            <Text variant="bodyMedium">
                              <Text style={styles.detailLabel}>Data dodania: </Text>
                              {formatDate(groupItem.addedDate)}
                            </Text>
                            <Text variant="bodyMedium">
                              <Text style={styles.detailLabel}>Data ważności: </Text>
                              {formatDate(groupItem.expirationDate)}
                            </Text>
                            <Text variant="bodyMedium">
                              <Text style={styles.detailLabel}>Miejsce: </Text>
                              {groupItem.product.storageLocation}
                            </Text>
                            {groupItem.product.notes && (
                              <Text variant="bodyMedium">
                                <Text style={styles.detailLabel}>Notatki: </Text>
                                {groupItem.product.notes}
                              </Text>
                            )}
                          </View>
                          <View style={styles.actions}>
                            <IconButton icon="pencil" size={20} onPress={() => openEditModal(groupItem.fridgeId)} />
                            <IconButton icon="delete" size={20} onPress={() => handleDelete(groupItem.fridgeId)} />
                          </View>
                        </View>
                      ))}
                    </Card.Content>
                  )}
                </Card>
              );
            }
          })
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
              label="Data ważności (RRRR-MM-DD)"
              value={editForm.expiryDate}
              onChangeText={(text) => setEditForm({ ...editForm, expiryDate: text })}
              style={styles.input}
            />
            <TextInput
              label="Notatki"
              value={editForm.notes}
              onChangeText={(text) => setEditForm({ ...editForm, notes: text })}
              style={styles.input}
              multiline
            />
            <View style={styles.modalButtons}>
              <Button mode="outlined" onPress={() => setEditModalVisible(false)} style={styles.modalButton}>Anuluj</Button>
              <Button mode="contained" onPress={handleEditSubmit} style={styles.modalButton}>Zapisz</Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: { marginBottom: 10, borderRadius: 8 },
  scrollContainer: { paddingBottom: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, marginBottom: 20, color: '#666' },
  productCard: { marginBottom: 15, borderRadius: 10, elevation: 3 },
  productImage: { height: 150 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  productName: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  detailLabel: { fontWeight: 'bold', color: '#555' },
  categoryChip: { alignSelf: 'flex-start', marginLeft: 5 },
  actions: { flexDirection: 'row' },
  groupContent: { paddingTop: 0 },
  groupItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10 },
  groupItemBorder: { borderBottomWidth: 1, borderBottomColor: '#eee' },
  groupItemDetails: { flex: 1 },
  modal: { padding: 20 },
  modalTitle: { marginBottom: 15, textAlign: 'center' },
  input: { marginBottom: 10, backgroundColor: 'white' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  modalButton: { flex: 1, marginHorizontal: 5 }
});

export default FridgeScreen;
