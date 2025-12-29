import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProductDatabase, generateId } from "../productServices/productsServices";

const FRIDGE_KEY = '@fridge';

export const getFridgeItemsRaw = async () => {
  const fridgeJson = await AsyncStorage.getItem(FRIDGE_KEY);
  return fridgeJson ? JSON.parse(fridgeJson) : [];
};


export const getFridgeItems = async () => {
  try {
    const fridgeItems = await getFridgeItemsRaw();
    const productsDb = await getProductDatabase();

    return fridgeItems
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

export const getExistingFridgeItems = async () => {
  try {
    const fridgeItems = await getFridgeItemsRaw();
    const productsDb = await getProductDatabase();

    const filteredfridgeItems = fridgeItems.filter(p => p.syncStatus !== 'deleted');

    return filteredfridgeItems
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

export const getFridgeItemsWithoutLocalId = async () => {
  const items = await getFridgeItemsRaw();
  return items.map(item => {
    const copy = { ...item };
    delete copy.fridgeId;
    return copy;
  });
};

export const getProductsFromFridge = async () => {
  return await getFridgeItems();
};

export const getProductsInFridgeByBarcode = async (barcode) => {
  const fridgeItems = await getExistingFridgeItems();
  return fridgeItems.filter(
    item => item.product.barcode === barcode
  );
};

export const getFridgeItem = async (fridgeId) => {
  try {
    const fridgeItems = await getFridgeItems();

    const item = fridgeItems.find(i => i.fridgeId === fridgeId);
    if (!item) return null;


    return item;
  } catch (error) {
    console.error('Error getting fridge item:', error);
    throw error;
  }
};

export const addToFridge = async (productId, expirationDate = null) => {
  try {
    const fridgeItems = await getFridgeItems();
    const productsDb = await getProductDatabase();
    let product = productsDb.find(p => p.remoteId === productId);
    if (!product) { 
      product = productsDb.find(p => p.id === productId);
      if (!product) {
        throw new Error('Produkt nie istnieje w bazie');
      }
    }
    const fridgeItem = {
      fridgeId: generateId(),
      remoteId: null,
      productId,
      addedDate: new Date().toISOString(),
      expirationDate,
      lastUpdated: new Date().toISOString(),
      syncStatus: 'created',
    };

    const updatedFridge = [...fridgeItems, fridgeItem];
    await AsyncStorage.setItem(FRIDGE_KEY, JSON.stringify(updatedFridge));

    return fridgeItem;
  } catch (error) {
    console.error('Error adding to fridge:', error);
    throw error;
  }
};


export const updateInFridge = async (fridgeId, updates) => {
  try {
    const fridgeItems = await getFridgeItems();

    const updatedItems = fridgeItems.map(p => {
      if (p.fridgeId !== fridgeId) return p;

      return {
        ...p,
        ...updates,
        lastUpdated: new Date().toISOString(),
        fridgeId,
        syncStatus: p.syncStatus === 'created' ? 'created' : 'updated'
      };
    });
    
    await AsyncStorage.setItem(FRIDGE_KEY, JSON.stringify(updatedItems));
    return updatedItems;
  } catch (error) {
    console.error('Error updating fridge item:', error);
    throw error;
  }
};

export const replaceProductIdInFridge = async (oldProductID, newProductID) => {
  try {
    const fridgeItems = await getFridgeItemsRaw();

    let changed = false;

    const updatedItems = fridgeItems.map(item => {
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
        FRIDGE_KEY,
        JSON.stringify(updatedItems)
      );
    }

    return updatedItems;
  } catch (error) {
    console.error(
      'Error replacing productId in fridge:',
      error
    );
    throw error;
  }
};


export const removeFromFridge = async (fridgeId) => {
  try {
    const fridgeItems = await getFridgeItems();
    const updatedFridge = fridgeItems.map(p =>
      p.fridgeId === fridgeId
        ? { ...p, syncStatus: 'deleted' }
        : p
    );

    const filteredFridge = updatedFridge.filter(item => item.fridgeId !== fridgeId)

    await AsyncStorage.setItem(FRIDGE_KEY, JSON.stringify(updatedFridge));
    return filteredFridge;
  } catch (error) {
    console.error('Error removing from fridge:', error);
    throw error;
  }
};

