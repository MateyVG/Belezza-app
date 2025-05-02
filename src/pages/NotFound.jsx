import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '50px 20px',
      textAlign: 'center',
      color: '#e0e0e0'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '20px', color: '#e74c3c' }}>404</h1>
      <h2 style={{ marginBottom: '30px' }}>Страницата не беше намерена</h2>
      <p style={{ marginBottom: '30px', color: '#aaaaaa' }}>
        Страницата, която търсите, не съществува или е била преместена.
      </p>
      <Link to="/" style={{
        display: 'inline-block',
        padding: '10px 20px',
        backgroundColor: '#e74c3c',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        fontWeight: '500'
      }}>
        Върнете се към началната страница
      </Link>
    </div>
  );
}

export default NotFound;