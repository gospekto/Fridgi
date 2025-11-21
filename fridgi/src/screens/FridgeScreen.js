import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
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
  getFridgeItem,
  addToShoppingList
} from '../services/productsServices';

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
    try {
      const items = await getFridgeItems();
      setFridgeItems(items);
      processItems(items);
    } catch (error) {
      showSnackbar('Błąd ładowania zawartości lodówki');
    } finally {
      setIsLoading(false);
    }
  };

  const processItems = (items) => {
    const grouped = {};
    items.forEach(item => {
      if (!grouped[item.name]) {
        grouped[item.name] = [];
      }
      grouped[item.name].push(item);
    });

    const result = [];
    Object.keys(grouped).forEach(name => {
      if (grouped[name].length === 1) {
        result.push({
          type: 'single',
          data: grouped[name][0]
        });
      } else {
        result.push({
          type: 'group',
          name: name,
          items: grouped[name],
          expanded: false
        });
      }
    });

    setProcessedItems(result);
  };

  useEffect(() => {
    if (searchQuery === '') {
      processItems(fridgeItems);
    } else {
      const filtered = fridgeItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      processItems(filtered);
    }
  }, [searchQuery, fridgeItems]);

  const toggleGroup = (index) => {
    setProcessedItems(prev => {
      const newItems = [...prev];
      if (newItems[index].type === 'group') {
        newItems[index] = {
          ...newItems[index],
          expanded: !newItems[index].expanded
        };
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
                            name: itemToAdd.name,
                            quantity: itemToAdd.quantity,
                            unit: itemToAdd.unit,
                            category: itemToAdd.category
                          });
                          showSnackbar('Dodano do listy zakupów');
                        } catch (error) {
                          showSnackbar('Błąd podczas dodawania do listy zakupów');
                        }
                      }
                    }
                  ]
                );
              }
            } catch (error) {
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
      setCurrentItem(item);
      setEditForm({
        quantity: item.quantity.toString(),
        expiryDate: item.expiryDate || '',
        storageLocation: item.storageLocation || 'Lodówka',
        notes: item.notes || ''
      });
      setEditModalVisible(true);
    } catch (error) {
      showSnackbar('Błąd podczas ładowania produktu');
    }
  };

  const handleEditSubmit = async () => {
    try {
      await updateInFridge(currentItem.fridgeId, {
        quantity: parseFloat(editForm.quantity) || 1,
        expiryDate: editForm.expiryDate,
        storageLocation: editForm.storageLocation,
        notes: editForm.notes
      });
      await loadFridgeItems();
      setEditModalVisible(false);
      showSnackbar('Produkt zaktualizowany');
    } catch (error) {
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
        <ActivityIndicator animating={true} size="large" />
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
              return (
                <Card key={item.data.fridgeId} style={styles.productCard}>
                  {item.data.imageUri && (
                    <Card.Cover source={{ uri: item.data.imageUri }} style={styles.productImage} />
                  )}
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <Title style={styles.productName}>{item.data.name}</Title>
                      <View style={styles.actions}>
                        <IconButton
                          icon="pencil"
                          size={20}
                          onPress={() => openEditModal(item.data.fridgeId)}
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          onPress={() => handleDelete(item.data.fridgeId)}
                        />
                      </View>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text variant="bodyMedium" style={styles.detailText}>
                        <Text style={styles.detailLabel}>Ilość: </Text>
                        {item.data.quantity} {item.data.unit}
                      </Text>
                      <Chip style={styles.categoryChip}>{item.data.category}</Chip>
                    </View>

                    <Text variant="bodyMedium" style={styles.detailText}>
                      <Text style={styles.detailLabel}>Miejsce: </Text>
                      {item.data.storageLocation}
                    </Text>

                    <Text variant="bodyMedium" style={styles.detailText}>
                      <Text style={styles.detailLabel}>Data ważności: </Text>
                      {formatDate(item.data.expiryDate)}
                    </Text>

                    {item.data.notes && (
                      <Text variant="bodyMedium" style={styles.detailText}>
                        <Text style={styles.detailLabel}>Notatki: </Text>
                        {item.data.notes}
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              );
            } else {
              return (
                <Card key={index} style={styles.productCard}>
                  {item.items[0].imageUri && (
                    <Card.Cover source={{ uri: item.items[0].imageUri }} style={styles.productImage} />
                  )}
                  
                  <TouchableOpacity onPress={() => toggleGroup(index)}>
                    <Card.Content>
                      <View style={styles.cardHeader}>
                        <Title style={styles.productName}>{item.name}</Title>
                        <MaterialIcons
                          name={item.expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                          size={24}
                          color="#666"
                        />
                      </View>

                      {!item.expanded && (
                        <View style={styles.detailsRow}>
                          <Text variant="bodyMedium" style={styles.detailText}>
                            <Text style={styles.detailLabel}>Łączna ilość: </Text>
                            {item.items.reduce((sum, i) => sum + i.quantity, 0)} {item.items[0].unit}
                          </Text>
                          <Chip style={styles.categoryChip}>{item.items[0].category}</Chip>
                        </View>
                      )}
                    </Card.Content>
                  </TouchableOpacity>

                  {item.expanded && (
                    <Card.Content style={styles.groupContent}>
                      {item.items.map((groupItem, groupIndex) => (
                        <View key={groupItem.fridgeId} style={[
                          styles.groupItem,
                          groupIndex < item.items.length - 1 && styles.groupItemBorder
                        ]}>
                          <View style={styles.groupItemDetails}>
                            <Text variant="bodyMedium" style={styles.detailText}>
                              <Text style={styles.detailLabel}>Ilość: </Text>
                              {groupItem.quantity} {groupItem.unit}
                            </Text>
                            <Text variant="bodyMedium" style={styles.detailText}>
                              <Text style={styles.detailLabel}>Data ważności: </Text>
                              {formatDate(groupItem.expiryDate)}
                            </Text>
                            <Text variant="bodyMedium" style={styles.detailText}>
                              <Text style={styles.detailLabel}>Miejsce: </Text>
                              {groupItem.storageLocation}
                            </Text>
                            {groupItem.notes && (
                              <Text variant="bodyMedium" style={styles.detailText}>
                                <Text style={styles.detailLabel}>Notatki: </Text>
                                {groupItem.notes}
                              </Text>
                            )}
                          </View>
                          <View style={styles.actions}>
                            <IconButton
                              icon="pencil"
                              size={20}
                              onPress={() => openEditModal(groupItem.fridgeId)}
                            />
                            <IconButton
                              icon="delete"
                              size={20}
                              onPress={() => handleDelete(groupItem.fridgeId)}
                            />
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
              label="Ilość"
              value={editForm.quantity}
              onChangeText={(text) => setEditForm({...editForm, quantity: text})}
              style={styles.input}
              keyboardType="numeric"
            />

            <TextInput
              label="Data ważności (RRRR-MM-DD)"
              value={editForm.expiryDate}
              onChangeText={(text) => setEditForm({...editForm, expiryDate: text})}
              style={styles.input}
            />

            <TextInput
              label="Miejsce przechowywania"
              value={editForm.storageLocation}
              onChangeText={(text) => setEditForm({...editForm, storageLocation: text})}
              style={styles.input}
            />

            <TextInput
              label="Notatki"
              value={editForm.notes}
              onChangeText={(text) => setEditForm({...editForm, notes: text})}
              style={styles.input}
              multiline
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
    paddingBottom: 20,
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
  productImage: {
    height: 150,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  groupHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  groupThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  groupHeaderText: {
    flex: 1,
  },
  groupItemImage: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  actions: {
    flexDirection: 'row',
  },
  groupContent: {
    paddingTop: 0,
  },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  groupItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupItemDetails: {
    flex: 1,
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
});

export default FridgeScreen;