import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../productServices/productsServices';

const PRODUCT_REVIEWS_KEY = '@productReviews';

export const getAllReviews = async () => {
  try {
    const json = await AsyncStorage.getItem(PRODUCT_REVIEWS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Error getting reviews', e);
    return [];
  }
};

export const getReviewByProductId = async (productId) => {
  const reviews = await getAllReviews();

  const productReviews = reviews.filter(
    (r) => r.productId === productId
  );

  if (productReviews.length === 0) {
    return null;
  }

  return productReviews[0];
};


export const hasProductReview = async (productId) => {
  const reviews = await getAllReviews();
  return reviews.some(r => r.productId === productId);
};

export const addProductReview = async ({ productId, rating, comment }) => {
  const reviews = await getAllReviews();

  const newReview = {
    rewiewId: generateId(),
    remoteId: null,
    productId,
    rating,
    comment,
    createdAt: new Date().toISOString(),
    syncStatus: 'created',
  };

  const updated = [...reviews, newReview];
  await AsyncStorage.setItem(PRODUCT_REVIEWS_KEY, JSON.stringify(updated));

  return newReview;
};

export const updateProductReview = async ({ reviewId, rating, comment }) => {
  const reviews = await getAllReviews();

  const updatedReviews = reviews.map(r =>
    r.rewiewId === reviewId
      ? { 
        ...r, 
        rating, 
        comment, 
        updatedAt: new Date().toISOString(),
        syncStatus: r.syncStatus === 'created' ? 'created' : 'updated', }
      : r
  );

  await AsyncStorage.setItem(PRODUCT_REVIEWS_KEY, JSON.stringify(updatedReviews));

  return updatedReviews.find(r => r.rewiewId === reviewId);
};

export const deleteProductReview = async (reviewId) => {
  const reviews = await getAllReviews();
  
  const updated = reviews.map(item =>
    item.reviewId === reviewId
    ? { ...item, syncStatus: 'deleted' }
    : item
  );
  
  await AsyncStorage.setItem(PRODUCT_REVIEWS_KEY, JSON.stringify(updated));
  console.log("usuwanie");
};
