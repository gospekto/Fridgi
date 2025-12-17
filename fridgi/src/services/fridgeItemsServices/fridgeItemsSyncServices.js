import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFridgeItemsRaw
} from "./fridgeItemsServices";
import { generateId } from "../productServices/productsServices";
import * as api from "./fridgeItemsAPIServices";

const FRIDGE_KEY = "@fridge";

const getFridgeItemsWithoutLocalId = async () => {
  const items = await getFridgeItemsRaw();
  return items.map(item => {
    const copy = { ...item };
    delete copy.fridgeId;
    return copy;
  });
};

export const syncFridgeItems = async () => {
  const fridgeItems = await getFridgeItemsWithoutLocalId();
  const result = [];

  for (const item of fridgeItems) {
    try {
      if (item.syncStatus === "created") {
        const res = await api.createFridgeItem(item);
        result.push({
          ...item,
          remoteId: res.id,
          syncStatus: "synced"
        });
        continue;
      }

      if (item.syncStatus === "updated") {
        if (!item.remoteId) throw new Error("Brak ID backendu");
        await api.updateFridgeItem(item);
        result.push({ ...item, syncStatus: "synced" });
        continue;
      }

      if (item.syncStatus === "deleted") {
        if (item.remoteId) {
          await api.deleteFridgeItem(item.remoteId);
        }
        continue;
      }

      result.push(item);
    } catch (err) {
      console.warn("Sync failed for fridge item:", item);
      result.push(item);
    }
  }

  await AsyncStorage.setItem(FRIDGE_KEY, JSON.stringify(result));
};

export const pullFridgeItemsFromBackend = async () => {
  const remoteItems = await api.fetchFridgeItems();

  const normalized = remoteItems.map(item => ({
    ...item,
    fridgeId: generateId(),
    syncStatus: "synced"
  }));

  await AsyncStorage.setItem(
    FRIDGE_KEY,
    JSON.stringify(normalized)
  );
};
