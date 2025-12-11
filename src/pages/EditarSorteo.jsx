import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { NavLink, useNavigate } from "react-router-dom";
import { getSession } from "../api";
import { getSorteoDetailsById, actualizarSorteo, uploadImageToCloudinary } from "../services/api";
import { toast } from 'react-toastify';
import NavTabs from "../components/NavTabs";

const EditarSorteo = () => {
    const navigate = useNavigate();
    const session = getSession();
    const { id } = useParams();
    const [sorteo, setSorteo] = useState(null);
    const [backup, setBackup] = useState({});
    const [diasRestantes, setDiasRestantes] = useState(0);
    const [imagenArchivo, setImagenArchivo] = useState(null);

    // Mostrar nombre o "Sorteador Anonimo"
    const nombreUsuario = session?.user?.nombre || "Sorteador Anonimo";
    const rolActual = "sorteador";
    const rolFormateado =
        rolActual.charAt(0).toUpperCase() + rolActual.slice(1).toLowerCase();

    const [formData, setFormData] = useState({
        nombre: "",
        premio: "",
        descripcion: "",
        precioBoleto: "",
        cantidadMaximaBoletos: "",
        fechaInicialVentaBoletos: "",
        fechaFinalVentaBoletos: "",
        fechaRealizacion: "",
        limiteBoletosPorUsuario: "",
        urlImagen: "",
        estado: "activo",
        montoRecaudado: "",
        montoPorRecaudar: "",
        boletosComprados: "",
        boletosApartados: "",
        totalBoletosDisponibles: "",
    });

    useEffect(() => {
        const cargarDetallesSorteo = async () => {
            if (!id) return;

            try {
                const data = await getSorteoDetailsById(id);

                const mapeado = {
                    nombre: data.raffle.nombre || "",
                    premio: data.raffle.premio || "",
                    descripcion: data.raffle.descripcion || "",
                    precioBoleto: data.raffle.precioBoleto || "",
                    cantidadMaximaBoletos: data.raffle.cantidadMaximaBoletos || "",
                    fechaInicialVentaBoletos: formatDate(data.raffle.fechaInicialVentaBoletos),
                    fechaFinalVentaBoletos: formatDate(data.raffle.fechaFinalVentaBoletos),
                    fechaRealizacion: formatDate(data.raffle.fechaRealizacion),
                    limiteBoletosPorUsuario: data.raffle.limiteBoletosPorUsuario || "",
                    urlImagen: data.raffle.urlImagen || "",
                    estado: data.raffle.estado || "activo",

                    montoRecaudado: data.estadisticas?.montoRecaudado || "0",
                    montoPorRecaudar: data.estadisticas?.montoPorRecaudar || "0",
                    boletosComprados: data.estadisticas?.boletosComprados || "0",
                    boletosApartados: data.estadisticas?.boletosApartados || "0",
                    totalBoletosDisponibles: data.estadisticas?.totalBoletosDisponibles || "0"
                };

                setFormData(mapeado);
                setBackup(mapeado);

                //Guardar el nombre del sorteo en el localStorage
                localStorage.setItem("nombreSorteo", data.raffle.nombre || "");
            } catch (error) {
                console.error("Error al cargar sorteo:", error);
            }
        };

        cargarDetallesSorteo();
    }, [id]);

    useEffect(() => {
        if (!formData.fechaFinalVentaBoletos) return;

        const hoy = new Date();
        const fin = new Date(formData.fechaFinalVentaBoletos);

        let diff = fin - hoy;
        let dias = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (dias < 0) dias = 0;

        setDiasRestantes(dias);
    }, [formData.fechaInicialVentaBoletos, formData.fechaFinalVentaBoletos]);


    const formatDate = (dateString) => {
        if (!dateString) return "";
        return dateString.split("T")[0]; // toma solo YYYY-MM-DD
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ["image/png", "image/jpeg"]; // PNG y JPG/JPEG

        if (!validTypes.includes(file.type)) {
            toast.error("Solo se permiten archivos PNG o JPG.");
            e.target.value = ""; // limpia el input
            setImagenArchivo(null);
            return;
        }

        setImagenArchivo(file);

        // Guardar el archivo en el formData
        setFormData(prev => ({
            ...prev,
            urlImagen: file
        }));
    };

    const handleVolver = () => {
        //Lleva a home
        navigate("/");
    };

    const handleValidacionBlur = (e) => {
        const { name } = e.target;

        const valido = revisarDatosValidos();

        if (!valido) {
            setFormData(backup); // revertir TODO
        }
    };

    //Calcula la cantidad de dias para que termine el periodo de ventas de boletos
    const calcularDiasRestantes = () => {
        const hoy = new Date();
        const fin = new Date(formData.fechaFinalVentaBoletos);

        // Si hoy es despues de la fecha de fin, regresar 0
        if (hoy > fin) return 0;

        const diffTime = fin - hoy;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? diffDays : 0;
    }

    const hayCambios = () => {
        return JSON.stringify(formData) !== JSON.stringify(backup);
    };

    const handleEditarSorteo = async () => {
        console.log("Intentando editar sorteo con datos:", formData);

        if (!hayCambios()) {
            toast.error("No has cambiado nada.");
            return;
        }
        if (!revisarDatosValidos()) return;

        try {
            let urlImagenFinal = formData.urlImagen;
            const urlOriginal = backup.urlImagenOriginal;

            // Caso 1: Usuario NO cambió nada → sigue siendo string y es igual
            if (typeof formData.urlImagen === "string" && formData.urlImagen === urlOriginal) {
                urlImagenFinal = urlOriginal;
            }

            // Caso 2: Usuario subió archivo nuevo (File)
            else if (formData.urlImagen instanceof File) {
                urlImagenFinal = await uploadImageToCloudinary(formData.urlImagen);
            }

            // Caso 3: Usuario pegó una nueva URL (string distinta)
            else if (typeof formData.urlImagen === "string" && formData.urlImagen !== urlOriginal) {
                urlImagenFinal = formData.urlImagen;
            }

            const dataFinal = {
                ...formData,
                urlImagen: urlImagenFinal,
                precioBoleto: Number(formData.precioBoleto),
                cantidadMaximaBoletos: Number(formData.cantidadMaximaBoletos),
                limiteBoletosPorUsuario: Number(formData.limiteBoletosPorUsuario),
            };

            await actualizarSorteo(id, dataFinal, session.token);

            toast.success("Sorteo actualizado exitosamente.");
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al actualizar el sorteo.");
        }
    };

    const revisarDatosValidos = () => {
        const {
            descripcion,
            urlImagen,
            fechaInicialVentaBoletos,
            fechaFinalVentaBoletos,
            fechaRealizacion,
            limiteBoletosPorUsuario,
            estado,
        } = formData;

        // Descripción: no vacía ni solo espacios
        if (!descripcion || descripcion.trim() === "") {
            toast.error("La descripción no puede estar vacía.");
            return;
        }

        // Imagen: no vacía, null o solo espacios
        if (!urlImagen) {
            toast.error("Debes seleccionar una imagen.");
            return;
        }
        if (typeof urlImagen === "string" && urlImagen.trim() === "") {
            toast.error("La imagen no puede estar vacía.");
            return;
        }

        // Fechas no null
        if (!fechaInicialVentaBoletos || !fechaFinalVentaBoletos || !fechaRealizacion) {
            toast.error("Todas las fechas son obligatorias.");
            return;
        }

        const fi = new Date(fechaInicialVentaBoletos);
        const ff = new Date(fechaFinalVentaBoletos);
        const fr = new Date(fechaRealizacion);
        const hoy = new Date();

        // Inicio < Fin del periodo de ventas
        if (fi >= ff) {
            toast.error("La fecha de inicio debe ser antes que la fecha de fin.");
            return;
        }

        // Fin > Realización (el sorteo se realiza después del fin de ventas)
        if (ff >= fr) {
            toast.error("La fecha de realización debe ser después del fin del periodo de ventas.");
            return;
        }

        if (estado.toLowerCase() === "finalizado" && hoy <= ff) {
            toast.error("No puedes finalizar el sorteo antes de que termine la venta de boletos.");
            return;
        }

        // Límite de apartados (opcional pero si existe debe ser entero positivo)
        if (limiteBoletosPorUsuario !== "" && limiteBoletosPorUsuario !== null) {
            const n = Number(limiteBoletosPorUsuario);
            if (!Number.isInteger(n) || n < 1) {
                toast.error("El límite de apartados debe ser un número entero positivo (mínimo 1).");
                return;
            }
        }
        return true;
    }

    const handleEstadoToggle = (nuevoEstado) => {
        setFormData((prev) => ({
            ...prev,
            estado: nuevoEstado
        }));
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
                    <h4 className="fw-bold mb-4">{formData.nombre}</h4>

                    {/* Barra de navegación */}
                    <NavTabs />

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
                                    onBlur={handleValidacionBlur}
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
                                    name="precioBoleto"
                                    className="form-control border-0"
                                    readOnly
                                    style={{
                                        backgroundColor: "#d8d8d8",
                                        borderRadius: "10px",
                                        padding: "12px 16px"
                                    }}
                                    value={formData.precioBoleto}
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
                                    name="cantidadMaximaBoletos"
                                    className="form-control border-0"
                                    readOnly
                                    style={{
                                        backgroundColor: "#d8d8d8",
                                        borderRadius: "10px",
                                        padding: "12px 16px"
                                    }}
                                    value={formData.cantidadMaximaBoletos}
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
                                    <span
                                        className="flex-grow-1 d-flex align-items-center px-3"
                                        style={{ color: "#666", fontSize: "14px" }}
                                    >
                                        {formData.urlImagen ? (
                                            typeof formData.urlImagen === "string" ? (
                                                <img
                                                    src={formData.urlImagen}
                                                    alt="Imagen del sorteo"
                                                    style={{
                                                        width: "60px",
                                                        height: "60px",
                                                        objectFit: "cover",
                                                        borderRadius: "8px"
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src={URL.createObjectURL(formData.urlImagen)}
                                                    alt="Nueva imagen"
                                                    style={{
                                                        width: "60px",
                                                        height: "60px",
                                                        objectFit: "cover",
                                                        borderRadius: "8px"
                                                    }}
                                                />
                                            )
                                        ) : (
                                            "No se eligió ningún archivo"
                                        )}

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
                                            backgroundColor: formData.estado === "activo" ? "#DAA1ED" : "#f3e5f5",
                                            color: formData.estado === "activo" ? "white" : "#555",
                                            borderRadius: "10px",
                                            padding: "8px 20px",
                                            border: "none",
                                            fontWeight: "500"
                                        }}
                                        onClick={() => handleEstadoToggle("activo")}
                                    >
                                        Activo
                                    </button>
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{
                                            backgroundColor: formData.estado === "inactivo" ? "#DAA1ED" : "#f3e5f5",
                                            color: formData.estado === "inactivo" ? "white" : "#555",
                                            borderRadius: "10px",
                                            padding: "8px 20px",
                                            border: "none",
                                            fontWeight: "500"
                                        }}
                                        onClick={() => handleEstadoToggle("inactivo")}
                                    >
                                        Inactivo
                                    </button>
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{
                                            backgroundColor: formData.estado === "finalizado" ? "#DAA1ED" : "#f3e5f5",
                                            color: formData.estado === "finalizado" ? "white" : "#555",
                                            borderRadius: "10px",
                                            padding: "8px 20px",
                                            border: "none",
                                            fontWeight: "500"
                                        }}
                                        onClick={() => handleEstadoToggle("finalizado")}
                                    >
                                        Finalizado
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
                                            name="fechaInicialVentaBoletos"
                                            className="form-control border-0"
                                            style={{
                                                backgroundColor: "#f3e5f5",
                                                borderRadius: "10px",
                                                padding: "12px 16px"
                                            }}
                                            value={formData.fechaInicialVentaBoletos}
                                            onChange={handleInputChange}
                                            onBlur={handleValidacionBlur}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label" style={{ color: "#666", fontSize: "12px" }}>Fin</label>
                                        <input
                                            type="date"
                                            name="fechaFinalVentaBoletos"
                                            className="form-control border-0"
                                            style={{
                                                backgroundColor: "#f3e5f5",
                                                borderRadius: "10px",
                                                padding: "12px 16px"
                                            }}
                                            value={formData.fechaFinalVentaBoletos}
                                            onChange={handleInputChange}
                                            onBlur={handleValidacionBlur}
                                        />
                                    </div>
                                    {calcularDiasRestantes() !== 0 && (
                                        <div
                                            style={{
                                                fontSize: "12px",
                                                color: "#000000ff",
                                                textAlign: "center",
                                                marginTop: "15px"
                                            }}
                                        >
                                            <p>Faltan {diasRestantes} días para que termine el sorteo</p>
                                        </div>
                                    )}
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
                                    name="limiteBoletosPorUsuario"
                                    className="form-control border-0"
                                    style={{
                                        backgroundColor: "#f3e5f5",
                                        borderRadius: "10px",
                                        padding: "12px 16px",
                                        width: "100px"
                                    }}
                                    value={formData.limiteBoletosPorUsuario}
                                    onChange={handleInputChange}
                                    onBlur={handleValidacionBlur}
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
                                    value={formData.montoRecaudado}
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
                                    value={formData.montoPorRecaudar}
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
                                    value={formData.boletosComprados}
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
                                    value={formData.boletosApartados}
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
                                    value={formData.totalBoletosDisponibles}
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
