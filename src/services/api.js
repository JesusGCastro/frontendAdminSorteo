// src/api.js
const API_URL = "https://apigatewaysorteos.onrender.com";
const RAFFLES_PATH = "api/raffles";

// Métodos para manejar sorteos

// Crear sorteo
// export const crearSorteo = async (sorteoData, token) => {
//   const res = await fetch(`${API_URL}/${RAFFLES_PATH}`, { 
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${token}`,
//     },
//     body: JSON.stringify(sorteoData),
//   });
//   if (!res.ok) {
//     throw new Error(`Error al crear sorteo: ${res.status}`);
//   }
//   const data = await res.json();
//   return data;
// }

export const crearSorteo = async (formData, token) => {
  const res = await fetch(`${API_URL}/${RAFFLES_PATH}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: `Error HTTP: ${res.status}` }));
    throw new Error(errorData.error || `Error al crear sorteo: ${res.status}`);
  }

  // DEBES retornar la respuesta para que el componente sepa que tuvo éxito
  return res.json(); 
};

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

// Funcion anterior
// export const apartarNumeros = async (sorteoId, numeros, token) => {
//   const bodyData = { numerosBoletos: numeros };
//   const res = await fetch(`${API_URL}/${RAFFLES_PATH}/${sorteoId}/tickets`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${token}`,
//     },
//     body: JSON.stringify(bodyData),
//   });
//   if (!res.ok) {
//     throw new Error(`Error al apartar números: ${res.status}`);
//   }
//   const data = await res.json();
//   return data;
// }
export const apartarNumeros = async (sorteoId, numeros, token) => {
  const bodyData = { numerosBoletos: numeros };
  const res = await fetch(`${API_URL}/${RAFFLES_PATH}/${sorteoId}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(bodyData),
  });

  if (!res.ok) {
    const errorData = await res.json();

    throw new Error(errorData.error || `Error ${res.status}: No se pudieron apartar los números.`);
  }

  const data = await res.json();
  return data;
}

// Obtener boletos creados de un sorteo

export const getBoletosPorSorteo = async (sorteoId) => {
  const res = await fetch(`${API_URL}/${RAFFLES_PATH}/${sorteoId}/tickets`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Error al consultar los boletos del sorteo: ${res.status}`);
  }

  const data = await res.json();
  return data;
};

/////////////////////////////////////////////////////////////////////////////////////////

// Métodos de autenticación y manejo de sesión

// Guardar puedeCambiarRol
export const setPuedeCambiarRol = (puedeCambiarRol) => {
  localStorage.setItem("puedeCambiarRol", puedeCambiarRol);
};

// Obtener puedeCambiarRol
export const getPuedeCambiarRol = () => {
  return localStorage.getItem("puedeCambiarRol");
}

// Guardar rolActual
export const setRolActual = (rolActual) => {
  localStorage.setItem("rolActual", rolActual);
};

// Obtener rolActual
export const getRolActual = () => {
  return localStorage.getItem("rolActual");
}

// Guardar token
export const saveToken = (token) => {
  localStorage.setItem("token", token);
};

// Obtener token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Borrar token
export const removeToken = () => {
  localStorage.removeItem("token");
};

// Función para verificar token
export const verifyToken = async () => {
  const token = getToken();
  if (!token) return false;

  try {
    const res = await fetch(`${API_URL}/verify-token`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid; // backend devuelve { valid: true/false }
  } catch (err) {
    console.error("Error verificando token:", err);
    return false;
  }
};

// Función para login (con logs de depuración)
export const loginUser = async (correo, contrasenia) => {
  const bodyData = { correo, contrasenia };
  console.log("Enviando datos al backend:", bodyData);

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    console.log("Respuesta recibida (status):", res.status);

    // Si el usuario no existe o contraseña incorrecta
    if (res.status === 404 || res.status === 401) {
      console.warn("Usuario no encontrado o credenciales incorrectas");
      return {}; // Devuelve vacío sin lanzar error
    }

    // Si hubo otro error en el servidor
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error del backend:", errorText);
      throw new Error(`Login fallido (${res.status})`);
    }

    const data = await res.json();
    console.log("Login exitoso. Datos recibidos:", data);

    return data; // { token, user }

  } catch (err) {
    console.error("Error en la función loginUser:", err);
    return {}; // También devuelve vacío en caso de error de conexión o fetch
  }
};


// Función para registro con manejo detallado de errores
export const registerUser = async (nombre, correo, contrasenia) => {
  const bodyData = { nombre, correo, contrasenia };

  console.log("Enviando datos al backend:", bodyData);

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    console.log("Respuesta recibida. Status:", res.status);

    // Intentamos obtener la respuesta del backend (puede ser JSON o texto)
    let responseData;
    try {
      responseData = await res.json();
    } catch {
      responseData = { error: await res.text() };
    }

    // Caso 1: Error del backend (como usuario ya registrado)
    if (res.status >= 400 && res.status < 499) {
      console.warn("Error del backend (usuario o datos inválidos):", responseData);
      throw new Error(responseData.error || "Datos de registro no válidos");
    }

    // Caso 1: Error correo ya registrado
    if (res.status == 500) {
      console.warn("Error del backend (correo ya registrado):", responseData);
      throw new Error(responseData.error || "Correo ya registrado, intenta con otro.");
    }

    // Caso 2: Error del servidor o gateway
    if (res.status >= 502) {
      console.error("Error del servidor o gateway:", responseData);
      throw new Error("Error del servidor o de la API. Intenta más tarde.");
    }

    // Caso 3: Éxito
    console.log("Registro exitoso:", responseData);
    return responseData;

  } catch (err) {
    // Error de red o fetch
    if (err.name === "TypeError") {
      console.error("Error de conexión con la API:", err.message);
      throw new Error("No se pudo conectar con la API Gateway o el servidor.");
    }

    console.error("Error general en fetch registerUser:", err);
    throw err;
  }
};

// Guardar sesión
export const saveSession = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

// Obtener sesión
export const getSession = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return { token, user };
};

// Limpiar sesión
export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("puedeCambiarRol");
  localStorage.removeItem("rolActual");
};

// Obtener información del usuario
export const getUserProfile = async (token) => {
  console.log("Token recibido para perfil:", token);

  try {
    const res = await fetch(`${API_URL}/perfil`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // token en el header
      },
    });

    console.log("Respuesta recibida (status):", res.status);

    // Si la respuesta no fue exitosa
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error del backend:", errorText);
      throw new Error(`Error al obtener perfil (${res.status})`);
    }

    const data = await res.json();
    console.log("Perfil obtenido correctamente:", data);

    return data; // { user }

  } catch (err) {
    console.error("Error en la función getUserProfile:", err);
    throw err;
  }
};

/////////////////////////////////////////////////////////////////////////////////////////