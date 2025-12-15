import AsyncStorage from '@react-native-async-storage/async-storage';

const PRODUCT_DB_KEY = '@productDatabase';

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
      localId: generateId(),
      id: null,
      barcode: product.barcode || null,
      createdAt: new Date().toISOString(),
      syncStatus: 'created',
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

export const updateProductInDatabase = async (localId, updates) => {
  try {
    const products = await getProductDatabase();

    const updated = products.map(p => {
      if (p.localId !== localId) return p;

      return {
        ...p,
        ...updates,
        updatedAt: new Date().toISOString(),
        syncStatus: p.syncStatus === 'created' ? 'created' : 'updated'
      };
    });
    
    await AsyncStorage.setItem(PRODUCT_DB_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProductFromDatabase = async (localId) => {
  try {
    const products = await getProductDatabase();
    const updatedProducts = products.map(p =>
      p.localId === localId
        ? { ...p, syncStatus: 'deleted' }
        : p
    );
    await AsyncStorage.setItem(PRODUCT_DB_KEY, JSON.stringify(updatedProducts));
    return updatedProducts;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

