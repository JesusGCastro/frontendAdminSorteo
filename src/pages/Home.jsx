import React, { useEffect, useState } from "react";
import SorteoCard from "../components/SorteoCard";
import { consultarSorteos } from "../services/api";
import Sidebar from "../components/Sidebar";
import { getSession, getRolActual } from "../api";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [sorteos, setSorteos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener sesión actual
    const session = getSession();
    console.log("Sesión obtenida:", session);
    setUsuario(session.user);

    const obtenerSorteos = async () => {
      try {

        
        const data = await consultarSorteos();
        
        // 3. Lógica defensiva para desempacar el array (como preguntaste)
        // (Asegurarse que data exista antes de acceder a data[0])
        const sorteosData = data && Array.isArray(data[0]) ? data[0] : data;
        
        // 4. Asegurarnos que siempre seteamos un array
        setSorteos(Array.isArray(sorteosData) ? sorteosData : []);

      } catch (err) {
        // 5. SOLUCIÓN PUNTO 2: Capturar cualquier error de la API
        console.error("Error al cargar sorteos:", err);
        console.log(err.message); // Guardar el error para mostrarlo al usuario
      } finally {
        // 6. SOLUCIÓN PUNTO 2: Indicar que la carga terminó (ya sea con éxito o error)
        console.log("Intento de carga de sorteos finalizado.");
      }
    };

    // 7. Llamar a la función
    obtenerSorteos();
    
  }, []);

  // Filtrar por estado activo y por nombre
  const sorteosFiltrados = (sorteos || []).filter(
    // Asegura que 'sorteos' sea un array
    (s) =>
      s.estado === "activo" &&
      (s.nombre || "").toLowerCase().includes(filtro.toLowerCase()) // Defensa contra nombre nulo
  );

  // Mostrar nombre o "Invitado"
  const nombreUsuario = usuario?.nombre || "Invitado";

  const esSorteador = getRolActual() === "sorteador";

  const handleCrearSorteo = () =>{
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
            {nombreUsuario}
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
