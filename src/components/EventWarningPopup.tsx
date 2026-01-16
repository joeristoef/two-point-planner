import React, { useState } from 'react';

interface EventWarningPopupProps {
  onDismiss?: () => void;
}

export const EventWarningPopup: React.FC<EventWarningPopupProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
        }}
        onClick={handleDismiss}
      />

      {/* Popup */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          zIndex: 10000,
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          border: '3px solid #ff9800',
        }}
      >
        {/* Warning Icon & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <span style={{ fontSize: '32px' }}>⚠️</span>
          <h2 style={{ margin: 0, color: '#1a1a1a', fontSize: '24px' }}>Important Notice</h2>
        </div>

        {/* Message */}
        <p style={{ color: '#495057', fontSize: '16px', lineHeight: '1.6', margin: '0 0 15px 0' }}>
          <strong>Current expedition requirements do not account for events.</strong>
        </p>

        <p style={{ color: '#495057', fontSize: '14px', lineHeight: '1.6', margin: '0 0 15px 0' }}>
          The skill and staff requirements shown are based on base expeditions only. When expeditions 
          occur, various events can trigger additional requirements (injuries, stat changes, skill 
          unlocks, etc.). We're currently integrating event filtering to show flexible requirements 
          based on which events you want to handle.
        </p>

        <p style={{ color: '#ff9800', fontSize: '14px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
          🔄 Expected completion: January 18, 2026 (end of this week)
        </p>

        {/* Button */}
        <button
          onClick={handleDismiss}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff9800',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e68900';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ff9800';
          }}
        >
          Got it, dismiss
        </button>
      </div>
    </>
  );
};
