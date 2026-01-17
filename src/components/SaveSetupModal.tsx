import React, { useState } from 'react';

interface SaveSetupModalProps {
  title: string;
  onSave: (name: string) => void;
  onCancel: () => void;
  existingNames?: string[];
}

export const SaveSetupModal: React.FC<SaveSetupModalProps> = ({ title, onSave, onCancel, existingNames = [] }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    if (existingNames.includes(name.trim())) {
      setError('This name already exists. Please choose a different name.');
      return;
    }
    onSave(name.trim());
  };

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
        maxWidth: '400px',
        width: '90%',
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#1a1a1a' }}>{title}</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          placeholder="Enter a name for this setup"
          autoFocus
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: error ? '8px' : '15px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSave();
            }
          }}
        />
        {error && (
          <p style={{ color: '#c92a2a', margin: '0 0 15px 0', fontSize: '14px' }}>{error}</p>
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
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4c6ef5',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
