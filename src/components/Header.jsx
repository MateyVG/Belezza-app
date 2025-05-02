import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css'; // Добавяме CSS файла

function Header() {
  const { user, userRole, signOut, isSuperAdmin, isRestaurantAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          Bellezza Cafe
        </Link>
        
        <button 
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Отвори меню"
        >
          ☰
        </button>
        
        <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            <li>
              <Link to="/" className="nav-link">
              </Link>
            </li>
            
            {user ? (
              <>
                <li>
                  <Link to="/user/dashboard" className="nav-link">
                    Моят профил
                  </Link>
                </li>
                {/* Използваме функциите вместо директна проверка на userRole.role */}
                {(isSuperAdmin && isSuperAdmin()) || (isRestaurantAdmin && isRestaurantAdmin()) ? (
                  <li>
                    <Link to="/admin" className="nav-link admin-link">
                      Админ панел
                    </Link>
                  </li>
                ) : null}
                <li>
                  <button
                    onClick={handleSignOut}
                    className="nav-button"
                  >
                    Изход
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="nav-link">
                    Вход
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="nav-link">
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