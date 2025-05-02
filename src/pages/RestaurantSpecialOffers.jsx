import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnquyopfvuikhjbjsiqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucXV5b3BmdnVpa2hqYmpzaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODA5MDEsImV4cCI6MjA2MTA1NjkwMX0.GmZ-5FzZkJyMorLGggF_Jegx2Atn0wRiNKCx4esecJw';
const supabase = createClient(supabaseUrl, supabaseKey);

function RestaurantSpecialOffers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [specialOffers, setSpecialOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRestaurantAndOffers() {
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
        
        // Добавяме логове за отстраняване на грешки
        console.log('Изпълняваме заявка за активни предложения');
        console.log('restaurant_id:', id);
        console.log('today:', today);
        
        // Зареждане на активни специални предложения
        const { data: offersData, error: offersError } = await supabase
          .from('special_offers')
          .select('*')
          .eq('restaurant_id', id)
          .eq('active', true)
          .lte('start_date', today)
          .or(`end_date.gt.${today},end_date.is.null`);
        
        console.log('Резултати от заявката:', offersData);
        console.log('Грешка при заявката:', offersError);
        
        if (offersError) throw offersError;
        setSpecialOffers(offersData || []);
        
        // Логове преди и след филтриране
        console.log('Предложения преди филтриране:', offersData);
        const validOffers = (offersData || []).filter(isValidToday);
        console.log('Предложения след филтриране:', validOffers);
        
      } catch (error) {
        console.error('Грешка при зареждане на специални предложения:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRestaurantAndOffers();
  }, [id]);

  const goBack = () => {
    navigate(`/restaurant/${id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Няма крайна дата';
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  };

  // Опростена версия на функцията isValidToday
  const isValidToday = (offer) => {
    console.log('Проверка на предложение:', offer);
    const today = new Date().toISOString().split('T')[0];
    
    // Опростена проверка - само активност и дати
    return offer.active && 
           (!offer.start_date || offer.start_date <= today) && 
           (!offer.end_date || offer.end_date >= today);
  };

  const getDiscountText = (offer) => {
    if (offer.discount_type === 'percentage') {
      return `${offer.discount_value}% отстъпка`;
    } else if (offer.discount_type === 'fixed') {
      return `${offer.discount_value.toFixed(2)} лв. отстъпка`;
    } else if (offer.discount_type === 'free_item') {
      return 'Безплатен продукт';
    }
    return '';
  };

  if (loading) {
    return <div style={{padding: '20px', textAlign: 'center'}}>Зареждане на специални предложения...</div>;
  }

  if (error) {
    return <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>Грешка: {error}</div>;
  }

  if (!restaurant) {
    return <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>Ресторантът не беше намерен</div>;
  }

  // Филтриране за валидни за днес предложения
  const validOffers = specialOffers.filter(isValidToday);

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '20px', color: '#e0e0e0'}}>
      <button 
        onClick={goBack} 
        style={{marginBottom: '20px', padding: '8px 16px', background: '#333', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer'}}
      >
        &larr; Назад към ресторанта
      </button>
      
      <h1 style={{marginBottom: '30px'}}>{restaurant.name} - Специални предложения</h1>
      
      {validOffers.length === 0 ? (
        <div style={{textAlign: 'center', padding: '30px', background: '#252525', borderRadius: '8px'}}>
          <p>Няма активни специални предложения за този ресторант.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '30px'
        }}>
          {validOffers.map(offer => (
            <div key={offer.id} style={{
              background: '#252525',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              {/* Заглавие и икона */}
              <div style={{
                background: '#e74c3c',
                padding: '15px',
                position: 'relative'
              }}>
                <h2 style={{margin: '0', color: 'white'}}>{offer.title}</h2>
              </div>
              
              {/* Добавяме лог за URL на изображението */}
              {console.log('URL на изображението:', offer.image_url)}
              
              {/* Показваме изображение само ако е налично */}
              {offer.image_url && offer.image_url.trim() !== '' && (
                <div style={{
                  height: '200px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={offer.image_url} 
                    alt={offer.title} 
                    style={{
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      display: 'block'  // Добавяме display: block
                    }}
                    onError={(e) => {
                      console.error('Грешка при зареждане на изображение:', e);
                      e.target.style.display = 'none';  // Скриваме изображението при грешка
                    }}
                  />
                </div>
              )}
              
              <div style={{padding: '20px'}}>
                {/* Отстъпка */}
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  color: '#e74c3c'
                }}>
                  {getDiscountText(offer)}
                </div>
                
                {/* Описание */}
                {offer.description && (
                  <p style={{marginBottom: '15px'}}>{offer.description}</p>
                )}
                
                {/* Валидност */}
                <div style={{
                  marginTop: '20px',
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '5px'
                }}>
                  <p style={{margin: '0', fontSize: '14px'}}>
                    <strong>Валидно до:</strong> {formatDate(offer.end_date)}
                  </p>
                  
                  {offer.min_order > 0 && (
                    <p style={{margin: '5px 0 0 0', fontSize: '14px'}}>
                      <strong>Минимална поръчка:</strong> {offer.min_order.toFixed(2)} лв.
                    </p>
                  )}
                  
                  {offer.days_of_week && offer.days_of_week.length > 0 && (
                    <p style={{margin: '5px 0 0 0', fontSize: '14px'}}>
                      <strong>Дни:</strong> {offer.days_of_week.map(day => {
                        const days = {
                          'monday': 'Понеделник',
                          'tuesday': 'Вторник',
                          'wednesday': 'Сряда',
                          'thursday': 'Четвъртък',
                          'friday': 'Петък',
                          'saturday': 'Събота',
                          'sunday': 'Неделя'
                        };
                        return days[day];
                      }).join(', ')}
                    </p>
                  )}
                  
                  {(offer.start_time || offer.end_time) && (
                    <p style={{margin: '5px 0 0 0', fontSize: '14px'}}>
                      <strong>Часове:</strong> {offer.start_time || '00:00'} - {offer.end_time || '23:59'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantSpecialOffers;