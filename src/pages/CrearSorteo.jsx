import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { getSession } from "../api";

const CrearSorteo = () => {
  const navigate = useNavigate();
  const session = getSession();
  const nombreUsuario = session?.user?.nombre || "Sorteador Anonimo";

  const [formData, setFormData] = useState({ // TODO: Cambiar dependiendo de la BD
    nombreRifa: "",
    premio: "",
    descripcion: "",
    precioBoletoPaquete: "",
    numeroBoletosIncluidos: "",
    rangoInicio: "",
    rangoFin: "",
    fechaRealizacion: "",
    limiteApartados: "",
    imagen: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      imagen: file,
    }));
  };

  const handleCancelar = () => {
    navigate(-1); // Volver a la pagina anterior
  };

  const handleCrearSorteo = () => {
    console.log("Crear sorteo:", formData);
    // Aquí logica del back
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

          {/* Título */}
          <h4 className="fw-bold mb-4">Crear Sorteo</h4>

          {/* Formulario */}
          <div className="row g-4">
            {/* Columna izquierda */}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: "#555", fontSize: "14px" }}>
                  Nombre de la rifa
                </label>
                <input
                  type="text"
                  name="nombreRifa"
                  className="form-control border-0"
                  style={{ 
                    backgroundColor: "#f3e5f5", 
                    borderRadius: "10px",
                    padding: "12px 16px"
                  }}
                  value={formData.nombreRifa}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: "#555", fontSize: "14px" }}>
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  className="form-control border-0"
                  style={{ 
                    backgroundColor: "#f3e5f5", 
                    borderRadius: "10px",
                    padding: "12px 16px",
                    minHeight: "100px",
                    resize: "vertical"
                  }}
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: "#555", fontSize: "14px" }}>
                  Precio del boleto
                </label>
                <input
                  type="number"
                  name="precioBoletoPaquete"
                  className="form-control border-0"
                  style={{ 
                    backgroundColor: "#f3e5f5", 
                    borderRadius: "10px",
                    padding: "12px 16px"
                  }}
                  value={formData.precioBoletoPaquete}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: "#555", fontSize: "14px" }}>
                  Numero de boletos
                </label>
                <input
                  type="number"
                  name="numeroBoletosIncluidos"
                  className="form-control border-0"
                  style={{ 
                    backgroundColor: "#f3e5f5", 
                    borderRadius: "10px",
                    padding: "12px 16px"
                  }}
                  value={formData.numeroBoletosIncluidos}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: "#555", fontSize: "14px" }}>
                  Imagen
                </label>
                <div className="d-flex align-items-stretch" 
                     style={{ 
                       backgroundColor: "#f3e5f5", 
                       borderRadius: "10px",
                       overflow: "hidden"
                     }}>
                  <label 
                    htmlFor="file-upload" 
                    className="btn mb-0"
                    style={{ 
                      backgroundColor: "#DAA1ED",
                      color: "white",
                      borderRadius: "0",
                      padding: "12px 20px",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    Elegir archivo
                  </label>
                  <input
                    type="file"
                    id="file-upload"
                    className="d-none"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <span className="flex-grow-1 d-flex align-items-center px-3" 
                        style={{ color: "#666", fontSize: "14px" }}>
                    {formData.imagen ? formData.imagen.name : "No se eligió ningún archivo"}
                  </span>
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: "#555", fontSize: "14px" }}>
                  Premio
                </label>
                <input
                  type="text"
                  name="premio"
                  className="form-control border-0"
                  style={{ 
                    backgroundColor: "#f3e5f5", 
                    borderRadius: "10px",
                    padding: "12px 16px"
                  }}
                  value={formData.premio}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: "#555", fontSize: "14px" }}>
                  Rango de venta de boletos
                </label>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label" style={{ color: "#666", fontSize: "12px" }}>Inicio</label>
                    <input
                      type="date"
                      name="rangoInicio"
                      className="form-control border-0"
                      style={{ 
                        backgroundColor: "#f3e5f5", 
                        borderRadius: "10px",
                        padding: "12px 16px"
                      }}
                      value={formData.rangoInicio}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label" style={{ color: "#666", fontSize: "12px" }}>Fin</label>
                    <input
                      type="date"
                      name="rangoFin"
                      className="form-control border-0"
                      style={{ 
                        backgroundColor: "#f3e5f5", 
                        borderRadius: "10px",
                        padding: "12px 16px"
                      }}
                      value={formData.rangoFin}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: "#555", fontSize: "14px" }}>
                  Fecha de realización del sorteo
                </label>
                <input
                  type="date"
                  name="fechaRealizacion"
                  className="form-control border-0"
                  style={{ 
                    backgroundColor: "#f3e5f5", 
                    borderRadius: "10px",
                    padding: "12px 16px"
                  }}
                  value={formData.fechaRealizacion}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: "#555", fontSize: "14px" }}>
                  Límite de apartados por persona (Opcional)
                </label>
                <input
                  type="number"
                  name="limiteApartados"
                  className="form-control border-0"
                  style={{ 
                    backgroundColor: "#f3e5f5", 
                    borderRadius: "10px",
                    padding: "12px 16px"
                  }}
                  value={formData.limiteApartados}
                  onChange={handleInputChange}
                  min="0"
                  placeholder=""
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button
              type="button"
              className="btn btn-danger d-flex align-items-center px-4 py-2"
              style={{ borderRadius: "25px", fontWeight: "600", color: "black" }}
              onClick={handleCancelar}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancelar
            </button>
            <button 
              type="button" 
              className="btn d-flex align-items-center px-4 py-2"
              style={{ 
                backgroundColor: "#DAA1ED",
                color: "black",
                borderRadius: "25px",
                fontWeight: "600",
                border: "none"
              }}
              onClick={handleCrearSorteo}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Crear Sorteo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearSorteo;
