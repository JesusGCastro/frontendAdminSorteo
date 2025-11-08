import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SorteoCard.css";

const SorteoCard = ({ sorteo }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/sorteos/${sorteo.id}`, sorteo);
  };

  return (
    <div
      className="card shadow-sm border-0 rounded-4 text-center m-3 sorteo-card"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <img
        src={sorteo.imagen}
        alt={sorteo.nombre}
        className="card-img-top p-3"
      />
      <div className="card-body">
        <h6 className="card-title">{sorteo.nombre}</h6>
        <p className="text-muted">${sorteo.precio}</p>
      </div>
    </div>
  );
};

export default SorteoCard;