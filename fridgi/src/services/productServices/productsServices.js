import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteProduct } from './productsAPIService';

const PRODUCT_DB_KEY = '@productDatabase';

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const getProductDatabase = async () => {
  try {
    const dbJson = await AsyncStorage.getItem(PRODUCT_DB_KEY);
    return dbJson ? JSON.parse(dbJson) : [];
  } catch (error) {
    console.error('Error getting product DB:', error);
    return [];
  }
};

export const getProductsWithoutId = async () => {
  const products = await getProductDatabase();
  return products.map(product => {
    // const data = product.toJSON();
    delete product.id;
    return product;
  });
};


export const addToProductDatabase = async (product) => {
  try {
    const existingProducts = await getProductDatabase();
    const productWithId = {
      ...product,
      id: generateId(),
      remoteId: null,
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

export const updateProductInDatabase = async (id, updates) => {
  try {
    const products = await getProductDatabase();

    const updated = products.map(p => {
      if (p.id !== id) return p;

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

export const deleteProductFromDatabase = async (id) => {
  try {
    const products = await getProductDatabase();
    const updatedProducts = products.map(p =>
      p.id === id
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

