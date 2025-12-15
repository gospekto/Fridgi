import axios from "../../../axios";

export const fetchProducts = async () => {
  const res = await axios.get("/products");
  return res.data;
};

export const createProduct = async (product) => {
  const res = await axios.post("/products", {
    name: product.name,
    barcode: product.barcode,
  });

  return res.data;
};

export const updateProduct = async (product) => {
  await axios.put(`/products/${product.id}`, {
    name: product.name,
    barcode: product.barcode,
  });
};

export const deleteProduct = async (id) => {
  await axios.delete(`/products/${id}`);
};
