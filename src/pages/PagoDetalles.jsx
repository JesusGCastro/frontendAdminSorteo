import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { getSession } from "../api";
import { getNombreSorteo } from "../api";
import { getDetallesPago } from "../services/api";
import { toast } from "react-toastify";

const PagoDetalles = () => {
    const navigate = useNavigate();
    const session = getSession();
    const { id, pagoId } = useParams();

    const [sorteo, setSorteo] = useState(null);
    const [pago, setPago] = useState(null);

    const nombreUsuario = session?.user?.nombre || "Sorteador Anonimo";
    const rolActual = "sorteador";
    const rolFormateado =
        rolActual.charAt(0).toUpperCase() + rolActual.slice(1).toLowerCase();

    const handleVolver = () => navigate(-1);

    // Obtener nombre del sorteo
    useEffect(() => {
        const nombreSorteo = getNombreSorteo();
        if (nombreSorteo) setSorteo({ nombre: nombreSorteo });
        else toast.error("No se pudo obtener el nombre del sorteo.");
    }, [id]);

    // Obtener detalles del pago
    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await getDetallesPago(pagoId, session.token);

                const adaptado = {
                    participante: data.tickets?.[0]?.user?.nombre || "Desconocido",
                    tipoPago: data.tipo,
                    estado: data.estado,
                    fechaRealizacion: data.createdAt,
                    boletos: data.tickets.map(t => t.numeroBoleto),
                    precioUnitario: data.raffle?.precioBoleto ?? "0",
                    importe: data.monto,
                    imagen: data.voucher,
                    claveRastreo: data.claveRastreo || "N/A",
                };
                console.log("Detalles del pago adaptados:", adaptado);
                setPago(adaptado);
            } catch {
                toast.error("Error al cargar detalles del pago.");
            }
        };
        cargar();
    }, [pagoId, session.token]);

    if (!pago) return <div>Cargando datos...</div>;

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

    return (
        <div className="d-flex">
            <Sidebar />

            <div className="flex-grow-1" style={{ marginLeft: "80px" }}>
                <div className="container py-4">

                    <p style={{ fontSize: ".9rem", marginBottom: "0.5rem" }}>
                        {`${nombreUsuario} / ${rolFormateado}`}
                    </p>

                    <h4 className="fw-bold mb-4">
                        {sorteo ? sorteo.nombre : "Cargando sorteo..."}
                    </h4>

                    {/* DETALLES */}
                    <div className="row">
                        {/* Texto izquierda */}
                        <div className="col-md-6">

                            <p><strong>Participante:</strong> &nbsp;{pago.participante}</p>
                            <p><strong>Tipo de pago:</strong> &nbsp;{pago.tipoPago}</p>
                            <p><strong>Estado:</strong> &nbsp;{pago.estado}</p>

                            <p>
                                <strong>Fecha realización:</strong> &nbsp;
                                {formatDate(pago.fechaRealizacion)}
                            </p>

                            <p>
                                <strong>Boletos:</strong> &nbsp;
                                {`"${pago.boletos.join(", ")}"`}
                            </p>

                            <p><strong>Precio unitario:</strong> &nbsp;${pago.precioUnitario}</p>

                            <p><strong>Importe:</strong> &nbsp;${pago.importe}</p>

                            {/* Solo mostrar si el tipo de pago es LINEA */}
                            {pago.tipoPago.toLowerCase() === "linea" && (
                                <p><strong>Clave de rastreo:</strong> &nbsp;{pago.claveRastreo}</p>
                            )}
                        </div>

                        {/* Imagen SOLO si es transferencia */}
                        {pago.tipoPago.toLowerCase() === "transferencia" && (
                            <div className="col-md-2 text-center">
                                <img
                                    src={pago.imagen}
                                    alt="Comprobante"
                                    style={{
                                        width: "200px",
                                        borderRadius: "8px",
                                        objectFit: "cover",
                                    }}
                                />
                                <p className="mt-2">Comprobante de pago</p>
                            </div>
                        )}
                    </div>

                    {/* BOTONES SOLO SI ES TRANSFERENCIA Y PENDIENTE */}
                    {(pago.tipoPago.toLowerCase() === "transferencia" && pago.estado.toLowerCase() === "pendiente") && (
                        <div className="d-flex justify-content-center gap-4 mt-4"
                            style={{ marginLeft: "250px" }}>

                            <button
                                className="px-4 py-3"
                                style={{
                                    backgroundColor: "#E45A5A",
                                    borderRadius: "25px",
                                    fontWeight: "600",
                                    color: "white",
                                    border: "none",
                                    minWidth: "200px",
                                }}
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                RECHAZAR PAGO
                            </button>

                            <button
                                className="px-4 py-3"
                                style={{
                                    backgroundColor: "#C7A0F7",
                                    borderRadius: "25px",
                                    fontWeight: "600",
                                    color: "black",
                                    border: "none",
                                    minWidth: "200px",
                                }}
                            >
                                <i className="bi bi-check-circle me-2"></i>
                                CONFIRMAR PAGO
                            </button>
                        </div>
                    )}

                    {/* BOTÓN VOLVER */}
                    <button
                        type="button"
                        className="d-flex align-items-center px-4 py-2 mb-4 mt-4"
                        style={{
                            borderRadius: "25px",
                            fontWeight: "600",
                            color: "black",
                            backgroundColor: "#DAA1ED",
                            border: "none",
                        }}
                        onClick={handleVolver}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PagoDetalles;
