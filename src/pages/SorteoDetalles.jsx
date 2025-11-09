import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSorteoById } from "../services/api";
import { apartarNumeros } from "../services/api";
import { getToken } from "../api";
import Sidebar from "../components/Sidebar";
import "../styles/SorteoDetalles.css";

const SorteoDetalles = () => {
  const { id } = useParams();
  console.log("ID del sorteo:", id);
  const [sorteo, setSorteo] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [boletosSeleccionados, setBoletosSeleccionados] = useState([]);
  const boletosPorPagina = 52;

  useEffect(() => {
    const obtenerSorteo = async () => {
      try {
        const response = await getSorteoById(id);
        setSorteo(response);
      } catch (error) {
        console.error("Error al obtener sorteo:", error);
        setSorteo({});
      }
    };
    obtenerSorteo();
  }, [id]);

  if (!sorteo) return <p>Cargando sorteo...</p>;

  // Genera los boletos del 1 al máximo
  const boletos = Array.from(
    { length: sorteo.cantidadMaximaBoletos },
    (_, i) => i + 1
  );

  // Paginación
  const indiceInicio = (paginaActual - 1) * boletosPorPagina;
  const boletosPagina = boletos.slice(
    indiceInicio,
    indiceInicio + boletosPorPagina
  );
  const totalPaginas = Math.ceil(boletos.length / boletosPorPagina);

  // Simular estados de boletos
  const estadoBoleto = (num) => {
    // Luego se cambia para ver los estaodos reales de los boletos
    if (boletosSeleccionados.includes(num)) return "seleccionado";
    return "disponible";
  };

  const alternarSeleccion = (num) => {
    setBoletosSeleccionados((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const apartarBoletos = () => {
    if (boletosSeleccionados.length === 0) {
      alert("Selecciona al menos un boleto para apartar.");
      return;
    }
    const token = getToken();
    if (!token) {
      alert("Debes iniciar sesión para apartar boletos.");
      return;
    }
    const numerosAStrings = boletosSeleccionados.map(String);

    // Llamamos a la API con los números convertidos a strings
    apartarNumeros(sorteo.id, numerosAStrings, token)
      .then((response) => {
        const numerosApartados = response.reservedTickets.map(
          (ticket) => ticket.numeroBoleto
        );

        // Notificación de éxito
        alert(`Boletos apartados exitosamente: ${numerosApartados.join(", ")}`);
        setBoletosSeleccionados([]);

        // Si la API informó que algunos boletos fallaron
        if (response.failedToReserve && response.failedToReserve.length > 0) {
          alert(
            `Los siguientes boletos no se pudieron apartar (ya estaban ocupados): ${response.failedToReserve.join(
              ", "
            )}`
          );
        }

      })
      .catch((error) => {
        // Manejo de Error
        console.error("Error al apartar boletos:", error);
        // El error.message contendrá el 400 y el mensaje de límite excedido
        alert(`Hubo un error al apartar los boletos: ${error.message}`);
      });
  };

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
                  <strong>Costo del boleto:</strong> ${sorteo.precio}
                </p>
                <p>
                  <strong>Fecha final de compra boletos:</strong>{" "}
                  {sorteo.fechaFinalVentaBoletos}
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
