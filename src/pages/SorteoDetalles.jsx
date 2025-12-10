import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSorteoById,
  apartarNumeros,
  getBoletosPorSorteo,
  getToken,
  getSession,
  liberarNumeros,
  getRolActual,
} from "../services/api";
import Sidebar from "../components/Sidebar";
import "../styles/SorteoDetalles.css";
import { toast } from 'react-toastify';
import ModalMetodoPago from '../components/ModalMetodoPago'

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const SorteoDetalles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sorteo, setSorteo] = useState(null);
  const [boletosOcupados, setBoletosOcupados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [boletosSeleccionados, setBoletosSeleccionados] = useState([]);
  const [mostrarSoloMisBoletos, setMostrarSoloMisBoletos] = useState(false);
  const [usuarioTieneBoletosApartados, setUsuarioTieneBoletosApartados] =
    useState(false);
  const boletosPorPagina = 52;
  const [mostrarModalPago, setMostrarModalPago] = useState(false)
  const session = getSession();

  const nombreUsuario = session?.user?.nombre || "Sorteador Anonimo";
  const rolActual = getRolActual();
  const rolFormateado =
    rolActual.charAt(0).toUpperCase() + rolActual.slice(1).toLowerCase();

  useEffect(() => {
    const obtenerDatosCompletos = async () => {
      try {
        const [dataSorteo, dataBoletos] = await Promise.all([
          getSorteoById(id),
          getBoletosPorSorteo(id),
        ]);
        setSorteo(dataSorteo);
        setBoletosOcupados(dataBoletos);

        // --- Lógica de validación (correcta) ---
        const session = getSession();
        const usuarioLogueado = session.user?.user || session.user;

        if (usuarioLogueado && Array.isArray(dataBoletos)) {
          const tieneApartados = dataBoletos.some(
            (boleto) =>
              boleto.estado === "APARTADO" &&
              boleto.userId === usuarioLogueado.id
          );
          setUsuarioTieneBoletosApartados(tieneApartados);
        } else {
          // Si no hay sesión o no hay boletos, nos aseguramos de que el estado sea false.
          setUsuarioTieneBoletosApartados(false);
        }
        // ------------------------------------
      } catch (error) {
        console.error("Error al obtener los datos del sorteo:", error);
        setSorteo(null); // Usamos null para que la condición de carga funcione bien
      }
    };
    obtenerDatosCompletos();
  }, [id]);

  const sorteoNoIniciado = useMemo(() => {
    if (!sorteo?.fechaInicialVentaBoletos) return false;

    const hoy = new Date();
    const fechaInicio = new Date(sorteo.fechaInicialVentaBoletos);

    return hoy < fechaInicio;
  }, [sorteo]);

  //Obtenemos el id del usuario logueado
  const idUsuarioLogueado = useMemo(() => {
    const session = getSession();
    const usuarioLogueado = session.user?.user || session.user;
    return usuarioLogueado ? usuarioLogueado.id : null;
  }, [getSession()]);

  const mostrarCategoriasUsuario = idUsuarioLogueado !== null;

  console.log("ID Usuario Logueado:", idUsuarioLogueado);

  const boletosEstadoMap = useMemo(() => {
    const map = {};
    if (Array.isArray(boletosOcupados)) {
      // Añadida verificación por seguridad
      boletosOcupados.forEach((boleto) => {
        map[boleto.numeroBoleto] = boleto.estado;
      });
    }
    return map;
  }, [boletosOcupados]);

  // NUEVA LÓGICA: Agrupar mis boletos (Ignorando paginación)
  // MOVIDO AQUÍ ARRIBA PARA EVITAR EL ERROR DE HOOKS
  const misBoletosGrouped = useMemo(() => {
    if (!idUsuarioLogueado || !Array.isArray(boletosOcupados))
      return { apartados: [], comprados: [] };

    // Filtramos TODOS los boletos del usuario separando apatados de comprados
    const mis = boletosOcupados.filter((b) => b.userId === idUsuarioLogueado);

    return {
      apartados: mis
        .filter((b) => b.estado === "APARTADO")
        .map((b) => b.numeroBoleto)
        .sort((a, b) => a - b),
      comprados: mis
        .filter((b) => b.estado === "COMPRADO")
        .map((b) => b.numeroBoleto)
        .sort((a, b) => a - b),
    };
  }, [boletosOcupados, idUsuarioLogueado]);

  const estadoBoleto = (num) => {
    // Si está seleccionado por el usuario
    if (boletosSeleccionados.includes(num)) {
      return "seleccionado";
    }

    const boletoInfo = boletosOcupados.find((b) => b.numeroBoleto === num);

    if (boletoInfo) {
      const { estado, userId } = boletoInfo;

      console.log(
        "Estado del boleto:",
        estado,
        "ID Usuario del boleto:",
        userId
      );
      console.log("Información completa del boleto:", boletoInfo);

      // ---- MIS BOLETOS ----
      if (idUsuarioLogueado && userId === idUsuarioLogueado) {
        if (estado === "APARTADO") return "mi_apartado";
        if (estado === "COMPRADO") return "mi_comprado";
      }

      // ---- BOLETOS DE OTROS ----
      if (estado === "APARTADO") return "apartado";
      if (estado === "COMPRADO") return "vendido";
    }

    // Si está libre
    return "disponible";
  };

  const alternarSeleccion = (num) => {
    if (sorteoNoIniciado) {
      toast.error(
        `Este sorteo aún no inicia.\nLa venta de boletos empieza el ${formatDate(
          sorteo.fechaInicialVentaBoletos
        )}.`
      );
      return;
    }

    // Obtener info completa del boleto
    const b = boletosOcupados.find(x => x.numeroBoleto === num);

    // Si está libre → permitir
    if (!b) {
      setBoletosSeleccionados(prev =>
        prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
      );
      return;
    }

    // Si está comprado → nunca permitir
    if (b.estado === "COMPRADO") return;

    // Si está apartado por otro usuario → no permitir
    if (b.estado === "APARTADO" && b.userId !== idUsuarioLogueado) return;

    // Si está apartado por mí → permitir selección
    if (b.estado === "APARTADO" && b.userId === idUsuarioLogueado) {
      setBoletosSeleccionados(prev =>
        prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
      );
      return;
    }
    /*
    setBoletosSeleccionados((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );*/
  };

  const apartarBoletos = () => {
    if (sorteoNoIniciado) {
      toast.error(
        `Este sorteo aún no inicia.\nNo puedes apartar boletos hasta el ${formatDate(
          sorteo.fechaInicialVentaBoletos
        )}.`
      );
      return;
    }

    if (boletosSeleccionados.length === 0) {
      toast.error("Por favor, selecciona al menos un boleto para apartar.");
      return;
    }

    const token = getToken();

    if (!token) {
      if (
        window.confirm(
          "Para apartar boletos, necesitas iniciar sesión. ¿Deseas ir a la página de inicio de sesión ahora?"
        )
      ) {
        navigate("/login");
      }
      return;
    }

    const numerosAStrings = boletosSeleccionados.map(String);

    apartarNumeros(sorteo.id, numerosAStrings, token)
      .then((response) => {
        const numerosApartados = response.reservedTickets.map(
          (ticket) => ticket.numeroBoleto
        );
        toast.success(`Boletos apartados exitosamente: ${numerosApartados.join(", ")}`);

        setBoletosOcupados((prev) => [...prev, ...response.reservedTickets]);
        setBoletosSeleccionados([]);
        setUsuarioTieneBoletosApartados(true); // Actualizamos el estado para mostrar el botón de pagar

        if (response.failedToReserve && response.failedToReserve.length > 0) {
          toast.warning(
            `Los siguientes boletos no se pudieron apartar (ya estaban ocupados): ${response.failedToReserve.join(
              ", "
            )}`
          );
        }
      })
      .catch((error) => {
        console.error("Error al apartar boletos:", error);
        toast.error(`Error: ${error.message}`);
      });
  };

  const liberarBoletos = () => {
    if (sorteoNoIniciado) {
      toast.error(
        `Este sorteo aún no inicia.\nNo puedes apartar boletos hasta el ${formatDate(
          sorteo.fechaInicialVentaBoletos
        )}.`
      );
      return;
    }

    if (boletosSeleccionados.length === 0) {
      toast.error("Por favor, selecciona al menos un boleto para apartar.");
      return;
    }

    const token = getToken();

    if (!token) {
      if (
        window.confirm(
          "Para apartar boletos, necesitas iniciar sesión. ¿Deseas ir a la página de inicio de sesión ahora?"
        )
      ) {
        navigate("/login");
      }
      return;
    }

    const numerosAStrings = boletosSeleccionados.map(String);

    //Mantener solo los boletos con estado APARTADO y que pertenezcan al usuario logueado
    const boletosApartadosDelUsuario = boletosOcupados.filter((boleto) =>
      numerosAStrings.includes(String(boleto.numeroBoleto)) &&
      boleto.estado === "APARTADO" &&
      boleto.userId === idUsuarioLogueado
    );

    //Solo imprimir mensaje en consolo de los boletos que se intentarán liberar
    console.log("Boletos a liberar:", boletosApartadosDelUsuario);

    /*liberarNumeros(sorteo.id, boletosApartadosDelUsuario.map(b => String(b.numeroBoleto)), token)
      .then((response) => {
        const numerosLiberados = response.freeTickets.map(
          (ticket) => ticket.numeroBoleto
        );
        toast.success(`Boletos liberados exitosamente: ${numerosLiberados.join(", ")}`);

        setBoletosOcupados((prev) => [...prev.filter(b => !numerosLiberados.includes(b.numeroBoleto)), ...response.freeTickets]);
        setBoletosSeleccionados([]);

        if (response.failedToReserve && response.failedToReserve.length > 0) {
          toast.warning(
            `Los siguientes boletos no se pudieron liberar: ${response.failedToReserve.join(
              ", "
            )}`
          );
        }
      })
      .catch((error) => {
        console.error("Error al liberar boletos:", error);
        toast.error(`Error: ${error.message}`);
      });*/
  };

  if (!sorteo) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div
          className="flex-grow-1"
          style={{ marginLeft: "80px", padding: "2rem" }}
        >
          <p>Cargando sorteo...</p>
        </div>
      </div>
    );
  }

  // // Lógica de paginación segura (evita error si 'sorteo.cantidadMaximaBoletos' no existe)
  // const cantidadBoletos = sorteo.cantidadMaximaBoletos || 0;
  // const boletos = Array.from({ length: cantidadBoletos }, (_, i) => i + 1);
  // const totalPaginas = Math.ceil(boletos.length / boletosPorPagina);
  // const indiceInicio = (paginaActual - 1) * boletosPorPagina;
  // const boletosPagina = boletos.slice(
  //   indiceInicio,
  //   indiceInicio + boletosPorPagina
  // );

  // // Filtrar si se activa "Mis boletos"
  // const boletosFiltrados = mostrarSoloMisBoletos
  //   ? boletosPagina.filter((num) => {
  //       const b = boletosOcupados.find((x) => x.numeroBoleto === num);
  //       if (!b) return false;
  //       return (
  //         b.userId === idUsuarioLogueado &&
  //         (b.estado === "APARTADO" || b.estado === "COMPRADO")
  //       );
  //     })
  //   : boletosPagina;


  // Si sorteo es null, evita romper todo
  if (!sorteo) {
    return <div>Cargando...</div>; // o lo que quieras mostrar
  }

  // Lógica segura
  const cantidadBoletos = sorteo.cantidadMaximaBoletos ?? 0;
  const boletos = Array.from({ length: cantidadBoletos }, (_, i) => i + 1);
  const totalPaginas = Math.ceil(boletos.length / boletosPorPagina);
  const indiceInicio = (paginaActual - 1) * boletosPorPagina;
  const boletosPagina = boletos.slice(
    indiceInicio,
    indiceInicio + boletosPorPagina
  );

  const handleSeleccionMetodoPago = (metodo) => {
    setMostrarModalPago(false);

    if (metodo === 'online') {
      // Redirige a pago en línea (actual)
      navigate(`/pagar/${sorteo.id}`);
    } else if (metodo === 'transferencia') {
      // Redirige a pago por transferencia (nueva página)
      navigate(`/pagar-transferencia/${sorteo.id}`);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
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
          <h2 className="fw-bold mb-3">{sorteo.nombre}</h2>
          <div className="sorteo-detalle-card p-4 mb-4">
            <h5 className="fw-bold mb-2">Descripción</h5>
            <p>{sorteo.descripcion}</p>
            <div className="d-flex flex-wrap align-items-center justify-content-around mt-3">
              <img
                src={sorteo.urlImagen}
                alt={sorteo.nombre}
                className="sorteo-imagen"
              />
              <div className="sorteo-info mt-3">
                <p>
                  <strong>Premio:</strong> {sorteo.premio}
                </p>
                <p>
                  <strong>Costo del boleto:</strong> ${sorteo.precioBoleto}
                </p>
                <p>
                  <strong>Fecha inicial de compra de boletos:</strong>{" "}
                  {formatDate(sorteo.fechaInicialVentaBoletos)}
                </p>
                <p>
                  <strong>Fecha final de compra boletos:</strong>{" "}
                  {formatDate(sorteo.fechaFinalVentaBoletos)}
                </p>
                <p>
                  <strong>Fecha de realización del sorteo:</strong>{" "}
                  {formatDate(sorteo.fechaRealizacion)}
                </p>
              </div>
            </div>
          </div>
          <div className="boletos-section">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="fw-bold m-0">Apartar Boletos</h5>

              {/* Checkbox Mis boletos */}
              {mostrarCategoriasUsuario && (
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="misBoletosCheck"
                    checked={mostrarSoloMisBoletos}
                    onChange={() => setMostrarSoloMisBoletos((v) => !v)}
                  />
                  <label className="form-check-label" htmlFor="misBoletosCheck">
                    Mis boletos
                  </label>
                </div>
              )}
            </div>

            <div className="leyenda mb-3">
              <span className="disponible">Disponibles</span>
              <span className="apartado">Apartados</span>
              <span className="vendido">Vendidos</span>
              <span className="seleccionado">Seleccionados</span>

              {mostrarCategoriasUsuario && (
                <>
                  <span className="mi_apartado">Mis Apartados</span>
                  <span className="mi_comprado">Mis Comprados</span>
                </>
              )}
            </div>

            {/* <div className="boletos-container">
              {boletosFiltrados.map((num) => (
                <button
                  key={num}
                  className={`boleto ${estadoBoleto(num)}`}
                  onClick={() => alternarSeleccion(num)}
                  disabled={!!boletosEstadoMap[num]}
                >
                  {num}
                </button>
              ))}
            </div> */}

            <div className="boletos-container">
              {/* VISTA 1: MODO "MIS BOLETOS" (Agrupado y sin paginación) */}
              {mostrarSoloMisBoletos ? (
                <div className="w-100">
                  {/* Sección Apartados */}
                  {misBoletosGrouped.apartados.length > 0 && (
                    <div className="mb-3">
                      <h6 className="fw-bold text-muted mb-2">Mis Apartados</h6>
                      <div className="d-flex flex-wrap gap-2 justify-content-center">
                        {misBoletosGrouped.apartados.map((num) => (
                          <button
                            key={num}
                            className={`boleto ${estadoBoleto(num)}`}
                            onClick={() => alternarSeleccion(num)}
                            disabled={true} // Mis apartados ya están ocupados
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sección Comprados */}
                  {misBoletosGrouped.comprados.length > 0 && (
                    <div className="mb-3">
                      <h6 className="fw-bold text-muted mb-2">Mis Comprados</h6>
                      <div className="d-flex flex-wrap gap-2 justify-content-center">
                        {misBoletosGrouped.comprados.map((num) => (
                          <button
                            key={num}
                            className={`boleto ${estadoBoleto(num)}`}
                            onClick={() => alternarSeleccion(num)}
                            disabled={true} // Mis comprados ya están ocupados
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mensaje si no tiene nada */}
                  {misBoletosGrouped.apartados.length === 0 &&
                    misBoletosGrouped.comprados.length === 0 && (
                      <p className="text-center text-muted">
                        No tienes boletos apartados ni comprados aún.
                      </p>
                    )}
                </div>
              ) : (
                /* VISTA 2: MODO NORMAL (Paginado) - Se mantiene igual para los tests */
                boletosPagina.map((num) => (
                  <button
                    key={num}
                    className={`boleto ${estadoBoleto(num)}`}
                    onClick={() => alternarSeleccion(num)}
                    disabled={
                      estadoBoleto(num) === "vendido" ||
                      estadoBoleto(num) === "apartado" // solo apartados de otros
                    }
                  >
                    {num}
                  </button>
                ))
              )}
            </div>

            {/* <div className="d-flex justify-content-center align-items-center mt-3">
              <button
                className="btn btn-sm btn-outline-secondary mx-2"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => p - 1)}
              >
                &lt;
              </button>
              <span>
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                className="btn btn-sm btn-outline-secondary mx-2"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((p) => p + 1)}
              >
                &gt;
              </button>
            </div> */}

            {/* Solo mostrar paginación si NO estamos en "Mis boletos" */}
            {!mostrarSoloMisBoletos && (
              <div className="d-flex justify-content-center align-items-center mt-3">
                <button
                  className="btn btn-sm btn-outline-secondary mx-2"
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual((p) => p - 1)}
                >
                  &lt;
                </button>
                <span>
                  Página {paginaActual} de {totalPaginas}
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary mx-2"
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual((p) => p + 1)}
                >
                  &gt;
                </button>
              </div>
            )}

            <div className="d-flex align-items-center mt-3">
              <button
                className="btn btn-primary rounded-pill"
                onClick={apartarBoletos}
                style={{
                  backgroundColor: "#C087E8",
                  color: "black",
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                Apartar números
              </button>

              <button
                className="btn btn-primary rounded-pill ms-3"
                onClick={liberarBoletos}
                style={{
                  backgroundColor: "#C087E8",
                  color: "black",
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                Liberar números
              </button>

              {usuarioTieneBoletosApartados && (
                <button
                  className="btn btn-primary rounded-pill"
                  onClick={() => setMostrarModalPago(true)}
                  style={{
                    backgroundColor: "#C087E8",
                    color: "black",
                    border: "none",
                    fontWeight: "bold",
                    marginLeft: "auto",
                  }}
                >
                  Pagar Números Apartados
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <ModalMetodoPago
        isOpen={mostrarModalPago}
        onClose={() => setMostrarModalPago(false)}
        onSelectMetodo={handleSeleccionMetodoPago}
      />
    </div>
  );
};

export default SorteoDetalles;