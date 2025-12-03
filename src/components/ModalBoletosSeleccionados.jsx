import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { liberarBoletosApartados } from '../services/api';
import './ModalBoletosSeleccionados.css';

const ModalBoletosSeleccionados = ({ isOpen, onClose, boletos, raffleId, token, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLiberar = async () => {
    if (boletos.length === 0) {
      toast.warning("No hay boletos seleccionados");
      return;
    }

    try {
      setLoading(true);

      // Llamar al backend para liberar
      const response = await liberarBoletosApartados(raffleId, boletos, token);

      console.log("Respuesta del servidor:", response);

      // Cerrar modal y notificar éxito
      onSuccess(boletos);

    } catch (error) {
      console.error("Error al liberar boletos:", error);
      toast.error(error.message || "Error al liberar los boletos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-boletos">
          
          <div className="modal-header border-0 pb-2">
            <h5 className="modal-title w-100 fw-bold text-center">Liberar numero apartado</h5>
            <button 
              className="btn-close position-absolute" 
              onClick={onClose}
              disabled={loading}
              style={{ right: '20px', top: '20px' }}
            ></button>
          </div>

          <div className="modal-body pt-2">
            <p className="text-center mb-3" style={{ color: '#666', fontSize: '0.95rem' }}>
              ¿Deseas liberar los siguientes números?
            </p>

            {/* Lista de boletos en grid */}
            <div className="boletos-grid">
              {boletos.length === 0 ? (
                <p className="text-center">No hay boletos seleccionados</p>
              ) : (
                boletos.map((num, i) => (
                  <div key={i} className="boleto-badge">
                    {num}
                  </div>
                ))
              )}
            </div>

            <p className="text-center mb-3" style={{ color: '#666', fontSize: '0.95rem' }}>
              Estos números se eliminarán de la base de datos y volverán a estar disponibles para todos.
            </p>
          </div>

          <div className="modal-footer border-0 d-flex justify-content-between pt-0 pb-4">
            <button 
              className="btn btn-cancelar px-4 py-2" 
              onClick={onClose}
              disabled={loading}
              style={{
                background: 'transparent',
                color: 'black',
                fontWeight: '500',
                border: 'none',
                minWidth: '120px'
              }}
            >
              Cancelar
            </button>

            <button 
              className="btn btn-liberar px-4 py-2" 
              onClick={handleLiberar}
              disabled={loading}
              style={{
                backgroundColor: '#DAA1ED',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                minWidth: '140px',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Liberando...
                </>
              ) : (
                'Liberar números'
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModalBoletosSeleccionados;