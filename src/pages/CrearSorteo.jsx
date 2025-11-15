import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { getSession, getToken, crearSorteo, subirImagenImgbb } from "../services/api";
import { toast } from 'react-toastify';
import { convertirImagenABase64 } from "../utils/utils";


const CrearSorteo = () => {
  const navigate = useNavigate();
  const session = getSession();

  const nombreUsuario = session?.user?.nombre || "Sorteador Anonimo";
  const rolActual = "sorteador";
  const rolFormateado =
    rolActual.charAt(0).toUpperCase() + rolActual.slice(1).toLowerCase();

  const [formData, setFormData] = useState({
    nombre: "", 
    descripcion: "",
    precioBoleto: "",
    cantidadMaximaBoletos: "",
    fechaInicialVentaBoletos: "",
    fechaFinalVentaBoletos: "",
    fechaRealizacion: "",
    limiteBoletosPorUsuario: "",
    premio: ""
  });
  
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImagenArchivo(file); 
  };

  const handleCancelar = () => {
    navigate(-1);
  };


  const handleCrearSorteo = async () => {
    if (!imagenArchivo) {
      toast.error("Por favor, selecciona una imagen para el sorteo.");
      return;
    }
    
    setCargando(true);


    try {
    // 1. Convertir imagen a Base64
    const base64 = await convertirImagenABase64(imagenArchivo);

    // 2. Subir Base64 a Imgbb → obtener URL
    const urlImagen = await subirImagenImgbb(base64);

    // 3. Preparar datos a enviar a tu microservicio
    const dataParaEnviar = {
      ...formData,
      urlImagen: urlImagen  // 👈 ESTA ES LA URL QUE GUARDA LA BD
    };

    // 4. Obtener token
    const token = getToken();
    if (!token) {
      toast.error("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
      navigate('/login');
      return;
    }

    // 5. Llamar a tu microservicio
    await crearSorteo(dataParaEnviar, token);

    toast.success("¡Sorteo creado exitosamente!");
    navigate('/');

  } catch (error) {
    toast.error(`Error al crear el sorteo: ${error.message}`);
  } finally {
    setCargando(false);
  }
};

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1" style={{ marginLeft: "80px" }}>
        <div className="container py-4">
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
          <h4 className="fw-bold mb-4">Crear Sorteo</h4>

          {/* 4. AJUSTAR la propiedad 'name' de cada input */}
          <form onSubmit={(e) => { e.preventDefault(); handleCrearSorteo(); }}>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nombre de la rifa</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control border-0"
                    style={{ backgroundColor: "#f3e5f5", borderRadius: "10px", padding: "12px 16px" }}
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea
                    name="descripcion"
                    className="form-control border-0"
                    style={{ backgroundColor: "#f3e5f5", borderRadius: "10px", padding: "12px 16px", minHeight: "100px", resize: "vertical" }}
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows="4"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Precio del boleto</label>
                  <input
                    type="number"
                    name="precioBoleto"
                    className="form-control border-0"
                    style={{ backgroundColor: "#f3e5f5", borderRadius: "10px", padding: "12px 16px" }}
                    value={formData.precioBoleto}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Numero de boletos</label>
                  <input
                    type="number"
                    name="cantidadMaximaBoletos"
                    className="form-control border-0"
                    style={{ backgroundColor: "#f3e5f5", borderRadius: "10px", padding: "12px 16px" }}
                    value={formData.cantidadMaximaBoletos}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Imagen</label>
                  <div className="d-flex align-items-stretch" style={{ backgroundColor: "#f3e5f5", borderRadius: "10px", overflow: "hidden" }}>
                    <label htmlFor="file-upload" className="btn mb-0" style={{ backgroundColor: "#DAA1ED", color: "white", borderRadius: "0", padding: "12px 20px", border: "none", cursor: "pointer" }}>
                      Elegir archivo
                    </label>
                    <input
                      type="file"
                      id="file-upload"
                      className="d-none"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                    />
                    <span className="flex-grow-1 d-flex align-items-center px-3">
                      {imagenArchivo ? imagenArchivo.name : "No se eligió ningún archivo"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Premio</label>
                  <input
                    type="text"
                    name="premio"
                    className="form-control border-0"
                    style={{ backgroundColor: "#f3e5f5", borderRadius: "10px", padding: "12px 16px" }}
                    value={formData.premio}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Rango de venta de boletos</label>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label">Inicio</label>
                      <input
                        type="datetime-local"
                        name="fechaInicialVentaBoletos" 
                        className="form-control border-0"
                        style={{ backgroundColor: "#f3e5f5", borderRadius: "10px", padding: "12px 16px" }}
                        value={formData.fechaInicialVentaBoletos}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Fin</label>
                      <input
                        type="datetime-local"
                        name="fechaFinalVentaBoletos"
                        className="form-control border-0"
                        style={{ backgroundColor: "#f3e5f5", borderRadius: "10px", padding: "12px 16px" }}
                        value={formData.fechaFinalVentaBoletos}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Fecha de realización del sorteo</label>
                  <input
                    type="datetime-local"
                    name="fechaRealizacion"
                    className="form-control border-0"
                    style={{ backgroundColor: "#f3e5f5", borderRadius: "10px", padding: "12px 16px" }}
                    value={formData.fechaRealizacion}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Límite de apartados por persona</label>
                  <input
                    type="number"
                    name="limiteBoletosPorUsuario"
                    className="form-control border-0"
                    style={{ backgroundColor: "#f3e5f5", borderRadius: "10px", padding: "12px 16px", width: "100px" }}
                    value={formData.limiteBoletosPorUsuario}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button
                type="button"
                className="btn btn-danger d-flex align-items-center px-4 py-2"
                style={{ borderRadius: "25px", fontWeight: "600", color: "black" }}
                onClick={handleCancelar}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn d-flex align-items-center px-4 py-2"
                style={{ backgroundColor: "#DAA1ED", color: "black", borderRadius: "25px", fontWeight: "600", border: "none" }}
                disabled={cargando}
              >
                {cargando ? 'Creando...' : 'Crear Sorteo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearSorteo;