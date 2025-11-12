import { Link, useNavigate } from "react-router-dom";
import { FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { loginUser, getUserProfile, saveSession, setPuedeCambiarRol, setRolActual } from "../services/api";

export default function Login() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // se usa para redirigir

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // limpia mensaje previo

    try {
      const data = await loginUser(correo, contrasenia);
      if (!data.token) {
        setError("Correo o contraseña incorrectos. Intenta de nuevo.");
        return;
      } else {
        const userData = await getUserProfile(data.token);
        console.log("Datos del usuario:", userData);
        saveSession(data.token, userData); // guarda todo

        if (userData.rol === "sorteador") {
          // Poner un debug
          console.log("Rol actual:", userData.rol);
          setPuedeCambiarRol("true");
          setRolActual("sorteador");
          navigate("/", { replace: true });
          return;

        } else if (userData.rol === "participante") {
          setPuedeCambiarRol("false");
          setRolActual("participante");
          navigate("/", { replace: true });
          return;
        }
        setError("No tiene un rol valido");
        return;
      }

    } catch (error) {
      console.error(error);
      setError("No se pudo iniciar sesion, intenta de nuevo más tarde.");
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  // Estilos
  const customBgColor = "#f7e8fb";
  const inputBgColor = "white";
  const buttonBgColor = "#5c5c5c";
  const buttonHoverBgColor = "#4a4a4a";
  const textColor = "black";

  const CustomButton = ({ children, ...props }) => (
    <button
      {...props}
      style={{
        backgroundColor: buttonBgColor,
        borderColor: buttonBgColor,
        color: "white",
        fontWeight: "normal",
        transition: "background-color 0.3s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHoverBgColor)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonBgColor)}
      className="btn w-100"
    >
      {children}
    </button>
  );

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100 w-100" // w-100 asegura que ocupe todo el ancho
      style={{ backgroundColor: customBgColor }}
    >
      {/* Contenedor que limita el ancho solo en desktop y añade padding en móvil */}
      <div
        className="mx-auto px-4" // mx-auto para centrar; px-4 para padding lateral en móvil
        style={{ maxWidth: '450px', color: textColor }} // Máximo 450px para desktop
      >
        {/* Título */}
        <h1 className="text-center fw-bold mb-1" style={{ fontSize: "2.5rem" }}>
          BIENVENIDO
        </h1>
        <p
          className="text-center text-muted mb-5"
          style={{ fontSize: "1.1rem" }}
        >
          Inicie sesión para continuar
        </p>

        {/* Mensaje de error (solo si existe) */}
        {error && (
          <div
            className={`alert ${error.startsWith('Valido') ? 'alert-success' : 'alert-danger'} text-center py-2`}
            style={{
              fontSize: "0.95rem",
              borderRadius: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Campo Correo */}
          <div className="mb-4">
            <label
              htmlFor="correo"
              className="form-label fw-normal"
              style={{ fontSize: "1.2rem" }}
            >
              Correo
            </label>
            <input
              type="email"
              className="form-control"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              style={{
                backgroundColor: inputBgColor,
                height: "3.5rem",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "1.1rem",
                padding: "0.75rem 1rem",
              }}
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="form-label fw-normal"
              style={{ fontSize: "1.2rem" }}
            >
              Contraseña
            </label>
            <div className="input-group">
              <input
                type={passwordShown ? "text" : "password"}
                className="form-control"
                value={contrasenia}
                onChange={(e) => setContrasenia(e.target.value)}
                style={{
                  backgroundColor: inputBgColor,
                  height: "3.5rem",
                  border: "none",
                  borderRight: "none",
                  borderRadius: "0.5rem 0 0 0.5rem",
                  fontSize: "1.1rem",
                  padding: "0.75rem 1rem",
                }}
                required
              />
              <span
                className="input-group-text"
                style={{
                  backgroundColor: inputBgColor,
                  border: "none",
                  borderRadius: "0 0.5rem 0.5rem 0",
                  height: "3.5rem",
                  paddingRight: "1rem",
                  cursor: "pointer",
                }}
                onClick={togglePasswordVisibility}
              >
                <FaEyeSlash size={22} color="#777" />
              </span>
            </div>
          </div>

          {/* Botón */}
          <div className="mt-4 mb-3">
            <CustomButton
              type="submit"
              buttonBgColor={buttonBgColor}
              buttonHoverBgColor={buttonHoverBgColor}
            >
              Iniciar Sesión
            </CustomButton>
          </div>
        </form>

        {/* Enlaces */}
        <p className="text-center small mt-0 mb-1">¿Olvidaste tu contraseña?</p>
        <p className="text-center small mt-2">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="fw-bold"
            style={{ color: textColor, textDecoration: "none" }}
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}