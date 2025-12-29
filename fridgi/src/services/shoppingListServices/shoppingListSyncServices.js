import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateId } from "../productServices/productsServices";
import * as api from "./shoppingListAPIServices";
import { getShoppingList } from "./shoppingListServices";

const SHOPPING_LIST_KEY = "@shoppingList";

export const syncShoppingList = async () => {
  const items = await getShoppingList();
  console.log("syncing shoppingList");
  const result = [];

  for (const item of items) {
    try {
      if (item.syncStatus === "created") {
        console.log("dodawanie");
        const res = await api.createShoppingItem(item);
        result.push({
          ...item,
          remoteId: res.id,
          syncStatus: "synced",
        });
        continue;
      }

      if (item.syncStatus === "updated") {
        if (!item.remoteId) throw new Error("Brak ID backendu");
        await api.updateShoppingItem(item);
        result.push({ ...item, syncStatus: "synced" });
        continue;
      }

      if (item.syncStatus === "deleted") {
        if (item.remoteId) {
          await api.deleteShoppingItem(item.remoteId);
        }
        continue;
      }

      result.push(item);
    } catch (err) {
      console.warn("Sync failed for shopping item:", item);
      result.push(item);
    }
  }

  console.log(result);
  await AsyncStorage.setItem(
    SHOPPING_LIST_KEY,
    JSON.stringify(result)
  );
};

export const pullShoppingListFromBackend = async () => {
  const remoteItems = await api.fetchShoppingList();

  const normalized = remoteItems.map(item => ({
    ...item,
    shoppingId: generateId(),
    syncStatus: "synced",
  }));

  await AsyncStorage.setItem(
    SHOPPING_LIST_KEY,
    JSON.stringify(normalized)
  );
};
