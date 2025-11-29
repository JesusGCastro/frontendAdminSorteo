import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { getSession } from "../api";
import { getNombreSorteo } from "../api";
import { getPagosSorteo } from "../services/api.js";
import { toast } from 'react-toastify';
import "bootstrap/dist/css/bootstrap.min.css";
import NavTabs from "../components/NavTabs";
import "../pages/SorteoPagos.css";

const SorteoPagos = () => {
    const navigate = useNavigate();
    const session = getSession();
    const { id } = useParams();
    const [filtro, setFiltro] = useState("");
    const [sorteo, setSorteo] = useState(null);
    const [pagos, setPagos] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const filasPorPagina = 10;

    // Mostrar nombre o "Sorteador Anonimo"
    const nombreUsuario = session?.user?.nombre || "Sorteador Anonimo";
    const rolActual = "sorteador";
    const rolFormateado =
        rolActual.charAt(0).toUpperCase() + rolActual.slice(1).toLowerCase();

    const handleVolver = () => {
        //Lleva a home
        navigate("/");
    };

    // Filtrado
    const pagosFiltrados = pagos.filter((p) =>
        `${p.participante} ${p.tipoPago} ${p.estado} ${p.fechaRealizacion}`
            .toLowerCase()
            .includes(filtro.toLowerCase())
    );

    //Obtener el nombre del sorteo
    useEffect(() => {
        const nombreSorteo = getNombreSorteo();
        if (nombreSorteo) {
            setSorteo({ nombre: nombreSorteo });
        } else {
            toast.error("No se pudo obtener el nombre del sorteo.");
        }
    }, [id]);

    // Paginación
    const totalPaginas = Math.ceil(pagosFiltrados.length / filasPorPagina);
    const inicio = (paginaActual - 1) * filasPorPagina;
    const pagosPagina = pagosFiltrados.slice(inicio, inicio + filasPorPagina);

    const formatDate = (dateString) => {
        if (!dateString) return "";

        const d = new Date(dateString);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    useEffect(() => {
        cargarPagos();
    }, []);

    // Cargar pagos
    const cargarPagos = async () => {
        try {
            let data = await getPagosSorteo();
            const pagosData = Array.isArray(data?.[0]) ? data[0] : data;
            setPagos(Array.isArray(pagosData) ? pagosData : []);
        } catch (err) {
            console.error("Error al cargar pagos:", err);
        }
    };

    const renderEstado = (estado) => {
        const estadoUpper = estado.toUpperCase();

        // Color del círculo según estado
        const circleColor =
            estadoUpper === "PENDIENTE"
                ? "#d4ff00ff"          // gris oscuro
                : estadoUpper === "COMPLETADO"
                    ? "#fff"          // blanco
                    : "#ff0000ff";         // rojo

        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#D9D9D9",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    width: "fit-content",
                    fontWeight: "600",
                }}
            >
                {/* Círculo */}
                <div
                    style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: circleColor,
                        border: "1px solid #000",
                    }}
                />

                {/* Texto */}
                <span>{estadoUpper}</span>
            </div>
        );
    };

    const handlePagoClick = (pagoId) => {
        navigate(`/edicionSorteos/${id}/pagos/${pagoId}`);
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
                    <h4 className="fw-bold mb-4">{sorteo?.nombre || "Nombre del sorteo"}</h4>

                    {/* Barra de navegación */}
                    <NavTabs />

                    {/* Buscador */}
                    <div className="input-group mb-4" style={{ maxWidth: "1300px" }}>
                        <input
                            type="text"
                            className="form-control rounded-start-pill border-0 shadow-sm"
                            placeholder="Buscar operación"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            style={{ backgroundColor: "#F1DEF7" }}
                        />
                        <span className="input-group-text rounded-end-pill border-0" style={{ backgroundColor: "#DAA1ED" }}>
                            <i className="bi bi-search"></i>
                        </span>
                    </div>

                    {/* TABLA */}
                    <div className="tabla-container p-3 rounded" style={{ backgroundColor: "#EDE1FF" }}>

                        {/* Encabezados */}
                        <table className="table">
                            <thead>
                                <tr style={{ borderBottom: "2px solid #ccc" }}>
                                    <th>Participante</th>
                                    <th>Tipo de pago</th>
                                    <th>Estado</th>
                                    <th>Fecha realización</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pagosPagina.length > 0 ? (
                                    pagosPagina.map((p, index) => (
                                        <tr
                                            key={index}
                                            className="fila-hover"
                                            onClick={() => handlePagoClick(p.id)}
                                        >
                                            <td>{p.participante}</td>
                                            <td>{p.tipoPago.toUpperCase()}</td>
                                            <td>{renderEstado(p.estado)}</td>
                                            <td>{formatDate(p.fechaRealizacion)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">
                                            No hay operaciones que coincidan con el filtro.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* PAGINACIÓN */}
                        {pagosFiltrados.length > 0 && (
                            <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                                {/* Botón atrás */}
                                <button
                                    className="btn"
                                    style={{ backgroundColor: "#DAA1ED", borderRadius: "20px" }}
                                    disabled={paginaActual === 1}
                                    onClick={() => setPaginaActual(paginaActual - 1)}
                                >
                                    <i className="bi bi-arrow-left" />
                                </button>

                                {/* Texto */}
                                <span
                                    className="px-4 py-2"
                                    style={{
                                        backgroundColor: "#E0C3F7",
                                        borderRadius: "20px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {paginaActual}/{totalPaginas} Páginas
                                </span>

                                {/* Botón adelante */}
                                <button
                                    className="btn"
                                    style={{ backgroundColor: "#DAA1ED", borderRadius: "20px" }}
                                    disabled={paginaActual === totalPaginas}
                                    onClick={() => setPaginaActual(paginaActual + 1)}
                                >
                                    <i className="bi bi-arrow-right" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="d-flex justify-content-left gap-3 mt-4">
                        <button
                            type="button"
                            className="d-flex align-items-center px-4 py-2"
                            style={{ borderRadius: "25px", fontWeight: "600", color: "black", backgroundColor: "#DAA1ED", border: "none" }}
                            onClick={handleVolver}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Volver
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SorteoPagos;
