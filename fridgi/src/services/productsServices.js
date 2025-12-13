import AsyncStorage from '@react-native-async-storage/async-storage';

const PRODUCTS_KEY = '@products';
const FRIDGE_KEY = '@fridge';
const PRODUCT_DB_KEY = '@productDatabase';
const SHOPPING_LIST_KEY = '@shoppingList';

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Baza produktów
export const getProductDatabase = async () => {
  try {
    const dbJson = await AsyncStorage.getItem(PRODUCT_DB_KEY);
    return dbJson ? JSON.parse(dbJson) : [];
  } catch (error) {
    console.error('Error getting product DB:', error);
    return [];
  }
};

export const addToProductDatabase = async (product) => {
  try {
    const existingProducts = await getProductDatabase();
    const productWithId = {
      ...product,
      id: generateId(),
      barcode: product.barcode || null,
      createdAt: new Date().toISOString() 
    };
    const updatedProducts = [...existingProducts, productWithId];
    await AsyncStorage.setItem(PRODUCT_DB_KEY, JSON.stringify(updatedProducts));
    return productWithId;
  } catch (error) {
    console.error('Error adding to product DB:', error);
    throw error;
  }
};

export const getProductByBarcode = async (barcode) => {
  try {
    const products = await getProductDatabase();
    return products.filter(p => p.barcode === barcode);
  } catch (error) {
    console.error('Error getting product by barcode:', error);
    return [];
  }
};

export const updateProductInDatabase = async (productId, updates) => {
  try {
    const products = await getProductDatabase();
    const index = products.findIndex(p => p.id === productId);
    
    if (index === -1) throw new Error('Product not found');
    
    const updatedProduct = {
      ...products[index],
      ...updates,
      id: productId
    };
    
    const newProducts = [...products];
    newProducts[index] = updatedProduct;
    
    await AsyncStorage.setItem(PRODUCT_DB_KEY, JSON.stringify(newProducts));
    return updatedProduct;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProductFromDatabase = async (productId) => {
  try {
    const products = await getProductDatabase();
    const updatedProducts = products.filter(p => p.id !== productId);
    await AsyncStorage.setItem(PRODUCT_DB_KEY, JSON.stringify(updatedProducts));
    return updatedProducts;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Lodówka
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

// Lista zakupów
export const getShoppingList = async () => {
  try {
    const listJson = await AsyncStorage.getItem(SHOPPING_LIST_KEY);
    return listJson ? JSON.parse(listJson) : [];
  } catch (error) {
    console.error('Error getting shopping list:', error);
    return [];
  }
};

export const addToShoppingList = async (item) => {
  try {
    const list = await getShoppingList();
    const normalizedName = item.name.trim().toLowerCase();
    const existingIndex = list.findIndex(
      (i) => i.name.trim().toLowerCase() === normalizedName
    );

    if (existingIndex !== -1) {
      const existing = list[existingIndex];
      const updatedItem = {
        ...existing,
        quantity:
          (parseFloat(existing.quantity) || 1) +
          (parseFloat(item.quantity) || 1),
        lastUpdated: new Date().toISOString(),
      };
      const newList = [...list];
      newList[existingIndex] = updatedItem;
      await AsyncStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(newList));
      return updatedItem;
    }

    const itemWithId = {
      ...item,
      quantity: parseFloat(item.quantity) || 1,
      shoppingId: generateId(),
      addedDate: new Date().toISOString(),
      checked: false,
    };
    const updatedList = [...list, itemWithId];
    await AsyncStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(updatedList));
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
      shoppingId
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

export const removeFromShoppingList = async (shoppingId) => {
  try {
    const list = await getShoppingList();
    const updatedList = list.filter(item => item.shoppingId !== shoppingId);
    await AsyncStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(updatedList));
    return updatedList;
  } catch (error) {
    console.error('Error removing from shopping list:', error);
    throw error;
  }
};

// Alias dla spójności
export const deleteFromFridge = removeFromFridge;