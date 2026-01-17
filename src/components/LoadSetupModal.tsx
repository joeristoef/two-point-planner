import React from 'react';

interface Setup {
  name: string;
  timestamp: number;
}

interface LoadSetupModalProps {
  title: string;
  setups: Setup[];
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
  onCancel: () => void;
}

export const LoadSetupModal: React.FC<LoadSetupModalProps> = ({ title, setups, onLoad, onDelete, onCancel }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#1a1a1a' }}>{title}</h3>
        {setups.length === 0 ? (
          <p style={{ color: '#6c757d', marginBottom: '15px' }}>No saved setups yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
            {setups.map((setup) => (
              <div
                key={setup.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{setup.name}</div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    Saved {new Date(setup.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onLoad(setup.name)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#4c6ef5',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${setup.name}"?`)) {
                        onDelete(setup.name);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#c92a2a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ddd',
              color: '#666',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
