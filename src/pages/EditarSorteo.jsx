import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { getSession } from "../api";

const EditarSorteo = () => {
    const navigate = useNavigate();
    const session = getSession();

    // Mostrar nombre o "Sorteador Anonimo"
    const nombreUsuario = session?.user?.nombre || "Sorteador Anonimo";
    const rolActual = "sorteador";
    const rolFormateado =
        rolActual.charAt(0).toUpperCase() + rolActual.slice(1).toLowerCase();

    const [formData, setFormData] = useState({
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
        estado: "activado",
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

    const handleVolver = () => {
        navigate(-1); // Volver a la pagina anterior
    };

    const handleEditarSorteo = () => {
        console.log("Editar sorteo:", formData);
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
                        {`${nombreUsuario} / ${rolFormateado}`}
                    </p>

                    {/* Título */}
                    <h4 className="fw-bold mb-4">Nombre del sorteo</h4>

                    {/* Formulario */}
                    <div className="row g-4">
                        {/* Columna izquierda */}
                        <div className="col-md-6">

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

                            {/* Precio del boleto */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: "#555", fontSize: "14px" }}>
                                    Precio del boleto
                                </label>
                                <input
                                    type="number"
                                    name="precioBoletoPaquete"
                                    className="form-control border-0"
                                    readOnly
                                    style={{
                                        backgroundColor: "#d8d8d8",
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
                                    readOnly
                                    style={{
                                        backgroundColor: "#d8d8d8",
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

                            {/* Estado */}
                            <div className="mb-4 text-center">
                                <label className="form-label fw-semibold d-block mb-2" style={{ color: "#555", fontSize: "14px" }}>
                                    Estado
                                </label>
                                <div className="d-flex justify-content-center gap-3">
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{
                                            backgroundColor: formData.estado === "activado" ? "#DAA1ED" : "#f3e5f5",
                                            color: formData.estado === "activado" ? "white" : "#555",
                                            borderRadius: "10px",
                                            padding: "8px 20px",
                                            border: "none",
                                            fontWeight: "500"
                                        }}
                                        onClick={() => handleEstadoToggle("activado")}
                                    >
                                        Activado
                                    </button>
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{
                                            backgroundColor: formData.estado === "desactivado" ? "#DAA1ED" : "#f3e5f5",
                                            color: formData.estado === "desactivado" ? "white" : "#555",
                                            borderRadius: "10px",
                                            padding: "8px 20px",
                                            border: "none",
                                            fontWeight: "500"
                                        }}
                                        onClick={() => handleEstadoToggle("desactivado")}
                                    >
                                        Desactivado
                                    </button>
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
                                    readOnly
                                    style={{
                                        backgroundColor: "#d8d8d8",
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
                                    <div style={{ fontSize: "12px", color: "#000000ff", textAlign: "center", marginTop: "15px" }}>X dias para terminar el periodo de ventas</div>
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
                                        padding: "12px 16px",
                                        width: "100px"
                                    }}
                                    value={formData.limiteApartados}
                                    onChange={handleInputChange}
                                    min="0"
                                    placeholder=""
                                />
                            </div>
                        </div>
                    </div>

                    {/* Datos estáticos del sorteo */}
                    <div className="mt-4">
                        <hr style={{ borderTop: "2px solid #E1BEE7", marginBottom: "20px" }} />
                        <div className="row text-start">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold" style={{ color: "#555", fontSize: "14px" }}>
                                    Monto recaudado
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value="$200,450"
                                    className="form-control border-0"
                                    style={{
                                        backgroundColor: "#d8d8d8",
                                        borderRadius: "10px",
                                        padding: "12px 16px"
                                    }}
                                />

                                <label className="form-label fw-semibold mt-3" style={{ color: "#555", fontSize: "14px" }}>
                                    Monto por recaudar (de boletos apartados)
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value="$100,261"
                                    className="form-control border-0"
                                    style={{
                                        backgroundColor: "#d8d8d8",
                                        borderRadius: "10px",
                                        padding: "12px 16px"
                                    }}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold" style={{ color: "#555", fontSize: "14px" }}>
                                    Boletos vendidos
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value="2000"
                                    className="form-control border-0"
                                    style={{
                                        backgroundColor: "#d8d8d8",
                                        borderRadius: "10px",
                                        padding: "12px 16px"
                                    }}
                                />

                                <label className="form-label fw-semibold mt-3" style={{ color: "#555", fontSize: "14px" }}>
                                    Boletos apartados
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value="1000"
                                    className="form-control border-0"
                                    style={{
                                        backgroundColor: "#d8d8d8",
                                        borderRadius: "10px",
                                        padding: "12px 16px"
                                    }}
                                />

                                <label className="form-label fw-semibold mt-3" style={{ color: "#555", fontSize: "14px" }}>
                                    Boletos por vender
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value="1000"
                                    className="form-control border-0"
                                    style={{
                                        backgroundColor: "#d8d8d8",
                                        borderRadius: "10px",
                                        padding: "12px 16px"
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <button
                            type="button"
                            className="d-flex align-items-center px-4 py-2"
                            style={{ borderRadius: "25px", fontWeight: "600", color: "black", backgroundColor: "#DAA1ED", border: "none" }}
                            onClick={handleVolver}
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
                                border: "none"
                            }}
                            onClick={handleEditarSorteo}
                        >
                            <i className="bi bi-check-circle me-2"></i>
                            Confirmar cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditarSorteo;
