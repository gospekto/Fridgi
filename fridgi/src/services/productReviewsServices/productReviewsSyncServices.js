import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateId } from "./productServices/productsServices";
import * as api from "./productReviewsAPIServices";
import { getAllReviews } from "./productReviewsServices";

const PRODUCT_REVIEWS_KEY = "@productReviews";

export const syncProductReviews = async () => {
  const reviews = await getAllReviews();
  const result = [];

  for (const review of reviews) {
    try {
      if (review.syncStatus === "created") {
        const res = await api.createProductReview(review);
        result.push({
          ...review,
          remoteId: res.id,
          syncStatus: "synced",
        });
        continue;
      }

      if (review.syncStatus === "updated") {
        if (!review.remoteId) {
          throw new Error("Missing remoteId");
        }
        await api.updateProductReview(review);
        result.push({
          ...review,
          syncStatus: "synced",
        });
        continue;
      }

      if (review.syncStatus === "deleted") {
        if (review.remoteId) {
          await api.deleteProductReview(review.remoteId);
        }
        continue;
      }

      result.push(review);
    } catch (err) {
      console.warn("Review sync failed:", review);
      result.push(review);
    }
  }

  await AsyncStorage.setItem(
    PRODUCT_REVIEWS_KEY,
    JSON.stringify(result)
  );
};

export const pullProductReviewsFromBackend = async () => {
  const remoteReviews = await api.fetchProductReviews();

  const normalized = remoteReviews.map(r => ({
    ...r,
    reviewId: generateId(), // ⬅️ lokalne ID
    syncStatus: "synced",
  }));

  await AsyncStorage.setItem(
    PRODUCT_REVIEWS_KEY,
    JSON.stringify(normalized)
  );
};
