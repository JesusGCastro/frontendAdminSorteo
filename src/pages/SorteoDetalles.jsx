import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSorteoById,
  apartarNumeros,
  getBoletosPorSorteo,
  getToken,
  getSession, // <-- Asegúrate de que getSession esté importado
} from "../services/api";
import Sidebar from "../components/Sidebar";
import "../styles/SorteoDetalles.css";

// La línea "useState(false);" que estaba aquí ha sido eliminada.

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const SorteoDetalles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sorteo, setSorteo] = useState(null);
  const [boletosOcupados, setBoletosOcupados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [boletosSeleccionados, setBoletosSeleccionados] = useState([]);
  // --- CORRECCIÓN 1: Declarar el estado que faltaba ---
  const [usuarioTieneBoletosApartados, setUsuarioTieneBoletosApartados] =
    useState(false);
  const boletosPorPagina = 52;

  useEffect(() => {
    const obtenerDatosCompletos = async () => {
      try {
        const [dataSorteo, dataBoletos] = await Promise.all([
          getSorteoById(id),
          getBoletosPorSorteo(id),
        ]);
        setSorteo(dataSorteo);
        setBoletosOcupados(dataBoletos);

        // --- Lógica de validación (correcta) ---
        const session = getSession();
        const usuarioLogueado = session.user?.user || session.user;

        if (usuarioLogueado && Array.isArray(dataBoletos)) {
          const tieneApartados = dataBoletos.some(
            (boleto) =>
              boleto.estado === "APARTADO" &&
              boleto.userId === usuarioLogueado.id
          );
          setUsuarioTieneBoletosApartados(tieneApartados);
        } else {
          // Si no hay sesión o no hay boletos, nos aseguramos de que el estado sea false.
          setUsuarioTieneBoletosApartados(false);
        }
        // ------------------------------------
      } catch (error) {
        console.error("Error al obtener los datos del sorteo:", error);
        setSorteo(null); // Usamos null para que la condición de carga funcione bien
      }
    };
    obtenerDatosCompletos();
  }, [id]);

  // --- El resto de tu código se mantiene igual ---

  const boletosEstadoMap = useMemo(() => {
    const map = {};
    if (Array.isArray(boletosOcupados)) {
      // Añadida verificación por seguridad
      boletosOcupados.forEach((boleto) => {
        map[boleto.numeroBoleto] = boleto.estado;
      });
    }
    return map;
  }, [boletosOcupados]);

  const estadoBoleto = (num) => {
    if (boletosSeleccionados.includes(num)) {
      return "seleccionado";
    }
    const estadoBackend = boletosEstadoMap[num];
    if (estadoBackend === "APARTADO") {
      return "apartado";
    }
    if (estadoBackend === "COMPRADO") {
      // Asumo que el estado es COMPRADO
      return "vendido";
    }
    return "disponible";
  };

  const alternarSeleccion = (num) => {
    if (boletosEstadoMap[num]) {
      return;
    }
    setBoletosSeleccionados((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const apartarBoletos = () => {
    if (boletosSeleccionados.length === 0) {
      alert("Por favor, selecciona al menos un boleto para apartar.");
      return;
    }

    const token = getToken();

    if (!token) {
      if (
        window.confirm(
          "Para apartar boletos, necesitas iniciar sesión. ¿Deseas ir a la página de inicio de sesión ahora?"
        )
      ) {
        navigate("/login");
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
        setUsuarioTieneBoletosApartados(true); // Actualizamos el estado para mostrar el botón de pagar

        if (response.failedToReserve && response.failedToReserve.length > 0) {
          alert(
            `Los siguientes boletos no se pudieron apartar (ya estaban ocupados): ${response.failedToReserve.join(
              ", "
            )}`
          );
        }
      })
      .catch((error) => {
        console.error("Error al apartar boletos:", error);
        alert(`Error: ${error.message}`);
      });
  };

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

  // Lógica de paginación segura (evita error si 'sorteo.cantidadMaximaBoletos' no existe)
  const cantidadBoletos = sorteo.cantidadMaximaBoletos || 0;
  const boletos = Array.from({ length: cantidadBoletos }, (_, i) => i + 1);
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
                src={sorteo.urlImagen}
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

            {usuarioTieneBoletosApartados && (
              <button
                className="btn btn-success rounded-pill mt-3 ms-3"
                onClick={() => navigate(`/pagar/${sorteo.id}`)}
                style={{
                  backgroundColor: "#C087E8",
                  color: "black",
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                Pagar Boletos Apartados
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SorteoDetalles;
