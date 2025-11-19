import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSorteoById,
  getBoletosPorSorteo,
  getSession,
  getToken, 
  pagarBoletosApartados,
} from "../services/api";
import { toast } from "react-toastify";
import "./PagarNumeros.css";

const PagarNumeros = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const session = getSession();
  const usuarioLogueado = session.user?.user || session.user;

  // --- LIMPIEZA: Eliminados los console.log de depuración ---

  const [sorteo, setSorteo] = useState(null);
  const [boletosApartados, setBoletosApartados] = useState([]);
  const [boletosSeleccionados, setBoletosSeleccionados] = useState([]);
  const [metodoPago, setMetodoPago] = useState("paypal");
  const [cargando, setCargando] = useState(true);
  const [comprarTodos, setComprarTodos] = useState(false);

  const nombreUsuario = usuarioLogueado?.nombre || "Usuario";
  const rolActual = "Participante";

  useEffect(() => {
    const cargarDatos = async () => {
      if (
        !session.token ||
        !usuarioLogueado ||
        typeof usuarioLogueado.id === "undefined"
      ) {
        toast.error("Debes iniciar sesión para poder pagar.");
        navigate("/login");
        return;
      }

      try {
        // --- LIMPIEZA: Eliminado console.log de "Cargando datos..." ---

        const [dataSorteo, dataBoletos] = await Promise.all([
          getSorteoById(id),
          getBoletosPorSorteo(id),
        ]);

        if (Array.isArray(dataBoletos)) {
          const idUsuarioActual = usuarioLogueado.id;
          const misBoletosApartados = dataBoletos.filter(
            (b) => b.estado === "APARTADO" && b.userId === idUsuarioActual
          );
          setSorteo(dataSorteo);
          setBoletosApartados(misBoletosApartados);
          // --- LIMPIEZA: Eliminado console.log de "Boletos apartados encontrados" ---
        } else {
          setSorteo(dataSorteo);
          setBoletosApartados([]); 
        }
      } catch (error) {
        toast.error("Error al cargar los datos del sorteo.");
        console.error("Detalle del error en cargarDatos:", error); // Este es útil dejarlo por si falla la red
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [id, navigate, session.token, usuarioLogueado]);

  // ... El resto del código (handlers y return) se queda igual ...
  
  const handleToggleSeleccion = (numeroBoleto) => {
    setBoletosSeleccionados((prev) =>
      prev.includes(numeroBoleto)
        ? prev.filter((n) => n !== numeroBoleto)
        : [...prev, numeroBoleto]
    );
  };

  const handleToggleComprarTodos = (e) => {
    const checked = e.target.checked;
    setComprarTodos(checked);
    setBoletosSeleccionados(
      checked ? boletosApartados.map((b) => b.numeroBoleto) : []
    );
  };

  useEffect(() => {
    setComprarTodos(
      boletosApartados.length > 0 &&
        boletosSeleccionados.length === boletosApartados.length
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
    const subtotal = cantidad * precioUnitario;
    const impuestos = subtotal * 0.16;
    const total = subtotal + impuestos;

    return {
      precio: precioUnitario,
      cantidad,
      subtotal,
      impuestos,
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
                  <option value="paypal">Paypal</option>
                  <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Número de tarjeta</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="•••• •••• •••• ••••"
                />
              </div>
              <div className="row mb-3">
                <div className="col-7">
                  <label className="form-label">Fecha de caducidad</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="MM/AA"
                  />
                </div>
                <div className="col-5">
                  <label className="form-label">Código de seguridad</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="CVC"
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
              <div className="boletos-a-pagar-grid mb-3">
                {boletosApartados.length > 0 ? (
                  boletosApartados.map((b) => (
                    <div
                      key={b.numeroBoleto}
                      className={`boleto-item ${
                        boletosSeleccionados.includes(b.numeroBoleto)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleToggleSeleccion(b.numeroBoleto)}
                    >
                      {b.numeroBoleto}
                    </div>
                  ))
                ) : (
                  <p className="text-muted small">
                    No tienes boletos apartados para este sorteo.
                  </p>
                )}
              </div>
              <div className="paginacion-boletos mb-3">
                <button className="btn btn-sm">&lt;</button>
                <button className="btn btn-sm">&gt;</button>
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="comprarTodos"
                  checked={comprarTodos}
                  onChange={handleToggleComprarTodos}
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
                <div className="precio-item">
                  <span>Subtotal</span>
                  <span>${totalCompra.subtotal.toFixed(2)}</span>
                </div>
                <div className="precio-item">
                  <span>Impuestos</span>
                  <span>${totalCompra.impuestos.toFixed(2)}</span>
                </div>
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
                disabled={boletosSeleccionados.length === 0}
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