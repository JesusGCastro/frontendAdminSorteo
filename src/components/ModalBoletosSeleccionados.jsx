import React from 'react';
import './ModalBoletosSeleccionados.css';

const ModalBoletosSeleccionados = ({ isOpen, onClose, boletos }) => {
  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-boletos">
          
          <div className="modal-header border-0 pb-2">
            <h5 className="modal-title w-100 fw-bold text-center">Liberar numero apartado</h5>
            <button 
              className="btn-close position-absolute" 
              onClick={onClose}
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
              Estos números se quitarán del apartado actual del participante y volverán a estar disponibles para todos.
            </p>
          </div>

          <div className="modal-footer border-0 d-flex justify-content-between pt-0 pb-4">
            <button 
              className="btn btn-cancelar px-4 py-2" 
              onClick={onClose}
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
              onClick={() => console.log("Liberar boletos")}
              style={{
                backgroundColor: '#DAA1ED',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                minWidth: '140px'
              }}
            >
              Liberar números
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModalBoletosSeleccionados;