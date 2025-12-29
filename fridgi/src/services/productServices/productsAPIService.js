import axios from "../../../axios";

export const fetchProducts = async () => {
  const res = await axios.get("/products");
  return res.data;
};

export const createProduct = async (product) => {
  const res = await axios.post("/products", product);

  return res.data;
};

export const updateProduct = async (product) => {
  await axios.put(`/products/${product.remoteId}`, product);
};

export const deleteProduct = async (id) => {
  await axios.delete(`/products/${id}`);
};
