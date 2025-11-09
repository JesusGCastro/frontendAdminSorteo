// src/api.js
const API_URL = "https://apigatewaysorteos.onrender.com";
const RAFFLES_PATH = "api/raffles";


// Crear sorteo
export const crearSorteo = async (sorteoData, token) => {
  const res = await fetch(`${API_URL}/${RAFFLES_PATH}`, { 
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(sorteoData),
  });
  if (!res.ok) {
    throw new Error(`Error al crear sorteo: ${res.status}`);
  }
  const data = await res.json();
  return data;
}

// Consultar sorteos
export const consultarSorteos = async () => {
    const res = await fetch(`${API_URL}/${RAFFLES_PATH}`, { 
      method: "GET",
    });

    if (!res.ok) {
      throw new Error(`Error al consultar sorteos: ${res.status}`);
    }

    const data = await res.json();
    return data;
};

// Obtener sorteo por ID
export const getSorteoById = async (id) => {
  const res = await fetch(`${API_URL}/${RAFFLES_PATH}/${id}`, { 
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(`Error al obtener sorteo: ${res.status}`);
  }
  const data = await res.json();
  return data;
};

// Apartar números para un sorteo
export const apartarNumeros = async (sorteoId, numeros, token) => {
  const bodyData = { sorteoId, numeros };
  const res = await fetch(`${API_URL}/${RAFFLES_PATH}/${sorteoId}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(bodyData),
  });
  if (!res.ok) {
    throw new Error(`Error al apartar números: ${res.status}`);
  }
  const data = await res.json();
  return data;
}

