import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { clearSession } from "../api";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const role = parsedUser?.rol ?? null;

    console.log("DEBUG: role:", role);
    console.log("DEBUG: user:", parsedUser);

    setRole(role);
  }, []);


  const handleLogout = async () => {
    try {
      await clearSession();
      navigate("/login");
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

  const menuItems = [
    { nombre: "Sorteos", icono: "bi bi-calendar2-event", ruta: "/" },
    { nombre: "Boletos", icono: "bi bi-ticket-perforated", ruta: "/boletos" },
  ];

  let bottomItems;
  if (role === null) {
    bottomItems = [
      { nombre: "Perfil", icono: "bi bi-person-circle", ruta: "/login" },
    ];
  } else {
    bottomItems = [
      { nombre: "Configuración", icono: "bi bi-gear", ruta: "/config" },
      ...(role !== "participante"
        ? [{ nombre: "Switch", icono: "bi bi-person-check", ruta: "/sorteador" }]
        : []),
      // Botón de cerrar sesión
      { nombre: "Cerrar Sesión", icono: "bi bi-arrow-left-right", onClick: handleLogout },
    ];
  }

  return (
    <div className="sidebar d-flex flex-column align-items-center py-4">
      {/* Parte superior */}
      <div className="flex-grow-1 d-flex flex-column align-items-center">
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.ruta;
          return (
            <Link
              key={i}
              to={item.ruta || "/"}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <div className="icon-container">
                <i className={`${item.icono} fs-4`} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Parte inferior */}
      <div className="d-flex flex-column align-items-center">
        {bottomItems.map((item, i) => {
          const isActive = location.pathname === item.ruta;

          return item.onClick ? (
            <button
              key={i}
              onClick={item.onClick}
              className="sidebar-link btn p-0"
            >
              <div className="icon-container">
                <i className={`${item.icono} fs-4`} />
              </div>
            </button>
          ) : (
            <Link
              key={i}
              to={item.ruta || "/"}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <div className="icon-container">
                {item.img ? (
                  <img src={item.img} alt={item.nombre} className="sidebar-img" />
                ) : (
                  <i className={`${item.icono} fs-4`} />
                )}
              </div>
            </Link>
          );
        })}

      </div>
    </div>
  );
};

export default Sidebar;
