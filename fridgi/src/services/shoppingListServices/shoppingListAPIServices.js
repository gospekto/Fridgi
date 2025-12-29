import axios from "../../../axios";

export const fetchShoppingList = async () => {
  const res = await axios.get("/shopping-list");
  return res.data;
};

export const createShoppingItem = async (item) => {
  const res = await axios.post("/shopping-list", item);
  return res.data;
};

export const updateShoppingItem = async (item) => {
  await axios.put(`/shopping-list/${item.remoteId}`, item);
};

export const deleteShoppingItem = async (id) => {
  await axios.delete(`/shopping-list/${id}`);
};
