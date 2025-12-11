import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getSorteoById,
    getBoletosPorSorteo,
    getSession,
    getToken,
    pagarBoletosApartados,
    obtenerBoletosApartadosPorUsuario
} from "../services/api";
import { toast } from "react-toastify";
import "./PagarNumeros.css";

const PagarNumeros = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const session = getSession();
    const usuarioLogueado = session.user?.user || session.user;
    const usuarioId = usuarioLogueado?.id;

    const [sorteo, setSorteo] = useState(null);
    const [boletosApartados, setBoletosApartados] = useState([]);
    const [boletosSeleccionados, setBoletosSeleccionados] = useState([]);
    const [metodoPago, setMetodoPago] = useState("Tarjeta de Crédito/Débito");
    const [cargando, setCargando] = useState(true);
    const [comprarTodos, setComprarTodos] = useState(false);

    const nombreUsuario = usuarioLogueado?.nombre || "Usuario";
    const rolActual = "Participante";

    // Estados del formulario de tarjeta
    const [numeroTarjeta, setNumeroTarjeta] = useState("");
    const [mes, setMes] = useState("");
    const [anio, setAnio] = useState("");
    const [cvc, setCvc] = useState("");

    // --- Manejadores de Inputs ---

    const handleNumeroTarjeta = (e) => {
        let value = e.target.value.replace(/\D/g, ""); // Solo números
        value = value.slice(0, 16); // Máximo 16 dígitos
        // Formato visual: grupos de 4
        value = value.replace(/(.{4})/g, "$1 ").trim();
        setNumeroTarjeta(value);
    };

    const handleMes = (e) => {
        let v = e.target.value.replace(/\D/g, "");
        if (Number(v) > 12) v = "12"; // No permitir más de 12
        setMes(v.slice(0, 2));
    };

    const handleAnio = (e) => {
        let v = e.target.value.replace(/\D/g, "");
        setAnio(v.slice(0, 2));
    };

    const handleCvc = (e) => {
        let v = e.target.value.replace(/\D/g, "");
        setCvc(v.slice(0, 3));
    };

    // --- Lógica de Validación de Fecha ---
    const validarExpiracion = () => {
        if (mes.length < 2 || anio.length < 2) return false; // Aún escribiendo

        const mesNum = parseInt(mes, 10);
        const anioNum = parseInt(anio, 10);

        // Obtener fecha actual (año 2 dígitos)
        const hoy = new Date();
        const anioActual = hoy.getFullYear() % 100;
        const mesActual = hoy.getMonth() + 1;

        // Validaciones
        if (mesNum < 1 || mesNum > 12) return true; // Mes inválido (ya expirado en lógica)
        if (anioNum < anioActual) return true; // Año pasado
        if (anioNum === anioActual && mesNum < mesActual) return true; // Año actual, mes pasado

        return false; // No está expirada (es válida)
    };

    const tarjetaExpirada = validarExpiracion();

    const tarjetaValida =
        (
            numeroTarjeta.replace(/\s/g, "").length === 16 &&
            /^[0-9]{2}$/.test(mes) &&
            /^[0-9]{2}$/.test(anio) &&
            !tarjetaExpirada && // Verificar que no haya vencido
            /^[0-9]{3}$/.test(cvc)
        );

    // --- Efectos y Carga de Datos ---

    useEffect(() => {
        const cargarDatos = async () => {
            if (!session.token || !usuarioId) {
                toast.error("Debes iniciar sesión para poder pagar.");
                navigate("/login");
                return;
            }

            try {
                const [dataSorteo, dataBoletos, dataBoletosApartados] = await Promise.all([
                    getSorteoById(id),
                    getBoletosPorSorteo(id),
                    obtenerBoletosApartadosPorUsuario(id, session.token),
                ]);
                setSorteo(dataSorteo);
                setBoletosApartados(dataBoletosApartados);

                /* Funcion anterior para filtrar boletos apartados del usuario
                if (Array.isArray(dataBoletos)) {
                    const misBoletosApartados = dataBoletos.filter(
                        (b) => b.estado === "APARTADO" && b.userId === usuarioId
                    );
                    setSorteo(dataSorteo);
                    setBoletosApartados(misBoletosApartados);
                } else {
                    setSorteo(dataSorteo);
                    setBoletosApartados([]);
                }*/
            } catch (error) {
                toast.error(error.message || "Error al cargar los datos del sorteo.");
                console.error("Detalle del error en cargarDatos:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [id, navigate, session.token, usuarioId]);

    const handleToggleSeleccion = (numeroBoleto) => {
        setBoletosSeleccionados((prev) =>
            prev.includes(numeroBoleto)
                ? prev.filter((n) => n !== numeroBoleto)
                : [...prev, numeroBoleto]
        );
    };

    // Lógica portada de PagarTransferenciaNumeros: excluir boletos "PENDIENTE"
    const handleToggleComprarTodos = (e) => {
        const checked = e.target.checked;
        setComprarTodos(checked);

        if (checked) {
            // Solo boletos que NO estén pendientes
            const boletosHabilitados = boletosApartados
                .filter((b) => b.payment?.estado !== "PENDIENTE")
                .map((b) => b.numeroBoleto);

            setBoletosSeleccionados(boletosHabilitados);
        } else {
            setBoletosSeleccionados([]);
        }
    };

    /*
    const handleToggleComprarTodos = (e) => {
        const checked = e.target.checked;
        setComprarTodos(checked);
        setBoletosSeleccionados(
            checked ? boletosApartados.map((b) => b.numeroBoleto) : []
        );
    };*/

    /*
    useEffect(() => {
        setComprarTodos(
            boletosApartados.length > 0 &&
            boletosSeleccionados.length === boletosApartados.length
        );
    }, [boletosSeleccionados, boletosApartados]);
    */

    // Lógica portada de PagarTransferenciaNumeros: revisar solo los boletos habilitados
    useEffect(() => {
        const boletosHabilitados = boletosApartados.filter(
            (b) => b.payment?.estado !== "PENDIENTE"
        );

        setComprarTodos(
            boletosHabilitados.length > 0 &&
            boletosSeleccionados.length === boletosHabilitados.length
        );
    }, [boletosSeleccionados, boletosApartados]);

    const handleVolver = () => navigate(-1);

    const handleRealizarCompra = async () => {
        const token = getToken();
        if (!token) {
            toast.error("Sesión no válida. Por favor inicia sesión nuevamente.");
            return;
        }

        if (boletosSeleccionados.length === 0) {
            toast.warning("Por favor selecciona los boletos que deseas pagar.");
            return;
        }

        // Validación adicional para asegurar que no se intente pagar un boleto PENDIENTE
        const boletosPendientesSeleccionados = boletosApartados.filter(
            b => boletosSeleccionados.includes(b.numeroBoleto) && b.payment?.estado === "PENDIENTE"
        );

        if (boletosPendientesSeleccionados.length > 0) {
            toast.error("No puedes pagar boletos que están actualmente 'En revisión'. Por favor, deselecciónalos.");
            return;
        }

        const claveRastreoGenerada = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const montoTotal = totalCompra.total;

        try {
            const loadingToast = toast.loading("Procesando pago...");

            await pagarBoletosApartados(
                id,
                boletosSeleccionados,
                montoTotal,
                claveRastreoGenerada,
                token
            );

            toast.update(loadingToast, {
                render: "¡Pago exitoso! Tus boletos han sido comprados.",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

            setTimeout(() => {
                navigate(`/sorteos/${id}`);
            }, 2000);

        } catch (error) {
            toast.dismiss();
            console.error("Error en pago:", error);
            toast.error(error.message || "Hubo un error al procesar tu pago.");
        }
    };

    const calcularTotal = () => {
        const precioUnitario = Number(sorteo?.precioBoleto) || 0;
        const cantidad = boletosSeleccionados.length;
        const total = cantidad * precioUnitario;

        return {
            precio: precioUnitario,
            cantidad,
            total,
        };
    };

    const totalCompra = calcularTotal();

    if (cargando)
        return (
            <div className="container mt-5 text-center">
                Cargando datos del pago...
            </div>
        );

    return (
        <div className="pagar-numeros-page">
            <div className="header-info">
                <p>{`${nombreUsuario} / ${rolActual}`}</p>
            </div>
            <div className="card card-pago shadow-sm">
                <div className="card-body">
                    <h2 className="titulo-pago">Pagar números</h2>
                    <div className="row mt-4 align-items-center">
                        <div className="col-lg-4">
                            <div className="mb-4">
                                <label className="form-label">
                                    Seleccione un método de pago
                                </label>
                                <select
                                    className="form-select"
                                    value={metodoPago}
                                    onChange={(e) => setMetodoPago(e.target.value)}
                                >
                                    <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Número de tarjeta</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="•••• •••• •••• ••••"
                                    value={numeroTarjeta}
                                    onChange={handleNumeroTarjeta}
                                    maxLength={19} // 16 digitos + 3 espacios
                                />
                            </div>
                            <div className="row mb-3">
                                <div className="col-7">
                                    <label className="form-label">Fecha de caducidad</label>
                                    <div className="d-flex gap-1 align-items-center">
                                        <input
                                            type="text"
                                            className={`form-control text-center ${tarjetaExpirada ? "is-invalid" : ""}`}
                                            placeholder="MM"
                                            value={mes}
                                            onChange={handleMes}
                                            maxLength={2}
                                        />
                                        <span className="fw-bold">/</span>
                                        <input
                                            type="text"
                                            className={`form-control text-center ${tarjetaExpirada ? "is-invalid" : ""}`}
                                            placeholder="AA"
                                            value={anio}
                                            onChange={handleAnio}
                                            maxLength={2}
                                        />
                                    </div>
                                    {tarjetaExpirada && (
                                        <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>
                                            Tarjeta vencida
                                        </div>
                                    )}
                                </div>

                                <div className="col-5">
                                    <label className="form-label">Código de seguridad</label>
                                    <input
                                        type="password"
                                        className="form-control text-center"
                                        placeholder="CVC"
                                        value={cvc}
                                        onChange={handleCvc}
                                        maxLength={3}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 text-center info-sorteo">
                            <div className="info-item">
                                <span>Sorteo</span>
                                <span>{sorteo?.nombre}</span>
                            </div>
                            <div className="info-item">
                                <span>Premio</span>
                                <span>{sorteo?.premio}</span>
                            </div>
                            <img
                                src={sorteo?.urlImagen}
                                alt={sorteo?.nombre}
                                className="img-fluid my-3"
                            />
                        </div>
                        <div className="col-lg-4">
                            <label className="form-label">
                                Seleccione los números a comprar
                            </label>
                            <div className="leyenda mb-3">
                                <span className="pendiente">En revisión</span>
                                <span className="vendido">Seleccionado</span>
                            </div>
                            <div className="boletos-a-pagar-grid mb-3">
                                {boletosApartados.length > 0 ? (
                                    boletosApartados.map((b) => {
                                        // CHECK DE ESTADO DE PAGO PORTADO
                                        const isPendiente = b.payment?.estado === "PENDIENTE";
                                        const isSelected = boletosSeleccionados.includes(
                                            b.numeroBoleto
                                        );

                                        return (
                                            <div
                                                key={b.numeroBoleto}
                                                // CLASES PORTADAS
                                                className={`boleto-item 
                                                    ${isSelected ? "selected" : ""}
                                                    ${isPendiente ? "pendiente" : ""}
                                                `}
                                                onClick={() => {
                                                    // DESHABILITAR SELECCIÓN SI ES PENDIENTE
                                                    if (isPendiente) return;
                                                    handleToggleSeleccion(b.numeroBoleto);
                                                }}
                                                // CURSOR DESHABILITADO
                                                style={{
                                                    cursor: isPendiente ? "not-allowed" : "pointer",
                                                }}
                                            >
                                                {b.numeroBoleto}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-muted small">
                                        No tienes boletos apartados para este sorteo.
                                    </p>
                                )}
                            </div>
                            <div className="paginacion-boletos mb-3">
                                {/* Paginación visual placeholder */}
                                <button className="btn btn-sm" disabled>&lt;</button>
                                <button className="btn btn-sm" disabled>&gt;</button>
                            </div>
                            <div className="form-check mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="comprarTodos"
                                    checked={comprarTodos}
                                    onChange={handleToggleComprarTodos}
                                    disabled={boletosApartados.length === 0}
                                />
                                <label className="form-check-label" htmlFor="comprarTodos">
                                    Comprar todos los numeros apartados
                                </label>
                            </div>
                            <div className="desglose-precio">
                                <div className="precio-item">
                                    <span>Precio del boleto</span>
                                    <span>${totalCompra.precio.toFixed(2)}</span>
                                </div>
                                <div className="precio-item">
                                    <span>Cantidad</span>
                                    <span>{totalCompra.cantidad}</span>
                                </div>
                                <hr />
                                <div className="precio-item total">
                                    <span>Total</span>
                                    <span>${totalCompra.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-5">
                        <div className="col-6 d-flex justify-content-center">
                            <button onClick={handleVolver} className="btn btn-volver">
                                <i className="bi bi-arrow-left me-2"></i>Volver
                            </button>
                        </div>
                        <div className="col-6 d-flex justify-content-center">
                            <button
                                onClick={handleRealizarCompra}
                                className="btn btn-comprar"
                                disabled={
                                    boletosSeleccionados.length === 0 || !tarjetaValida
                                }
                            >
                                Realizar compra
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PagarNumeros;