import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import NavTabs from "../components/NavTabs";
import ModalBoletosSeleccionados from "../components/ModalBoletosSeleccionados";
import { getSession, getNombreSorteo } from "../api";

const SorteoBoletos = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const session = getSession();

  // Estados
  const [sorteo, setSorteo] = useState(null);
  const [boletos] = useState([2, 22, 6, 10, 12, 29, 13, 17]); // mock
  const [seleccionados, setSeleccionados] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Datos del usuario
  const nombreUsuario = session?.user?.nombre || "Sorteador Anonimo";
  const rolActual = "sorteador";
  const rolFormateado =
    rolActual.charAt(0).toUpperCase() + rolActual.slice(1).toLowerCase();

  // Cargar nombre del sorteo
  useEffect(() => {
    const nombreSorteo = getNombreSorteo();
    if (nombreSorteo) {
      setSorteo({ nombre: nombreSorteo });
    } else {
      toast.error("No se pudo obtener el nombre del sorteo.");
    }
  }, [id]);

  // Toggle de boleto individual
  const toggleBoleto = (num) => {
    const estaSeleccionado = seleccionados.includes(num);
    const actualizados = estaSeleccionado
      ? seleccionados.filter((b) => b !== num)
      : [...seleccionados, num];

    setSeleccionados(actualizados);
    setSelectAll(actualizados.length === boletos.length);
  };

  // Toggle seleccionar todos
  const toggleSelectAll = () => {
    if (selectAll) {
      setSeleccionados([]);
      setSelectAll(false);
    } else {
      setSeleccionados([...boletos]);
      setSelectAll(true);
    }
  };

  // Handlers
  const handleVolver = () => {
    navigate("/");
  };

  const handleContinuar = () => {
    if (seleccionados.length === 0) {
      toast.warning("Por favor, seleccione al menos un boleto.");
      return;
    }
    setModalOpen(true);
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-grow-1" style={{ marginLeft: "80px" }}>
        <div className="container py-4">
          {/* Header del usuario */}
          <p
            style={{
              color: "#000",
              fontSize: "0.9rem",
              fontWeight: "400",
              marginBottom: "0.5rem",
            }}
          >
            {`${nombreUsuario} / ${rolFormateado}`}
          </p>

          {/* Título del sorteo */}
          <h4 className="fw-bold mb-4">
            {sorteo?.nombre || "Nombre del sorteo"}
          </h4>

          {/* Barra de navegación */}
          <NavTabs />

          {/* Sección de selección de boletos */}
          <div
            className="p-4 mt-4"
            style={{
              backgroundColor: "#EDE0F7",
              borderRadius: "20px",
              minHeight: "240px",
            }}
          >
            {/* Header con checkbox seleccionar todos */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span style={{ fontSize: "1.1rem", color: "#000" }}>
                Seleccione un boleto para liberar
              </span>

              <div className="d-flex align-items-center">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  style={{ cursor: "pointer" }}
                />
                <label
                  htmlFor="selectAll"
                  className="ms-2"
                  style={{ color: "#000", cursor: "pointer" }}
                >
                  Seleccionar todos
                </label>
              </div>
            </div>

            {/* Grid de boletos */}
            <div className="d-flex flex-wrap gap-3">
              {boletos.length === 0 ? (
                <p className="text-muted">No hay boletos disponibles</p>
              ) : (
                boletos.map((num) => {
                  const isSelected = seleccionados.includes(num);

                  return (
                    <div
                      key={num}
                      onClick={() => toggleBoleto(num)}
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "45px",
                        height: "40px",
                        backgroundColor: isSelected ? "#B646DC" : "#D59BF6",
                        color: "white",
                        borderRadius: "10px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        userSelect: "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "#C756EC";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "#D59BF6";
                        }
                      }}
                    >
                      {num}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Botones inferiores */}
          <div className="d-flex justify-content-center gap-3 mt-4 mb-5">
            <button
              type="button"
              className="d-flex align-items-center px-4 py-2"
              style={{
                borderRadius: "25px",
                fontWeight: "600",
                color: "black",
                backgroundColor: "#DAA1ED",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={handleVolver}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#C891DD";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#DAA1ED";
              }}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver
            </button>

            <button
              type="button"
              className="btn d-flex align-items-center px-4 py-2"
              style={{
                backgroundColor: "#DAA1ED",
                color: "black",
                borderRadius: "25px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={handleContinuar}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#C891DD";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#DAA1ED";
              }}
            >
              <i className="bi bi-check-circle me-2"></i>
              Continuar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ModalBoletosSeleccionados
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        boletos={seleccionados}
      />
    </div>
  );
};

export default SorteoBoletos;