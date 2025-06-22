import React from 'react';

const App: React.FC = () => {
  console.log('App component rendering...');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      color: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>ATM Genesis System</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#ccc' }}>System is loading...</p>
        <div style={{ 
          width: '3rem', 
          height: '3rem', 
          border: '4px solid #3b82f6', 
          borderTop: '4px solid transparent', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>Checking system components...</p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
