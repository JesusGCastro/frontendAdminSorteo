import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSorteoById,
  obtenerBoletosApartadosPorUsuario,
  getSession,
  getToken,
  registarTransBoletosApartados,
  uploadImageToCloudinary,
} from "../services/api";
import { toast } from "react-toastify";
import "./PagarNumeros.css";

const PagarTransferenciaNumeros = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const session = getSession();
  const usuarioLogueado = session.user?.user || session.user;
  const usuarioId = usuarioLogueado?.id; // Extraer el ID una sola vez

  const [sorteo, setSorteo] = useState(null);
  const [boletosApartados, setBoletosApartados] = useState([]);
  const [boletosSeleccionados, setBoletosSeleccionados] = useState([]);
  const [metodoPago, setMetodoPago] = useState("Transferencia Bancaria");
  const [cargando, setCargando] = useState(true);
  const [comprarTodos, setComprarTodos] = useState(false);
  const [imagenArchivo, setImagenArchivo] = useState(null);

  const nombreUsuario = usuarioLogueado?.nombre || "Usuario";
  const rolActual = "Participante";

  useEffect(() => {
    const cargarDatos = async () => {
      if (!session.token || !usuarioId) {
        toast.error("Debes iniciar sesión para poder pagar.");
        navigate("/login");
        return;
      }

      try {
        const [dataSorteo, dataBoletosApartados] = await Promise.all([
          getSorteoById(id),
          obtenerBoletosApartadosPorUsuario(id, session.token),
        ]);

        setSorteo(dataSorteo);
        setBoletosApartados(dataBoletosApartados);
      } catch (error) {
        toast.error(error.message || "Error al cargar los datos del sorteo.");
        console.error("Detalle del error en cargarDatos:", error);
      }
      finally {
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
  };

  // Limpiar la URL del objeto de imagen cuando el componente se desmonte o el archivo cambie
  useEffect(() => {
    if (imagenArchivo) {
      const objectUrl = URL.createObjectURL(imagenArchivo);
      // Retorna una función de limpieza para revocar la URL
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [imagenArchivo]);

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

  const handleRegistrarComprobante = async () => {
    const token = getToken();
    if (!token) {
      toast.error("Sesión no válida. Por favor inicia sesión nuevamente.");
      return;
    }

    if (!imagenArchivo) {
      toast.error(
        "Por favor, selecciona una imagen para registrar el comprobante de pago."
      );
      return;
    }

    if (boletosSeleccionados.length === 0) {
      toast.warning("Por favor selecciona los boletos que deseas pagar.");
      return;
    }

    const montoTotal = totalCompra.total;

    try {
      const loadingToast = toast.loading("Procesando pago...");

      const urlImagen = await uploadImageToCloudinary(imagenArchivo);

      await registarTransBoletosApartados(
        id,
        boletosSeleccionados,
        montoTotal,
        urlImagen,
        token
      );

      toast.update(loadingToast, {
        render:
          "Registro de comprobante exitoso! Tu comprobante procederá a ser verificado.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate(`/sorteos/${id}`);
      }, 2000);
    } catch (error) {
      toast.dismiss();
      console.error("Error en registro de comprobante:", error);
      toast.error(
        error.message || "Hubo un error al procesar tu registro de comprobante."
      );
    }
  };

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
                <label className="form-label fw-semibold">
                  Imagen de comprobante de transferencia
                </label>
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
                    {imagenArchivo ? (
                      <img
                        src={URL.createObjectURL(imagenArchivo)}
                        alt="Comprobante de transferencia"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "8px"
                        }}
                      />
                    ) : (
                      "No se eligió ningún archivo"
                    )}
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
              <div className="leyenda mb-3">
                <span className="pendiente">En revisión</span>
                <span className="vendido">Seleccionado</span>
              </div>
              <div className="boletos-a-pagar-grid mb-3">
                {boletosApartados.length > 0 ? (
                  boletosApartados.map((b) => {
                    const isPendiente = b.payment?.estado === "PENDIENTE";
                    const isSelected = boletosSeleccionados.includes(
                      b.numeroBoleto
                    );

                    return (
                      <div
                        key={b.numeroBoleto}
                        className={`boleto-item 
                          ${isSelected ? "selected" : ""}
                          ${isPendiente ? "pendiente" : ""}
                        `}
                        onClick={() => {
                          if (isPendiente) return;
                          handleToggleSeleccion(b.numeroBoleto);
                        }}
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
                onClick={handleRegistrarComprobante}
                className="btn btn-comprar"
                disabled={boletosSeleccionados.length === 0 || !imagenArchivo}
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
