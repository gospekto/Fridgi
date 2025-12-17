import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProductDatabase, getProductsWithoutId } from "./productsServices";
import * as api from "./productsAPIService";

const PRODUCT_DB_KEY = "@productDatabase";

export const syncProducts = async () => {
  const products = await getProductsWithoutId();
  const result = [];
  for (const product of products) {
    try {
      if(product.id !== null) {
        if (product.syncStatus === "created") {
          const res = await api.createProduct(product);
          result.push({
            ...product,
            remoteId: res.id,
            syncStatus: "synced"
          });
          continue;
        }

        if (product.syncStatus === "updated") {
          if (!product.remoteId) throw new Error("Brak ID backendu");

          await api.updateProduct(product);
          result.push({ ...product, syncStatus: "synced" });
          continue;
        }

        if (product.syncStatus === "deleted") {
          if (product.remoteId) {
            await api.deleteProduct(product.remoteId);
          }
          continue;
        }

        result.push(product);

      }

    } catch (err) {
      console.warn("Sync failed for product:", product);
      result.push(product);
    }
  }

  await AsyncStorage.setItem(PRODUCT_DB_KEY, JSON.stringify(result));
};

export const pullProductsFromBackend = async () => {
  const remoteProducts = await api.fetchProducts();
  const normalized = remoteProducts.map(p => ({
    ...p,
    localId: generateId(),
    syncStatus: "synced"
  }));

  await AsyncStorage.setItem(
    PRODUCT_DB_KEY,
    JSON.stringify(normalized)
  );
};
