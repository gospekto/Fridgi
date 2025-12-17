import axios from "../../../axios";

export const fetchFridgeItems = async () => {
  const res = await axios.get("/fridge-items");
  return res.data;
};

export const createFridgeItem = async (item) => {
  const res = await axios.post("/fridge-items", item);
  return res.data;
};

export const updateFridgeItem = async (item) => {
  await axios.put(`/fridge-items/${item.remoteId}`, item);
};

export const deleteFridgeItem = async (id) => {
  await axios.delete(`/fridge-items/${id}`);
};
