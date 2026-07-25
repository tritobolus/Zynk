import React from 'react';

export const RightSideTemp = () => {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      textAlign: 'center',
      gap: '1.5rem'
    }}>
      {/* Chat Icon */}
      <div className="w-20 h-20 rounded-xl text-6xl bg-primary flex items-center justify-center text-white font-medium mb-3">
        Z
      </div>

      {/* Main Heading */}
      <div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 600,
          margin: '0 0 0.5rem 0',
          color: 'var(--text-base)',
          letterSpacing: '-0.5px'
        }}>
          Welcome to <span style={{ color: 'var(--primary)' }}>Zynk</span>
        </h1>
      </div>

      {/* Description */}
      <p style={{
        fontSize: '1rem',
        color: 'var(--text-muted)',
        margin: 0,
        maxWidth: '300px',
        lineHeight: 1.6
      }}>
        Select a conversation from the sidebar to start messaging
      </p>

      {/* Subtle decorative line */}
      <div style={{
        width: '60px',
        height: '3px',
        background: 'var(--primary)',
        borderRadius: '2px',
        marginTop: '0.5rem'
      }}></div>
    </div>
  );
};
