import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { getSession, getToken, crearSorteo, uploadImageToCloudinary} from "../services/api";
import { toast } from 'react-toastify';


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

  const validarFormulario = () => {
    if (parseFloat(formData.precioBoleto) <= 0) {
      toast.error("El precio del boleto debe ser mayor a cero.");
      return false;
    }
    
    if (parseInt(formData.cantidadMaximaBoletos) <= 0) {
      toast.error("El número de boletos debe ser mayor a cero.");
      return false;
    }
    
    if (parseInt(formData.limiteBoletosPorUsuario) <= 0) {
      toast.error("El límite de boletos por persona debe ser mayor a cero.");
      return false;
    }

    const ahora = new Date();
    const ahoraConMargen = new Date(ahora.getTime() - (2 * 60 * 1000));
    
    const fechaInicio = new Date(formData.fechaInicialVentaBoletos);
    const fechaFin = new Date(formData.fechaFinalVentaBoletos);
    const fechaRealizacion = new Date(formData.fechaRealizacion);

    if (fechaInicio < ahoraConMargen) {
      toast.error("La fecha de inicio de venta no puede ser anterior a la fecha actual.");
      return false;
    }

    if (fechaFin < ahoraConMargen) {
      toast.error("La fecha de fin de venta no puede ser anterior a la fecha actual.");
      return false;
    }

    if (fechaRealizacion < ahoraConMargen) {
      toast.error("La fecha de realización no puede ser anterior a la fecha actual.");
      return false;
    }

    if (fechaFin <= fechaInicio) {
      toast.error("La fecha de fin de venta debe ser posterior a la fecha de inicio.");
      return false;
    }

    if (fechaRealizacion <= fechaFin) {
      toast.error("La fecha de realización del sorteo debe ser posterior a la fecha de fin de venta.");
      return false;
    }

    return true;
  };

  const handleCrearSorteo = async () => {
    // Aseguramos que el estado 'imagenArchivo' contenga el objeto File
    if (!imagenArchivo) {
        toast.error("Por favor, selecciona una imagen para el sorteo.");
        return;
    }

    if (!validarFormulario()) {
      return;
    }
    
    setCargando(true);

    try {
        const token = getToken();
        if (!token) {
            toast.error("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
            navigate('/login');
            return;
        }

        const urlImagen = await uploadImageToCloudinary(imagenArchivo); 

        const dataParaEnviar = {
            ...formData, 
            urlImagen: urlImagen 
        };

        await crearSorteo(dataParaEnviar, token);

        toast.success("¡Sorteo creado exitosamente!");
        navigate('/');

    } catch (error) {

        const errorMessage = error.message || "Error desconocido al crear el sorteo.";
        toast.error(`Error al crear el sorteo: ${errorMessage}`);
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

          <form onSubmit={(e) => { e.preventDefault(); handleCrearSorteo(); }} noValidate>
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
                    min="0.01"
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
                    min="1"
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