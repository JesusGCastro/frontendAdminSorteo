import { Link } from "react-router-dom";
import { FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { registerUser } from "../services/api";

const CustomButton = ({ children, buttonBgColor, buttonHoverBgColor, ...props }) => (
  <button
    {...props}
    style={{
      backgroundColor: buttonBgColor,
      borderColor: buttonBgColor,
      color: 'white',
      fontWeight: 'normal',
      transition: 'background-color 0.3s',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHoverBgColor)}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonBgColor)}
    className="btn w-100"
  >
    {children}
  </button>
);

const PasswordInput = ({ label, isVisible, toggleVisibility, value, onChange, inputBgColor }) => (
  <div className="mb-4">
    <label htmlFor={label} className="form-label fw-normal" style={{ fontSize: '1.2rem' }}>
      {label}
    </label>
    <div className="input-group">
      <input
        type={isVisible ? "text" : "password"}
        className="form-control"
        style={{
          backgroundColor: inputBgColor,
          height: '3.5rem',
          border: 'none',
          borderRight: 'none',
          borderRadius: '0.5rem 0 0 0.5rem',
          fontSize: '1.1rem',
          padding: '0.75rem 1rem'
        }}
        value={value}
        onChange={onChange}
        required
      />
      <span
        className="input-group-text"
        style={{
          backgroundColor: inputBgColor,
          border: 'none',
          borderRadius: '0 0.5rem 0.5rem 0',
          height: '3.5rem',
          paddingRight: '1rem',
          cursor: 'pointer'
        }}
        onClick={toggleVisibility}
      >
        <FaEyeSlash size={22} color="#777" />
      </span>
    </div>
  </div>
);

const SimpleInput = ({ label, type, required = true, value, onChange, inputBgColor }) => (
  <div className="mb-4">
    <label htmlFor={label} className="form-label fw-normal" style={{ fontSize: '1.2rem' }}>
      {label}
    </label>
    <input
      type={type}
      className="form-control"
      style={{
        backgroundColor: inputBgColor,
        height: '3.5rem',
        border: 'none',
        borderRadius: '0.5rem',
        fontSize: '1.1rem',
        padding: '0.75rem 1rem'
      }}
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
);

export default function Register() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    // Requiere: 1 minúscula, 1 mayúscula, 1 número, 1 caracter especial y 6+ caracteres de largo.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<,>./?~`-])(?=.{6,})/;

    if (!passwordRegex.test(password)) {
      setError("La contraseña debe tener al menos 6 caracteres, 1 mayúscula, 1 minúscula, y 1 caracter especial.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try { // Logica de registro
      const data = await registerUser(name, email, password);
      console.log("Registro exitoso simulado:", { name, email, password });
      setError("Registro exitoso. Redirigiendo..."); // Mensaje temporal de éxito
      // Redirigir al login
      setTimeout(() => {
        window.location.href = "/frontendAdminSorteo/#/login";
      }, 1000);
    } catch (error) {
      console.error("Error en handleSubmit:", error.message);

      // Detectar el tipo de error por mensaje
      if (error.message.includes("ya registrado") || error.message.includes("existente")) {
        setError("El usuario ya está registrado. Intenta con otro correo.");
      } else if (error.message.includes("Datos de registro no válidos")) {
        setError("Los datos ingresados no son válidos. Revisa el formulario.");
      } else if (error.message.includes("API") || error.message.includes("servidor")) {
        setError("Error en el servidor. Intenta más tarde.");
      } else {
        setError("No se pudo registrar. Verifique los datos o intente más tarde.");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordShown(!confirmPasswordShown);
  };

  const customBgColor = "#f7e8fb";
  const inputBgColor = "white";
  const buttonBgColor = "#5c5c5c";
  const buttonHoverBgColor = "#4a4a4a";
  const textColor = "black";

  return (
    <div className="d-flex justify-content-center align-items-start" style={{ backgroundColor: customBgColor, minHeight: '100vh', width: '100%' }}>

      {/* 1. Contenedor del Título y Formulario */}
      <div
        className="pt-5 pb-5 w-100" // w-100 asegura que ocupe todo el ancho disponible
      >
        {/* 2. Contenedor Interno: Aplica el ancho máximo solo en dispositivos grandes */}
        <div
          className="mx-auto px-4" // mx-auto para centrar; px-4 añade padding horizontal en móviles
          // Usamos clases de Bootstrap para ancho máximo: max-width: 400px o sm/md/lg
          style={{ maxWidth: '400px', color: textColor }}
        >

          <h1 className="text-center fw-bold mb-5" style={{ fontSize: '2.5rem' }}>
            Cree una cuenta
          </h1>

          {/* ... (Mensaje de error y Formulario sin cambios) ... */}
          {error && (
            <div
              className={`alert ${error.startsWith('Registro exitoso') ? 'alert-success' : 'alert-danger'} text-center py-2`}
              style={{ fontSize: "0.95rem", borderRadius: "0.5rem", marginBottom: "1.5rem" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <SimpleInput
              label="Nombre de participante"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              inputBgColor={inputBgColor}
            />
            <SimpleInput
              label="Correo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputBgColor={inputBgColor}
            />
            <PasswordInput
              label="Contraseña"
              isVisible={passwordShown}
              toggleVisibility={togglePasswordVisibility}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputBgColor={inputBgColor}
            />
            <PasswordInput
              label="Confirmar contraseña"
              isVisible={confirmPasswordShown}
              toggleVisibility={toggleConfirmPasswordVisibility}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              inputBgColor={inputBgColor}
            />

            <div className="mt-4 mb-3">
              <CustomButton
                type="submit"
                buttonBgColor={buttonBgColor}
                buttonHoverBgColor={buttonHoverBgColor}
              >
                Registrarse
              </CustomButton>
            </div>
          </form>

          <p className="text-center small mt-0">
            ¿Ya tienes cuenta?{" "}
            <Link to="/Login" className="fw-bold" style={{ color: textColor, textDecoration: 'none' }}>
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}