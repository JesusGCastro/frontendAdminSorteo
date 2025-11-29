import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { getSession } from "../api";
import { getNombreSorteo } from "../api";
import NavTabs from "../components/NavTabs";

const SorteoBoletos = () => {
    const navigate = useNavigate();
    const session = getSession();
    const { id } = useParams();
    const [sorteo, setSorteo] = useState(null);

    // Mostrar nombre o "Sorteador Anonimo"
    const nombreUsuario = session?.user?.nombre || "Sorteador Anonimo";
    const rolActual = "sorteador";
    const rolFormateado =
        rolActual.charAt(0).toUpperCase() + rolActual.slice(1).toLowerCase();

    const handleVolver = () => {
        //Lleva a home
        navigate("/");
    };

    //Obtener el nombre del sorteo
    useEffect(() => {
        const nombreSorteo = getNombreSorteo();
        if (nombreSorteo) {
            setSorteo({ nombre: nombreSorteo });
        } else {
            toast.error("No se pudo obtener el nombre del sorteo.");
        }
    }, [id]);

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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SorteoBoletos;
