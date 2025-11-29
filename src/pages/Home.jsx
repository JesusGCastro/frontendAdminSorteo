import React, { useEffect, useState } from "react";
import SorteoCard from "../components/SorteoCard";
import { consultarSorteos, consultarSorteosInactivos, consultarSorteosFinalizados, consultarSorteosDeParticipante } from "../services/api";
import Sidebar from "../components/Sidebar";
import { getSession, getRolActual, getToken } from "../api";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [sorteos, setSorteos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState("activo");
  const navigate = useNavigate();

  // Obtener sesión y rol
  useEffect(() => {
    const session = getSession();
    setUsuario(session.user);
  }, []);

  const rolActual = getRolActual() || "invitado";
  const esSorteador = rolActual === "sorteador";
  const esInvitado = rolActual === "invitado";
  const esParticipante = rolActual === "participante";

  console.log("Rol actual en el Home:", getRolActual());

  // Ajustar filtro inicial según rol
  useEffect(() => {
    if (esInvitado) setEstadoFiltro("activo");
    if (esParticipante) setEstadoFiltro("todos");
  }, [rolActual]);


  // Cargar sorteos según rol y categoría
  const cargarSorteosPorEstado = async () => {
    try {
      let data;

      if (esSorteador) {
        if (estadoFiltro === "activo") data = await consultarSorteos();
        if (estadoFiltro === "inactivo") data = await consultarSorteosInactivos();
        if (estadoFiltro === "finalizado") data = await consultarSorteosFinalizados();
      }

      if (esInvitado) {
        data = await consultarSorteos(); // solo activos
      }

      if (esParticipante) {
        if (estadoFiltro === "todos") data = await consultarSorteos();
        if (estadoFiltro === "participando") {
          data = null
          //data = await consultarSorteosDeParticipante(await getToken());
        }
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


  const nombreUsuario = usuario?.nombre || "Invitado";

  let rolFormateado = "";

  if (rolActual === "sorteador" || rolActual === "participante") {
    rolFormateado = rolActual.charAt(0).toUpperCase() + rolActual.slice(1).toLowerCase();
  }

  const handleCrearSorteo = () => navigate("/crear-sorteo");

  // --- LÓGICA DE FILTRADO DINÁMICO ---
  // Filtramos la lista "master" (sorteos) basado en el texto del input (filtro)
  const sorteosFiltrados = sorteos.filter((s) => 
    s.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido */}
      <div className="flex-grow-1" style={{ marginLeft: "80px" }}>
        <div className="container py-4">

          {/* Usuario */}
          <p style={{ color: "#000", fontSize: "0.9rem", fontWeight: "400", marginBottom: "0.5rem" }}>
            {`${nombreUsuario} / ${rolFormateado}`}
          </p>

          {/* Título y botón */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">Sorteos disponibles</h4>

            {esSorteador && (
              <button
                className="btn d-flex align-items-center gap-2 px-4 py-2"
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

          {/* Buscador */}
          <div className="input-group mb-4" style={{ maxWidth: "1300px" }}>
            <input
              type="text"
              className="form-control rounded-start-pill border-0 shadow-sm"
              placeholder="Buscar sorteo"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              style={{ backgroundColor: "#F1DEF7" }}
            />
            <span className="input-group-text rounded-end-pill border-0" style={{ backgroundColor: "#DAA1ED" }}>
              <i className="bi bi-search"></i>
            </span>
          </div>

          {/* Categorías según rol */}
          <div className="d-flex gap-2 mb-4">

            {/* Sorteador */}
            {esSorteador &&
              ["activo", "inactivo", "finalizado"].map((estado) => (
                <button
                  key={estado}
                  className={`btn ${estadoFiltro === estado ? "text-white" : "text-dark"}`}
                  style={{
                    backgroundColor: estadoFiltro === estado ? "#DAA1ED" : "#F1DEF7",
                    fontWeight: "600",
                    borderRadius: "25px",
                    border: "none",
                  }}
                  onClick={() => setEstadoFiltro(estado)}
                >
                  {estado.toUpperCase()}
                </button>
              ))}

            {/* Participante */}
            {esParticipante &&
              ["todos", "participando"].map((estado) => (
                <button
                  key={estado}
                  className={`btn ${estadoFiltro === estado ? "text-white" : "text-dark"}`}
                  style={{
                    backgroundColor: estadoFiltro === estado ? "#DAA1ED" : "#F1DEF7",
                    fontWeight: "600",
                    borderRadius: "25px",
                    border: "none",
                  }}
                  onClick={() => setEstadoFiltro(estado)}
                >
                  {estado.toUpperCase()}
                </button>
              ))}

            {/* Invitado no muestra categorías */}
          </div>

          {/* Lista Filtrada */}
          <div className="d-flex flex-wrap justify-content-start">
            {sorteosFiltrados.length > 0 ? (
              sorteosFiltrados.map((s) => <SorteoCard key={s.id} sorteo={s} />)
            ) : (
              <p className="text-muted">
                {filtro 
                  ? "No se encontraron sorteos con ese nombre." 
                  : `No se encontraron sorteos ${estadoFiltro}`}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;