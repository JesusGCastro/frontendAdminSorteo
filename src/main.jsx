import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import { HashRouter as Router } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";


ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <App />
  </Router>
);
