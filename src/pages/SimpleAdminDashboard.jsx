import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SimpleAdminDashboard() {
  const { user, userRole, isSuperAdmin, isRestaurantAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Опростен администраторски панел</h1>
      
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <div style={{ width: '250px', padding: '15px', background: '#f1f1f1', borderRadius: '5px', marginRight: '20px' }}>
          <h2>Меню</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}><a href="/admin/dashboard">Табло</a></li>
            <li style={{ marginBottom: '10px' }}><a href="/admin/reservations">Резервации</a></li>
            <li style={{ marginBottom: '10px' }}><a href="/admin/menu">Меню</a></li>
            <li style={{ marginBottom: '10px' }}><a href="/admin/events">Събития</a></li>
            <li style={{ marginBottom: '10px' }}><a href="/">Към сайта</a></li>
            <li><button onClick={handleSignOut}>Изход</button></li>
          </ul>
        </div>
        
        <div style={{ flex: 1, padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
          <h2>Информация</h2>
          <p><strong>Потребител:</strong> {user?.email || user?.id || 'Неизвестен'}</p>
          <p><strong>Роля:</strong> {userRole?.role || 'Няма роля'}</p>
          <p><strong>Тип админ:</strong> {
            typeof isSuperAdmin === 'function' && isSuperAdmin() ? 'Супер администратор' :
            typeof isRestaurantAdmin === 'function' && isRestaurantAdmin() ? 'Ресторантски администратор' :
            'Няма административни права'
          }</p>
          
          {userRole?.restaurant_id && (
            <p><strong>Ресторант ID:</strong> {userRole.restaurant_id}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SimpleAdminDashboard;