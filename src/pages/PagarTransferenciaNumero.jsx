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

const PagarTransferenciaNumeros = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const session = getSession();
  const usuarioLogueado = session.user?.user || session.user;

  const [sorteo, setSorteo] = useState(null);
  const [boletosApartados, setBoletosApartados] = useState([]);
  const [boletosSeleccionados, setBoletosSeleccionados] = useState([]);
  const [metodoPago, setMetodoPago] = useState("Transferencia Bancaria");
  const [cargando, setCargando] = useState(true);
  const [comprarTodos, setComprarTodos] = useState(false);
  const [imagenArchivo, setImagenArchivo] = useState(null);

  const nombreUsuario = usuarioLogueado?.nombre || "Usuario";
  const rolActual = "Participante";

  // --- Efectos y Carga de Datos ---

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
        } else {
          setSorteo(dataSorteo);
          setBoletosApartados([]);
        }
      } catch (error) {
        toast.error("Error al cargar los datos del sorteo.");
        console.error("Detalle del error en cargarDatos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [id, navigate, session.token, usuarioLogueado]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImagenArchivo(file);
  };

  useEffect(() => {
    setComprarTodos(
      boletosApartados.length > 0 &&
        boletosSeleccionados.length === boletosApartados.length
    );
  }, [boletosSeleccionados, boletosApartados]);

  const handleVolver = () => navigate(-1);

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
                  Método de pago : <strong>{metodoPago}</strong>
                </label>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Número de tarjeta para tranferir:
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="4152 3402 5746 2241"
                  disabled
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Imagen de comprobante de transferencia</label>
                <div
                  className="d-flex align-items-stretch"
                  style={{
                    backgroundColor: "#f3e5f5",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <label
                    htmlFor="file-upload"
                    className="btn mb-0"
                    style={{
                      backgroundColor: "#DAA1ED",
                      color: "white",
                      borderRadius: "0",
                      padding: "12px 20px",
                      border: "none",
                      cursor: "pointer",
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
                    required
                  />
                  <span className="flex-grow-1 d-flex align-items-center px-3">
                    {imagenArchivo
                      ? imagenArchivo.name
                      : "No se eligió ningún archivo"}
                  </span>
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
                Seleccione los números a pagar
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
                {/* Paginación visual placeholder, si la necesitas funcional avísame */}
                <button className="btn btn-sm" disabled>
                  &lt;
                </button>
                <button className="btn btn-sm" disabled>
                  &gt;
                </button>
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
                  Pagar todos los numeros apartados
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
                className="btn btn-comprar"
                disabled={boletosSeleccionados.length === 0}
              >
                Enviar comprobante de transferencia
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagarTransferenciaNumeros;
