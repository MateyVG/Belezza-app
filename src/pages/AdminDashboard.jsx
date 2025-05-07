import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Admin.css';

import AdminDashboardSection from '../components/AdminDashboardSection';
import AdminReservationsSection from '../components/AdminReservationsSection';
import AdminMenuSection from '../components/AdminMenuSection';
import AdminEventsSection from '../components/AdminEventsSection';
import AdminSpecialOffersSection from '../components/AdminSpecialOffersSection';
import AdminTablesSection from '../components/AdminTablesSection';
import AdminGallerySection from '../components/AdminGallerySection';
import AdminAdminsSection from '../components/AdminAdminsSection';


function AdminDashboard() {
  const { user, userRole, isSuperAdmin, isRestaurantAdmin, supabase, signOut } = useAuth();
  const [section, setSection] = useState('dashboard');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const navigate = useNavigate();
  const { section: urlSection, restaurantId } = useParams();

   console.log('AdminDashboard - начално зареждане');
  console.log('AdminDashboard - user:', user);
  console.log('AdminDashboard - userRole:', userRole);
  console.log('AdminDashboard - isSuperAdmin:', typeof isSuperAdmin === 'function' ? isSuperAdmin() : 'not a function');
  console.log('AdminDashboard - isRestaurantAdmin:', typeof isRestaurantAdmin === 'function' ? isRestaurantAdmin() : 'not a function');
  console.log('AdminDashboard - urlSection:', urlSection);
  console.log('AdminDashboard - restaurantId:', restaurantId);

  // Установяваме секцията от URL параметъра, ако е наличен
  useEffect(() => {
    if (urlSection) {
      setSection(urlSection);
    }
  }, [urlSection]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        // Проверка дали потребителят има админ права
        if (!isSuperAdmin() && !isRestaurantAdmin()) {
          navigate('/');
          return;
        }
        
        // Зареждане на ресторантите
        let restaurantsQuery = supabase.from('restaurants').select('*');
        
        // Ако е ресторантски админ, филтрираме само за неговия ресторант
        if (isRestaurantAdmin()) {
          restaurantsQuery = restaurantsQuery.eq('id', userRole.restaurant_id);
        }
        
        const { data: restaurantsData, error: restaurantsError } = await restaurantsQuery;
        
        if (restaurantsError) throw restaurantsError;
        
        setRestaurants(restaurantsData);
        
        // Избиране на ресторант от URL параметъра или по подразбиране
        if (restaurantId) {
          const restaurant = restaurantsData.find(r => r.id === restaurantId);
          if (restaurant) {
            setSelectedRestaurant(restaurant);
          } else if (restaurantsData.length > 0) {
            // Ако не намерим ресторанта от URL, избираме първия наличен
            setSelectedRestaurant(restaurantsData[0]);
          }
        } else if (restaurantsData.length > 0) {
          if (isRestaurantAdmin()) {
            setSelectedRestaurant(restaurantsData[0]);
          } else if (isSuperAdmin()) {
            setSelectedRestaurant(restaurantsData[0]);
          }
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, userRole, isSuperAdmin, isRestaurantAdmin, navigate, restaurantId, supabase]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Функция за смяна на секцията и обновяване на URL
  const changeSection = (newSection) => {
    setSection(newSection);
    if (selectedRestaurant) {
      navigate(`/admin/restaurant/${selectedRestaurant.id}/${newSection}`);
    } else {
      navigate(`/admin/${newSection}`);
    }
  };

  // Функция за смяна на избрания ресторант и обновяване на URL
  const changeRestaurant = (restaurantId) => {
    const selected = restaurants.find(r => r.id === restaurantId);
    setSelectedRestaurant(selected);
    navigate(`/admin/restaurant/${restaurantId}/${section}`);
  };

  if (loading) {
    return <div className="admin-loading">Зареждане на администраторски панел...</div>;
  }

  return (
    <div className="admin-container">
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="admin-sidebar-header" onClick={toggleSidebar}>
  <h2>Админ панел</h2>
  <p>{isSuperAdmin() ? 'Главен администратор' : 'Ресторантски администратор'}</p>
  
  {/* Добавете икона за мобилен изглед */}
  <i className={`fas ${sidebarOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} 
     style={{ display: window.innerWidth <= 768 ? 'block' : 'none' }}></i>
          
          {isSuperAdmin() && restaurants.length > 0 && (
            <div className="restaurant-selector">
              <label>Избран ресторант:</label>
              <select 
                value={selectedRestaurant?.id || ''} 
                onChange={(e) => changeRestaurant(e.target.value)}
              >
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <ul className="admin-menu">
          <li 
            className={section === 'dashboard' ? 'active' : ''}
            onClick={() => changeSection('dashboard')}
          >
            <i className="fas fa-tachometer-alt"></i> Табло
          </li>
          
          <li 
            className={section === 'reservations' ? 'active' : ''}
            onClick={() => changeSection('reservations')}
          >
            <i className="fas fa-calendar-check"></i> Резервации
          </li>
          
          <li 
            className={section === 'menu' ? 'active' : ''}
            onClick={() => changeSection('menu')}
          >
            <i className="fas fa-utensils"></i> Меню
          </li>
          
          <li 
            className={section === 'events' ? 'active' : ''}
            onClick={() => changeSection('events')}
          >
            <i className="fas fa-calendar-alt"></i> Събития
          </li>
          
          <li 
            className={section === 'special_offers' ? 'active' : ''}
            onClick={() => changeSection('special_offers')}
          >
            <i className="fas fa-percentage"></i> Специални предложения
          </li>
          
          <li 
            className={section === 'tables' ? 'active' : ''}
            onClick={() => changeSection('tables')}
          >
            <i className="fas fa-chair"></i> Управление на маси
          </li>

          <li 
            className={section === 'gallery' ? 'active' : ''}
            onClick={() => changeSection('gallery')}
          >
            <i className="fas fa-images"></i> Галерия и изображения
          </li>
          
          {isSuperAdmin() && (
            <>
              <li 
                className={section === 'restaurants' ? 'active' : ''}
                onClick={() => changeSection('restaurants')}
              >
                <i className="fas fa-store"></i> Управление на ресторанти
              </li>
              <li 
                className={section === 'admins' ? 'active' : ''}
                onClick={() => changeSection('admins')}
              >
                <i className="fas fa-users-cog"></i> Администратори
              </li>
              <li 
                className={section === 'reports' ? 'active' : ''}
                onClick={() => changeSection('reports')}
              >
                <i className="fas fa-chart-bar"></i> Отчети и статистика
              </li>
            </>
          )}
          
          <li onClick={handleSignOut}>
            <i className="fas fa-sign-out-alt"></i> Изход
          </li>
        </ul>
      </div>
      
      <div className="admin-content">
        {section === 'dashboard' && (
          <AdminDashboardSection restaurant={selectedRestaurant} supabase={supabase} />
        )}
        
        {section === 'reservations' && (
          <AdminReservationsSection restaurant={selectedRestaurant} supabase={supabase} />
        )}
        
        {section === 'menu' && (
          <AdminMenuSection restaurant={selectedRestaurant} supabase={supabase} />
        )}
        
        {section === 'events' && (
          <AdminEventsSection restaurant={selectedRestaurant} supabase={supabase} />
        )}
        
        {section === 'special_offers' && (
          <AdminSpecialOffersSection restaurant={selectedRestaurant} supabase={supabase} />
        )}
        
        {section === 'tables' && (
          <AdminTablesSection restaurant={selectedRestaurant} supabase={supabase} />
        )}
        
        {section === 'gallery' && (
          <AdminGallerySection restaurant={selectedRestaurant} supabase={supabase} />
        )}
        
        {section === 'restaurants' && isSuperAdmin() && (
          <div>
            <h1>Управление на ресторанти</h1>
            <p>Тук ще бъде секцията за управление на ресторанти</p>
          </div>
        )}
        
        {section === 'admins' && isSuperAdmin() && (
  <AdminAdminsSection supabase={supabase} />
)}

        {section === 'reports' && isSuperAdmin() && (
          <div>
            <h1>Отчети и статистика</h1>
            <p>Тук ще бъде секцията за отчети и статистика</p>
          </div>
        )}
      </div>
    </div>
  );
}


export default AdminDashboard;

