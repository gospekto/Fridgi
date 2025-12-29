import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProductDatabase, generateId } from "../productServices/productsServices";

const SHOPPING_LIST_KEY = '@shoppingList';



export const getShoppingListItems = async () => {
  try {
    const list = await getShoppingList();
    const productsDb = await getProductDatabase();
    return list
      .map(item => {
        let product = productsDb.find(p => p.remoteId === item.productId);
        if(!product) {
          product = productsDb.find(p => p.id === item.productId);
          if (!product) return null;
        }

        return {
          ...item,
          product
        };
      })
      .filter(Boolean);
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getExistingShoppingListItems = async () => {
  try {
    const list = await getShoppingList();
    const productsDb = await getProductDatabase();
    
    const filteredShoppingList = list.filter(i => i.syncStatus !== 'deleted');
    
    return filteredShoppingList
      .map(item => {
        let product = productsDb.find(p => p.remoteId === item.productId);
        if(!product) {
          product = productsDb.find(p => p.id === item.productId);
          if (!product) return null;
        }

        return {
          ...item,
          product
        };
      })
      .filter(Boolean);
  } catch (e) {
    console.error(e);
    return [];
  }
};


export const getShoppingList = async () => {
  try {
    const listJson = await AsyncStorage.getItem(SHOPPING_LIST_KEY);
    return listJson ? JSON.parse(listJson) : [];
  } catch (error) {
    console.error('Error getting shopping list:', error);
    return [];
  }
};

export const addToShoppingList = async (productId, quantity = 1) => {
  try {
    const list = await getShoppingList();
    const existingIndex = list.findIndex(
      item => item.productId === productId
    );

    if (existingIndex !== -1) {
      const existing = list[existingIndex];

      const updatedItem = {
        ...existing,
        quantity: (existing.quantity || 1) + quantity,
        lastUpdated: new Date().toISOString(),
        syncStatus: 'updated',
      };

      const newList = [...list];
      newList[existingIndex] = updatedItem;

      await AsyncStorage.setItem(
        SHOPPING_LIST_KEY,
        JSON.stringify(newList)
      );

      return updatedItem;
    }

    const itemWithId = {
      shoppingId: generateId(),
      productId,
      quantity,
      addedDate: new Date().toISOString(),
      checked: false,
      lastUpdated: new Date().toISOString(),
      syncStatus: 'created',
    };

    const updatedList = [...list, itemWithId];
    await AsyncStorage.setItem(
      SHOPPING_LIST_KEY,
      JSON.stringify(updatedList)
    );

    return itemWithId;
  } catch (error) {
    console.error('Error adding to shopping list:', error);
    throw error;
  }
};

export const updateShoppingItem = async (shoppingId, updates) => {
  try {
    const list = await getShoppingList();
    const index = list.findIndex(item => item.shoppingId === shoppingId);

    if (index === -1) throw new Error('Item not found in shopping list');

    const updatedItem = {
      ...list[index],
      ...updates,
      shoppingId,
      syncStatus: list[index].syncStatus === 'created' ? 'created' : 'updated',
    };

    const newList = [...list];
    newList[index] = updatedItem;

    await AsyncStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(newList));
    return updatedItem;
  } catch (error) {
    console.error('Error updating shopping list item:', error);
    throw error;
  }
};

export const replaceProductIdInShoppingList = async (
  oldProductID,
  newProductID
) => {
  try {
    const shoppingList = await getShoppingList();

    let changed = false;

    const updatedList = shoppingList.map(item => {
      if (item.productId !== oldProductID) return item;

      changed = true;

      return {
        ...item,
        productId: newProductID,
        lastUpdated: new Date().toISOString(),
        syncStatus:
          item.syncStatus === 'created'
            ? 'created'
            : 'updated',
      };
    });

    if (changed) {
      await AsyncStorage.setItem(
        SHOPPING_LIST_KEY,
        JSON.stringify(updatedList)
      );
    }

    return updatedList;
  } catch (error) {
    console.error(
      'Error replacing productId in shopping list:',
      error
    );
    throw error;
  }
};


export const removeFromShoppingList = async (shoppingId) => {
  const list = await getShoppingList();

  const updated = list.map(item =>
    item.shoppingId === shoppingId
      ? { ...item, syncStatus: 'deleted' }
      : item
  );

  await AsyncStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(updated));

  return updated.filter(i => i.shoppingId !== shoppingId);
};
