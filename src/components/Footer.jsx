import React from 'react';

function Footer() {
  return (
    <footer style={{
      backgroundColor: '#252525',
      padding: '20px',
      marginTop: '50px',
      textAlign: 'center',
      color: '#aaaaaa',
      fontSize: '0.9rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p>&copy; {new Date().getFullYear()} Bellezza Cafe. Всички права запазени.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
          <a href="#" style={{ color: '#aaaaaa', textDecoration: 'none' }}>За нас</a>
          <a href="#" style={{ color: '#aaaaaa', textDecoration: 'none' }}>Контакти</a>
          <a href="#" style={{ color: '#aaaaaa', textDecoration: 'none' }}>Общи условия</a>
          <a href="#" style={{ color: '#aaaaaa', textDecoration: 'none' }}>Поверителност</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;