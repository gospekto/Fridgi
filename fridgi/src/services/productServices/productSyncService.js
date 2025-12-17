import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProductDatabase, getProductsWithoutId } from "./productsServices";
import * as api from "./productsAPIService";
import { replaceProductIdInFridge } from "../fridgeItemsServices/fridgeItemsServices";
import { replaceProductIdInShoppingList } from "../shoppingListServices/shoppingListServices";

const PRODUCT_DB_KEY = "@productDatabase";

export const syncProducts = async () => {
  const products = await getProductDatabase();
  console.log("syncingProducts");
  const result = [];
  for (const product of products) {
    const tmpid = product.id
    try {
      if(product.id !== null) {
        if (product.syncStatus === "created") {
          delete product.id;
          const res = await api.createProduct(product);
          console.log(tmpid);
          result.push({
            ...product,
            id: tmpid,
            remoteId: res.id,
            syncStatus: "synced"
          });

          await replaceProductIdInFridge(tmpid, res.id);
          await replaceProductIdInShoppingList(tmpid, res.id);

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
      result.push({
        ...product,
        id: tmpid,
      });
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
