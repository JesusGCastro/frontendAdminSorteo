import React, { useEffect, useState } from "react";
import SorteoCard from "../components/SorteoCard";
import { fetchSorteos } from "../services/api";
import Sidebar from "../components/Sidebar";
import { getSession } from "../api";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  const [sorteos, setSorteos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Obtener sesión actual
    const session = getSession();
    console.log("Sesión obtenida:", session);
    setUsuario(session.user);

    const obtenerSorteos = async () => {
      const data = await fetchSorteos();
      // para desempacar en caso de que el sorteo venga en array anidado
      const sorteosData = Array.isArray(data[0]) ? data[0] : data;
      setSorteos(sorteosData);
    };
    obtenerSorteos();
  }, []);

  // Filtrar por estado activo y por nombre
  const sorteosFiltrados = sorteos.filter(
    (s) =>
      s.estado === "activo" &&
      s.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  // Mostrar nombre o "Invitado"
  const nombreUsuario = usuario?.nombre || "Invitado";

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
            {nombreUsuario}
          </p>

          {/* Título */}
          <h4 className="fw-bold mb-3">Sorteos disponibles</h4>

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

          {/* Tarjetas de sorteos */}
          <div className="d-flex flex-wrap justify-content-start">
            {sorteosFiltrados.length > 0 ? (
              sorteosFiltrados.map((s) => <SorteoCard key={s.id} sorteo={s} />)
            ) : (
              <p className="text-muted">No se encontraron sorteos activos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
