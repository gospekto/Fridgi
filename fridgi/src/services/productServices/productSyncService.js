import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProductDatabase } from "./productsServices";
import * as api from "./productsAPIService";

const PRODUCT_DB_KEY = "@productDatabase";

export const syncProducts = async () => {
  const products = await getProductDatabase();
  const result = [];

  for (const product of products) {
    try {
      if (product.syncStatus === "created") {
        const res = await api.createProduct(product);

        result.push({
          ...product,
          id: res.id,
          syncStatus: "synced"
        });
        continue;
      }

      if (product.syncStatus === "updated") {
        if (!product.id) throw new Error("Brak ID backendu");

        await api.updateProduct(product);
        result.push({ ...product, syncStatus: "synced" });
        continue;
      }

      if (product.syncStatus === "deleted") {
        if (product.id) {
          await api.deleteProduct(product.id);
        }
        continue;
      }

      result.push(product);

    } catch (err) {
      console.warn("Sync failed for product:", product.localId);
      result.push(product);
    }
  }

  await AsyncStorage.setItem(PRODUCT_DB_KEY, JSON.stringify(result));
};
