import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';

// Запазваме вашите настройки за Supabase
const supabaseUrl = 'https://lnquyopfvuikhjbjsiqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucXV5b3BmdnVpa2hqYmpzaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODA5MDEsImV4cCI6MjA2MTA1NjkwMX0.GmZ-5FzZkJyMorLGggF_Jegx2Atn0wRiNKCx4esecJw';
const supabase = createClient(supabaseUrl, supabaseKey);

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        console.log("Започваме зареждане на ресторанти");
        
        const response = await supabase.from('restaurants').select('*');
        
        if (response.error) {
          console.error("Supabase грешка:", response.error);
          setError(response.error.message);
        } else {
          console.log("Получени данни:", response.data);
          setRestaurants(response.data || []);
        }
      } catch (error) {
        console.error('Грешка при зареждане на ресторанти:', error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRestaurants();
  }, []);

  // Функция за навигация към детайлите на ресторанта
  const goToRestaurantDetails = (id) => {
    navigate(`/restaurant/${id}`);
  };

  return (
    <div className="home-container">
      <h1>Нашите ресторанти</h1>
      
      {error && (
        <div className="error-message">
          <strong>Грешка:</strong> {error}
        </div>
      )}
      
      {loading ? (
        <div className="loading-message">Зареждане на ресторанти...</div>
      ) : (
        <div className="restaurants-grid">
          {restaurants.length === 0 ? (
            <div className="no-restaurants">
              <p>Няма намерени ресторанти. Моля, добавете някои в Supabase.</p>
            </div>
          ) : (
            restaurants.map(restaurant => (
              <div key={restaurant.id} className="restaurant-card">
                {/* Цялата карта е кликваема */}
                <div 
                  className="restaurant-content" 
                  onClick={() => goToRestaurantDetails(restaurant.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="restaurant-image">
                    <img 
                      src={restaurant.cover_image_url || "https://res.cloudinary.com/dcvggpamh/image/upload/v1745313759/465468984_9504341636258870_1337033491857940661_n_bwfvg2.jpg"} 
                      alt={restaurant.name || "Placeholder"} 
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://res.cloudinary.com/dcvggpamh/image/upload/v1745313759/465468984_9504341636258870_1337033491857940661_n_bwfvg2.jpg';
                      }} 
                    />
                  </div>
                  <div className="restaurant-info">
                    {restaurant.logo_url && (
                      <div className="restaurant-logo">
                        <img 
                          src={restaurant.logo_url} 
                          alt={`${restaurant.name} лого`} 
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = 'https://via.placeholder.com/150';
                          }} 
                        />
                      </div>
                    )}
                    <h2>{restaurant.name || 'Без име'}</h2>
                    <p className="restaurant-address">
                      <strong>Адрес:</strong> {restaurant.address || 'Няма адрес'}
                    </p>
                    <p className="restaurant-phone">
                      <strong>Телефон:</strong> {restaurant.phone || 'Няма телефон'}
                    </p>
                    <p className="restaurant-hours">
                      <strong>Работно време:</strong> {restaurant.hours || 'Не е посочено'}
                    </p>
                    {restaurant.description && (
                      <p className="restaurant-description">
                        {restaurant.description}
                      </p>
                    )}
                    {/* Социални мрежи */}
                    <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                      <a href="https://www.facebook.com/bellezzacafebar" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M22.675 0h-21.35C.595 0 0 .593 0 1.326v21.348C0 23.407.595 24 1.325 24H12.82v-9.294H9.692V11.01h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.466.099 2.797.143v3.24l-1.919.001c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.696h-3.12V24h6.116c.73 0 1.325-.593 1.325-1.326V1.326C24 .593 23.405 0 22.675 0z"/>
                        </svg>
                      </a>

                      <a href="https://www.instagram.com/bellezzacafebar" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512" fill="#E1306C">
                          <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9S160.5 370.8 224.1 370.8 339 319.5 339 255.9 287.7 141 224.1 141zm0 186.6c-39.6 0-71.7-32.1-71.7-71.7s32.1-71.7 71.7-71.7 71.7 32.1 71.7 71.7-32.1 71.7-71.7 71.7zm146.4-194.3c0 14.9-12 26.9-26.9 26.9s-26.9-12-26.9-26.9 12-26.9 26.9-26.9 26.9 12 26.9 26.9zm76.1 27.2c-.7-14.9-4.1-29.9-11.7-43.2-7.9-13.8-18.8-24.7-32.6-32.6-13.3-7.6-28.3-11-43.2-11.7-17.2-.8-22.5-1-66.5-1s-49.3.2-66.5 1c-14.9.7-29.9 4.1-43.2 11.7-13.8 7.9-24.7 18.8-32.6 32.6-7.6 13.3-11 28.3-11.7 43.2-.8 17.2-1 22.5-1 66.5s.2 49.3 1 66.5c.7 14.9 4.1 29.9 11.7 43.2 7.9 13.8 18.8 24.7 32.6 32.6 13.3 7.6 28.3 11 43.2 11.7 17.2.8 22.5 1 66.5 1s49.3-.2 66.5-1c14.9-.7 29.9-4.1 43.2-11.7 13.8-7.9 24.7-18.8 32.6-32.6 7.6-13.3 11-28.3 11.7-43.2.8-17.2 1-22.5 1-66.5s-.2-49.3-1-66.5zM398.8 388c-6.4 16.1-18.9 28.6-35 35-24.2 9.6-81.6 7.4-109.8 7.4s-85.6 2.1-109.8-7.4c-16.1-6.4-28.6-18.9-35-35-9.6-24.2-7.4-81.6-7.4-109.8s-2.1-85.6 7.4-109.8c6.4-16.1 18.9-28.6 35-35 24.2-9.6 81.6-7.4 109.8-7.4s85.6-2.1 109.8 7.4c16.1 6.4 28.6 18.9 35 35 9.6 24.2 7.4 81.6 7.4 109.8s2.2 85.6-7.4 109.8z"/>
                        </svg>
                      </a>

                      <a href="https://www.youtube.com/@bellezzacafebar" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 576 512" fill="#FF0000">
                          <path d="M549.655 124.083c-6.281-23.65-24.764-42.22-48.094-48.482C456.534 64 288 64 288 64s-168.534 0-213.561 11.601c-23.33 6.262-41.813 24.832-48.094 48.482C16 168.123 16 256.045 16 256.045s0 87.922 10.345 131.962c6.281 23.65 24.764 42.22 48.094 48.482C119.466 448 288 448 288 448s168.534 0 213.561-11.601c23.33-6.262 41.813-24.832 48.094-48.482C560 343.967 560 256.045 560 256.045s0-87.922-10.345-131.962zM232 334.2V177.89l142.8 78.16L232 334.2z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="restaurant-buttons">
                  <Link to={`/restaurant/${restaurant.id}`} className="restaurant-button">
                    Виж повече
                  </Link>
                  <Link to={`/restaurant/${restaurant.id}/reservation`} className="restaurant-button primary">
                    Резервирай
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {/* Admin Panel Button */}
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        padding: '15px', 
        background: '#e74c3c', 
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 1000
      }}>
        <a href="/admin" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none' }}>
          АДМИН ПАНЕЛ
        </a>
      </div>
    </div>
  );
}

export default Home;