import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Register from "./pages/Register";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SorteoDetalles from "./pages/SorteoDetalles";
import CrearSorteo from "./pages/CrearSorteo";
import EditarSorteo from "./pages/EditarSorteo";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PagarNumeros from "./pages/PagarNumeros";
import PagarTransferenciaNumeros from "./pages/PagarTransferenciaNumero";

function App() {
  return (
    <div className="d-flex">
      <ToastContainer />
      <Sidebar />
      <div className="flex-grow-1" style={{ marginLeft: "80px" }}>
        <Routes>
          {/* Página principal con los sorteos */}
          <Route path="/" element={<Home />} />
          {/* Página de inicio de sesión */}
          <Route path="/login" element={<Login />} />
          {/* Página de registro */}
          <Route path="/register" element={<Register />} />
          {/* Página de detalles del sorteo */}
          <Route path="/sorteos/:id" element={<SorteoDetalles />} />
          {/* Página para crear un nuevo sorteo */}
          <Route path="/crear-sorteo" element={<CrearSorteo />} />
          {/* Página para editar un sorteo */}
          <Route path="/edicionSorteos/:id" element={<EditarSorteo />} />
          {/* Página para pagar en linea un número */}
          <Route path="/pagar/:id" element={<PagarNumeros />} />
          {/* Página para pagar por transferencia un número */}
          <Route path="/pagar-transferencia/:id" element={<PagarTransferenciaNumeros />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;