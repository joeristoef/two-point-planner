import React, { useEffect, useState } from 'react';

interface EventWarningPopupProps {
  onDismiss?: () => void;
}

export const EventWarningPopup: React.FC<EventWarningPopupProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already seen this message
    const hasSeenMessage = localStorage.getItem('seenv14ThankYouMessage');
    if (!hasSeenMessage) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Store that user has seen this message
    localStorage.setItem('seenv14ThankYouMessage', 'true');
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
          border: '3px solid #4c6ef5',
        }}
      >
        {/* Thank You Icon & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <span style={{ fontSize: '32px' }}>✨</span>
          <h2 style={{ margin: 0, color: '#1a1a1a', fontSize: '24px' }}>Thank You for Using v1.4!</h2>
        </div>

        {/* Message */}
        <p style={{ color: '#495057', fontSize: '16px', lineHeight: '1.6', margin: '0 0 15px 0' }}>
          <strong>We've added comprehensive event filtering and improved requirement calculations!</strong>
        </p>

        <p style={{ color: '#495057', fontSize: '14px', lineHeight: '1.6', margin: '0 0 15px 0' }}>
          Version 1.4 now includes:
        </p>

        <ul style={{ color: '#495057', fontSize: '14px', lineHeight: '1.8', margin: '0 0 15px 0', paddingLeft: '20px' }}>
          <li>Separate event type and subtype filtering for better control</li>
          <li>Corrected requirement calculations for all event types</li>
          <li>Chosen staff display within expeditions</li>
          <li>Enhanced roster management with save/load functionality</li>
        </ul>

        <p style={{ color: '#495057', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
          Our next focus is building a <strong>staff roster solver</strong> to help you optimize team compositions. Have suggestions or feedback? Use the <strong>Feedback button</strong> to share your ideas!
        </p>

        {/* Button */}
        <button
          onClick={handleDismiss}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4c6ef5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#364fc7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4c6ef5';
          }}
        >
          Thanks! Let's go planning
        </button>
      </div>
    </>
  );
};
