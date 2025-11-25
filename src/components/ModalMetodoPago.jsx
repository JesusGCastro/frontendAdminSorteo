import React from 'react';
import './ModalMetodoPago.css';

const ModalMetodoPago = ({ isOpen, onClose, onSelectMetodo }) => {
  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title w-100 text-center fw-bold">
              Selecciona tu método de pago
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body px-4">
            <p className="text-center text-muted mb-4">
              ¿Cómo deseas realizar el pago de tus boletos?
            </p>
            
            <div className="d-grid gap-3">
              <button 
                className="btn btn-outline-primary btn-lg d-flex align-items-center justify-content-start p-3 metodo-btn"
                onClick={() => onSelectMetodo('online')}
              >
                <i className="bi bi-credit-card fs-2 me-3"></i>
                <div className="text-start">
                  <div className="fw-bold">Pago en Línea</div>
                  <small className="text-muted">Paga con tarjeta de crédito/débito</small>
                </div>
              </button>

              <button 
                className="btn btn-outline-primary btn-lg d-flex align-items-center justify-content-start p-3 metodo-btn"
                onClick={() => onSelectMetodo('transferencia')}
              >
                <i className="bi bi-bank fs-2 me-3"></i>
                <div className="text-start">
                  <div className="fw-bold">Transferencia Bancaria</div>
                  <small className="text-muted">Realiza una transferencia o depósito</small>
                </div>
              </button>
            </div>
          </div>

          <div className="modal-footer border-0 justify-content-center">
            <button 
              type="button" 
              className="btn btn-secondary px-4" 
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalMetodoPago;