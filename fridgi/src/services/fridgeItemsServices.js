import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProductDatabase, generateId } from "./productServices/productsServices";

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
        const product = productsDb.find(p => p.id === item.productId);
        if (!product) return null;

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


export const getProductsFromFridge = async () => {
  return await getFridgeItems();
};

export const getProductsInFridgeByBarcode = async (barcode) => {
  const fridgeItems = await getFridgeItems();
  return fridgeItems.filter(
    item => item.product.barcode === barcode
  );
};

export const getFridgeItem = async (fridgeId) => {
  try {
    const fridgeItems = await getFridgeItems();
    const productsDb = await getProductDatabase();

    const item = fridgeItems.find(i => i.fridgeId === fridgeId);
    if (!item) return null;

    const product = productsDb.find(p => p.id === item.productId);
    if (!product) return null;

    return {
      ...item,
      product
    };
  } catch (error) {
    console.error('Error getting fridge item:', error);
    throw error;
  }
};

export const addToFridge = async (productId, expirationDate = null) => {
  try {
    const fridgeItems = await getFridgeItems();
    const productsDb = await getProductDatabase();

    const product = productsDb.find(p => p.id === productId);
    if (!product) {
      throw new Error('Produkt nie istnieje w bazie');
    }

    const fridgeItem = {
      fridgeId: generateId(),
      productId,
      addedDate: new Date().toISOString(),
      expirationDate,
      lastUpdated: new Date().toISOString()
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
    const index = fridgeItems.findIndex(item => item.fridgeId === fridgeId);
    
    if (index === -1) throw new Error('Product not found in fridge');
    
    const updatedItem = {
      ...fridgeItems[index],
      ...updates,
      lastUpdated: new Date().toISOString(),
      fridgeId
    };
    
    const newFridge = [...fridgeItems];
    newFridge[index] = updatedItem;
    
    await AsyncStorage.setItem(FRIDGE_KEY, JSON.stringify(newFridge));
    return updatedItem;
  } catch (error) {
    console.error('Error updating fridge item:', error);
    throw error;
  }
};

export const removeFromFridge = async (fridgeId) => {
  try {
    const fridgeItems = await getFridgeItems();
    const updatedFridge = fridgeItems.filter(item => item.fridgeId !== fridgeId);
    await AsyncStorage.setItem(FRIDGE_KEY, JSON.stringify(updatedFridge));
    return updatedFridge;
  } catch (error) {
    console.error('Error removing from fridge:', error);
    throw error;
  }
};



// Alias dla spójności
export const deleteFromFridge = removeFromFridge;