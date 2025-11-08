import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { nombre: "Sorteos", icono: "bi bi-calendar2-event", ruta: "/" },
    { nombre: "Boletos", icono: "bi bi-ticket-perforated", ruta: "/boletos" },
  ];

  const bottomItems = [
    { nombre: "Perfil", icono: "bi bi-person-circle", ruta: "/login" },
    { nombre: "Configuración", icono: "bi bi-gear", ruta: "/config" },
    { nombre: "Switch", img: "/assets/switchProfile.png", ruta: "/sorteador" },
  ];

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
          return (
            <Link
              key={i}
              to={item.ruta || "/"}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <div className="icon-container">
                {item.img ? (
                  <img
                    src={item.img}
                    alt={item.nombre}
                    className="sidebar-img"
                  />
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
