import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getImages = async (skip = 0, limit = 9999) => {
  const response = await api.get("/labels", { params: { skip, limit } });
  return response.data;
};

export const updateImageLabel = async (path, imageLabel) => {
  const response = await api.put(`/labels/${path}`, { label: imageLabel });
  return response.data;
};

export const loadImage = async (path, size) => {
  const response = await api.get(`/images/${path}`, { params: { size } });
  return response.request.responseURL;
};

export const getMaxImages = async () => {
  const response = await api.get("/images/");
  return response.data;
};
