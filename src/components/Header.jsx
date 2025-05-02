import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, userRole, signOut, isSuperAdmin, isRestaurantAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Добавяме конзолни логове за дебъгване
  console.log('Header render - user:', user);
  console.log('Header render - userRole:', userRole);
  console.log('Header render - isSuperAdmin:', isSuperAdmin ? isSuperAdmin() : 'undefined');
  console.log('Header render - isRestaurantAdmin:', isRestaurantAdmin ? isRestaurantAdmin() : 'undefined');

  return (
    <header style={{
      backgroundColor: '#252525',
      padding: '15px 20px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link to="/" style={{
          color: '#e74c3c',
          textDecoration: 'none',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          Bellezza Cafe
        </Link>
        
        <nav>
          <ul style={{
            display: 'flex',
            listStyle: 'none',
            gap: '20px',
            margin: 0,
            padding: 0
          }}>
            <li>
              <Link to="/" style={{
                color: '#e0e0e0',
                textDecoration: 'none'
              }}>
                Начало
              </Link>
            </li>
            
            {user ? (
              <>
                <li>
                  <Link to="/user/dashboard" style={{
                    color: '#e0e0e0',
                    textDecoration: 'none'
                  }}>
                    Моят профил
                  </Link>
                </li>
                {/* Използваме функциите вместо директна проверка на userRole.role */}
                {(isSuperAdmin && isSuperAdmin()) || (isRestaurantAdmin && isRestaurantAdmin()) ? (
                  <li>
                    <Link to="/admin" style={{
                      color: '#e74c3c', // Променен цвят за по-добра видимост
                      textDecoration: 'none',
                      fontWeight: 'bold' // По-удебелен шрифт за по-добра видимост
                    }}>
                      Админ панел
                    </Link>
                  </li>
                ) : null}
                <li>
                  <button
                    onClick={handleSignOut}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e0e0e0',
                      cursor: 'pointer',
                      padding: 0,
                      font: 'inherit'
                    }}
                  >
                    Изход
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" style={{
                    color: '#e0e0e0',
                    textDecoration: 'none'
                  }}>
                    Вход
                  </Link>
                </li>
                <li>
                  <Link to="/register" style={{
                    color: '#e0e0e0',
                    textDecoration: 'none'
                  }}>
                    Регистрация
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;