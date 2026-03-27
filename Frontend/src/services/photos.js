import axios from "axios";

const url = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Obtener todas las fotos
export const getPhotos = async () => {
  const response = await fetch(`${url}/photos`);
  const photos = await response.json();
  return photos;
};

export const getPhotosByPet = async (id) => {
  const response = await fetch(`${url}/photos/pet/${id}`);
  const photos = await response.json();
  return photos;
};

export const BASE_URL = url.replace("/api", "");

// Función para subir una foto
export async function uploadPhoto(formData) {
  return axios.post(`${url}/photos`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// Función para eliminar una foto
export const deletePhoto = async (id) => {
  return axios.delete(`${url}/photos/${id}`);
};
