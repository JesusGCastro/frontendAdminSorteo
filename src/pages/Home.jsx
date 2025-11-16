import React, { useEffect, useState } from "react";
import SorteoCard from "../components/SorteoCard";
import { consultarSorteos, consultarSorteosInactivos, consultarSorteosFinalizados } from "../services/api";
import Sidebar from "../components/Sidebar";
import { getSession, getRolActual } from "../api";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [sorteos, setSorteos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState("activo");
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener sesión actual
    const session = getSession();
    console.log("Sesión obtenida:", session);
    setUsuario(session.user);

    const obtenerSorteos = async () => {
      try {


        const data = await consultarSorteos();

        // 3. Lógica defensiva para desempacar el array
        // (Asegurarse que data exista antes de acceder a data[0])
        const sorteosData = data && Array.isArray(data[0]) ? data[0] : data;

        // 4. Asegurarnos que siempre seteamos un array
        setSorteos(Array.isArray(sorteosData) ? sorteosData : []);

      } catch (err) {
        // 5. SOLUCIÓN PUNTO 2: Capturar cualquier error de la API
        console.error("Error al cargar sorteos:", err);
        console.log(err.message); // Guardar el error para mostrarlo al usuario
      } finally {
        // 6. SOLUCIÓN PUNTO 2: Indicar que la carga terminó
        console.log("Intento de carga de sorteos finalizado.");
      }
    };

    // 7. Llamar a la función
    obtenerSorteos();

  }, []);

  // filtra los sorteos segun el estado seleccionado
  const cargarSorteosPorEstado = async () => {
    try {
      let data;

      if (estadoFiltro === "activo") {
        data = await consultarSorteos();
      } else if (estadoFiltro === "inactivo") {
        data = await consultarSorteosInactivos();
      } else if (estadoFiltro === "finalizado") {
        data = await consultarSorteosFinalizados();
      }

      const sorteosData = Array.isArray(data?.[0]) ? data[0] : data;

      setSorteos(Array.isArray(sorteosData) ? sorteosData : []);
    } catch (err) {
      console.error("Error al cargar sorteos:", err);
    }
  };

  useEffect(() => {
    cargarSorteosPorEstado();
  }, [estadoFiltro]);


  // Mostrar nombre o "Invitado"
  const nombreUsuario = usuario?.nombre || "Invitado";
  const rolActual = getRolActual() || "participante"; // si no hay rol, por defecto participante
  const rolFormateado =
    rolActual.charAt(0).toUpperCase() + rolActual.slice(1).toLowerCase();


  const esSorteador = getRolActual() === "sorteador";

  const handleCrearSorteo = () => {
    navigate("/crear-sorteo");
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-grow-1" style={{ marginLeft: "80px" }}>
        <div className="container py-4">
          {/* Etiqueta del usuario */}
          <p
            style={{
              color: "#000",
              fontSize: "0.9rem",
              fontWeight: "400",
              maxWidth: "100%",
              marginBottom: "0.5rem",
            }}
          >
            {`${nombreUsuario} / ${rolFormateado}`}
          </p>

          {/* Encabezado con titulo y boton */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">Sorteos disponibles</h4>

            {/* El boton solo visible para sorteadores */}
            {esSorteador && (
              <button className="btn d-flex align-items-center gap-2 px-4 py-2"
                onClick={handleCrearSorteo}
                style={{
                  backgroundColor: "#D1AAD3",
                  color: "black",
                  borderRadius: "25px",
                  fontWeight: "600",
                  border: "none",
                }}
              >
                <i className="bi bi-plus-circle"></i>
                Crear Sorteo
              </button>
            )}
          </div>

          {/* Barra de búsqueda */}
          <div className="input-group mb-4" style={{ maxWidth: "1300px" }}>
            <input
              type="text"
              className="form-control rounded-start-pill border-0 shadow-sm"
              placeholder="Buscar sorteo"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              style={{
                backgroundColor: "#F1DEF7",
              }}
            />
            <span
              className="input-group-text rounded-end-pill border-0"
              style={{
                backgroundColor: "#DAA1ED",
              }}
            >
              <i className="bi bi-search"></i>
            </span>
          </div>

          {/* Botones de filtro por estado */}
          <div className="d-flex gap-2 mb-4">
            {esSorteador && (["activo", "inactivo", "finalizado"].map((estado) => (
              <button
                key={estado}
                className={`btn ${estadoFiltro === estado ? "text-white" : "text-dark"
                  }`}
                style={{
                  backgroundColor:
                    estadoFiltro === estado ? "#DAA1ED" : "#F1DEF7",
                  fontWeight: "600",
                  borderRadius: "25px",
                  border: "none",
                }}
                onClick={() => setEstadoFiltro(estado)}
              >
                {estado.toUpperCase()}
              </button>
            )))}
          </div>

          {/* Tarjetas de sorteos */}
          <div className="d-flex flex-wrap justify-content-start">
            {sorteos.length > 0 ? (
              sorteos.map((s) => <SorteoCard key={s.id} sorteo={s} />)
            ) : (
              <p className="text-muted">No se encontraron sorteos {estadoFiltro}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
