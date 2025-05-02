import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnquyopfvuikhjbjsiqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucXV5b3BmdnVpa2hqYmpzaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODA5MDEsImV4cCI6MjA2MTA1NjkwMX0.GmZ-5FzZkJyMorLGggF_Jegx2Atn0wRiNKCx4esecJw';
const supabase = createClient(supabaseUrl, supabaseKey);

function RestaurantEvents() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRestaurantAndEvents() {
      try {
        setLoading(true);
        
        // Зареждане на ресторант
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single();
        
        if (restaurantError) throw restaurantError;
        setRestaurant(restaurantData);
        
        // Получаване на днешната дата
        const today = new Date().toISOString().split('T')[0];
        
        // Зареждане на събития (само предстоящи)
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('restaurant_id', id)
          .gte('date', today)
          .order('date', { ascending: true });
        
        if (eventsError) throw eventsError;
        setEvents(eventsData || []);
        
      } catch (error) {
        console.error('Грешка при зареждане на събития:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRestaurantAndEvents();
  }, [id]);

  const goBack = () => {
    navigate(`/restaurant/${id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  };

  if (loading) {
    return <div style={{padding: '20px', textAlign: 'center'}}>Зареждане на събития...</div>;
  }

  if (error) {
    return <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>Грешка: {error}</div>;
  }

  if (!restaurant) {
    return <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>Ресторантът не беше намерен</div>;
  }

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '20px', color: '#e0e0e0'}}>
      <button 
        onClick={goBack} 
        style={{marginBottom: '20px', padding: '8px 16px', background: '#333', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer'}}
      >
        &larr; Назад към ресторанта
      </button>
      
      <h1 style={{marginBottom: '30px'}}>{restaurant.name} - Предстоящи събития</h1>
      
      {events.length === 0 ? (
        <div style={{textAlign: 'center', padding: '30px', background: '#252525', borderRadius: '8px'}}>
          <p>Няма предстоящи събития за този ресторант.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '30px'
        }}>
          {events.map(event => (
            <div key={event.id} style={{
              background: '#252525',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              {event.image_url ? (
                <div style={{height: '200px'}}>
                  <img 
                    src={event.image_url} 
                    alt={event.title} 
                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                  />
                </div>
              ) : (
                <div style={{
                  height: '200px',
                  background: '#333',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <span style={{fontSize: '60px'}}>🎉</span>
                </div>
              )}
              
              <div style={{padding: '20px'}}>
                <h2 style={{marginBottom: '10px'}}>{event.title}</h2>
                
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '15px', color: '#e74c3c'}}>
                  <span style={{marginRight: '10px'}}>📅</span>
                  <span>{formatDate(event.date)}</span>
                  {event.time && (
                    <>
                      <span style={{margin: '0 10px'}}>|</span>
                      <span>🕒 {event.time}</span>
                      {event.end_time && <span> - {event.end_time}</span>}
                    </>
                  )}
                </div>
                
                {event.description && (
                  <p style={{marginBottom: '15px', color: '#aaa'}}>{event.description}</p>
                )}
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px'}}>
                  {event.price > 0 ? (
                    <p style={{margin: '0', fontWeight: 'bold'}}>Цена: {event.price.toFixed(2)} лв.</p>
                  ) : (
                    <p style={{margin: '0', fontWeight: 'bold', color: '#2ecc71'}}>Безплатно</p>
                  )}
                  
                  {event.seats_available > 0 && (
                    <p style={{margin: '0', fontSize: '14px'}}>Оставащи места: {event.seats_available}</p>
                  )}
                </div>
                
                {event.is_private && (
                  <div style={{
                    marginTop: '15px',
                    padding: '5px 10px',
                    background: 'rgba(236, 236, 236, 0.1)',
                    borderRadius: '5px',
                    display: 'inline-block'
                  }}>
                    <span style={{fontSize: '14px'}}>Частно събитие</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantEvents;