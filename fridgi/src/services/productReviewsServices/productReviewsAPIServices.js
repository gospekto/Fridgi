import axios from "../../../axios";

export const fetchProductReviews = async () => {
  const res = await axios.get("/product-reviews");
  return res.data;
};

export const createProductReview = async (review) => {
  const res = await axios.post("/product-reviews", review);
  return res.data;
};

export const updateProductReview = async (review) => {
  await axios.put(
    `/product-reviews/${review.remoteId}`,
    review
  );
};

export const deleteProductReview = async (id) => {
  await axios.delete(`/product-reviews/${id}`);
};
