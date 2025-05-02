import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Използвайте същите настройки за Supabase
const supabaseUrl = 'https://lnquyopfvuikhjbjsiqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucXV5b3BmdnVpa2hqYmpzaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODA5MDEsImV4cCI6MjA2MTA1NjkwMX0.GmZ-5FzZkJyMorLGggF_Jegx2Atn0wRiNKCx4esecJw';
const supabase = createClient(supabaseUrl, supabaseKey);

function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRestaurantDetails() {
      try {
        console.log("Зареждане на детайли за ресторант с ID:", id);
        
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error("Supabase грешка:", error);
          setError(error.message);
        } else {
          console.log("Получени данни:", data);
          setRestaurant(data);
        }
      } catch (error) {
        console.error('Грешка при зареждане на детайли за ресторанта:', error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRestaurantDetails();
  }, [id]);

  // Функция за връщане към списъка с всички ресторанти
  const goBackToRestaurants = () => {
    navigate('/');  // Предполагам, че списъкът с ресторанти е на главната страница
  };

  // Обработващи функции за навигация
  const goToMenu = () => {
    navigate(`/restaurant/${id}/menu`);
  };
  
  const goToEvents = () => {
    navigate(`/restaurant/${id}/events`);
  };
  
  const goToSpecialOffers = () => {
    navigate(`/restaurant/${id}/special-offers`);
  };
  
  const goToReservation = () => {
    navigate(`/restaurant/${id}/reservation`);
  };

  // Обработване на клик върху телефонния номер
  const handlePhoneClick = () => {
    if (restaurant && restaurant.phone) {
      window.location.href = `tel:${restaurant.phone}`;
    }
  };

  // Обработване на клик върху адреса (отваря Google Maps)
  const handleAddressClick = () => {
    if (restaurant && restaurant.address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`, '_blank');
    }
  };

  if (loading) {
    return <div style={{padding: '20px', textAlign: 'center'}}>Зареждане на информация за ресторанта...</div>;
  }

  if (error) {
    return <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>Грешка: {error}</div>;
  }

  if (!restaurant) {
    return <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>Ресторантът не беше намерен</div>;
  }

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '20px', color: '#e0e0e0'}}>
      

      <div style={{
        height: '400px',
        backgroundImage: `url(${restaurant.image_url || 'https://res.cloudinary.com/dcvggpamh/image/upload/v1745313759/465468984_9504341636258870_1337033491857940661_n_bwfvg2.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '10px',
        position: 'relative',
        marginBottom: '30px'
      }}>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          padding: '30px',
          color: 'white'
        }}>
          <h1 style={{margin: '0 0 10px 0', fontSize: '2.5rem'}}>{restaurant.name}</h1>
          <p style={{maxWidth: '700px', fontSize: '1.1rem', marginBottom: '20px'}}>{restaurant.description}</p>
          
          {/* Социални мрежи като текстови бутони */}
          <div style={{marginTop: '20px'}}>
            {/* Социални мрежи със SVG икони */}
            <div style={{display: 'flex', gap: '15px', marginTop: '20px'}}>
              <a href="https://www.facebook.com/bellezzacafebar" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                padding: '8px'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M22.675 0h-21.35C.595 0 0 .593 0 1.326v21.348C0 23.407.595 24 1.325 24H12.82v-9.294H9.692V11.01h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.466.099 2.797.143v3.24l-1.919.001c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.696h-3.12V24h6.116c.73 0 1.325-.593 1.325-1.326V1.326C24 .593 23.405 0 22.675 0z"/>
                </svg>
              </a>
              
              <a href="https://www.instagram.com/bellezzacafebar" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                padding: '8px'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512" fill="white">
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9S160.5 370.8 224.1 370.8 339 319.5 339 255.9 287.7 141 224.1 141zm0 186.6c-39.6 0-71.7-32.1-71.7-71.7s32.1-71.7 71.7-71.7 71.7 32.1 71.7 71.7-32.1 71.7-71.7 71.7zm146.4-194.3c0 14.9-12 26.9-26.9 26.9s-26.9-12-26.9-26.9 12-26.9 26.9-26.9 26.9 12 26.9 26.9zm76.1 27.2c-.7-14.9-4.1-29.9-11.7-43.2-7.9-13.8-18.8-24.7-32.6-32.6-13.3-7.6-28.3-11-43.2-11.7-17.2-.8-22.5-1-66.5-1s-49.3.2-66.5 1c-14.9.7-29.9 4.1-43.2 11.7-13.8 7.9-24.7 18.8-32.6 32.6-7.6 13.3-11 28.3-11.7 43.2-.8 17.2-1 22.5-1 66.5s.2 49.3 1 66.5c.7 14.9 4.1 29.9 11.7 43.2 7.9 13.8 18.8 24.7 32.6 32.6 13.3 7.6 28.3 11 43.2 11.7 17.2.8 22.5 1 66.5 1s49.3-.2 66.5-1c14.9-.7 29.9-4.1 43.2-11.7 13.8-7.9 24.7-18.8 32.6-32.6 7.6-13.3 11-28.3 11.7-43.2.8-17.2 1-22.5 1-66.5s-.2-49.3-1-66.5zM398.8 388c-6.4 16.1-18.9 28.6-35 35-24.2 9.6-81.6 7.4-109.8 7.4s-85.6 2.1-109.8-7.4c-16.1-6.4-28.6-18.9-35-35-9.6-24.2-7.4-81.6-7.4-109.8s-2.1-85.6 7.4-109.8c6.4-16.1 18.9-28.6 35-35 24.2-9.6 81.6-7.4 109.8-7.4s85.6-2.1 109.8 7.4c16.1 6.4 28.6 18.9 35 35 9.6 24.2 7.4 81.6 7.4 109.8s2.2 85.6-7.4 109.8z"/>
                </svg>
              </a>
              
              <a href="https://www.youtube.com/@bellezzacafebar" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                padding: '8px'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 576 512" fill="white">
                  <path d="M549.655 124.083c-6.281-23.65-24.764-42.22-48.094-48.482C456.534 64 288 64 288 64s-168.534 0-213.561 11.601c-23.33 6.262-41.813 24.832-48.094 48.482C16 168.123 16 256.045 16 256.045s0 87.922 10.345 131.962c6.281 23.65 24.764 42.22 48.094 48.482C119.466 448 288 448 288 448s168.534 0 213.561-11.601c23.33-6.262 41.813-24.832 48.094-48.482C560 343.967 560 256.045 560 256.045s0-87.922-10.345-131.962zM232 334.2V177.89l142.8 78.16L232 334.2z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '30px'}}>
        <div style={{
          flex: '1',
          minWidth: '300px',
          background: '#252525',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
          
        }}>
          <div style={{marginBottom: '15px'}}>
            <strong style={{display: 'block', marginBottom: '5px'}}>
              <span style={{marginRight: '8px', color: '#e74c3c'}}>📍</span>
              Адрес:
            </strong>
            <span 
              style={{cursor: 'pointer', color: '#e74c3c', paddingLeft: '25px'}} 
              onClick={handleAddressClick}
            >
              {restaurant.address}
            </span>
          </div>
          
          <div style={{marginBottom: '15px'}}>
            <strong style={{display: 'block', marginBottom: '5px'}}>
              <span style={{marginRight: '8px', color: '#e74c3c'}}>📞</span>
              Телефон:
            </strong>
            <span 
              style={{cursor: 'pointer', color: '#e74c3c', paddingLeft: '25px'}} 
              onClick={handlePhoneClick}
            >
              {restaurant.phone}
            </span>
          </div>
          
          <div style={{marginBottom: '15px'}}>
            <strong style={{display: 'block', marginBottom: '5px'}}>
              <span style={{marginRight: '8px', color: '#e74c3c'}}>🕒</span>
              Работно време:
            </strong>
            <span style={{paddingLeft: '25px'}}>
              {restaurant.hours}
            </span>
          </div>
        </div>
        
        <div style={{
          flex: '1',
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          <button 
            style={{
              padding: '15px 20px',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              background: '#333',
              color: 'white'
            }}
            onClick={goToMenu}
          >
            Виж менюто
          </button>
          
          <button 
            style={{
              padding: '15px 20px',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              background: '#555',
              color: 'white'
            }}
            onClick={goToEvents}
          >
            Събития
          </button>
          
          <button 
            style={{
              padding: '15px 20px',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              background: '#555',
              color: 'white'
            }}
            onClick={goToSpecialOffers}
          >
            Специални предложения
          </button>
          
          <button 
            style={{
              padding: '15px 20px',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              background: '#e74c3c',
              color: 'white'
            }}
            onClick={goToReservation}
          >
            Направи резервация
          </button>
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetails;