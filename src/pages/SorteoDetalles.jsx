import React, { useEffect, useState, useMemo } from "react";

// import { useParams } from "react-router-dom";

import { useParams, useNavigate } from "react-router-dom"; 
import {
  getSorteoById,
  apartarNumeros,
  getBoletosPorSorteo,
} from "../services/api";
import { getToken, verifyToken } from "../services/api";
import Sidebar from "../components/Sidebar";
import "../styles/SorteoDetalles.css";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    // Usamos toLocaleDateString para asegurar el formato DD/MM/AAAA
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString; // Devuelve la cadena original si falla la conversión
  }
};

const SorteoDetalles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sorteo, setSorteo] = useState(null);
  const [boletosOcupados, setBoletosOcupados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [boletosSeleccionados, setBoletosSeleccionados] = useState([]);
  const boletosPorPagina = 52;

  // Carga los datos del sorteo y los boletos ocupados al montar el componente
  useEffect(() => {
    const obtenerDatosCompletos = async () => {
      try {
        // Ejecuta ambas llamadas a la API en paralelo para mayor eficiencia
        const [dataSorteo, dataBoletos] = await Promise.all([
          getSorteoById(id),
          getBoletosPorSorteo(id),
        ]);
        setSorteo(dataSorteo);
        setBoletosOcupados(dataBoletos);
      } catch (error) {
        console.error("Error al obtener los datos del sorteo:", error);
        setSorteo({}); // Asigna un objeto vacío para evitar errores si la carga falla
      }
    };
    obtenerDatosCompletos();
  }, [id]); // Se vuelve a ejecutar si el ID del sorteo cambia

  // Crea un mapa para buscar rápidamente el estado de un boleto (más eficiente)
  const boletosEstadoMap = useMemo(() => {
    const map = {};
    boletosOcupados.forEach((boleto) => {
      map[boleto.numeroBoleto] = boleto.estado; // Ej: { '15': 'APARTADO', '22': 'COMPRADO' }
    });
    return map;
  }, [boletosOcupados]);

  // Función para determinar la clase CSS de un boleto
  const estadoBoleto = (num) => {
    if (boletosSeleccionados.includes(num)) {
      return "seleccionado";
    }
    const estadoBackend = boletosEstadoMap[num];
    if (estadoBackend === "APARTADO") {
      return "apartado";
    }
    if (estadoBackend === "COMPRADO") {
      return "vendido";
    }
    return "disponible";
  };

  // Función para manejar la selección de boletos por el usuario
  const alternarSeleccion = (num) => {
    // Impide seleccionar boletos que ya están apartados o vendidos
    if (boletosEstadoMap[num]) {
      return;
    }
    setBoletosSeleccionados((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

    //Funcion anterior

      // const apartarBoletos = () => {
      //   if (boletosSeleccionados.length === 0) {
      //     alert("Selecciona al menos un boleto para apartar.");
      //     return;
      //   }
      //   const token = getToken();
      //   //Debug
      //   console.log("Token:", token);
      //   if (verifyToken(token) === false) {
      //     //Debug
      //     console.error("Token inválido o expirado.");
      //     window.location.href = "/login";
      //     return;
      //   }
      //   const numerosAStrings = boletosSeleccionados.map(String);

      //   apartarNumeros(sorteo.id, numerosAStrings, token)
      //     .then((response) => {
      //       const numerosApartados = response.reservedTickets.map(
      //         (ticket) => ticket.numeroBoleto
      //       );
      //       alert(`Boletos apartados exitosamente: ${numerosApartados.join(", ")}`);

      //       // Refrescar la lista de boletos ocupados para reflejar los nuevos cambios
      //       setBoletosOcupados((prev) => [...prev, ...response.reservedTickets]);
      //       setBoletosSeleccionados([]);

      //       if (response.failedToReserve && response.failedToReserve.length > 0) {
      //         alert(
      //           `Los siguientes boletos no se pudieron apartar (ya estaban ocupados): ${response.failedToReserve.join(
      //             ", "
      //           )}`
      //         );
      //       }
      //     })
      //     .catch((error) => {
      //       console.error("Error al apartar boletos:", error);
      //       alert(`Hubo un error al apartar los boletos: ${error.message}`);
      //     });
      // };


  // Función para llamar a la API y apartar los boletos seleccionados
  const apartarBoletos = () => {
    if (boletosSeleccionados.length === 0) {
      alert("Por favor, selecciona al menos un boleto para apartar.");
      return;
    }

    const token = getToken();
    
    // CAMBIO 1: Mensaje interactivo para cuando no hay sesión iniciada
    if (!token) { 
      if (window.confirm("Para apartar boletos, necesitas iniciar sesión. ¿Deseas ir a la página de inicio de sesión ahora?")) {
        navigate("/login"); // Redirige al usuario a la página de login
      }
      return;
    }

    const numerosAStrings = boletosSeleccionados.map(String);

    apartarNumeros(sorteo.id, numerosAStrings, token)
      .then((response) => {
        const numerosApartados = response.reservedTickets.map(
          (ticket) => ticket.numeroBoleto
        );
        alert(`Boletos apartados exitosamente: ${numerosApartados.join(", ")}`);
        
        setBoletosOcupados((prev) => [...prev, ...response.reservedTickets]);
        setBoletosSeleccionados([]);

        if (response.failedToReserve && response.failedToReserve.length > 0) {
          alert(
            `Los siguientes boletos no se pudieron apartar (ya estaban ocupados): ${response.failedToReserve.join(", ")}`
          );
        }
      })
      .catch((error) => {
        // Mensaje de error mejorado.
        console.error("Error al apartar boletos:", error);
        alert(`Error: ${error.message}`); 
      });
  };


  // Renderizado condicional mientras cargan los datos
  if (!sorteo) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div
          className="flex-grow-1"
          style={{ marginLeft: "80px", padding: "2rem" }}
        >
          <p>Cargando sorteo...</p>
        </div>
      </div>
    );
  }

  // Lógica de paginación
  const boletos = Array.from(
    { length: sorteo.cantidadMaximaBoletos },
    (_, i) => i + 1
  );
  const totalPaginas = Math.ceil(boletos.length / boletosPorPagina);
  const indiceInicio = (paginaActual - 1) * boletosPorPagina;
  const boletosPagina = boletos.slice(
    indiceInicio,
    indiceInicio + boletosPorPagina
  );

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1" style={{ marginLeft: "80px" }}>
        <div className="container py-4">
          <h2 className="fw-bold mb-3">{sorteo.nombre}</h2>

          <div className="sorteo-detalle-card p-4 mb-4">
            <h5 className="fw-bold mb-2">Descripción</h5>
            <p>{sorteo.descripcion}</p>

            <div className="d-flex flex-wrap align-items-center justify-content-around mt-3">
              <img
                src={sorteo.imagen}
                alt={sorteo.nombre}
                className="sorteo-imagen"
              />
              <div className="sorteo-info mt-3">
                <p>
                  <strong>Premio:</strong> {sorteo.premio}
                </p>
                <p>
                  <strong>Costo del boleto:</strong> ${sorteo.precioBoleto}
                </p>
                <p>
                  <strong>Fecha final de compra boletos:</strong>{" "}
                  {formatDate(sorteo.fechaFinalVentaBoletos)}
                </p>
              </div>
            </div>
          </div>

          <div className="boletos-section">
            <h5 className="fw-bold mb-3">Apartar Boletos</h5>
            <div className="leyenda mb-3">
              <span className="disponible">Disponibles</span>
              <span className="apartado">Apartados</span>
              <span className="vendido">Vendidos</span>
              <span className="seleccionado">Seleccionados</span>
            </div>

            <div className="boletos-container">
              {boletosPagina.map((num) => (
                <button
                  key={num}
                  className={`boleto ${estadoBoleto(num)}`}
                  onClick={() => alternarSeleccion(num)}
                  disabled={!!boletosEstadoMap[num]}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="d-flex justify-content-center align-items-center mt-3">
              <button
                className="btn btn-sm btn-outline-secondary mx-2"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => p - 1)}
              >
                &lt;
              </button>
              <span>
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                className="btn btn-sm btn-outline-secondary mx-2"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((p) => p + 1)}
              >
                &gt;
              </button>
            </div>

            <div className="mt-3">
              <strong>Boletos seleccionados:</strong>{" "}
              {boletosSeleccionados.join(", ") || "Ninguno"}
            </div>

            <button
              className="btn btn-primary rounded-pill mt-3"
              onClick={apartarBoletos}
              style={{
                backgroundColor: "#C087E8",
                border: "none",
                fontWeight: "bold",
              }}
            >
              Apartar números
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SorteoDetalles;
